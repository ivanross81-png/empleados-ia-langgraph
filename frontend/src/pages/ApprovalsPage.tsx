import { useMemo, useState } from 'react'
import { ArrowRight, Check, CheckCheck, Clock3, FileText, Filter, Search, ShieldAlert, ShieldCheck, X } from 'lucide-react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { employeeById } from '../data/catalog'
import { demoApprover } from '../services/mockPlatform'
import { usePlatformService, usePlatformState } from '../hooks/usePlatform'
import { Button, ConfirmDialog, DecisionBadge, EmployeeAvatar, EmptyState, PageHeader, StatusBadge } from '../components/primitives'
import type { Approval, ApprovalActor } from '../domain/types'

const when = (value: string) => new Intl.DateTimeFormat('es-AR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(value))

export function ApprovalsPage() {
  const state = usePlatformState()
  const service = usePlatformService()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('Pendientes')
  const selectedId = params.get('solicitud')
  const selected = state.approvals.find((item) => item.id === selectedId) ?? null
  const [reason, setReason] = useState('')
  const [decision, setDecision] = useState<'APPROVED' | 'REJECTED' | null>(null)
  const [actorMode, setActorMode] = useState<'authorized' | 'unauthorized'>('authorized')
  const [error, setError] = useState('')
  const filtered = useMemo(() => [...state.approvals].sort((a, b) => a.requestedAt.localeCompare(b.requestedAt)).filter((approval) => {
    const employee = employeeById(approval.employeeId)
    const matches = `${approval.title} ${approval.id} ${approval.executionId} ${employee?.name ?? ''}`.toLowerCase().includes(search.toLowerCase())
    return matches && (filter === 'Todas' || approval.status === 'PENDING')
  }), [state.approvals, search, filter])
  const pendingCount = state.approvals.filter((item) => item.status === 'PENDING').length
  const setSelected = (approval: Approval) => { setParams({ solicitud: approval.id }); setReason(''); setError('') }
  const currentActor: ApprovalActor = actorMode === 'authorized' ? demoApprover : { name: 'Diego Martín', role: 'Operador', authorized: false }
  const submitDecision = () => {
    if (!selected || !decision || !reason.trim()) { setError('Escribe un motivo para registrar una decisión.'); return }
    try {
      service.decideApproval(selected.id, decision, currentActor, reason)
      setDecision(null)
      setReason('')
      setError('')
      if (decision === 'APPROVED') navigate(`/ejecuciones/${selected.executionId}`)
    } catch (exception) {
      setError(exception instanceof Error ? exception.message : 'No se pudo registrar la decisión.')
      setDecision(null)
    }
  }
  return <>
    <PageHeader eyebrow="SUPERVISIÓN HUMANA" title="Centro de aprobaciones" description="Revisa acciones propuestas, valida su contexto y decide cuándo pueden continuar." action={<span className="pending-counter"><span className="pending-counter-dot" /> {pendingCount} pendientes</span>} />
    <div className="approval-policy-note"><span className="policy-note-icon"><ShieldCheck size={16} /></span><div><strong>Una aprobación pertenece a una acción exacta</strong><p>Antes de ejecutar, se valida de nuevo su huella y autorización. La espera nunca se resuelve automáticamente.</p></div><span className="policy-note-tag">CONTROL HUMANO</span></div>
    <div className="approval-workspace"><section className="approval-inbox"><div className="approval-inbox-head"><div><h2>Bandeja de entrada</h2><p>Ordenada por solicitud más antigua</p></div><span className="inbox-count">{filtered.length}</span></div><div className="approval-filter-bar"><div className="search-field"><Search size={15} /><input aria-label="Buscar aprobaciones" placeholder="Buscar solicitud..." value={search} onChange={(event) => setSearch(event.target.value)} /></div><div className="approval-filter-select"><Filter size={13} /><select aria-label="Filtrar aprobaciones" value={filter} onChange={(event) => setFilter(event.target.value)}><option>Pendientes</option><option>Todas</option></select></div></div>{filtered.length ? <div className="approval-list">{filtered.map((approval) => { const employee = employeeById(approval.employeeId); return <button key={approval.id} className={`approval-list-item ${selected?.id === approval.id ? 'approval-list-selected' : ''}`} onClick={() => setSelected(approval)}><div className="approval-list-top"><EmployeeAvatar initials={employee?.initials ?? 'ED'} color={employee?.color ?? 'blue'} /><span className="approval-list-title"><strong>{approval.title}</strong><small>{employee?.name ?? 'Empleado'} · {employee?.role ?? 'Perfil demo'}</small></span><span className={`approval-risk risk-${approval.risk.toLowerCase()}`}><i />{approval.risk === 'MEDIUM' ? 'Medio' : approval.risk === 'HIGH' ? 'Alto' : 'Bajo'}</span></div><div className="approval-list-bottom"><span><Clock3 size={12} />{when(approval.requestedAt)}</span><span>{approval.executionId}</span>{approval.status !== 'PENDING' && <StatusBadge status={approval.status} />}</div></button> })}</div> : <EmptyState title="Bandeja despejada" description={filter === 'Pendientes' ? 'No hay decisiones pendientes. Las solicitudes nuevas aparecerán aquí.' : 'No encontramos solicitudes con ese criterio.'} />}</section>
      <section className="approval-review-panel">{selected ? <ApprovalReview approval={selected} actor={currentActor} actorMode={actorMode} setActorMode={setActorMode} reason={reason} setReason={setReason} setDecision={setDecision} error={error} onClearError={() => setError('')} /> : <div className="approval-select-empty"><div className="approval-empty-art"><span><CheckCheck size={24} /></span><i /><i /><i /></div><h2>Selecciona una solicitud</h2><p>Revisa la acción, el riesgo y la identidad que la solicita antes de tomar una decisión.</p><div className="approval-empty-safety"><ShieldAlert size={14} /> Las aprobaciones no se infieren por silencio ni por antigüedad.</div></div>}</section></div>
    {decision && selected && <ConfirmDialog title={decision === 'APPROVED' ? '¿Aprobar esta acción?' : '¿Rechazar esta acción?'} description={decision === 'APPROVED' ? `La ejecución volverá a validar esta acción exacta antes de continuar. Motivo: “${reason.trim()}”.` : 'La acción quedará rechazada y no se ejecutará. El rechazo no puede convertirse en un efecto realizado.'} confirmLabel={decision === 'APPROVED' ? 'Confirmar aprobación' : 'Confirmar rechazo'} danger={decision === 'REJECTED'} onClose={() => setDecision(null)} onConfirm={submitDecision} />}
  </>
}

function ApprovalReview({ approval, actor, actorMode, setActorMode, reason, setReason, setDecision, error, onClearError }: { approval: Approval; actor: ApprovalActor; actorMode: 'authorized' | 'unauthorized'; setActorMode: (mode: 'authorized' | 'unauthorized') => void; reason: string; setReason: (reason: string) => void; setDecision: (decision: 'APPROVED' | 'REJECTED') => void; error: string; onClearError: () => void }) {
  const state = usePlatformState()
  const execution = state.executions.find((item) => item.id === approval.executionId)
  const employee = employeeById(approval.employeeId)
  const pending = approval.status === 'PENDING'
  const actionMatches = execution?.action?.id === approval.actionId && execution.action.digest === approval.actionDigest
  return <>
    <div className="review-heading"><div><div className="eyebrow">DETALLE DE SOLICITUD</div><h2>Revisión de acción</h2></div><StatusBadge status={approval.status} /></div>
    <div className="review-action-title"><div className="action-icon-surface"><FileText size={18} /></div><div><span>ACCIÓN PROPUESTA</span><h3>{approval.title}</h3></div></div>
    <div className="review-tags"><DecisionBadge decision="REQUIRE_APPROVAL" /><span className={`approval-risk risk-${approval.risk.toLowerCase()}`}><i />Riesgo {approval.risk === 'MEDIUM' ? 'medio' : approval.risk === 'HIGH' ? 'alto' : 'bajo'}</span></div>
    <div className="review-reason"><span>Motivo del empleado</span><p>{approval.reason}</p></div>
    <div className="review-context"><div><span>Solicita</span><strong><EmployeeAvatar initials={employee?.initials ?? 'ED'} color={employee?.color ?? 'blue'} />{employee?.name ?? 'Empleado'}</strong></div><div><span>Rol requerido</span><strong>{approval.requiredRole}</strong></div><div><span>Fecha de solicitud</span><strong>{when(approval.requestedAt)}</strong></div><div><span>Ejecución</span><strong><Link to={`/ejecuciones/${approval.executionId}`}>{approval.executionId} <ArrowRight size={12} /></Link></strong></div></div>
    <div className={`approval-integrity ${actionMatches ? 'integrity-ok' : 'integrity-fail'}`}><ShieldCheck size={15} /><div><strong>{actionMatches ? 'Acción y aprobación coinciden' : 'La acción ya no coincide'}</strong><small>Huella de demostración: {approval.actionDigest}</small></div>{actionMatches ? <Check size={15} /> : <X size={15} />}</div>
    <div className="approval-actor"><label htmlFor="actor-select">Actuar como</label><select id="actor-select" value={actorMode} onChange={(event) => { setActorMode(event.target.value as 'authorized' | 'unauthorized'); onClearError() }}><option value="authorized">Elena García · Aprobadora autorizada</option><option value="unauthorized">Diego Martín · Operador sin permiso</option></select><span>{actor.name} · {actor.role}</span></div>
    {pending ? <><label className="field-label review-reason-label" htmlFor="decision-reason">Motivo de la decisión <span>Obligatorio</span></label><textarea id="decision-reason" className="decision-reason-input" value={reason} onChange={(event) => { setReason(event.target.value); onClearError() }} placeholder="Añade contexto para el registro de auditoría simulado..." rows={3} /><div className="approval-controls"><Button variant="danger" disabled={!reason.trim()} onClick={() => setDecision('REJECTED')}><X size={15} /> Rechazar</Button><Button variant="primary" disabled={!reason.trim() || actorMode === 'unauthorized' || !actionMatches} onClick={() => setDecision('APPROVED')}><Check size={15} /> Aprobar y continuar</Button></div></> : <div className={`decision-record decision-record-${approval.status.toLowerCase()}`}><span>{approval.status === 'APPROVED' ? <Check size={15} /> : <X size={15} />}</span><div><strong>{approval.status === 'APPROVED' ? 'Aprobada' : 'Rechazada'} por {approval.decidedBy}</strong><small>{approval.decidedAt ? when(approval.decidedAt) : ''} · {approval.decisionReason}</small></div></div>}
    {error && <div className="inline-error" role="alert">{error}</div>}
    {pending && !actionMatches && <div className="form-warning">La acción no coincide con la huella de aprobación. No se puede ejecutar.</div>}
    <div className="approval-boundary-note"><ShieldCheck size={14} /> Una aprobación autoriza solo esta acción y su huella exacta. El permiso se simula en este prototipo.</div>
  </>
}
