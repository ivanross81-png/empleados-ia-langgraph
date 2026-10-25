import type { DemoActionArguments, DemoScenario, DigitalEmployee, PolicyDecision, PolicyEvaluation, ProposedAction } from './types'

export const DEMO_POLICY_VERSION = 'pol-cobranza-v4'
export const LEGACY_DEMO_POLICY_VERSION = 'pol-cobranza-v3'

export function argumentsForScenario(scenario: DemoScenario): DemoActionArguments {
  const invoiceIds = scenario.invoices.map((invoice) => invoice.id)
  return scenario.action.type === 'MARK_REVIEWED'
    ? { actionType: 'MARK_REVIEWED', invoiceIds, reviewStatus: 'REVIEWED' }
    : { actionType: 'PREPARE_FOLLOW_UP', invoiceIds, destination: 'LOCAL_DRAFTS', templateId: 'collections-follow-up-v1' }
}

function assessRisk(scenario: DemoScenario): ProposedAction['risk'] {
  if (scenario.invoices.some((invoice) => invoice.status === 'CLOSED' || !invoice.contactEligible)) return 'HIGH'
  const batchAmount = scenario.invoices.reduce((total, invoice) => total + invoice.amount, 0)
  if (batchAmount >= 10_000 || scenario.action.type === 'PREPARE_FOLLOW_UP') return 'MEDIUM'
  return 'LOW'
}

export function evaluateDemoPolicy(employee: DigitalEmployee | undefined, scenario: DemoScenario): PolicyEvaluation {
  const risk = assessRisk(scenario)
  const deny = (reason: string): PolicyEvaluation => ({ decision: 'DENY', reason, risk, policyVersion: DEMO_POLICY_VERSION })

  if (!employee) return deny('El Empleado Digital no existe en el catálogo local.')
  if (employee.status !== 'ACTIVE') return deny('El perfil del Empleado Digital no está activo.')
  if (employee.executionMode !== 'FULL_DEMO' || employee.id !== scenario.employeeId) {
    return deny('Este perfil no tiene un flujo completo de ejecución demostrativo para esta tarea.')
  }
  if (!employee.tasks.includes(scenario.taskName)) return deny('La tarea no está asignada a este Empleado Digital.')
  if (scenario.invoices.length === 0) return deny('No hay registros sintéticos para evaluar.')
  if (scenario.invoices.some((invoice) => invoice.status === 'CLOSED')) {
    return deny('El lote contiene una factura cerrada; la política local deniega la acción.')
  }
  if (scenario.action.type === 'PREPARE_FOLLOW_UP') {
    if (scenario.invoices.some((invoice) => !invoice.contactEligible)) {
      return deny('Al menos una factura no es elegible para seguimiento.')
    }
    return { decision: 'REQUIRE_APPROVAL', reason: 'Los seguimientos se preparan como borradores y requieren aprobación humana explícita.', risk, policyVersion: DEMO_POLICY_VERSION }
  }
  if (scenario.action.type === 'MARK_REVIEWED' && employee.capabilities.includes('Registro de actividad')) {
    return { decision: 'ALLOW', reason: 'El lote está abierto y la actualización interna es reversible y de bajo riesgo.', risk, policyVersion: DEMO_POLICY_VERSION }
  }
  return deny('No hay una regla local explícita que permita esta acción.')
}

/** Stable demonstration fingerprint only; it is not a cryptographic authorization token. */
export function actionDigest(action: ProposedAction): string {
  const args = action.arguments?.actionType === 'MARK_REVIEWED'
    ? `MARK_REVIEWED|${[...action.arguments.invoiceIds].sort().join(',')}|${action.arguments.reviewStatus}`
    : action.arguments?.actionType === 'PREPARE_FOLLOW_UP'
      ? `PREPARE_FOLLOW_UP|${[...action.arguments.invoiceIds].sort().join(',')}|${action.arguments.destination}|${action.arguments.templateId}`
      : undefined
  // Preserve the former fingerprint for migrated, read-only history without normalized arguments.
  const canonical = args
    ? [action.id, action.name, action.summary, action.reason, action.targetReference, args, action.risk, action.policyVersion].join('|')
    : [action.id, action.name, action.targetReference, action.summary].join('|')
  let hash = 2166136261
  for (let index = 0; index < canonical.length; index += 1) {
    hash ^= canonical.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return `demo-${(hash >>> 0).toString(16).padStart(8, '0')}`
}

export function decisionLabel(decision: PolicyDecision): string {
  return decision === 'ALLOW' ? 'Permitida por política' : decision === 'DENY' ? 'Denegada por política' : 'Requiere aprobación'
}
