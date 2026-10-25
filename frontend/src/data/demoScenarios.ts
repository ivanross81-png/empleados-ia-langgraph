import type { DemoScenario, LegacyRunScenario, RunScenario } from '../domain/types'

const legacyScenarioIds: Record<LegacyRunScenario, RunScenario> = {
  approval: 'follow-up-review',
  allow: 'review-eligible',
  deny: 'closed-case',
  failure: 'tool-unavailable',
  uncertain: 'uncertain-ack',
}

export const demoScenarios: DemoScenario[] = [
  {
    id: 'review-eligible',
    title: 'Revisar lote de facturas abierto',
    description: 'Caso abierto y de bajo riesgo para actualizar su marca de revisión.',
    badge: 'CASO ABIERTO',
    employeeId: 'cobranzas',
    taskName: 'Revisar facturas vencidas',
    inputLabel: 'Lote sintético · abril',
    invoices: [{ id: 'INV-SYN-041', customerReference: 'ACME-SYN-041', amount: 3_920, daysOverdue: 18, status: 'OPEN', contactEligible: true }],
    action: {
      type: 'MARK_REVIEWED',
      name: 'Marcar caso como revisado',
      summary: 'Registrar la revisión interna del caso sintético.',
      reason: 'El caso está abierto y la actualización interna es reversible.',
    },
    adapterOutcome: 'CONFIRMED',
  },
  {
    id: 'closed-case',
    title: 'Proponer seguimiento a caso cerrado',
    description: 'Caso cerrado y no elegible para contacto en los datos sintéticos.',
    badge: 'CASO CERRADO',
    employeeId: 'cobranzas',
    taskName: 'Revisar facturas vencidas',
    inputLabel: 'Caso sintético · cerrado',
    invoices: [{ id: 'INV-SYN-018', customerReference: 'ACME-SYN-018', amount: 1_830, daysOverdue: 0, status: 'CLOSED', contactEligible: false }],
    action: {
      type: 'PREPARE_FOLLOW_UP',
      name: 'Preparar borrador de seguimiento',
      summary: 'Preparar un borrador local para un caso sintético cerrado.',
      reason: 'La cuenta está cerrada y no cumple las condiciones de elegibilidad.',
    },
    adapterOutcome: 'CONFIRMED',
  },
  {
    id: 'follow-up-review',
    title: 'Preparar seguimiento para revisión humana',
    description: 'Caso abierto y elegible; el borrador requiere una decisión humana.',
    badge: 'SEGUIMIENTO',
    employeeId: 'cobranzas',
    taskName: 'Revisar facturas vencidas',
    inputLabel: 'Lote sintético · abril',
    invoices: [
      { id: 'INV-SYN-042', customerReference: 'ACME-SYN-042', amount: 5_300, daysOverdue: 34, status: 'OPEN', contactEligible: true },
      { id: 'INV-SYN-043', customerReference: 'ACME-SYN-043', amount: 4_180, daysOverdue: 26, status: 'OPEN', contactEligible: true },
      { id: 'INV-SYN-044', customerReference: 'ACME-SYN-044', amount: 3_000, daysOverdue: 20, status: 'OPEN', contactEligible: true },
    ],
    action: {
      type: 'PREPARE_FOLLOW_UP',
      name: 'Preparar borrador de seguimiento',
      summary: 'Preparar un borrador local para tres facturas sintéticas.',
      reason: 'El lote está abierto y es elegible; la comunicación necesita aprobación humana explícita.',
    },
    adapterOutcome: 'CONFIRMED',
  },
  {
    id: 'tool-unavailable',
    title: 'Simular herramienta no disponible',
    description: 'Caso abierto permitido cuya herramienta local devuelve un fallo tipado.',
    badge: 'FALLO DE HERRAMIENTA',
    employeeId: 'cobranzas',
    taskName: 'Revisar facturas vencidas',
    inputLabel: 'Lote sintético · cierre',
    invoices: [
      { id: 'INV-SYN-051', customerReference: 'ACME-SYN-051', amount: 2_200, daysOverdue: 12, status: 'OPEN', contactEligible: true },
      { id: 'INV-SYN-052', customerReference: 'ACME-SYN-052', amount: 1_800, daysOverdue: 15, status: 'OPEN', contactEligible: true },
      { id: 'INV-SYN-053', customerReference: 'ACME-SYN-053', amount: 2_710, daysOverdue: 22, status: 'OPEN', contactEligible: true },
      { id: 'INV-SYN-054', customerReference: 'ACME-SYN-054', amount: 2_000, daysOverdue: 9, status: 'OPEN', contactEligible: true },
    ],
    action: {
      type: 'MARK_REVIEWED',
      name: 'Marcar casos como revisados',
      summary: 'Registrar la revisión interna de cuatro casos sintéticos.',
      reason: 'Los casos están abiertos; el adaptador de demostración simulará una indisponibilidad.',
    },
    adapterOutcome: 'FAILURE',
  },
  {
    id: 'uncertain-ack',
    title: 'Simular respuesta externa incierta',
    description: 'Caso abierto permitido con un efecto en ledger y acuse de recibo incierto.',
    badge: 'ACUSE INCIERTO',
    employeeId: 'cobranzas',
    taskName: 'Revisar facturas vencidas',
    inputLabel: 'Lote sintético · marzo',
    invoices: [
      { id: 'INV-SYN-038', customerReference: 'ACME-SYN-038', amount: 2_220, daysOverdue: 19, status: 'OPEN', contactEligible: true },
      { id: 'INV-SYN-039', customerReference: 'ACME-SYN-039', amount: 2_200, daysOverdue: 11, status: 'OPEN', contactEligible: true },
    ],
    action: {
      type: 'MARK_REVIEWED',
      name: 'Marcar casos como revisados',
      summary: 'Registrar la revisión interna de dos casos sintéticos.',
      reason: 'Los casos están abiertos y la actualización no envía comunicaciones.',
    },
    adapterOutcome: 'UNCERTAIN',
  },
]

export function demoScenarioById(id: RunScenario | LegacyRunScenario): DemoScenario | undefined {
  const currentId = id in legacyScenarioIds ? legacyScenarioIds[id as LegacyRunScenario] : id as RunScenario
  return demoScenarios.find((scenario) => scenario.id === currentId)
}
