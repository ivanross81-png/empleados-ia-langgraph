import { describe, expect, it } from 'vitest'
import { createSeedState } from '../data/seed'
import { actionDigest } from '../domain/policy'
import type { LegacyRunScenario, PlatformState } from '../domain/types'
import { MockPlatformService } from './mockPlatform'
import {
  CURRENT_STORAGE_KEY,
  LEGACY_STORAGE_KEY,
  OLDER_STORAGE_KEY,
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

const legacyIdByExecution: Record<string, LegacyRunScenario> = {
  'ex-2084': 'approval',
  'ex-2083': 'allow',
  'ex-2082': 'failure',
  'ex-2081': 'allow',
  'ex-2080': 'deny',
  'ex-2079': 'uncertain',
  'ex-2078': 'approval',
}

function buildLegacyState(): PlatformState {
  const state = createSeedState()
  state.executions = state.executions.map((execution) => {
    const action = execution.action ? { ...execution.action, policyVersion: 'pol-cobranza-v3', arguments: undefined } : undefined
    if (action) action.digest = actionDigest(action)
    return { ...execution, scenario: legacyIdByExecution[execution.id] ?? 'HISTORICAL', action }
  })
  state.approvals = state.approvals.map((approval) => {
    const execution = state.executions.find((item) => item.id === approval.executionId)!
    return { ...approval, actionDigest: execution.action!.digest }
  })
  return state
}

describe('Persistencia local versionada', () => {
  it('los datos iniciales no contienen ejecuciones activas sin una simulación viva', () => {
    const initial = createSeedState()
    expect(initial.executions.some((execution) => execution.status === 'PENDING' || execution.status === 'RUNNING')).toBe(false)
    expect(initial.executions.some((execution) => execution.status === 'WAITING_APPROVAL')).toBe(true)
  })

  it('migra el estado anterior sin ledger y crea los efectos recuperables', () => {
    const storage = new MemoryStorage()
    storage.setItem(OLDER_STORAGE_KEY, JSON.stringify(buildLegacyState()))

    const service = new MockPlatformService(undefined, 10, storage)
    const saved = JSON.parse(storage.getItem(CURRENT_STORAGE_KEY) ?? 'null') as { schemaVersion?: number; effects?: unknown[] }

    expect(saved.schemaVersion).toBe(PERSISTENCE_SCHEMA_VERSION)
    expect(saved.effects).toHaveLength(2)
    expect(service.getSnapshot().recoveryNotice).toMatch(/migr[oó]/i)
    expect(service.getSnapshot().executions.find((run) => run.id === 'ex-2079')?.status).toBe('OUTCOME_UNCERTAIN')
    expect(service.getSnapshot().approvals.find((approval) => approval.id === 'ap-2084')?.status).toBe('PENDING')
  })

  it('migra el snapshot versionado anterior conservando sus escenarios históricos', () => {
    const storage = new MemoryStorage()
    const legacy = buildLegacyState()
    storage.setItem(LEGACY_STORAGE_KEY, JSON.stringify({ schemaVersion: 2, state: legacy, effects: effectsFromExecutions(legacy) }))

    const service = new MockPlatformService(undefined, 10, storage)
    const saved = JSON.parse(storage.getItem(CURRENT_STORAGE_KEY) ?? 'null') as { schemaVersion?: number }

    expect(saved.schemaVersion).toBe(PERSISTENCE_SCHEMA_VERSION)
    expect(service.getSnapshot().recoveryNotice).toMatch(/migr[oó]/i)
    expect(service.getSnapshot().executions.find((run) => run.id === 'ex-2084')?.scenario).toBe('approval')
  })

  it.each([
    ['JSON corrupto', '{sin-json'],
    ['versión incompatible', JSON.stringify({ schemaVersion: 99, state: {}, effects: [] })],
    ['estado inválido', JSON.stringify({ schemaVersion: 3, state: { executions: [{}], approvals: [] }, effects: [] })],
  ])('restaura datos sintéticos ante %s y avisa al usuario', (_case, contents) => {
    const storage = new MemoryStorage()
    storage.setItem(CURRENT_STORAGE_KEY, contents)
    const service = new MockPlatformService(undefined, 10, storage)

    expect(service.getSnapshot().executions.some((run) => run.id === 'ex-2084')).toBe(true)
    expect(service.getSnapshot().recoveryNotice).toBeTruthy()
    expect(JSON.parse(storage.getItem(CURRENT_STORAGE_KEY) ?? 'null').schemaVersion).toBe(PERSISTENCE_SCHEMA_VERSION)
  })

  it('restaura el estado sintético si WAITING_APPROVAL no referencia una solicitud', () => {
    const storage = new MemoryStorage()
    const state = createSeedState()
    state.executions.find((run) => run.id === 'ex-2084')!.approvalId = undefined
    storage.setItem(CURRENT_STORAGE_KEY, JSON.stringify({ schemaVersion: 3, state, effects: effectsFromExecutions(state) }))

    const service = new MockPlatformService(undefined, 10, storage)
    expect(service.getSnapshot().recoveryNotice).toMatch(/incompatible/i)
    expect(service.getSnapshot().executions.find((run) => run.id === 'ex-2084')?.approvalId).toBe('ap-2084')
  })

  it('rechaza guardar un snapshot cuyo contador de efectos no coincide con el ledger', () => {
    const state = createSeedState()
    state.executions = state.executions.map((execution) => execution.id === 'ex-2083' ? { ...execution, sideEffectCount: 2 } : execution)
    expect(savePlatformSnapshot(new MemoryStorage(), state, effectsFromExecutions(state))).toBe(false)
  })

  it('no genera efectos de legado para una acción sin efecto registrado', () => {
    const state = createSeedState()
    state.executions = state.executions.map((execution) => execution.id === 'ex-2083' ? { ...execution, sideEffectCount: 0 } : execution)
    expect(effectsFromExecutions(state).some((effect) => effect.executionId === 'ex-2083')).toBe(false)
    expect(savePlatformSnapshot(undefined, state, [])).toBe(false)
  })
})
