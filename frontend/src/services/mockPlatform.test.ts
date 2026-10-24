import { afterEach, describe, expect, it, vi } from 'vitest'
import { createSeedState } from '../data/seed'
import { MockPlatformService, demoApprover } from './mockPlatform'

describe('MockPlatformService: límites de gobernanza de la demostración', () => {
  afterEach(() => vi.useRealTimers())

  it('no permite decidir una aprobación con un rol no autorizado', () => {
    const service = new MockPlatformService(createSeedState(), 10)
    expect(() => service.decideApproval('ap-2084', 'APPROVED', { name: 'Diego', role: 'Operador', authorized: false }, 'Revisado')).toThrow('no está autorizado')
    expect(service.getSnapshot().approvals[0]?.status).toBe('PENDING')
    expect(service.getSnapshot().executions.find((run) => run.id === 'ex-2084')?.sideEffectCount).toBe(0)
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
    { scenario: 'allow' as const, status: 'COMPLETED', outcome: 'SUCCESS', effects: 1 },
    { scenario: 'deny' as const, status: 'COMPLETED', outcome: 'POLICY_DENIED', effects: 0 },
    { scenario: 'failure' as const, status: 'FAILED', outcome: 'FAILURE', effects: 0 },
    { scenario: 'uncertain' as const, status: 'OUTCOME_UNCERTAIN', outcome: 'UNCERTAIN', effects: 1 },
  ])('recorre el escenario $scenario sin efectos no autorizados', async ({ scenario, status, outcome, effects }) => {
    vi.useFakeTimers()
    const service = new MockPlatformService(createSeedState(), 10)
    const id = service.startExecution('cobranzas', scenario)
    await vi.advanceTimersByTimeAsync(60)
    const execution = service.getSnapshot().executions.find((run) => run.id === id)
    expect(execution?.status).toBe(status)
    expect(execution?.outcome).toBe(outcome)
    expect(execution?.sideEffectCount).toBe(effects)
    if (scenario === 'deny') expect(execution?.events.some((item) => item.kind === 'tool')).toBe(false)
  })

  it('suspende REQUIRE_APPROVAL indefinidamente hasta una decisión humana', async () => {
    vi.useFakeTimers()
    const service = new MockPlatformService(createSeedState(), 10)
    const id = service.startExecution('cobranzas', 'approval')
    await vi.advanceTimersByTimeAsync(86_400_000)
    const execution = service.getSnapshot().executions.find((run) => run.id === id)
    const approval = service.getSnapshot().approvals.find((item) => item.executionId === id)
    expect(execution?.status).toBe('WAITING_APPROVAL')
    expect(execution?.sideEffectCount).toBe(0)
    expect(approval?.status).toBe('PENDING')
  })
})
