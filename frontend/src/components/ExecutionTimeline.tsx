import { useState } from 'react'
import { Activity, AlertTriangle, Check, Circle, Clock3, Database, FileSearch, GitBranch, ShieldCheck, Sparkles, Wrench } from 'lucide-react'
import type { ExecutionEvent } from '../domain/types'
import { DecisionBadge } from './primitives'

const icons = { request: FileSearch, start: Activity, read: Database, analysis: Sparkles, proposal: GitBranch, policy: ShieldCheck, approval: Check, tool: Wrench, result: Check, failure: AlertTriangle, reconciliation: Clock3 }
const time = (value: string) => new Intl.DateTimeFormat('es-AR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(new Date(value))

export function ExecutionTimeline({ events }: { events: ExecutionEvent[] }) {
  const [expanded, setExpanded] = useState<string | null>(null)
  if (events.length === 0) return <div className="timeline-empty"><Circle size={16} /><span>Los eventos aparecerán mientras avanza la ejecución.</span></div>
  return <div className="timeline">{events.map((event, index) => {
    const Icon = icons[event.kind]
    const isLast = index === events.length - 1
    return <article key={event.id} className={`timeline-item ${isLast ? 'timeline-last' : ''}`}><div className={`timeline-rail rail-${event.kind}`}><span className="timeline-node"><Icon size={13} /></span>{!isLast && <span className="timeline-line" />}</div><div className="timeline-event"><button className="timeline-summary" onClick={() => setExpanded(expanded === event.id ? null : event.id)} aria-expanded={expanded === event.id}><span className="timeline-title">{event.title}{event.kind === 'analysis' && <span className="operational-label">RESUMEN OPERATIVO</span>}</span><time>{time(event.timestamp)}</time></button><p>{event.description}</p>{event.decision && <div className="timeline-decision"><DecisionBadge decision={event.decision} /><span>{event.decision === 'REQUIRE_APPROVAL' ? 'La ejecución queda suspendida hasta una decisión humana.' : event.decision === 'DENY' ? 'No se invocó ninguna herramienta.' : 'La acción continúa dentro del alcance simulado.'}</span></div>}{expanded === event.id && <div className="timeline-extra"><strong>Detalle de trazabilidad</strong><span>{event.reference ?? `Evento ${event.id} · ${new Date(event.timestamp).toISOString()}`}</span></div>}</div></article>
  })}</div>
}
