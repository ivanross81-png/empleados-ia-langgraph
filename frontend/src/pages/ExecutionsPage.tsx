import { useEffect, useMemo, useState } from 'react'
import { Activity, ArrowRight, CalendarDays, CircleHelp, Filter, Play, Search, ShieldCheck } from 'lucide-react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { employeeById, employees } from '../data/catalog'
import { usePlatformService, usePlatformState } from '../hooks/usePlatform'
import type { ExecutionRecord, RunScenario } from '../domain/types'
import { Button, ConfirmDialog, DecisionBadge, EmployeeAvatar, EmptyState, PageHeader, Panel, StatusBadge } from '../components/primitives'
import { ExecutionStartDialog } from '../components/ExecutionStartDialog'
import { ExecutionTimeline } from '../components/ExecutionTimeline'

const time = (value?: string) => value ? new Intl.DateTimeFormat('es-AR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(value)) : '—'
const duration = (run: ExecutionRecord) => run.durationMs ? `${Math.max(1, Math.round(run.durationMs / 1000))} s` : run.status === 'RUNNING' ? 'En curso' : '—'

export function ExecutionsPage() {
  const state = usePlatformState()
  const service = usePlatformService()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [params, setParams] = useSearchParams()
  const [employee, setEmployee] = useState('Todos los empleados')
  const [status, setStatus] = useState('Todos los estados')
  const [starting, setStarting] = useState(false)
  useEffect(() => {
    if (params.get('focusSearch') === '1') {
      document.querySelector<HTMLInputElement>('[aria-label="Buscar ejecuciones"]')?.focus()
      const next = new URLSearchParams(params)
      next.delete('focusSearch')
      setParams(next, { replace: true })
    }
  }, [params, setParams])
  const runs = useMemo(() => [...state.executions].sort((a, b) => b.requestedAt.localeCompare(a.requestedAt)).filter((run) => {
    const person = employeeById(run.employeeId)
    const query = `${run.id} ${run.taskName} ${run.inputLabel} ${person?.name ?? ''}`.toLowerCase()
    const activeFilter = status === 'Activas' ? ['PENDING', 'RUNNING', 'WAITING_APPROVAL'].includes(run.status) : status === 'Completadas' ? run.status === 'COMPLETED' : status === 'Fallidas' ? run.status === 'FAILED' : status === 'Inciertas' ? run.status === 'OUTCOME_UNCERTAIN' : status === 'Canceladas' ? run.status === 'CANCELLED' : true
    return query.includes(search.toLowerCase()) && (employee === 'Todos los empleados' || run.employeeId === employee) && activeFilter
  }), [state.executions, search, employee, status])
  return <>
    <PageHeader eyebrow="TRABAJO Y TRAZABILIDAD" title="Ejecuciones" description="Cada tarea tiene un recorrido visible, una decisión de política y un resultado trazable." action={<Button variant="primary" onClick={() => setStarting(true)}><Play size={14} fill="currentColor" /> Nueva ejecución</Button>} />
    <div className="execution-callout"><span><Activity size={16} /></span><div><strong>Las ejecuciones son la unidad de trabajo</strong><small>La actividad, las decisiones de política y las aprobaciones se muestran como eventos simulados.</small></div><span className="callout-right"><ShieldCheck size={15} /> Sin efectos reales</span></div>
    <div className="execution-summary-row"><Summary label="Total en muestra" value={state.executions.length} tone="sum-neutral" /><Summary label="Activas" value={state.executions.filter((run) => ['PENDING', 'RUNNING', 'WAITING_APPROVAL'].includes(run.status)).length} tone="sum-blue" /><Summary label="Esperando aprobación" value={state.executions.filter((run) => run.status === 'WAITING_APPROVAL').length} tone="sum-violet" /><Summary label="Resultado incierto" value={state.executions.filter((run) => run.status === 'OUTCOME_UNCERTAIN').length} tone="sum-amber" /></div>
    <Panel className="execution-list-panel"><div className="execution-toolbar"><div className="search-field execution-search"><Search size={16} /><input aria-label="Buscar ejecuciones" placeholder="Buscar por tarea o ID..." value={search} onChange={(event) => setSearch(event.target.value)} /></div><div className="filter-select-wrap"><Filter size={14} /><select aria-label="Filtrar por empleado" value={employee} onChange={(event) => setEmployee(event.target.value)}><option>Todos los empleados</option>{employees.map((item) => <option key={item.id} value={item.id}>{item.name} · {item.department}</option>)}</select></div><div className="filter-select-wrap"><Activity size={14} /><select aria-label="Filtrar por estado" value={status} onChange={(event) => setStatus(event.target.value)}>{['Todos los estados', 'Activas', 'Completadas', 'Fallidas', 'Inciertas', 'Canceladas'].map((item) => <option key={item}>{item}</option>)}</select></div><span className="results-count">{runs.length} ejecuciones</span></div>{runs.length ? <div className="execution-table-wrap"><table className="execution-table"><thead><tr><th>TRABAJO</th><th>EMPLEADO DIGITAL</th><th>ESTADO</th><th>POLÍTICA</th><th>FECHA</th><th>DURACIÓN</th><th /></tr></thead><tbody>{runs.map((run) => { const person = employeeById(run.employeeId); return <tr key={run.id} onClick={() => navigate(`/ejecuciones/${run.id}`)} tabIndex={0} onKeyDown={(event) => { if (event.key === 'Enter') navigate(`/ejecuciones/${run.id}`) }}><td><strong>{run.taskName}</strong><small>{run.id} · {run.inputLabel}</small></td><td><span className="employee-cell"><EmployeeAvatar initials={person?.initials ?? 'ED'} color={person?.color ?? 'blue'} />{person?.name}</span></td><td><StatusBadge status={run.status} /></td><td>{run.action ? <DecisionBadge decision={run.action.policyDecision} /> : <span className="muted-cell">—</span>}</td><td><span className="date-cell"><CalendarDays size={13} />{time(run.requestedAt)}</span></td><td className="duration-cell">{duration(run)}</td><td><ArrowRight size={15} className="table-arrow" /></td></tr> })}</tbody></table></div> : <EmptyState title="No hay ejecuciones para estos filtros" description="Cambia la búsqueda o los filtros, o inicia una simulación nueva." action={<Button variant="primary" onClick={() => setStarting(true)}><Play size={14} /> Iniciar ejecución</Button>} />}</Panel>
    <div className="execution-legend"><CircleHelp size={14} /><span>La cronología refleja eventos operativos simulados; no representa prompts ni razonamiento interno privado.</span><Link to="/aprobaciones">Ver aprobaciones pendientes <ArrowRight size={13} /></Link></div>
    {starting && <ExecutionStartDialog onClose={() => setStarting(false)} onStart={(employeeId, scenario: RunScenario) => { const id = service.startExecution(employeeId, scenario); setStarting(false); navigate(`/ejecuciones/${id}`) }} />}
  </>
}

function Summary({ label, value, tone }: { label: string; value: number; tone: string }) {
  return <div className="execution-summary"><span className={`summary-mark ${tone}`} /><span>{label}</span><strong>{value}</strong></div>
}

export function ExecutionDetailPage() {
  const { executionId = '' } = useParams()
  const state = usePlatformState()
  const service = usePlatformService()
  const navigate = useNavigate()
  const execution = state.executions.find((run) => run.id === executionId)
  const [confirmAction, setConfirmAction] = useState<'retry' | 'cancel' | null>(null)
  const [error, setError] = useState('')
  if (!execution) return <><PageHeader title="Ejecución no encontrada" description="No existe una ejecución con ese identificador en el conjunto local." /><Link to="/ejecuciones" className="text-link">Volver a ejecuciones <ArrowRight size={14} /></Link></>
  const employee = employeeById(execution.employeeId)
  const approval = state.approvals.find((item) => item.id === execution.approvalId)
  const confirmDescription = confirmAction === 'retry'
    ? 'Se consultará el mismo registro de idempotencia. Si la operación ya se registró, se recuperará el resultado sin repetir el efecto.'
    : 'Se detendrán los pasos pendientes. Una cancelación no revierte operaciones que ya se hayan registrado.'
  return <>
    <div className="detail-back"><Link to="/ejecuciones">← Ejecuciones</Link><span>/</span><span>{execution.id}</span></div>
    <div className="execution-detail-header"><div className="execution-detail-title"><div className="detail-kicker"><span className="execution-id-mark"><Activity size={14} /></span><span>{execution.id}</span><span className="kicker-divider">·</span><span>{execution.correlationId}</span></div><h1>{execution.taskName}</h1><div className="execution-title-meta"><StatusBadge status={execution.status} /><span className="meta-separator" /><EmployeeAvatar initials={employee?.initials ?? 'ED'} color={employee?.color ?? 'blue'} /><span>{employee?.name ?? 'Empleado'} <span className="muted-cell">· {execution.employeeVersion}</span></span><span className="meta-separator" /><span>{execution.inputLabel}</span></div></div><div className="execution-detail-actions">{execution.status === 'WAITING_APPROVAL' && <Button variant="primary" onClick={() => navigate('/aprobaciones')}>Abrir aprobación <ArrowRight size={14} /></Button>}{execution.status === 'OUTCOME_UNCERTAIN' && <Button variant="primary" onClick={() => setConfirmAction('retry')}>Reintentar con la misma clave</Button>}{['PENDING', 'RUNNING'].includes(execution.status) && <Button variant="danger" onClick={() => setConfirmAction('cancel')}>Cancelar ejecución</Button>}</div></div>
    {error && <div className="inline-error" role="alert">{error}</div>}
    {execution.status === 'OUTCOME_UNCERTAIN' && <div className="uncertain-banner"><span><CircleHelp size={18} /></span><div><strong>El resultado externo no está confirmado</strong><p>El simulador conserva la clave de idempotencia. Puedes reconciliar o reintentar con la misma clave para recuperar el resultado sin crear un segundo efecto.</p></div><Button onClick={() => { try { service.reconcileUncertainExecution(execution.id, false); setError('') } catch (exception) { setError(exception instanceof Error ? exception.message : 'No se pudo reconciliar.') } }}>Reconciliar resultado</Button></div>}
    {execution.status === 'WAITING_APPROVAL' && <div className="waiting-banner"><span><Clock3Icon /></span><div><strong>Esperando una decisión humana</strong><p>Esta ejecución permanece suspendida. El paso del tiempo no aprobará, rechazará ni cancelará la acción.</p></div><Link to="/aprobaciones">Revisar solicitud <ArrowRight size={14} /></Link></div>}
    <div className="run-detail-layout"><div className="run-detail-main"><Panel title="Línea de tiempo" subtitle={`${execution.events.length} eventos operativos · zona horaria local`} className="timeline-panel"><ExecutionTimeline events={execution.events} /></Panel>{execution.action && <Panel title="Acción propuesta" subtitle="La propuesta se evalúa de forma independiente; el modelo no autoriza acciones." className="action-panel"><div className="action-title-row"><div><div className="action-type-label">{execution.action.name}</div><h3>{execution.action.summary}</h3></div><DecisionBadge decision={execution.action.policyDecision} /></div><div className="action-description">{execution.action.reason}</div><div className="action-facts"><div><span>Referencia sintética</span><strong>{execution.action.targetReference}</strong></div><div><span>Nivel de riesgo</span><strong className={`risk-text risk-text-${execution.action.risk.toLowerCase()}`}><i />{execution.action.risk === 'LOW' ? 'Bajo' : execution.action.risk === 'MEDIUM' ? 'Medio' : 'Alto'}</strong></div><div><span>Política evaluada</span><strong>{execution.action.policyVersion}</strong></div><div><span>Estado de acción</span><strong>{actionStatusLabel(execution.action.status)}</strong></div></div>{execution.action.policyDecision === 'REQUIRE_APPROVAL' && <div className="action-binding"><ShieldCheck size={15} /><span>Aprobación asociada a esta acción exacta</span><code>{execution.action.digest}</code><small>{approval ? `Solicitud ${approval.id} · ${approval.requiredRole}` : 'No se encontró una solicitud asociada'}</small></div>}</Panel>}{execution.outcome && <Panel title="Resultado" subtitle="Resumen final de la ejecución"><div className={`outcome-box outcome-${execution.outcome.toLowerCase().replaceAll('_', '-')}`}><span className="outcome-mark">{execution.outcome === 'SUCCESS' ? '✓' : execution.outcome === 'POLICY_DENIED' ? '×' : execution.outcome === 'HUMAN_REJECTED' ? '↗' : execution.outcome === 'FAILURE' ? '!' : '·'}</span><div><strong>{outcomeLabel(execution.outcome)}</strong><p>{execution.summary}</p></div></div></Panel>}</div><aside className="run-detail-side"><Panel title="Resumen de ejecución" subtitle="Contexto y referencias fijadas"><div className="run-facts"><Fact label="Empleado" value={employee?.name ?? 'No disponible'} /><Fact label="Versión" value={execution.employeeVersion} /><Fact label="Tarea" value={execution.taskName} /><Fact label="Disparador" value="Manual" /><Fact label="Solicitó" value={execution.requestedBy} /><Fact label="Inicio solicitado" value={formatLongTime(execution.requestedAt)} /><Fact label="Duración" value={execution.durationMs ? `${(execution.durationMs / 1000).toFixed(1)} s` : execution.status === 'RUNNING' ? 'En curso' : '—'} /><Fact label="Intentos" value={String(execution.attempts)} /><Fact label="Efectos en simulador" value={String(execution.sideEffectCount)} /></div></Panel><Panel title="Entrada de trabajo" subtitle="Datos sintéticos de esta ejecución"><div className="input-summary"><div className="input-summary-icon"><FileBatchIcon /></div><div><strong>{execution.inputLabel}</strong><small>{execution.invoiceCount} facturas · {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(execution.amountTotal)}</small></div></div><div className="input-synthetic-note"><span /> Conjunto sintético local. Sin datos de clientes reales.</div></Panel><div className="trace-card"><div className="trace-card-icon"><ShieldCheck size={15} /></div><div><strong>Trazabilidad del prototipo</strong><p>IDs, decisiones, acción y eventos se generan localmente. No son registros de auditoría del backend.</p></div></div></aside></div>
    {confirmAction && <ConfirmDialog title={confirmAction === 'retry' ? '¿Reintentar de forma segura?' : '¿Cancelar esta ejecución?'} description={confirmDescription} confirmLabel={confirmAction === 'retry' ? 'Reintentar con clave fija' : 'Cancelar ejecución'} danger={confirmAction === 'cancel'} onClose={() => setConfirmAction(null)} onConfirm={() => { try { if (confirmAction === 'retry') service.reconcileUncertainExecution(execution.id, true); else service.cancelExecution(execution.id); setError(''); setConfirmAction(null) } catch (exception) { setError(exception instanceof Error ? exception.message : 'No se pudo completar la acción.'); setConfirmAction(null) } }} />}
  </>
}

function Fact({ label, value }: { label: string; value: string }) { return <div className="run-fact"><span>{label}</span><strong>{value}</strong></div> }
function Clock3Icon() { return <Activity size={17} /> }
function FileBatchIcon() { return <CalendarDays size={16} /> }
function formatLongTime(value: string) { return new Intl.DateTimeFormat('es-AR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(value)) }
function actionStatusLabel(value: ExecutionRecord['action'] extends infer A ? A extends { status: infer S } ? S : never : never): string { return ({ PROPOSED: 'Propuesta', WAITING_APPROVAL: 'En espera', APPROVED: 'Aprobada', REJECTED: 'Rechazada', DENIED: 'Denegada', INVOKED: 'Invocada', SUCCEEDED: 'Completada', FAILED: 'Fallida', UNCERTAIN: 'Resultado incierto' } as Record<string, string>)[value] ?? String(value) }
function outcomeLabel(value: NonNullable<ExecutionRecord['outcome']>) { return ({ SUCCESS: 'Acción completada en simulación', POLICY_DENIED: 'Denegada por política', HUMAN_REJECTED: 'Rechazada por una persona', FAILURE: 'Ejecución fallida', UNCERTAIN: 'Resultado externo incierto', CANCELLED: 'Ejecución cancelada' })[value] }
