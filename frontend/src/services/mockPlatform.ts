import type { Approval, ApprovalActor, ExecutionEvent, ExecutionRecord, PlatformState, RunScenario } from '../domain/types'
import { actionDigest, decidePolicy } from '../domain/policy'
import { createSeedState } from '../data/seed'
import { employees } from '../data/catalog'

const STORAGE_KEY = 'digital-employee-prototype-v1'
const DEMO_ACTOR: ApprovalActor = { name: 'Elena García', role: 'Aprobador de cobranzas', authorized: true }

function readSavedState(): PlatformState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) return JSON.parse(saved) as PlatformState
  } catch {
    // A malformed or unavailable browser store falls back to fresh synthetic data.
  }
  return createSeedState()
}

export class MockPlatformService {
  private state: PlatformState
  private listeners = new Set<() => void>()
  private timers = new Map<string, number[]>()
  private sequence = 1

  constructor(initialState = readSavedState(), private readonly delayMs = 420) {
    this.state = initialState
  }

  getSnapshot = (): PlatformState => this.state

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  reset(): void {
    this.timers.forEach((timers) => timers.forEach(window.clearTimeout))
    this.timers.clear()
    this.state = createSeedState()
    this.publish()
  }

  startExecution(employeeId: string, scenario: RunScenario, inputLabel = 'Lote sintético · abril'): string {
    const employee = employees.find((item) => item.id === employeeId)
    if (!employee) throw new Error('No se encontró el Empleado Digital seleccionado.')
    const id = `ex-${Date.now().toString(36)}-${this.sequence++}`
    const actionId = `act-${id}-${scenario}`
    const actionBase = {
      id: actionId,
      name: scenario === 'deny' ? 'Iniciar seguimiento de caso no elegible' : scenario === 'allow' ? 'Marcar casos como revisados' : scenario === 'failure' ? 'Registrar revisión de lote' : scenario === 'uncertain' ? 'Registrar revisión interna' : 'Preparar seguimiento de cobranza',
      summary: scenario === 'deny' ? 'Intento de seguimiento sobre un caso sintético cerrado.' : scenario === 'allow' ? 'Marcar 3 casos sintéticos como revisados.' : scenario === 'failure' ? 'Registrar la revisión del lote sintético.' : scenario === 'uncertain' ? 'Registrar una nota interna para los casos revisados.' : 'Preparar una propuesta de seguimiento para 3 facturas sintéticas.',
      reason: scenario === 'deny' ? 'El caso sintético no cumple las condiciones de elegibilidad.' : scenario === 'approval' ? 'La comunicación requiere autorización humana explícita.' : 'Actualización de prueba acotada al conjunto de datos sintéticos.',
      targetReference: `LOTE-SINT-${String(42 + this.sequence).padStart(3, '0')}`,
    }
    const action = {
      ...actionBase,
      risk: scenario === 'approval' ? 'MEDIUM' as const : scenario === 'deny' ? 'HIGH' as const : 'LOW' as const,
      policyDecision: decidePolicy(scenario),
      policyVersion: 'pol-cobranza-v3',
      status: 'PROPOSED' as const,
      idempotencyKey: `demo:${id}:${actionId}`,
      digest: actionDigest(actionBase),
      proposedAt: new Date().toISOString(),
    }
    const now = new Date().toISOString()
    const record: ExecutionRecord = {
      id, employeeId, employeeVersion: employee.version, taskName: employee.tasks[0] ?? 'Tarea demostrativa', scenario,
      status: 'PENDING', requestedAt: now, requestedBy: DEMO_ACTOR.name, inputLabel, invoiceCount: 3, amountTotal: 12_480,
      summary: 'Solicitud aceptada; preparando una ejecución con datos sintéticos.', correlationId: `corr-demo-${id}`, action,
      events: [this.makeEvent('request', 'Solicitud recibida', `${employee.name} recibió una tarea manual con datos sintéticos.`)], attempts: 0, sideEffectCount: 0,
    }
    this.update((state) => ({ ...state, executions: [record, ...state.executions] }))
    this.schedule(id, [
      () => this.patchExecution(id, (execution) => ({ ...execution, status: 'RUNNING', startedAt: new Date().toISOString(), attempts: 1, summary: 'La ejecución comenzó en el entorno local de demostración.', events: [...execution.events, this.makeEvent('start', 'Ejecución iniciada', `Versión ${employee.version} fijada · tarea «${execution.taskName}».`)] })),
      () => this.addEvent(id, 'read', 'Información consultada', '3 facturas sintéticas · identificadores ficticios · fuente local.'),
      () => this.addEvent(id, 'analysis', 'Análisis operativo', 'Resumen de casos preparado. El prototipo no expone razonamiento privado del modelo.'),
      () => this.addEvent(id, 'proposal', 'Acción propuesta', `${action.name}: ${action.summary}`),
      () => this.evaluate(id, scenario),
    ])
    return id
  }

  decideApproval(approvalId: string, decision: 'APPROVED' | 'REJECTED', actor: ApprovalActor, reason: string): void {
    const approval = this.state.approvals.find((item) => item.id === approvalId)
    if (!approval || approval.status !== 'PENDING') throw new Error('Esta solicitud ya fue resuelta o no está disponible.')
    if (!actor.authorized || actor.role !== approval.requiredRole) throw new Error('El rol actual no está autorizado para esta aprobación.')
    const execution = this.state.executions.find((item) => item.id === approval.executionId)
    if (!execution?.action || execution.action.id !== approval.actionId || execution.action.digest !== approval.actionDigest || actionDigest(execution.action) !== approval.actionDigest) {
      throw new Error('La acción cambió desde que se solicitó la aprobación. Se requiere una nueva revisión.')
    }
    const decidedAt = new Date().toISOString()
    const updatedApproval: Approval = { ...approval, status: decision, decidedAt, decidedBy: actor.name, decisionReason: reason.trim() }
    const updatedAction = { ...execution.action, status: decision }
    this.update((state) => ({ ...state, approvals: state.approvals.map((item) => item.id === approvalId ? updatedApproval : item), executions: state.executions.map((item) => item.id === execution.id ? { ...item, action: updatedAction } : item) }))
    if (decision === 'REJECTED') {
      this.patchExecution(execution.id, (current) => ({ ...current, status: 'CANCELLED', outcome: 'HUMAN_REJECTED', completedAt: decidedAt, durationMs: Date.now() - new Date(current.requestedAt).getTime(), summary: 'La persona autorizada rechazó la acción. La herramienta no se ejecutó.', events: [...current.events, this.makeEvent('approval', 'Acción rechazada', `${actor.name} rechazó la propuesta. No se produjo ningún efecto.`), this.makeEvent('result', 'Ejecución cerrada sin cambios', 'El rechazo humano es terminal para esta acción exacta.')] }))
      return
    }
    this.patchExecution(execution.id, (current) => ({ ...current, action: { ...updatedAction, status: 'APPROVED' }, events: [...current.events, this.makeEvent('approval', 'Aprobación registrada', `${actor.name} aprobó esta acción exacta · ${approval.actionDigest}.`)] }))
    this.schedule(execution.id, [
      () => this.revalidateApprovedAction(execution.id),
      () => this.invokeApprovedAction(execution.id, false),
    ])
  }

  reconcileUncertainExecution(executionId: string, retryWithSameKey = false): void {
    const execution = this.state.executions.find((item) => item.id === executionId)
    if (execution?.status !== 'OUTCOME_UNCERTAIN' || !execution.action) throw new Error('Esta ejecución no requiere reconciliación.')
    const priorEffect = execution.sideEffectCount > 0
    if (retryWithSameKey && !priorEffect) throw new Error('El resultado no está registrado; se bloquea el reintento automático para evitar duplicados.')
    this.patchExecution(executionId, (current) => ({
      ...current, status: 'COMPLETED', outcome: 'SUCCESS', completedAt: new Date().toISOString(), durationMs: Date.now() - new Date(current.requestedAt).getTime(),
      attempts: retryWithSameKey ? current.attempts + 1 : current.attempts,
      action: { ...current.action!, status: 'SUCCEEDED' },
      summary: retryWithSameKey ? 'Reintento con la misma clave idempotente: se recuperó el resultado registrado; no se duplicó el efecto.' : 'Reconciliación: se confirmó el único efecto registrado en el simulador.',
      events: [...current.events, this.makeEvent('reconciliation', retryWithSameKey ? 'Reintento idempotente' : 'Resultado reconciliado', retryWithSameKey ? 'La misma clave devolvió el registro existente. Efectos simulados: 1.' : 'El registro local confirma un efecto simulado y no se ejecutó una segunda operación.')],
    }))
  }

  cancelExecution(executionId: string): void {
    const execution = this.state.executions.find((item) => item.id === executionId)
    if (!execution || !['PENDING', 'RUNNING'].includes(execution.status)) throw new Error('Esta ejecución ya no puede cancelarse.')
    this.timers.get(executionId)?.forEach(window.clearTimeout)
    this.timers.delete(executionId)
    this.patchExecution(executionId, (current) => ({ ...current, status: 'CANCELLED', outcome: 'CANCELLED', completedAt: new Date().toISOString(), summary: 'Cancelada por una persona operadora; no se inician nuevos pasos.', events: [...current.events, this.makeEvent('result', 'Ejecución cancelada', 'No se iniciaron nuevos efectos simulados.')] }))
  }

  private evaluate(id: string, scenario: RunScenario): void {
    const decision = decidePolicy(scenario)
    if (decision === 'REQUIRE_APPROVAL') {
      const execution = this.state.executions.find((item) => item.id === id)
      if (!execution?.action) return
      const approvalId = `ap-${id}`
      const approval: Approval = { id: approvalId, executionId: id, employeeId: execution.employeeId, actionId: execution.action.id, actionDigest: execution.action.digest, title: execution.action.name, reason: execution.action.reason, risk: execution.action.risk, requiredRole: 'Aprobador de cobranzas', status: 'PENDING', requestedAt: new Date().toISOString() }
      this.update((state) => ({ ...state, approvals: [approval, ...state.approvals] }))
      this.patchExecution(id, (current) => ({ ...current, status: 'WAITING_APPROVAL', approvalId, action: { ...current.action!, status: 'WAITING_APPROVAL' }, summary: 'La política requiere aprobación humana. La ejecución queda suspendida; el tiempo no decidirá por la persona.', events: [...current.events, this.makeEvent('policy', 'Decisión de política', 'REQUIRE_APPROVAL · no se ejecutará la acción hasta recibir una decisión humana.', 'REQUIRE_APPROVAL'), this.makeEvent('approval', 'Aprobación solicitada', `Solicitud ${approvalId} vinculada a la huella ${execution.action!.digest}.`)] }))
      return
    }
    this.patchExecution(id, (current) => ({ ...current, action: { ...current.action!, status: decision === 'DENY' ? 'DENIED' : 'PROPOSED' }, events: [...current.events, this.makeEvent('policy', 'Decisión de política', decision === 'DENY' ? 'DENY · acción bloqueada. No se invoca la herramienta.' : 'ALLOW · acción acotada permitida por la política simulada.', decision)] }))
    if (decision === 'DENY') {
      this.patchExecution(id, (current) => ({ ...current, status: 'COMPLETED', outcome: 'POLICY_DENIED', completedAt: new Date().toISOString(), durationMs: Date.now() - new Date(current.requestedAt).getTime(), summary: 'Acción denegada por política. No se ejecutó ninguna herramienta.', events: [...current.events, this.makeEvent('result', 'Ejecución finalizada sin efecto', 'La política DENY prevalece; no hay operación registrada.')] }))
      return
    }
    if (scenario === 'failure') {
      this.patchExecution(id, (current) => ({ ...current, status: 'FAILED', outcome: 'FAILURE', completedAt: new Date().toISOString(), durationMs: Date.now() - new Date(current.requestedAt).getTime(), action: { ...current.action!, status: 'FAILED' }, summary: 'MOCK_TOOL_UNAVAILABLE · fallo simulado tipado; no se registró ningún efecto.', events: [...current.events, this.makeEvent('failure', 'Herramienta simulada no disponible', 'MOCK_TOOL_UNAVAILABLE · error no reintentable en esta demostración.'), this.makeEvent('result', 'Ejecución fallida', 'Sin efectos simulados.')] }))
      return
    }
    if (scenario === 'uncertain') {
      this.patchExecution(id, (current) => ({ ...current, status: 'OUTCOME_UNCERTAIN', outcome: 'UNCERTAIN', action: { ...current.action!, status: 'UNCERTAIN' }, sideEffectCount: 1, attempts: 1, summary: 'TIMEOUT_AFTER_SIMULATED_COMMIT · el resultado requiere reconciliación; no reintentar a ciegas.', events: [...current.events, this.makeEvent('tool', 'Respuesta externa incierta', 'El simulador registró una operación con clave idempotente, pero la respuesta expiró. No se repetirá automáticamente.')] }))
      return
    }
    this.invokeApprovedAction(id, false)
  }

  private revalidateApprovedAction(id: string): void {
    const execution = this.state.executions.find((item) => item.id === id)
    const approval = execution?.approvalId ? this.state.approvals.find((item) => item.id === execution.approvalId) : undefined
    const action = execution?.action
    const currentDigest = action ? actionDigest(action) : ''
    const bindingIsCurrent = Boolean(
      approval && action && approval.status === 'APPROVED' && approval.actionId === action.id &&
      approval.actionDigest === action.digest && approval.actionDigest === currentDigest &&
      approval.requiredRole === DEMO_ACTOR.role && action.policyVersion === 'pol-cobranza-v3',
    )
    if (!bindingIsCurrent) {
      this.failStaleApprovedAction(id)
      return
    }
    this.addEvent(id, 'policy', 'Política revalidada', 'La autorización vigente y la huella de la acción exacta coinciden antes de continuar.', 'ALLOW')
  }

  private invokeApprovedAction(id: string, alreadyScheduled: boolean): void {
    const execution = this.state.executions.find((item) => item.id === id)
    if (!execution?.action) return
    if (execution.action.policyDecision === 'REQUIRE_APPROVAL') {
      const approval = this.state.approvals.find((item) => item.id === execution.approvalId)
      const currentDigest = actionDigest(execution.action)
      const bindingIsCurrent = approval?.status === 'APPROVED' && approval.actionId === execution.action.id && approval.actionDigest === execution.action.digest && approval.actionDigest === currentDigest && approval.requiredRole === DEMO_ACTOR.role && execution.action.policyVersion === 'pol-cobranza-v3'
      if (!bindingIsCurrent) {
        this.failStaleApprovedAction(id)
        return
      }
    }
    const wasApplied = execution.sideEffectCount > 0
    this.patchExecution(id, (current) => ({ ...current, status: 'COMPLETED', outcome: 'SUCCESS', completedAt: new Date().toISOString(), durationMs: Date.now() - new Date(current.requestedAt).getTime(), action: { ...current.action!, status: 'SUCCEEDED' }, sideEffectCount: wasApplied ? current.sideEffectCount : current.sideEffectCount + 1, summary: 'Operación completada en el registro local de demostración. No se contactó a clientes ni a sistemas reales.', events: [...current.events, this.makeEvent('tool', alreadyScheduled ? 'Herramienta simulada ejecutada' : 'Acción simulada registrada', wasApplied ? 'La clave idempotente devolvió el efecto existente; no hubo duplicación.' : `Acción ${execution.action!.name} registrada solo en memoria local de demostración.`), this.makeEvent('result', 'Resultado final', 'Ejecución completada · acción gobernada y trazable · integración simulada.')] }))
  }

  private failStaleApprovedAction(id: string): void {
    this.patchExecution(id, (current) => ({
      ...current,
      status: 'FAILED',
      outcome: 'FAILURE',
      completedAt: new Date().toISOString(),
      durationMs: Date.now() - new Date(current.requestedAt).getTime(),
      action: current.action ? { ...current.action, status: 'FAILED' } : undefined,
      summary: 'La acción cambió después de solicitar o recibir aprobación. No se ejecutó; hace falta una nueva revisión.',
      events: [...current.events, this.makeEvent('failure', 'Revalidación de acción fallida', 'La huella, el rol o la versión de política ya no coinciden. No se invocó la herramienta.'), this.makeEvent('result', 'Ejecución cerrada sin efecto', 'La aprobación anterior no autoriza una acción distinta.')],
    }))
  }

  private addEvent(id: string, kind: ExecutionEvent['kind'], title: string, description: string, decision?: ExecutionEvent['decision']): void {
    this.patchExecution(id, (current) => ({ ...current, events: [...current.events, this.makeEvent(kind, title, description, decision)] }))
  }

  private patchExecution(id: string, transform: (execution: ExecutionRecord) => ExecutionRecord): void {
    this.update((state) => ({ ...state, executions: state.executions.map((execution) => execution.id === id ? transform(execution) : execution) }))
  }

  private update(transform: (state: PlatformState) => PlatformState): void {
    this.state = transform(this.state)
    this.publish()
  }

  private publish(): void {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state)) } catch { /* Browser storage is optional for this prototype. */ }
    this.listeners.forEach((listener) => listener())
  }

  private schedule(id: string, steps: Array<() => void>): void {
    const timers = steps.map((step, index) => window.setTimeout(step, this.delayMs * (index + 1)))
    this.timers.set(id, timers)
  }

  private makeEvent(kind: ExecutionEvent['kind'], title: string, description: string, decision?: ExecutionEvent['decision']): ExecutionEvent {
    return { id: `event-${Date.now()}-${this.sequence++}`, kind, title, description, timestamp: new Date().toISOString(), ...(decision ? { decision } : {}) }
  }
}

export const mockPlatform = new MockPlatformService()
export const demoApprover = DEMO_ACTOR
