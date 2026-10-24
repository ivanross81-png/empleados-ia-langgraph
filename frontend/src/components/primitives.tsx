import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { ArrowUpRight, Check, CircleHelp, X } from 'lucide-react'
import type { ApprovalStatus, ExecutionStatus, PolicyDecision } from '../domain/types'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'quiet' | 'light'
export function Button({ children, variant = 'secondary', className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  return <button className={`button button-${variant} ${className}`} {...props}>{children}</button>
}

export function IconButton({ label, children, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return <button className="icon-button" aria-label={label} title={label} {...props}>{children}</button>
}

export function StatusBadge({ status }: { status: ExecutionStatus | ApprovalStatus | 'ACTIVE' | 'PAUSED' | 'DRAFT' | 'SIMULATED' | 'AVAILABLE' | 'FUTURE' | 'SUCCESS' | 'POLICY_DENIED' | 'HUMAN_REJECTED' | 'UNCERTAIN' }) {
  const labels: Record<string, string> = {
    PENDING: 'Pendiente', RUNNING: 'En ejecución', WAITING_APPROVAL: 'Esperando aprobación', COMPLETED: 'Completada', FAILED: 'Fallida', CANCELLED: 'Cancelada', OUTCOME_UNCERTAIN: 'Resultado incierto', APPROVED: 'Aprobada', REJECTED: 'Rechazada', ACTIVE: 'Activo', PAUSED: 'En pausa', DRAFT: 'Borrador', SIMULATED: 'Simulada', AVAILABLE: 'Disponible', FUTURE: 'Futura', SUCCESS: 'Exitosa', POLICY_DENIED: 'Denegada por política', HUMAN_REJECTED: 'Rechazada por persona', UNCERTAIN: 'Incierto',
  }
  return <span className={`status-badge status-${status.toLowerCase().replaceAll('_', '-')}`}><i aria-hidden="true" />{labels[status] ?? status}</span>
}

export function DecisionBadge({ decision }: { decision: PolicyDecision }) {
  const label = decision === 'ALLOW' ? 'ALLOW' : decision === 'DENY' ? 'DENY' : 'REQUIRE_APPROVAL'
  return <span className={`decision-badge decision-${decision.toLowerCase()}`}><i aria-hidden="true" />{label}</span>
}

export function PageHeader({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description?: string; action?: ReactNode }) {
  return <div className="page-header"><div>{eyebrow && <div className="eyebrow">{eyebrow}</div>}<h1>{title}</h1>{description && <p>{description}</p>}</div>{action && <div className="page-header-action">{action}</div>}</div>
}

export function Panel({ children, className = '', title, subtitle, action }: { children: ReactNode; className?: string; title?: string; subtitle?: string; action?: ReactNode }) {
  return <section className={`panel ${className}`}>{(title || action) && <div className="panel-heading"><div>{title && <h2>{title}</h2>}{subtitle && <p>{subtitle}</p>}</div>{action}</div>}{children}</section>
}

export function EmptyState({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return <div className="empty-state"><div className="empty-state-icon"><CircleHelp size={20} /></div><h3>{title}</h3><p>{description}</p>{action}</div>
}

export function ConfirmDialog({ title, description, confirmLabel, danger = false, onConfirm, onClose }: { title: string; description: string; confirmLabel: string; danger?: boolean; onConfirm: () => void; onClose: () => void }) {
  return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}><section className="modal" role="dialog" aria-modal="true" aria-labelledby="confirm-title"><button className="modal-close icon-button" aria-label="Cerrar" onClick={onClose}><X size={17} /></button><div className={`modal-mark ${danger ? 'modal-mark-danger' : ''}`}>{danger ? <X size={20} /> : <Check size={20} />}</div><h2 id="confirm-title">{title}</h2><p>{description}</p><div className="modal-actions"><Button onClick={onClose}>Volver</Button><Button variant={danger ? 'danger' : 'primary'} onClick={onConfirm}>{confirmLabel}<ArrowUpRight size={15} /></Button></div></section></div>
}

export function EmployeeAvatar({ initials, color, size = 'normal' }: { initials: string; color: string; size?: 'normal' | 'large' }) {
  return <span className={`employee-avatar avatar-${color} ${size === 'large' ? 'avatar-large' : ''}`}>{initials}</span>
}
