import { describe, expect, it } from 'vitest'
import { createSeedState } from '../data/seed'
import { MockPlatformService } from './mockPlatform'
import {
  CURRENT_STORAGE_KEY,
  LEGACY_STORAGE_KEY,
  PERSISTENCE_SCHEMA_VERSION,
  effectsFromExecutions,
  savePlatformSnapshot,
  type StoragePort,
} from './persistence'

class MemoryStorage implements StoragePort {
  private values = new Map<string, string>()

  getItem(key: string): string | null { return this.values.get(key) ?? null }
  setItem(key: string, value: string): void { this.values.set(key, value) }
}

describe('Persistencia local versionada', () => {
  it('los datos iniciales no contienen ejecuciones activas sin una simulación viva', () => {
    const initial = createSeedState()
    expect(initial.executions.some((execution) => execution.status === 'PENDING' || execution.status === 'RUNNING')).toBe(false)
    expect(initial.executions.some((execution) => execution.status === 'WAITING_APPROVAL')).toBe(true)
  })

  it('migra de forma validada el esquema anterior y crea un ledger inicial de efectos', () => {
    const storage = new MemoryStorage()
    const initial = createSeedState()
    storage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(initial))

    const service = new MockPlatformService(undefined, 10, storage)
    const saved = JSON.parse(storage.getItem(CURRENT_STORAGE_KEY) ?? 'null') as { schemaVersion?: number; effects?: unknown[] }

    expect(saved.schemaVersion).toBe(PERSISTENCE_SCHEMA_VERSION)
    expect(saved.effects).toHaveLength(2)
    expect(service.getSnapshot().recoveryNotice).toMatch(/migró/i)
    expect(service.getSnapshot().executions.find((run) => run.id === 'ex-2079')?.status).toBe('OUTCOME_UNCERTAIN')
  })

  it.each([
    ['JSON corrupto', '{sin-json'],
    ['versión incompatible', JSON.stringify({ schemaVersion: 99, state: {}, effects: [] })],
    ['estado inválido', JSON.stringify({ schemaVersion: 2, state: { executions: [{}], approvals: [] }, effects: [] })],
  ])('restaura datos sintéticos ante %s y avisa al usuario', (_case, contents) => {
    const storage = new MemoryStorage()
    storage.setItem(CURRENT_STORAGE_KEY, contents)
    const service = new MockPlatformService(undefined, 10, storage)

    expect(service.getSnapshot().executions.some((run) => run.id === 'ex-2084')).toBe(true)
    expect(service.getSnapshot().recoveryNotice).toBeTruthy()
    expect(JSON.parse(storage.getItem(CURRENT_STORAGE_KEY) ?? 'null').schemaVersion).toBe(2)
  })

  it('restaura el estado sintético si WAITING_APPROVAL no referencia una solicitud', () => {
    const storage = new MemoryStorage()
    const state = createSeedState()
    state.executions.find((run) => run.id === 'ex-2084')!.approvalId = undefined
    storage.setItem(CURRENT_STORAGE_KEY, JSON.stringify({ schemaVersion: 2, state, effects: effectsFromExecutions(state) }))

    const service = new MockPlatformService(undefined, 10, storage)
    expect(service.getSnapshot().recoveryNotice).toMatch(/incompatible/i)
    expect(service.getSnapshot().executions.find((run) => run.id === 'ex-2084')?.approvalId).toBe('ap-2084')
  })

  it('no genera efectos de legado para una acción sin efecto registrado', () => {
    const state = createSeedState()
    state.executions = state.executions.map((execution) => execution.id === 'ex-2083' ? { ...execution, sideEffectCount: 0 } : execution)
    expect(effectsFromExecutions(state).some((effect) => effect.executionId === 'ex-2083')).toBe(false)
    expect(savePlatformSnapshot(undefined, state, [])).toBe(false)
  })
})
