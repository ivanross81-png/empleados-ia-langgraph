import { useState } from 'react'
import { ArrowRight, Check, ChevronDown, CircleHelp, FlaskConical, X } from 'lucide-react'
import type { RunScenario } from '../domain/types'
import { employees } from '../data/catalog'
import { Button } from './primitives'

const scenarios: Array<{ id: RunScenario; title: string; description: string; tag: string }> = [
  { id: 'approval', title: 'Requiere aprobación', description: 'Propone un seguimiento; espera una decisión humana.', tag: 'REQUIRE_APPROVAL' },
  { id: 'allow', title: 'Permitida por política', description: 'Completa una actualización interna de bajo riesgo.', tag: 'ALLOW' },
  { id: 'deny', title: 'Denegada por política', description: 'Bloquea un caso no elegible sin ejecutar la herramienta.', tag: 'DENY' },
  { id: 'failure', title: 'Fallo simulado', description: 'La herramienta devuelve un error tipado sin efecto.', tag: 'ERROR' },
  { id: 'uncertain', title: 'Respuesta incierta', description: 'Registra el efecto y simula un timeout reconciliable.', tag: 'TIMEOUT' },
]

export function ExecutionStartDialog({ onClose, onStart }: { onClose: () => void; onStart: (employeeId: string, scenario: RunScenario) => void }) {
  const [employeeId, setEmployeeId] = useState('cobranzas')
  const [scenario, setScenario] = useState<RunScenario>('approval')
  const [error, setError] = useState('')
  const submit = () => {
    if (!employeeId || !scenario) { setError('Selecciona un Empleado Digital y un escenario.'); return }
    onStart(employeeId, scenario)
  }
  return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}><section className="modal start-modal" role="dialog" aria-modal="true" aria-labelledby="start-title"><button className="modal-close icon-button" aria-label="Cerrar" onClick={onClose}><X size={17} /></button><div className="eyebrow">NUEVA EJECUCIÓN</div><h2 id="start-title">¿Qué trabajo iniciamos?</h2><p className="start-intro">Elige un empleado y un escenario. Todas las operaciones de esta demostración usan datos sintéticos.</p><label className="field-label" htmlFor="employee-select">Empleado Digital</label><div className="select-wrap"><select id="employee-select" value={employeeId} onChange={(event) => setEmployeeId(event.target.value)}>{employees.map((employee) => <option key={employee.id} value={employee.id}>{employee.name} · {employee.role}</option>)}</select><ChevronDown size={15} /></div><div className="field-row-label"><span className="field-label">Escenario de demostración</span><span className="synthetic-note"><FlaskConical size={12} /> Sintético</span></div><div className="scenario-options">{scenarios.map((item) => <button key={item.id} type="button" className={`scenario-option ${scenario === item.id ? 'scenario-selected' : ''}`} onClick={() => { setScenario(item.id); setError('') }}><span className="scenario-radio">{scenario === item.id && <Check size={11} />}</span><span className="scenario-copy"><strong>{item.title}</strong><small>{item.description}</small></span><span className={`scenario-tag scenario-${item.id}`}>{item.tag}</span></button>)}</div><div className="safe-note"><CircleHelp size={15} /><span>No se enviarán correos ni se modificarán sistemas externos. Las aprobaciones no se resuelven por tiempo.</span></div>{error && <p className="form-error" role="alert">{error}</p>}<div className="modal-actions"><Button onClick={onClose}>Cancelar</Button><Button variant="primary" onClick={submit}>Iniciar simulación <ArrowRight size={15} /></Button></div></section></div>
}
