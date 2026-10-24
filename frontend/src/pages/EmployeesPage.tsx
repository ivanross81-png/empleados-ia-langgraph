import { useMemo, useState } from 'react'
import { ArrowRight, Bot, Check, Filter, Search, ShieldCheck, Sparkles } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { employees, employeeById } from '../data/catalog'
import { usePlatformState } from '../hooks/usePlatform'
import { Button, EmployeeAvatar, EmptyState, PageHeader, Panel, StatusBadge } from '../components/primitives'
import { ExecutionStartDialog } from '../components/ExecutionStartDialog'
import { usePlatformService } from '../hooks/usePlatform'

export function EmployeesPage() {
  const [search, setSearch] = useState('')
  const [department, setDepartment] = useState('Todos los equipos')
  const filtered = useMemo(() => employees.filter((employee) => {
    const matchesSearch = `${employee.name} ${employee.role} ${employee.department} ${employee.description}`.toLowerCase().includes(search.toLowerCase())
    return matchesSearch && (department === 'Todos los equipos' || employee.department === department)
  }), [search, department])
  const departments = ['Todos los equipos', ...new Set(employees.map((employee) => employee.department))]
  return <>
    <PageHeader eyebrow="TU EQUIPO DIGITAL" title="Empleados digitales" description="Cada empleado tiene una responsabilidad definida, capacidades gobernadas y supervisión humana." action={<span className="demo-indicator"><i /> Todos son perfiles demostrativos</span>} />
    <div className="employee-summary-strip"><div><span className="strip-icon strip-violet"><Bot size={17} /></span><span><strong>{employees.length} perfiles de demostración</strong><small>Distribuidos en {departments.length - 1} equipos</small></span></div><div className="strip-divider" /><div><span className="strip-icon strip-green"><ActivityIcon /></span><span><strong>{employees.filter((employee) => employee.status === 'ACTIVE').length} disponibles</strong><small>Listos para simulaciones locales</small></span></div><div className="strip-note"><ShieldCheck size={15} /> Las capacidades no implican conexión a sistemas reales</div></div>
    <div className="list-toolbar"><div className="search-field"><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar empleados digitales..." aria-label="Buscar empleados digitales" /></div><div className="filter-select-wrap"><Filter size={14} /><select value={department} onChange={(event) => setDepartment(event.target.value)} aria-label="Filtrar por equipo">{departments.map((item) => <option key={item}>{item}</option>)}</select></div><span className="results-count">{filtered.length} resultados</span></div>
     {filtered.length === 0 ? <EmptyState title="No encontramos empleados" description="Prueba con otro nombre o equipo." /> : <div className="employee-grid">{filtered.map((employee) => <article className="employee-card" key={employee.id}><div className="employee-card-head"><EmployeeAvatar initials={employee.initials} color={employee.color} size="large" /><StatusBadge status={employee.status} /></div><div className="employee-card-name"><h2>{employee.name}</h2><span className="role-dot">·</span><span>{employee.role}</span></div><div className="employee-department">{employee.department}<span className="demo-tiny">DEMO</span></div><p className="employee-card-description">{employee.description}</p><div className="capability-label">CAPACIDADES</div><div className="capability-chips">{employee.capabilities.slice(0, 3).map((capability) => <span key={capability}>{capability}</span>)}{employee.capabilities.length > 3 && <span className="chip-overflow">+{employee.capabilities.length - 3}</span>}</div><div className="employee-card-foot"><span>Versión <strong>{employee.version}</strong></span><span>{employee.lastActivity}</span></div><Link className="employee-card-link" to={`/empleados/${employee.id}`}>Ver perfil <ArrowRight size={14} /></Link></article>)}</div>}
    <div className="future-banner"><span><Sparkles size={17} /></span><div><strong>Tu plataforma, preparada para crecer</strong><p>Finanzas, Recursos Humanos, Compras y Operaciones son perfiles ficticios para mostrar cómo la plataforma puede adaptarse a distintos equipos.</p></div><span className="future-tag">CASOS DEMOSTRATIVOS</span></div>
  </>
}

export function EmployeeDetailPage() {
  const { employeeId = '' } = useParams()
  const navigate = useNavigate()
  const employee = employeeById(employeeId)
  const state = usePlatformState()
  const service = usePlatformService()
  const [startDialog, setStartDialog] = useState(false)
  const runs = state.executions.filter((execution) => execution.employeeId === employeeId)
  const [tab, setTab] = useState<'overview' | 'runs'>('overview')
  if (!employee) return <><PageHeader title="Empleado no encontrado" description="Este perfil no está disponible en el catálogo de demostración." /><Link to="/empleados" className="text-link">Volver al catálogo <ArrowRight size={14} /></Link></>
  return <>
    <div className="detail-back"><Link to="/empleados">← Empleados digitales</Link><span>/</span><span>{employee.name}</span></div>
    <div className="profile-hero"><div className="profile-identity"><EmployeeAvatar initials={employee.initials} color={employee.color} size="large" /><div><div className="profile-title-line"><h1>{employee.name}</h1><StatusBadge status={employee.status} /></div><div className="profile-role">{employee.role} <span>·</span> {employee.department}</div><div className="profile-tags"><span className="demo-tiny">PERFIL DEMOSTRATIVO</span><span>Versión <strong>{employee.version}</strong></span></div></div></div><div className="profile-actions"><Button onClick={() => setTab('runs')}>Ver ejecuciones</Button><Button variant="primary" disabled={employee.status !== 'ACTIVE'} onClick={() => setStartDialog(true)}><Sparkles size={15} /> Iniciar simulación</Button></div></div>
    <div className="profile-tabs" role="tablist"><button role="tab" aria-selected={tab === 'overview'} className={tab === 'overview' ? 'profile-tab-active' : ''} onClick={() => setTab('overview')}>Resumen</button><button role="tab" aria-selected={tab === 'runs'} className={tab === 'runs' ? 'profile-tab-active' : ''} onClick={() => setTab('runs')}>Historial de ejecuciones <span>{runs.length}</span></button></div>
    {tab === 'overview' ? <div className="profile-content"><div className="profile-main"><Panel title="Propósito y responsabilidades" subtitle="Identidad del Empleado Digital"><div className="purpose-copy"><p>{employee.purpose}</p><div className="purpose-note"><ShieldCheck size={16} /><span>Las políticas y los permisos determinan qué acciones pueden continuar; la identidad conversacional no otorga autoridad.</span></div></div></Panel><Panel title="Tareas asignadas" subtitle="Responsabilidades configuradas para este perfil"><div className="task-list">{employee.tasks.map((task, index) => <div className="task-row" key={task}><span className="task-index">0{index + 1}</span><span><strong>{task}</strong><small>Activación manual · datos sintéticos</small></span><span className="task-status"><i /> Disponible</span></div>)}</div></Panel><Panel title="Capacidades" subtitle="Habilidades disponibles en el perfil de demostración"><div className="detail-capabilities">{employee.capabilities.map((capability) => <span key={capability}><Check size={14} />{capability}</span>)}</div></Panel></div><aside className="profile-side"><Panel title="Integraciones" subtitle="Conectores visibles, sin credenciales ni conexiones reales"><div className="profile-integrations">{employee.integrations.map((integration) => <div key={integration}><span className="integration-mini">{integration.slice(0, 1)}</span><span>{integration}<small>Conector de demostración</small></span><span className="sim-dot" /></div>)}</div><Link to="/integraciones" className="panel-bottom-link">Ver catálogo de integraciones <ArrowRight size={13} /></Link></Panel><Panel title="Configuración actual" subtitle="Solo lectura en este prototipo"><div className="config-readonly"><div><span>Modelo asignado</span><strong>Modelo de demostración</strong></div><div><span>Política</span><strong>pol-{employee.id}-v3</strong></div><div><span>Supervisión</span><strong>Acción humana habilitada</strong></div><div><span>Última actividad</span><strong>{employee.lastActivity}</strong></div></div><div className="readonly-note">La edición de definiciones no está disponible en esta versión.</div></Panel></aside></div> : <Panel title="Historial de ejecuciones" subtitle={`${runs.length} ejecuciones asociadas a ${employee.name}`}><RunRows runs={runs} /></Panel>}
    {startDialog && <ExecutionStartDialog onClose={() => setStartDialog(false)} onStart={(id, scenario) => { const runId = service.startExecution(id, scenario); setStartDialog(false); navigate(`/ejecuciones/${runId}`) }} />}
  </>
}

function RunRows({ runs }: { runs: ReturnType<typeof usePlatformState>['executions'] }) {
  if (runs.length === 0) return <EmptyState title="Todavía no hay ejecuciones" description="Inicia una simulación para ver su actividad aquí." />
  return <div className="simple-run-list">{runs.map((run) => <Link to={`/ejecuciones/${run.id}`} key={run.id}><span><strong>{run.taskName}</strong><small>{run.id} · {run.inputLabel}</small></span><StatusBadge status={run.status} /><ArrowRight size={15} /></Link>)}</div>
}

function ActivityIcon() { return <Check size={16} /> }
