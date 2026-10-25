import type { DigitalEmployee, Integration } from '../domain/types'

export const employees: DigitalEmployee[] = [
  {
    id: 'cobranzas', name: 'Sofía', role: 'Analista de cobranzas', department: 'Finanzas',
    description: 'Prioriza cuentas vencidas y prepara el siguiente paso para cada caso.',
    purpose: 'Ayuda al equipo financiero a revisar facturas vencidas, ordenar casos por prioridad y proponer seguimientos consistentes. Las comunicaciones permanecen bajo supervisión humana.',
    capabilities: ['Análisis de facturas', 'Priorización de cuentas', 'Propuesta de seguimiento', 'Registro de actividad'],
    tasks: ['Revisar facturas vencidas', 'Preparar resumen diario', 'Clasificar casos para revisión'],
    integrations: ['Nexo CRM', 'Atlas ERP', 'Bóveda de facturas'], version: 'v1.4.2', status: 'ACTIVE', executionMode: 'FULL_DEMO', lastActivity: 'Hace 4 min', initials: 'SO', color: 'coral', isDemo: true,
  },
  {
    id: 'finanzas', name: 'Mateo', role: 'Analista de conciliación', department: 'Finanzas',
    description: 'Detecta diferencias entre movimientos y registros contables.',
    purpose: 'Apoya la conciliación diaria destacando movimientos que necesitan revisión y preparando una lista trazable de excepciones.',
    capabilities: ['Comparación de registros', 'Detección de discrepancias', 'Preparación de informes'],
    tasks: ['Conciliar movimientos', 'Preparar excepciones de cierre'], integrations: ['Atlas ERP', 'Bóveda de facturas'], version: 'v0.9.1', status: 'ACTIVE', executionMode: 'PROFILE_ONLY', lastActivity: 'Hace 28 min', initials: 'MA', color: 'blue', isDemo: true,
  },
  {
    id: 'personas', name: 'Valentina', role: 'Coordinadora de personas', department: 'Recursos humanos',
    description: 'Organiza solicitudes internas y mantiene visibles los siguientes pasos.',
    purpose: 'Clasifica solicitudes internas sintéticas, consulta políticas de equipo y prepara borradores para revisión de personas autorizadas.',
    capabilities: ['Clasificación de solicitudes', 'Consulta de políticas', 'Preparación de borradores'],
    tasks: ['Clasificar solicitudes', 'Preparar kit de incorporación'], integrations: ['Correo de prueba', 'Directorio de equipo'], version: 'v0.7.0', status: 'PAUSED', executionMode: 'PROFILE_ONLY', lastActivity: 'Ayer', initials: 'VA', color: 'purple', isDemo: true,
  },
  {
    id: 'compras', name: 'Tomás', role: 'Asistente de compras', department: 'Compras',
    description: 'Compara propuestas de proveedores y prepara solicitudes internas.',
    purpose: 'Reúne datos de proveedores ficticios, resume diferencias y prepara solicitudes para aprobación según políticas de compras.',
    capabilities: ['Comparación de propuestas', 'Validación de requisitos', 'Preparación de solicitudes'],
    tasks: ['Comparar cotizaciones', 'Preparar solicitud de compra'], integrations: ['Atlas ERP', 'Directorio de proveedores'], version: 'v0.5.3', status: 'ACTIVE', executionMode: 'PROFILE_ONLY', lastActivity: 'Hace 2 h', initials: 'TO', color: 'green', isDemo: true,
  },
  {
    id: 'operaciones', name: 'Inés', role: 'Analista de operaciones', department: 'Operaciones',
    description: 'Resume incidencias operativas y propone prioridades de atención.',
    purpose: 'Consolida incidencias sintéticas y prepara una vista priorizada para que el equipo de operaciones decida los próximos pasos.',
    capabilities: ['Resumen de incidencias', 'Priorización', 'Seguimiento de tareas'],
    tasks: ['Revisar cola de incidencias', 'Preparar resumen de turno'], integrations: ['Nexo CRM', 'Base de conocimiento'], version: 'v0.3.0', status: 'DRAFT', executionMode: 'PROFILE_ONLY', lastActivity: 'Sin actividad', initials: 'IN', color: 'amber', isDemo: true,
  },
]

export const integrations: Integration[] = [
  { id: 'nexo-crm', name: 'Nexo CRM', category: 'CRM', description: 'Cuentas, casos y actividad comercial sintética.', status: 'SIMULATED', capabilities: ['Consultar cuentas', 'Leer casos', 'Registrar nota de prueba'], permissions: ['crm.account.read', 'crm.case.read', 'crm.note.write (simulado)'], initials: 'N', accent: 'coral' },
  { id: 'atlas-erp', name: 'Atlas ERP', category: 'ERP', description: 'Facturas y estados contables de demostración.', status: 'SIMULATED', capabilities: ['Consultar facturas', 'Leer saldos', 'Marcar revisión (simulado)'], permissions: ['erp.invoice.read', 'erp.invoice.review (simulado)'], initials: 'A', accent: 'blue' },
  { id: 'correo-prueba', name: 'Correo de prueba', category: 'CORREO', description: 'Buzón ficticio para previsualizar borradores.', status: 'FUTURE', capabilities: ['Previsualizar borradores'], permissions: ['Sin envío habilitado'], initials: '@', accent: 'purple' },
  { id: 'boveda', name: 'Bóveda de facturas', category: 'DATOS', description: 'Conjunto local de documentos de muestra.', status: 'AVAILABLE', capabilities: ['Buscar documentos sintéticos', 'Consultar metadatos'], permissions: ['documents.sample.read'], initials: 'B', accent: 'green' },
  { id: 'datos-equipo', name: 'Directorio de equipo', category: 'DATOS', description: 'Perfiles de roles ficticios para las demostraciones.', status: 'FUTURE', capabilities: ['Consultar perfiles de prueba'], permissions: ['No conectado'], initials: 'D', accent: 'amber' },
]

export const employeeById = (id: string) => employees.find((employee) => employee.id === id)
