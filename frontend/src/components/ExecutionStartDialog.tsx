import { useMemo, useState } from 'react'
import { ArrowRight, Check, ChevronDown, CircleHelp, FlaskConical, ShieldCheck, Users, X } from 'lucide-react'
import type { RunScenario } from '../domain/types'
import { employees, employeeById } from '../data/catalog'
import { demoScenarios } from '../data/demoScenarios'
import { evaluateDemoPolicy } from '../domain/policy'
import { Button, DecisionBadge } from './primitives'

const runnableEmployees = employees.filter((employee) => employee.executionMode === 'FULL_DEMO')
const defaultEmployeeId = runnableEmployees[0]?.id ?? ''
const defaultScenarioId = demoScenarios.find((scenario) => scenario.employeeId === defaultEmployeeId)?.id ?? 'review-eligible'

export function ExecutionStartDialog({ onClose, onStart }: { onClose: () => void; onStart: (employeeId: string, scenario: RunScenario) => void }) {
  const [employeeId, setEmployeeId] = useState(defaultEmployeeId)
  const [scenario, setScenario] = useState<RunScenario>(defaultScenarioId)
  const [error, setError] = useState('')
  const scenarios = useMemo(() => demoScenarios.filter((item) => item.employeeId === employeeId), [employeeId])
  const selectedScenario = scenarios.find((item) => item.id === scenario)
  const employee = employeeById(employeeId)
  const policy = selectedScenario ? evaluateDemoPolicy(employee, selectedScenario) : undefined

  const selectEmployee = (nextEmployeeId: string) => {
    setEmployeeId(nextEmployeeId)
    const firstScenario = demoScenarios.find((item) => item.employeeId === nextEmployeeId)
    if (firstScenario) setScenario(firstScenario.id)
    setError('')
  }

  const submit = () => {
    if (!employeeId || !scenario) { setError('Selecciona un Empleado Digital y un escenario.'); return }
    try {
      onStart(employeeId, scenario)
    } catch (exception) {
      setError(exception instanceof Error ? exception.message : 'No se pudo iniciar la simulación.')
    }
  }

  return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
    <section className="modal start-modal" role="dialog" aria-modal="true" aria-labelledby="start-title">
      <button className="modal-close icon-button" aria-label="Cerrar" onClick={onClose}><X size={17} /></button>
      <div className="eyebrow">NUEVA EJECUCIÓN</div>
      <h2 id="start-title">¿Qué trabajo iniciamos?</h2>
      <p className="start-intro">Elige un empleado con ejecución habilitada y un caso sintético. La política local decide el resultado a partir de los atributos del caso.</p>

      <label className="field-label" htmlFor="employee-select">Empleado Digital</label>
      <div className="select-wrap"><select id="employee-select" value={employeeId} onChange={(event) => selectEmployee(event.target.value)}>{runnableEmployees.map((item) => <option key={item.id} value={item.id}>{item.name} · {item.role}</option>)}</select><ChevronDown size={15} /></div>
      <p className="start-hint"><Users size={13} /> Solo Cobranzas tiene un flujo completo. Los demás perfiles del catálogo son demostrativos y su ejecución todavía no está habilitada.</p>

      <div className="field-row-label"><span className="field-label">Caso de demostración</span><span className="synthetic-note"><FlaskConical size={12} /> Sintético</span></div>
      <div className="scenario-options" role="radiogroup" aria-label="Caso de demostración">
        {scenarios.map((item) => {
          const selected = scenario === item.id
          const preview = evaluateDemoPolicy(employee, item)
          return <button key={item.id} type="button" role="radio" aria-checked={selected} className={`scenario-option ${selected ? 'scenario-selected' : ''}`} onClick={() => { setScenario(item.id); setError('') }}>
            <span className="scenario-radio">{selected && <Check size={11} />}</span>
            <span className="scenario-copy"><strong>{item.title}</strong><small>{item.description}</small></span>
            <DecisionBadge decision={preview.decision} />
          </button>
        })}
      </div>

      {policy && <div className="policy-preview"><ShieldCheck size={16} /><div><strong>Evaluación de política prevista</strong><p>{policy.reason}</p></div><span className="policy-preview-version">{policy.policyVersion}</span></div>}

      <div className="safe-note"><CircleHelp size={15} /><span>No se enviarán correos ni se modificarán sistemas externos. Las aprobaciones no se resuelven por tiempo.</span></div>
      {error && <p className="form-error" role="alert">{error}</p>}
      <div className="modal-actions"><Button onClick={onClose}>Cancelar</Button><Button variant="primary" onClick={submit}>Iniciar simulación <ArrowRight size={15} /></Button></div>
    </section>
  </div>
}
