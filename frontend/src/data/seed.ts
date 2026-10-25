import type { Approval, ExecutionEvent, ExecutionRecord, PlatformState, ProposedAction } from '../domain/types'
import { actionDigest } from '../domain/policy'

const iso = (minutesAgo: number) => new Date(Date.now() - minutesAgo * 60_000).toISOString()

function event(id: string, kind: ExecutionEvent['kind'], title: string, description: string, timestamp: string, decision?: ExecutionEvent['decision']): ExecutionEvent {
  return { id, kind, title, description, timestamp, decision }
}

function action(fields: Omit<ProposedAction, 'digest' | 'proposedAt'>, proposedMinutesAgo: number): ProposedAction {
  const proposed = { ...fields, proposedAt: iso(proposedMinutesAgo), digest: '' }
  proposed.digest = actionDigest(proposed)
  return proposed
}

const pendingAction = action({
  id: 'act-2084-follow-up',
  name: 'Preparar borrador de seguimiento',
  summary: 'Preparar un borrador local para tres facturas sintéticas.',
  reason: 'El lote está abierto y es elegible; la comunicación necesita aprobación humana explícita.',
  targetReference: 'LOTE-SINT-042 · cuenta ACME-SYN-042',
  arguments: { actionType: 'PREPARE_FOLLOW_UP', invoiceIds: ['INV-SYN-042', 'INV-SYN-043', 'INV-SYN-044'], destination: 'LOCAL_DRAFTS', templateId: 'collections-follow-up-v1' },
  risk: 'MEDIUM',
  policyDecision: 'REQUIRE_APPROVAL',
  policyVersion: 'pol-cobranza-v4',
  status: 'WAITING_APPROVAL',
  idempotencyKey: 'demo:ex-2084:act-2084-follow-up',
}, 11)

function baseEvents(id: string, age: number, proposed?: ProposedAction): ExecutionEvent[] {
  return [
    event(`${id}-request`, 'request', 'Solicitud recibida', 'Revisión manual de lote sintético · disparador MANUAL.', iso(age)),
    event(`${id}-start`, 'start', 'Ejecución iniciada', 'Versión del empleado y tarea fijadas para esta ejecución.', iso(age - 1)),
    event(`${id}-read`, 'read', 'Información consultada', 'Se leyeron registros sintéticos con identificadores ficticios.', iso(age - 2)),
    event(`${id}-analysis`, 'analysis', 'Análisis operativo', 'Se preparó un resumen de casos. No se muestra razonamiento interno del modelo.', iso(age - 3)),
    ...(proposed ? [
      event(`${id}-proposal`, 'proposal', 'Acción propuesta', proposed.summary, iso(age - 4)),
      event(`${id}-policy`, 'policy', 'Evaluación de política', 'La política local requiere una decisión humana para esta acción exacta.', iso(age - 5), 'REQUIRE_APPROVAL'),
    ] : []),
  ]
}

const executions: ExecutionRecord[] = [
  {
    id: 'ex-2084', employeeId: 'cobranzas', employeeVersion: 'v1.4.2', taskName: 'Revisar facturas vencidas', scenario: 'follow-up-review',
    status: 'WAITING_APPROVAL', requestedAt: iso(11), startedAt: iso(10), requestedBy: 'Elena García', inputLabel: 'Lote sintético · abril',
    invoiceCount: 3, amountTotal: 12_480, summary: 'Propuesta de borrador preparada; espera revisión de una persona autorizada.',
    correlationId: 'corr-demo-2084', action: pendingAction, approvalId: 'ap-2084', events: baseEvents('ex-2084', 11, pendingAction), attempts: 1, sideEffectCount: 0,
  },
  {
    id: 'ex-2083', employeeId: 'cobranzas', employeeVersion: 'v1.4.2', taskName: 'Revisar facturas vencidas', scenario: 'review-eligible',
    status: 'COMPLETED', outcome: 'SUCCESS', requestedAt: iso(34), startedAt: iso(33), completedAt: iso(31), durationMs: 128_000,
    requestedBy: 'Elena García', inputLabel: 'Lote sintético · abril', invoiceCount: 2, amountTotal: 3_920,
    summary: '2 casos revisados y registrados en el entorno simulado.', correlationId: 'corr-demo-2083',
    action: action({ id: 'act-2083-review', name: 'Marcar casos como revisados', summary: 'Registrar revisión de dos casos sintéticos.', reason: 'Actualización interna reversible.', targetReference: 'LOTE-SINT-041', arguments: { actionType: 'MARK_REVIEWED', invoiceIds: ['INV-SYN-041', 'INV-SYN-040'], reviewStatus: 'REVIEWED' }, risk: 'LOW', policyDecision: 'ALLOW', policyVersion: 'pol-cobranza-v4', status: 'SUCCEEDED', idempotencyKey: 'demo:ex-2083:act-2083-review' }, 32),
    events: [...baseEvents('ex-2083', 34), event('ex-2083-allow', 'policy', 'Evaluación de política', 'Los registros están abiertos y la actualización es de bajo riesgo.', iso(30), 'ALLOW'), event('ex-2083-tool', 'tool', 'Herramienta simulada ejecutada', '2 casos marcados como revisados en el ledger local.', iso(29)), event('ex-2083-result', 'result', 'Ejecución completada', 'Resultado visible; no se modificó ningún sistema externo.', iso(28))],
    attempts: 1, sideEffectCount: 1,
  },
  {
    id: 'ex-2082', employeeId: 'cobranzas', employeeVersion: 'v1.4.2', taskName: 'Revisar facturas vencidas', scenario: 'tool-unavailable',
    status: 'FAILED', outcome: 'FAILURE', failureCode: 'MOCK_TOOL_UNAVAILABLE', requestedAt: iso(86), startedAt: iso(85), completedAt: iso(83), durationMs: 96_000,
    requestedBy: 'Diego Martín', inputLabel: 'Lote sintético · cierre', invoiceCount: 4, amountTotal: 8_710,
    summary: 'El adaptador de demostración devolvió un error tipado de lectura.', correlationId: 'corr-demo-2082',
    action: action({ id: 'act-2082-review', name: 'Marcar casos como revisados', summary: 'Registrar revisión interna de cuatro casos sintéticos.', reason: 'La política permitió el análisis; el adaptador local no estuvo disponible.', targetReference: 'LOTE-SINT-051', arguments: { actionType: 'MARK_REVIEWED', invoiceIds: ['INV-SYN-051', 'INV-SYN-052', 'INV-SYN-053', 'INV-SYN-054'], reviewStatus: 'REVIEWED' }, risk: 'LOW', policyDecision: 'ALLOW', policyVersion: 'pol-cobranza-v4', status: 'FAILED', idempotencyKey: 'demo:ex-2082:act-2082-review' }, 84),
    events: [...baseEvents('ex-2082', 86), event('ex-2082-failure', 'failure', 'Lectura interrumpida', 'MOCK_TOOL_UNAVAILABLE · no se registró ningún efecto.', iso(83))], attempts: 1, sideEffectCount: 0,
  },
  {
    id: 'ex-2081', employeeId: 'cobranzas', employeeVersion: 'v1.4.2', taskName: 'Revisar facturas vencidas', scenario: 'review-eligible',
    status: 'COMPLETED', outcome: 'SUCCESS', requestedAt: iso(190), startedAt: iso(189), completedAt: iso(187), durationMs: 42_000,
    requestedBy: 'Elena García', inputLabel: 'Lote sintético · abril', invoiceCount: 2, amountTotal: 4_420,
    summary: 'Comparación sintética completada; el resumen quedó disponible para revisión.', correlationId: 'corr-demo-2081',
    events: [...baseEvents('ex-2081', 190), event('ex-2081-result', 'result', 'Revisión completada', 'Se generó un resumen local con facturas ficticias; sin cambios externos.', iso(187))], attempts: 1, sideEffectCount: 0,
  },
  {
    id: 'ex-2080', employeeId: 'cobranzas', employeeVersion: 'v1.4.2', taskName: 'Revisar facturas vencidas', scenario: 'closed-case',
    status: 'COMPLETED', outcome: 'POLICY_DENIED', requestedAt: iso(245), startedAt: iso(244), completedAt: iso(242), durationMs: 112_000,
    requestedBy: 'Diego Martín', inputLabel: 'Caso sintético · cerrado', invoiceCount: 1, amountTotal: 1_830,
    summary: 'La política denegó la propuesta; no hubo efecto simulado.', correlationId: 'corr-demo-2080',
    action: action({ id: 'act-2080-closed', name: 'Preparar borrador de seguimiento', summary: 'Intento de seguimiento sobre una cuenta sintética cerrada.', reason: 'La cuenta está cerrada y no cumple las condiciones de elegibilidad.', targetReference: 'INV-SYN-018', arguments: { actionType: 'PREPARE_FOLLOW_UP', invoiceIds: ['INV-SYN-018'], destination: 'LOCAL_DRAFTS', templateId: 'collections-follow-up-v1' }, risk: 'HIGH', policyDecision: 'DENY', policyVersion: 'pol-cobranza-v4', status: 'DENIED', idempotencyKey: 'demo:ex-2080-closed' }, 243),
    events: [...baseEvents('ex-2080', 245), event('ex-2080-deny', 'policy', 'Evaluación de política', 'Caso cerrado: la acción queda denegada.', iso(242), 'DENY'), event('ex-2080-result', 'result', 'Sin cambios', 'La herramienta simulada no fue ejecutada.', iso(241))], attempts: 1, sideEffectCount: 0,
  },
  {
    id: 'ex-2079', employeeId: 'cobranzas', employeeVersion: 'v1.4.2', taskName: 'Revisar facturas vencidas', scenario: 'uncertain-ack',
    status: 'OUTCOME_UNCERTAIN', outcome: 'UNCERTAIN', requestedAt: iso(410), startedAt: iso(409),
    requestedBy: 'Elena García', inputLabel: 'Lote sintético · marzo', invoiceCount: 2, amountTotal: 4_420,
    summary: 'El ledger registró el efecto simulado; el acuse quedó incierto. Reconciliar antes de reintentar.', correlationId: 'corr-demo-2079',
    action: action({ id: 'act-2079-timeout', name: 'Marcar casos como revisados', summary: 'Registrar revisión interna de dos casos sintéticos.', reason: 'Los casos están abiertos y la actualización no envía comunicaciones.', targetReference: 'LOTE-SINT-038', arguments: { actionType: 'MARK_REVIEWED', invoiceIds: ['INV-SYN-038', 'INV-SYN-039'], reviewStatus: 'REVIEWED' }, risk: 'LOW', policyDecision: 'ALLOW', policyVersion: 'pol-cobranza-v4', status: 'UNCERTAIN', idempotencyKey: 'demo:ex-2079-timeout' }, 408),
    events: [...baseEvents('ex-2079', 410), event('ex-2079-allow', 'policy', 'Evaluación de política', 'Los registros están abiertos y la actualización es de bajo riesgo.', iso(407), 'ALLOW'), event('ex-2079-tool', 'tool', 'Respuesta externa incierta', 'TIMEOUT_AFTER_SIMULATED_COMMIT · el ledger idempotente conserva el efecto.', iso(406))], attempts: 1, sideEffectCount: 1,
  },
  {
    id: 'ex-2078', employeeId: 'cobranzas', employeeVersion: 'v1.4.2', taskName: 'Revisar facturas vencidas', scenario: 'follow-up-review',
    status: 'CANCELLED', outcome: 'HUMAN_REJECTED', requestedAt: iso(510), startedAt: iso(509), completedAt: iso(507), durationMs: 101_000,
    requestedBy: 'Elena García', inputLabel: 'Caso sintético · marzo', invoiceCount: 1, amountTotal: 960,
    summary: 'La persona aprobadora rechazó la propuesta. Nunca se ejecutó.', correlationId: 'corr-demo-2078', approvalId: 'ap-2078',
    action: action({ id: 'act-2078-rejected', name: 'Preparar borrador de seguimiento', summary: 'Propuesta de borrador para un caso sintético.', reason: 'La persona responsable debe revisar el borrador.', targetReference: 'INV-SYN-014', arguments: { actionType: 'PREPARE_FOLLOW_UP', invoiceIds: ['INV-SYN-014'], destination: 'LOCAL_DRAFTS', templateId: 'collections-follow-up-v1' }, risk: 'MEDIUM', policyDecision: 'REQUIRE_APPROVAL', policyVersion: 'pol-cobranza-v4', status: 'REJECTED', idempotencyKey: 'demo:ex-2078-rejected' }, 508),
    events: [...baseEvents('ex-2078', 510), event('ex-2078-rejected', 'approval', 'Acción rechazada por una persona', 'No se invocó la herramienta simulada.', iso(507))], attempts: 1, sideEffectCount: 0,
  },
]

const rejectedExecution = executions.find((execution) => execution.id === 'ex-2078')!
const rejectedAction = rejectedExecution.action!

const approvals: Approval[] = [
  { id: 'ap-2084', executionId: 'ex-2084', employeeId: 'cobranzas', actionId: pendingAction.id, actionDigest: pendingAction.digest, title: pendingAction.name, reason: pendingAction.reason, risk: 'MEDIUM', requiredRole: 'Aprobador de cobranzas', status: 'PENDING', requestedAt: iso(11) },
  { id: 'ap-2078', executionId: 'ex-2078', employeeId: 'cobranzas', actionId: rejectedAction.id, actionDigest: rejectedAction.digest, title: rejectedAction.name, reason: rejectedAction.reason, risk: rejectedAction.risk, requiredRole: 'Aprobador de cobranzas', status: 'REJECTED', requestedAt: rejectedAction.proposedAt, decidedAt: rejectedExecution.completedAt, decidedBy: 'Elena García', decisionReason: 'El caso no debe recibir seguimiento.' },
]

export function createSeedState(): PlatformState {
  return { executions: structuredClone(executions), approvals: structuredClone(approvals) }
}
