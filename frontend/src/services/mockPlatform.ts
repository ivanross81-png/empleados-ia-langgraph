import type { Approval, ApprovalActor, ExecutionEvent, ExecutionRecord, PlatformState, RunScenario } from '../domain/types'
import { actionDigest, argumentsForScenario, evaluateDemoPolicy, LEGACY_DEMO_POLICY_VERSION } from '../domain/policy'
import { createSeedState } from '../data/seed'
import { employees } from '../data/catalog'
import { demoScenarioById } from '../data/demoScenarios'
import { effectsFromExecutions, loadPlatformSnapshot, savePlatformSnapshot, type SimulatedEffect, type StoragePort } from './persistence'
import { demoApprover } from '../data/demoActors'
import type { PlatformService } from './platformService'

const DEMO_ACTOR = demoApprover

function browserStorage(): StoragePort | undefined {
  try {
    return typeof window === 'undefined' ? undefined : window.localStorage
  } catch {
    return undefined
  }
}

export class MockPlatformService implements PlatformService {
  private state: PlatformState
  private effects: SimulatedEffect[]
  private listeners = new Set<() => void>()
  private timers = new Map<string, number[]>()
  private sequence = 1
  private readonly storage: StoragePort | undefined
  private readonly delayMs: number

  constructor(initialState?: PlatformState, delayMs = 420, storage = browserStorage()) {
    this.storage = storage
    this.delayMs = delayMs
    if (initialState) {
      this.state = structuredClone(initialState)
      this.effects = effectsFromExecutions(this.state)
      return
    }

    const loaded = loadPlatformSnapshot(storage)
    this.state = { ...loaded.state, ...(loaded.notice ? { recoveryNotice: loaded.notice } : {}) }
    this.effects = loaded.effects
    if (loaded.source === 'current' || loaded.source === 'migrated') {
      const recoveredCount = this.recoverPersistedExecutions()
      if (recoveredCount > 0) {
        const notice = this.state.recoveryNotice
        this.state = {
          ...this.state,
          recoveryNotice: [notice, `Se recuperaron ${recoveredCount} ejecución(es) interrumpida(s) tras recargar.`].filter(Boolean).join(' '),
        }
      }
    }
    if (loaded.notice || loaded.source === 'migrated' || loaded.source === 'recovered') this.persist()
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
    this.effects = effectsFromExecutions(this.state)
    this.publish()
  }

  dismissRecoveryNotice(): void {
    if (!this.state.recoveryNotice) return
    const nextState = { ...this.state }
    delete nextState.recoveryNotice
    this.state = nextState
    this.listeners.forEach((listener) => listener())
  }

  startExecution(employeeId: string, scenarioId: RunScenario, inputLabel?: string): string {
    const employee = employees.find((item) => item.id === employeeId)
    if (!employee) throw new Error('No se encontró el Empleado Digital seleccionado.')
    if (employee.status !== 'ACTIVE') throw new Error(`${employee.name} no está disponible para iniciar ejecuciones (${employee.status.toLowerCase()}).`)
    if (employee.executionMode !== 'FULL_DEMO') throw new Error(`${employee.name} es un perfil de catálogo; su ejecución todavía no está habilitada.`)
    const scenario = demoScenarioById(scenarioId)
    if (!scenario || scenario.employeeId !== employeeId || !employee.tasks.includes(scenario.taskName)) {
      throw new Error('El escenario no corresponde a una tarea ejecutable de este Empleado Digital.')
    }
    const policy = evaluateDemoPolicy(employee, scenario)
    const id = `ex-${Date.now().toString(36)}-${this.sequence++}`
    const actionId = `act-${id}-${scenario.id}`
    const invoiceIds = scenario.invoices.map((invoice) => invoice.id)
    const actionArguments = argumentsForScenario(scenario)
    const action = {
      id: actionId,
      name: scenario.action.name,
      summary: scenario.action.summary,
      reason: policy.reason,
      targetReference: invoiceIds.join(', '),
      arguments: actionArguments,
      risk: policy.risk,
      policyDecision: policy.decision,
      policyVersion: policy.policyVersion,
      status: 'PROPOSED' as const,
      idempotencyKey: `demo:${id}:${actionId}`,
      digest: '',
      proposedAt: new Date().toISOString(),
    }
    action.digest = actionDigest(action)
    const now = new Date().toISOString()
    const record: ExecutionRecord = {
      id, employeeId, employeeVersion: employee.version, taskName: scenario.taskName, scenario: scenario.id,
      status: 'PENDING', requestedAt: now, requestedBy: DEMO_ACTOR.name, inputLabel: inputLabel ?? scenario.inputLabel,
      invoiceCount: scenario.invoices.length, amountTotal: scenario.invoices.reduce((total, invoice) => total + invoice.amount, 0),
      summary: `Solicitud aceptada; ${scenario.description.toLowerCase()}`, correlationId: `corr-demo-${id}`, action,
      events: [this.makeEvent('request', 'Solicitud recibida', `${employee.name} recibió «${scenario.title}» con ${scenario.invoices.length} registro(s) sintético(s).`)], attempts: 0, sideEffectCount: 0,
    }
    this.update((state) => ({ ...state, executions: [record, ...state.executions] }))
    this.schedule(id, [
      () => this.patchExecution(id, (execution) => ({ ...execution, status: 'RUNNING', startedAt: new Date().toISOString(), attempts: 1, summary: 'La ejecución comenzó en el entorno local de demostración.', events: [...execution.events, this.makeEvent('start', 'Ejecución iniciada', `Versión ${employee.version} fijada · tarea «${execution.taskName}».`)] })),
      () => this.addEvent(id, 'read', 'Información consultada', '3 facturas sintéticas · identificadores ficticios · fuente local.'),
      () => this.addEvent(id, 'analysis', 'Análisis operativo', 'Resumen de casos preparado. El prototipo no expone razonamiento privado del modelo.'),
      () => this.addEvent(id, 'proposal', 'Acción propuesta', `${action.name}: ${action.summary}`),
      () => this.evaluate(id),
    ])
    return id
  }

  decideApproval(approvalId: string, decision: 'APPROVED' | 'REJECTED', actor: ApprovalActor, reason: string): void {
    const approval = this.state.approvals.find((item) => item.id === approvalId)
    if (!approval) throw new Error('Esta solicitud no está disponible.')
    if (!actor.authorized || actor.role !== approval.requiredRole) throw new Error('El rol actual no está autorizado para esta aprobación.')
    const normalizedReason = reason.trim()
    if (!normalizedReason) throw new Error('La decisión necesita un motivo registrado.')
    if (approval.status !== 'PENDING') {
      if (approval.status === decision && approval.decidedBy === actor.name && approval.decisionReason === normalizedReason) return
      throw new Error('Esta solicitud ya fue resuelta con una decisión distinta o con otro motivo.')
    }
    const execution = this.state.executions.find((item) => item.id === approval.executionId)
    if (!execution?.action || execution.action.id !== approval.actionId || execution.action.digest !== approval.actionDigest || actionDigest(execution.action) !== approval.actionDigest) {
      throw new Error('La acción cambió desde que se solicitó la aprobación. Se requiere una nueva revisión.')
    }
    const decidedAt = new Date().toISOString()
    const updatedApproval: Approval = { ...approval, status: decision, decidedAt, decidedBy: actor.name, decisionReason: normalizedReason }
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
    const recordedEffect = this.findEffect(execution)
    if (!recordedEffect) throw new Error('No existe un registro idempotente del efecto; se bloquea el reintento para evitar duplicados.')
    this.patchExecution(executionId, (current) => ({
      ...current, status: 'COMPLETED', outcome: 'SUCCESS', completedAt: new Date().toISOString(), durationMs: Date.now() - new Date(current.requestedAt).getTime(),
      attempts: retryWithSameKey ? current.attempts + 1 : current.attempts,
      sideEffectCount: this.effectCount(executionId),
      action: { ...current.action!, status: 'SUCCEEDED' },
      summary: retryWithSameKey ? 'Reintento con la misma clave idempotente: se recuperó el resultado del ledger; no se duplicó el efecto.' : 'Reconciliación: se confirmó el efecto del ledger local de demostración.',
      events: [...current.events, this.makeEvent('reconciliation', retryWithSameKey ? 'Reintento idempotente' : 'Resultado reconciliado', retryWithSameKey ? `La clave ${recordedEffect.idempotencyKey} devolvió el efecto registrado. No se creó un segundo efecto.` : 'El registro local confirma el efecto previamente guardado; no se invocó una operación nueva.')],
    }))
  }

  cancelExecution(executionId: string): void {
    const execution = this.state.executions.find((item) => item.id === executionId)
    if (!execution || !['PENDING', 'RUNNING'].includes(execution.status)) throw new Error('Esta ejecución ya no puede cancelarse.')
    this.timers.get(executionId)?.forEach(window.clearTimeout)
    this.timers.delete(executionId)
    this.patchExecution(executionId, (current) => ({ ...current, status: 'CANCELLED', outcome: 'CANCELLED', completedAt: new Date().toISOString(), sideEffectCount: this.effectCount(executionId), summary: 'Cancelada por una persona operadora; no se inician nuevos pasos ni se revierten efectos ya registrados.', events: [...current.events, this.makeEvent('result', 'Ejecución cancelada', 'No se iniciaron nuevos pasos simulados. Los efectos ya registrados se conservan para reconciliación.')] }))
  }

  private evaluate(id: string): void {
    const execution = this.state.executions.find((item) => item.id === id)
    if (!execution?.action) return
    const scenario = execution.scenario === 'HISTORICAL' ? undefined : demoScenarioById(execution.scenario)
    const decision = execution.action.policyDecision
    if (decision === 'REQUIRE_APPROVAL') {
      const approvalId = `ap-${id}`
      const approval: Approval = { id: approvalId, executionId: id, employeeId: execution.employeeId, actionId: execution.action.id, actionDigest: execution.action.digest, title: execution.action.name, reason: execution.action.reason, risk: execution.action.risk, requiredRole: 'Aprobador de cobranzas', status: 'PENDING', requestedAt: new Date().toISOString() }
      this.update((state) => ({ ...state, approvals: [approval, ...state.approvals] }))
      this.patchExecution(id, (current) => ({ ...current, status: 'WAITING_APPROVAL', approvalId, action: { ...current.action!, status: 'WAITING_APPROVAL' }, summary: 'La política requiere aprobación humana. La ejecución queda suspendida; el tiempo no decidirá por la persona.', events: [...current.events, this.makeEvent('policy', 'Decisión de política', `REQUIRE_APPROVAL · ${execution.action!.reason}`, 'REQUIRE_APPROVAL'), this.makeEvent('approval', 'Aprobación solicitada', `Solicitud ${approvalId} vinculada a la huella ${execution.action!.digest}.`)] }))
      return
    }
    this.patchExecution(id, (current) => ({ ...current, action: { ...current.action!, status: decision === 'DENY' ? 'DENIED' : 'PROPOSED' }, events: [...current.events, this.makeEvent('policy', 'Decisión de política', `${decision} · ${execution.action!.reason}`, decision)] }))
    if (decision === 'DENY') {
      this.patchExecution(id, (current) => ({ ...current, status: 'COMPLETED', outcome: 'POLICY_DENIED', completedAt: new Date().toISOString(), durationMs: Date.now() - new Date(current.requestedAt).getTime(), summary: `Acción denegada por política. ${execution.action!.reason}`, events: [...current.events, this.makeEvent('result', 'Ejecución finalizada sin efecto', 'La política DENY prevalece; no hay operación registrada.')] }))
      return
    }
    if (!scenario) {
      this.failExecution(id, 'DEMO_SCENARIO_NOT_FOUND', 'El escenario demostrativo ya no está disponible; no se inició ninguna herramienta.')
      return
    }
    if (scenario.adapterOutcome === 'FAILURE') {
      this.failExecution(id, 'MOCK_TOOL_UNAVAILABLE', 'El adaptador sintético no estuvo disponible. La política había permitido la acción, pero no se registró ningún efecto.')
      this.addEvent(id, 'failure', 'Herramienta simulada no disponible', 'MOCK_TOOL_UNAVAILABLE · indisponibilidad del adaptador posterior a una decisión ALLOW.')
      return
    }
    if (scenario.adapterOutcome === 'UNCERTAIN') {
      const effect = this.recordSimulatedEffect(execution, 'UNCERTAIN')
      this.patchExecution(id, (current) => ({ ...current, status: 'OUTCOME_UNCERTAIN', outcome: 'UNCERTAIN', action: { ...current.action!, status: 'UNCERTAIN' }, sideEffectCount: this.effectCount(id), attempts: 1, summary: 'TIMEOUT_AFTER_SIMULATED_COMMIT · el resultado requiere reconciliación; no reintentar a ciegas.', events: [...current.events, this.makeEvent('tool', 'Respuesta externa incierta', `${effect.operation} quedó registrado con la clave ${effect.idempotencyKey}, pero el acuse expiró. No se repetirá automáticamente.`)] }))
      return
    }
    this.invokeApprovedAction(id, false)
  }

  private failExecution(id: string, failureCode: string, summary: string): void {
    this.patchExecution(id, (current) => ({
      ...current,
      status: 'FAILED',
      outcome: 'FAILURE',
      failureCode,
      completedAt: new Date().toISOString(),
      durationMs: Date.now() - new Date(current.requestedAt).getTime(),
      action: current.action ? { ...current.action, status: 'FAILED' } : undefined,
      sideEffectCount: this.effectCount(id),
      summary,
      events: [...current.events, this.makeEvent('failure', failureCode, summary)],
    }))
  }

  private revalidateApprovedAction(id: string): void {
    const execution = this.state.executions.find((item) => item.id === id)
    const approval = execution?.approvalId ? this.state.approvals.find((item) => item.id === execution.approvalId) : undefined
    if (!execution || !approval || !this.approvalBindingIsCurrent(execution, approval)) {
      this.failStaleApprovedAction(id)
      return
    }
    this.addEvent(id, 'policy', 'Política revalidada', 'La regla sigue requiriendo aprobación; la decisión humana autorizada y la huella de la acción exacta coinciden.', 'REQUIRE_APPROVAL')
  }

  private invokeApprovedAction(id: string, alreadyScheduled: boolean): void {
    const execution = this.state.executions.find((item) => item.id === id)
    if (!execution?.action) return
    if (execution.status !== 'RUNNING' && execution.status !== 'WAITING_APPROVAL') return
    if (execution.action.policyDecision === 'REQUIRE_APPROVAL') {
      const approval = this.state.approvals.find((item) => item.id === execution.approvalId)
      if (!approval || !this.approvalBindingIsCurrent(execution, approval)) {
        this.failStaleApprovedAction(id)
        return
      }
    }
    const actionName = execution.action.name
    const effect = this.recordSimulatedEffect(execution, 'CONFIRMED')
    if (effect.acknowledgement === 'UNCERTAIN') {
      this.patchExecution(id, (current) => ({ ...current, status: 'OUTCOME_UNCERTAIN', outcome: 'UNCERTAIN', action: { ...current.action!, status: 'UNCERTAIN' }, sideEffectCount: this.effectCount(id), summary: 'El ledger ya contiene una respuesta incierta. Reconcíliala antes de completar la ejecución.', events: [...current.events, this.makeEvent('reconciliation', 'Se conserva el resultado incierto', 'La clave idempotente ya tiene un efecto cuyo acuse no fue confirmado. No se creó otro efecto.')] }))
      return
    }
    this.patchExecution(id, (current) => ({ ...current, status: 'COMPLETED', outcome: 'SUCCESS', completedAt: new Date().toISOString(), durationMs: Date.now() - new Date(current.requestedAt).getTime(), action: { ...current.action!, status: 'SUCCEEDED' }, sideEffectCount: this.effectCount(id), summary: 'Operación completada en el registro local de demostración. No se contactó a clientes ni a sistemas reales.', events: [...current.events, this.makeEvent('tool', alreadyScheduled ? 'Herramienta simulada ejecutada' : 'Acción simulada registrada', effect.wasExisting ? `La clave ${effect.idempotencyKey} devolvió el efecto del ledger; no se duplicó.` : `${actionName} quedó registrada solo en el ledger local de demostración.`), this.makeEvent('result', 'Resultado final', 'Ejecución completada · acción gobernada y trazable · integración simulada.')] }))
  }

  private failStaleApprovedAction(id: string): void {
    this.patchExecution(id, (current) => ({
      ...current,
      status: 'FAILED',
      outcome: 'FAILURE',
      failureCode: 'ACTION_APPROVAL_BINDING_INVALID',
      completedAt: new Date().toISOString(),
      durationMs: Date.now() - new Date(current.requestedAt).getTime(),
      action: current.action ? { ...current.action, status: 'FAILED' } : undefined,
      summary: 'La acción cambió después de solicitar o recibir aprobación. No se ejecutó; hace falta una nueva revisión.',
      events: [...current.events, this.makeEvent('failure', 'Revalidación de acción fallida', 'La huella, el rol o la versión de política ya no coinciden. No se invocó la herramienta.'), this.makeEvent('result', 'Ejecución cerrada sin efecto', 'La aprobación anterior no autoriza una acción distinta.')],
    }))
  }

  private recoverPersistedExecutions(): number {
    let recovered = 0
    const persistedExecutions = [...this.state.executions]
    for (const execution of persistedExecutions) {
      if (execution.status === 'PENDING' || execution.status === 'RUNNING') {
        const effect = this.findEffect(execution)
        if (!effect) {
          this.patchExecution(execution.id, (current) => ({
            ...current,
            status: 'FAILED',
            outcome: 'FAILURE',
            failureCode: 'MOCK_EXECUTION_INTERRUPTED_ON_RELOAD',
            completedAt: new Date().toISOString(),
            action: current.action ? { ...current.action, status: 'FAILED' } : undefined,
            sideEffectCount: this.effectCount(execution.id),
            summary: 'La simulación se interrumpió al recargar. No existe un efecto en el ledger, por lo que no se reintentó automáticamente.',
            events: [...current.events, this.makeEvent('failure', 'Simulación interrumpida al recargar', 'No había un efecto idempotente registrado. Se cerró de forma controlada y no se reanudó trabajo incierto.')],
          }))
        } else if (effect.acknowledgement === 'UNCERTAIN') {
          this.patchExecution(execution.id, (current) => ({
            ...current,
            status: 'OUTCOME_UNCERTAIN',
            outcome: 'UNCERTAIN',
            action: current.action ? { ...current.action, status: 'UNCERTAIN' } : undefined,
            sideEffectCount: this.effectCount(execution.id),
            summary: 'Se recuperó un efecto del ledger cuyo acuse es incierto. Reconcílialo antes de reintentar.',
            events: [...current.events, this.makeEvent('reconciliation', 'Resultado incierto recuperado', `El ledger conserva la clave ${effect.idempotencyKey}; no se creó un efecto adicional.`)],
          }))
        } else {
          this.completeFromRecordedEffect(execution.id, effect, 'Ejecución recuperada del ledger tras recargar.')
        }
        recovered += 1
        continue
      }

      if (execution.status === 'WAITING_APPROVAL') {
        const approval = this.state.approvals.find((item) => item.id === execution.approvalId)
        if (!approval || approval.status === 'PENDING') continue
        if (approval.status === 'REJECTED') {
          this.patchExecution(execution.id, (current) => ({
            ...current,
            status: 'CANCELLED',
            outcome: 'HUMAN_REJECTED',
            completedAt: approval.decidedAt ?? new Date().toISOString(),
            failureCode: undefined,
            summary: 'La decisión de rechazo recuperada cierra la ejecución sin invocar herramientas.',
            action: current.action ? { ...current.action, status: 'REJECTED' } : undefined,
            events: [...current.events, this.makeEvent('reconciliation', 'Rechazo humano recuperado', 'La aprobación estaba rechazada antes de la recarga. No se ejecutó la acción.')],
          }))
          recovered += 1
          continue
        }
        if (!this.approvalBindingIsCurrent(execution, approval)) {
          this.failStaleApprovedAction(execution.id)
          recovered += 1
          continue
        }
        const effect = this.findEffect(execution)
        if (effect?.acknowledgement === 'UNCERTAIN') {
          this.patchExecution(execution.id, (current) => ({
            ...current,
            status: 'OUTCOME_UNCERTAIN',
            outcome: 'UNCERTAIN',
            action: current.action ? { ...current.action, status: 'UNCERTAIN' } : undefined,
            sideEffectCount: this.effectCount(execution.id),
            summary: 'La aprobación y el efecto se recuperaron, pero el acuse es incierto. Reconcílialo antes de continuar.',
            events: [...current.events, this.makeEvent('reconciliation', 'Aprobación y efecto recuperados', 'No se repitió la acción; el ledger requiere reconciliación explícita.')],
          }))
        } else {
          const recorded = effect ?? this.recordSimulatedEffect(execution, 'CONFIRMED')
          this.completeFromRecordedEffect(execution.id, recorded, 'Aprobación recuperada; la acción exacta se reanudó en el simulador local.')
        }
        recovered += 1
        continue
      }

      if (execution.status === 'OUTCOME_UNCERTAIN') {
        const effect = this.findEffect(execution)
        if (!effect) {
          this.patchExecution(execution.id, (current) => ({
            ...current,
            status: 'FAILED',
            outcome: 'FAILURE',
            failureCode: 'MOCK_UNCERTAIN_EFFECT_MISSING',
            completedAt: new Date().toISOString(),
            sideEffectCount: this.effectCount(execution.id),
            summary: 'No se encontró en el ledger el efecto de resultado incierto. El reintento queda bloqueado para evitar duplicados.',
            events: [...current.events, this.makeEvent('failure', 'Ledger de efecto no disponible', 'La ejecución se cerró de forma controlada. Se requiere revisión manual del prototipo.')],
          }))
          recovered += 1
        } else if (effect.acknowledgement === 'CONFIRMED') {
          this.completeFromRecordedEffect(execution.id, effect, 'El ledger confirma el resultado previamente incierto.')
          recovered += 1
        }
      }
    }
    return recovered
  }

  private approvalBindingIsCurrent(execution: ExecutionRecord, approval: Approval): boolean {
    const action = execution.action
    if (!action) return false
    const scenario = execution.scenario === 'HISTORICAL' ? undefined : demoScenarioById(execution.scenario)
    const employee = employees.find((item) => item.id === execution.employeeId)
    if (!scenario || !employee) return false
    const policy = evaluateDemoPolicy(employee, scenario)
    const fingerprint = actionDigest(action)
    const isLegacyAction = action.arguments === undefined && action.policyVersion === LEGACY_DEMO_POLICY_VERSION
    const versionIsSupported = action.policyVersion === policy.policyVersion || isLegacyAction
    const normalizedArgumentsMatch = isLegacyAction || JSON.stringify(action.arguments) === JSON.stringify(argumentsForScenario(scenario))
    return policy.decision === 'REQUIRE_APPROVAL' && policy.risk === action.risk &&
      action.policyDecision === policy.decision && versionIsSupported && normalizedArgumentsMatch &&
      approval.status === 'APPROVED' && approval.actionId === action.id &&
      approval.actionDigest === action.digest && approval.actionDigest === fingerprint &&
      approval.requiredRole === DEMO_ACTOR.role
  }

  private completeFromRecordedEffect(executionId: string, effect: SimulatedEffect, recoverySummary: string): void {
    this.patchExecution(executionId, (current) => ({
      ...current,
      status: 'COMPLETED',
      outcome: 'SUCCESS',
      completedAt: new Date().toISOString(),
      durationMs: Date.now() - new Date(current.requestedAt).getTime(),
      action: current.action ? { ...current.action, status: 'SUCCEEDED' } : undefined,
      sideEffectCount: this.effectCount(executionId),
      summary: recoverySummary,
      events: [...current.events, this.makeEvent('reconciliation', 'Efecto recuperado sin duplicarlo', `Se usó el resultado existente de la clave ${effect.idempotencyKey}. No se creó un efecto nuevo.`), this.makeEvent('result', 'Resultado final recuperado', effect.resultSummary)],
    }))
  }

  private recordSimulatedEffect(execution: ExecutionRecord, acknowledgement: SimulatedEffect['acknowledgement']): SimulatedEffect & { wasExisting: boolean } {
    if (!execution.action) throw new Error('No se puede registrar un efecto sin una acción tipada.')
    const existing = this.effects.find((effect) => effect.idempotencyKey === execution.action!.idempotencyKey)
    if (existing) {
      if (existing.executionId !== execution.id || existing.actionId !== execution.action.id) {
        throw new Error('La clave de idempotencia ya pertenece a otra acción; se bloqueó el efecto simulado.')
      }
      return { ...existing, wasExisting: true }
    }
    const effect: SimulatedEffect = {
      idempotencyKey: execution.action.idempotencyKey,
      executionId: execution.id,
      actionId: execution.action.id,
      operation: execution.action.name,
      resultSummary: `Efecto local simulado: ${execution.action.summary}`,
      committedAt: new Date().toISOString(),
      acknowledgement,
    }
    this.effects = [...this.effects, effect]
    this.persist()
    return { ...effect, wasExisting: false }
  }

  private findEffect(execution: ExecutionRecord): SimulatedEffect | undefined {
    if (!execution.action) return undefined
    return this.effects.find((effect) => effect.idempotencyKey === execution.action!.idempotencyKey && effect.executionId === execution.id && effect.actionId === execution.action!.id)
  }

  private effectCount(executionId: string): number {
    return this.effects.filter((effect) => effect.executionId === executionId).length
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
    this.persist()
    this.listeners.forEach((listener) => listener())
  }

  private persist(): void {
    if (!savePlatformSnapshot(this.storage, this.state, this.effects) && this.storage) {
      this.state = { ...this.state, recoveryNotice: 'No se pudieron guardar los datos sintéticos en este navegador. La simulación solo estará disponible durante esta sesión.' }
    }
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
