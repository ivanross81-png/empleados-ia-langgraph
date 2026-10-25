import { afterEach, describe, expect, it, vi } from 'vitest'
import { createSeedState } from '../data/seed'
import { MockPlatformService } from './mockPlatform'
import { demoApprover } from '../data/demoActors'
import { CURRENT_STORAGE_KEY, effectsFromExecutions, savePlatformSnapshot, type StoragePort } from './persistence'

class MemoryStorage implements StoragePort {
  private values = new Map<string, string>()
  getItem(key: string): string | null { return this.values.get(key) ?? null }
  setItem(key: string, value: string): void { this.values.set(key, value) }
}

function saveState(storage: StoragePort, state: ReturnType<typeof createSeedState>) {
  savePlatformSnapshot(storage, state, effectsFromExecutions(state))
}

describe('MockPlatformService: límites de gobernanza de la demostración', () => {
  afterEach(() => vi.useRealTimers())

  it('no permite decidir una aprobación con un rol no autorizado', () => {
    const service = new MockPlatformService(createSeedState(), 10)
    expect(() => service.decideApproval('ap-2084', 'APPROVED', { name: 'Diego', role: 'Operador', authorized: false }, 'Revisado')).toThrow('no está autorizado')
    expect(service.getSnapshot().approvals[0]?.status).toBe('PENDING')
    expect(service.getSnapshot().executions.find((run) => run.id === 'ex-2084')?.sideEffectCount).toBe(0)
  })

  it.each([
    { employeeId: 'personas', status: 'PAUSED' },
    { employeeId: 'operaciones', status: 'DRAFT' },
  ])('rechaza iniciar ejecución para un perfil $status', ({ employeeId }) => {
    const service = new MockPlatformService(createSeedState(), 10)
    const countBefore = service.getSnapshot().executions.length
    expect(() => service.startExecution(employeeId, 'review-eligible')).toThrow('no está disponible')
    expect(service.getSnapshot().executions).toHaveLength(countBefore)
  })

  it('rechaza un empleado inexistente antes de crear una ejecución', () => {
    const service = new MockPlatformService(createSeedState(), 10)
    expect(() => service.startExecution('no-existe', 'review-eligible')).toThrow('No se encontró')
    expect(service.getSnapshot().executions).toHaveLength(createSeedState().executions.length)
  })

  it('rechaza ejecutar un perfil de catálogo sin flujo completo', () => {
    const service = new MockPlatformService(createSeedState(), 10)
    expect(() => service.startExecution('finanzas', 'review-eligible')).toThrow('perfil de catálogo')
  })

  it('rechaza un escenario que no pertenece a la tarea del empleado', () => {
    const service = new MockPlatformService(createSeedState(), 10)
    expect(() => service.startExecution('compras', 'closed-case')).toThrow()
    expect(service.getSnapshot().executions).toHaveLength(createSeedState().executions.length)
  })

  it('rechazar una acción cierra la ejecución sin invocar la herramienta', () => {
    const service = new MockPlatformService(createSeedState(), 10)
    service.decideApproval('ap-2084', 'REJECTED', demoApprover, 'No corresponde continuar.')
    const execution = service.getSnapshot().executions.find((run) => run.id === 'ex-2084')
    expect(execution?.status).toBe('CANCELLED')
    expect(execution?.outcome).toBe('HUMAN_REJECTED')
    expect(execution?.action?.status).toBe('REJECTED')
    expect(execution?.sideEffectCount).toBe(0)
    expect(execution?.events.some((item) => item.kind === 'tool')).toBe(false)
  })

  it('aprueba solo la acción exacta, revalida política y continúa una vez', async () => {
    vi.useFakeTimers()
    const service = new MockPlatformService(createSeedState(), 10)
    service.decideApproval('ap-2084', 'APPROVED', demoApprover, 'Revisión humana completada.')
    await vi.advanceTimersByTimeAsync(30)
    const execution = service.getSnapshot().executions.find((run) => run.id === 'ex-2084')
    expect(service.getSnapshot().approvals[0]?.status).toBe('APPROVED')
    expect(execution?.status).toBe('COMPLETED')
    expect(execution?.action?.status).toBe('SUCCEEDED')
    expect(execution?.sideEffectCount).toBe(1)
    expect(execution?.events.some((item) => item.title === 'Política revalidada')).toBe(true)
  })

  it('trata el reenvío idéntico de una decisión humana como idempotente', async () => {
    vi.useFakeTimers()
    const service = new MockPlatformService(createSeedState(), 10)
    const reason = 'Aprobación sintética repetida por reintento de interfaz.'
    service.decideApproval('ap-2084', 'APPROVED', demoApprover, reason)
    service.decideApproval('ap-2084', 'APPROVED', demoApprover, reason)
    await vi.advanceTimersByTimeAsync(30)

    const execution = service.getSnapshot().executions.find((run) => run.id === 'ex-2084')
    expect(execution?.status).toBe('COMPLETED')
    expect(execution?.sideEffectCount).toBe(1)
    expect(execution?.events.filter((event) => event.title === 'Aprobación registrada')).toHaveLength(1)
  })

  it('no reemplaza una decisión humana previa por una decisión distinta', () => {
    const service = new MockPlatformService(createSeedState(), 10)
    service.decideApproval('ap-2084', 'REJECTED', demoApprover, 'No se autoriza en esta prueba.')
    expect(() => service.decideApproval('ap-2084', 'APPROVED', demoApprover, 'Intento de cambiar la decisión.')).toThrow('ya fue resuelta')
    expect(service.getSnapshot().approvals[0]?.status).toBe('REJECTED')
    expect(service.getSnapshot().executions.find((run) => run.id === 'ex-2084')?.sideEffectCount).toBe(0)
  })

  it('invalida una aprobación si la acción cambió después de solicitarla', () => {
    const initial = createSeedState()
    const execution = initial.executions.find((run) => run.id === 'ex-2084')!
    execution.action!.summary = 'Acción alterada después de la solicitud.'
    const service = new MockPlatformService(initial, 10)
    expect(() => service.decideApproval('ap-2084', 'APPROVED', demoApprover, 'Aprobación')).toThrow('cambió')
    expect(service.getSnapshot().approvals[0]?.status).toBe('PENDING')
  })

  it('vuelve a comprobar la huella inmediatamente antes del efecto', async () => {
    vi.useFakeTimers()
    const service = new MockPlatformService(createSeedState(), 10)
    service.decideApproval('ap-2084', 'APPROVED', demoApprover, 'Revisión completada.')
    service.getSnapshot().executions.find((run) => run.id === 'ex-2084')!.action!.summary = 'Cambio posterior a la aprobación.'
    await vi.advanceTimersByTimeAsync(30)
    const execution = service.getSnapshot().executions.find((run) => run.id === 'ex-2084')
    expect(execution?.status).toBe('FAILED')
    expect(execution?.sideEffectCount).toBe(0)
    expect(execution?.events.some((item) => item.kind === 'tool')).toBe(false)
    expect(execution?.events.some((item) => item.title === 'Revalidación de acción fallida')).toBe(true)
    expect(execution?.events.filter((item) => item.title === 'Revalidación de acción fallida')).toHaveLength(1)
  })

  it('recupera el resultado incierto con la misma clave sin duplicar el efecto', () => {
    const service = new MockPlatformService(createSeedState(), 10)
    const before = service.getSnapshot().executions.find((run) => run.id === 'ex-2079')!
    expect(before.sideEffectCount).toBe(1)
    service.reconcileUncertainExecution(before.id, true)
    const after = service.getSnapshot().executions.find((run) => run.id === before.id)!
    expect(after.status).toBe('COMPLETED')
    expect(after.attempts).toBe(2)
    expect(after.sideEffectCount).toBe(1)
  })

  it('mantiene una aprobación pendiente sin decisiones automáticas por antigüedad', () => {
    const service = new MockPlatformService(createSeedState(), 10)
    const approval = service.getSnapshot().approvals[0]!
    expect(Date.now() - new Date(approval.requestedAt).getTime()).toBeGreaterThan(0)
    expect(approval.status).toBe('PENDING')
    expect(service.getSnapshot().executions.find((run) => run.id === approval.executionId)?.status).toBe('WAITING_APPROVAL')
  })

  it.each([
    { scenario: 'review-eligible' as const, decision: 'ALLOW', status: 'COMPLETED', outcome: 'SUCCESS', effects: 1 },
    { scenario: 'closed-case' as const, decision: 'DENY', status: 'COMPLETED', outcome: 'POLICY_DENIED', effects: 0 },
    { scenario: 'tool-unavailable' as const, decision: 'ALLOW', status: 'FAILED', outcome: 'FAILURE', effects: 0 },
    { scenario: 'uncertain-ack' as const, decision: 'ALLOW', status: 'OUTCOME_UNCERTAIN', outcome: 'UNCERTAIN', effects: 1 },
  ])('recorre el escenario $scenario sin efectos no autorizados', async ({ scenario, decision, status, outcome, effects }) => {
    vi.useFakeTimers()
    const service = new MockPlatformService(createSeedState(), 10)
    const id = service.startExecution('cobranzas', scenario)
    await vi.advanceTimersByTimeAsync(60)
    const execution = service.getSnapshot().executions.find((run) => run.id === id)
    expect(execution?.action?.policyDecision).toBe(decision)
    expect(execution?.status).toBe(status)
    expect(execution?.outcome).toBe(outcome)
    expect(execution?.sideEffectCount).toBe(effects)
    if (decision === 'DENY') expect(execution?.events.some((item) => item.kind === 'tool')).toBe(false)
  })

  it('suspende REQUIRE_APPROVAL indefinidamente hasta una decisión humana', async () => {
    vi.useFakeTimers()
    const service = new MockPlatformService(createSeedState(), 10)
    const id = service.startExecution('cobranzas', 'follow-up-review')
    await vi.advanceTimersByTimeAsync(86_400_000)
    const execution = service.getSnapshot().executions.find((run) => run.id === id)
    const approval = service.getSnapshot().approvals.find((item) => item.executionId === id)
    expect(execution?.status).toBe('WAITING_APPROVAL')
    expect(execution?.sideEffectCount).toBe(0)
    expect(approval?.status).toBe('PENDING')
  })

  it.each(['PENDING', 'RUNNING'] as const)('cierra de forma controlada una ejecución %s al recargar sin efecto registrado', (status) => {
    const storage = new MemoryStorage()
    const state = createSeedState()
    const interrupted = state.executions.find((run) => run.id === 'ex-2081')!
    interrupted.status = status
    interrupted.action = undefined
    interrupted.sideEffectCount = 0
    saveState(storage, state)

    const restored = new MockPlatformService(undefined, 10, storage)
    const run = restored.getSnapshot().executions.find((item) => item.id === 'ex-2081')
    expect(run?.status).toBe('FAILED')
    expect(run?.failureCode).toBe('MOCK_EXECUTION_INTERRUPTED_ON_RELOAD')
    expect(run?.sideEffectCount).toBe(0)
    expect(run?.events.some((event) => event.title === 'Simulación interrumpida al recargar')).toBe(true)
    expect(restored.getSnapshot().recoveryNotice).toMatch(/recargar/i)
  })

  it('conserva la aprobación pendiente al recargar y no la resuelve por antigüedad', () => {
    const storage = new MemoryStorage()
    const state = createSeedState()
    saveState(storage, state)

    const restored = new MockPlatformService(undefined, 10, storage)
    expect(restored.getSnapshot().approvals.find((approval) => approval.id === 'ap-2084')?.status).toBe('PENDING')
    expect(restored.getSnapshot().executions.find((run) => run.id === 'ex-2084')?.status).toBe('WAITING_APPROVAL')
    expect(restored.getSnapshot().executions.find((run) => run.id === 'ex-2084')?.sideEffectCount).toBe(0)
  })

  it('reanuda la acción aprobada exacta tras recargar, creando un solo efecto en el ledger', () => {
    const storage = new MemoryStorage()
    const state = createSeedState()
    const approval = state.approvals.find((item) => item.id === 'ap-2084')!
    const execution = state.executions.find((item) => item.id === approval.executionId)!
    approval.status = 'APPROVED'
    approval.decidedAt = new Date().toISOString()
    approval.decidedBy = demoApprover.name
    approval.decisionReason = 'Autorización registrada antes de recargar.'
    execution.action!.status = 'APPROVED'
    saveState(storage, state)

    const restored = new MockPlatformService(undefined, 10, storage)
    const run = restored.getSnapshot().executions.find((item) => item.id === execution.id)!
    const saved = JSON.parse(storage.getItem(CURRENT_STORAGE_KEY)!) as { effects: Array<{ executionId: string; idempotencyKey: string }> }
    expect(run.status).toBe('COMPLETED')
    expect(run.sideEffectCount).toBe(1)
    expect(saved.effects.filter((effect) => effect.executionId === execution.id)).toHaveLength(1)
    expect(saved.effects.find((effect) => effect.executionId === execution.id)?.idempotencyKey).toBe(execution.action!.idempotencyKey)
  })

  it('mantiene OUTCOME_UNCERTAIN tras recargar y reconcilia usando el efecto existente', () => {
    const storage = new MemoryStorage()
    const state = createSeedState()
    saveState(storage, state)

    const restored = new MockPlatformService(undefined, 10, storage)
    const uncertain = restored.getSnapshot().executions.find((item) => item.id === 'ex-2079')!
    expect(uncertain.status).toBe('OUTCOME_UNCERTAIN')
    restored.reconcileUncertainExecution(uncertain.id, true)
    const complete = restored.getSnapshot().executions.find((item) => item.id === uncertain.id)!
    const saved = JSON.parse(storage.getItem(CURRENT_STORAGE_KEY)!) as { effects: Array<{ executionId: string }> }
    expect(complete.status).toBe('COMPLETED')
    expect(complete.sideEffectCount).toBe(1)
    expect(saved.effects.filter((effect) => effect.executionId === uncertain.id)).toHaveLength(1)
  })

  it('recupera un commit del ledger ocurrido antes de guardar el estado terminal', () => {
    const storage = new MemoryStorage()
    const state = createSeedState()
    const sourceAction = state.executions.find((run) => run.id === 'ex-2083')!.action!
    const interrupted = state.executions.find((run) => run.id === 'ex-2081')!
    interrupted.status = 'RUNNING'
    interrupted.action = { ...sourceAction, id: 'act-2081-review', idempotencyKey: 'demo:ex-2081:act-2081-review' }
    interrupted.sideEffectCount = 0
    const effect = {
      idempotencyKey: interrupted.action.idempotencyKey,
      executionId: interrupted.id,
      actionId: interrupted.action.id,
      operation: interrupted.action.name,
      resultSummary: 'Resultado confirmado antes de actualizar el estado de ejecución.',
      committedAt: new Date().toISOString(),
      acknowledgement: 'CONFIRMED' as const,
    }
    savePlatformSnapshot(storage, state, [...effectsFromExecutions(state), effect])

    const restored = new MockPlatformService(undefined, 10, storage)
    const run = restored.getSnapshot().executions.find((item) => item.id === interrupted.id)!
    const saved = JSON.parse(storage.getItem(CURRENT_STORAGE_KEY)!) as { effects: Array<{ executionId: string }> }
    expect(run.status).toBe('COMPLETED')
    expect(run.sideEffectCount).toBe(1)
    expect(saved.effects.filter((item) => item.executionId === interrupted.id)).toHaveLength(1)
    expect(run.events.some((event) => event.title === 'Efecto recuperado sin duplicarlo')).toBe(true)
  })
})
