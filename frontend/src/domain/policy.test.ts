import { describe, expect, it } from 'vitest'
import { demoScenarios } from '../data/demoScenarios'
import { employeeById } from '../data/catalog'
import { evaluateDemoPolicy } from './policy'

const employee = employeeById('cobranzas')!
const scenario = (id: string) => demoScenarios.find((item) => item.id === id)!

describe('Evaluación determinista de política demostrativa', () => {
  it('permite una revisión interna de un lote abierto y de bajo riesgo', () => {
    const result = evaluateDemoPolicy(employee, scenario('review-eligible'))
    expect(result.decision).toBe('ALLOW')
    expect(result.risk).toBe('LOW')
    expect(result.reason).toMatch(/reversible/i)
  })

  it('deniega un seguimiento sobre una cuenta cerrada', () => {
    const result = evaluateDemoPolicy(employee, scenario('closed-case'))
    expect(result.decision).toBe('DENY')
    expect(result.reason).toMatch(/cerrada/i)
  })

  it('requiere aprobación para preparar un seguimiento a una cuenta elegible', () => {
    const result = evaluateDemoPolicy(employee, scenario('follow-up-review'))
    expect(result.decision).toBe('REQUIRE_APPROVAL')
    expect(result.risk).toBe('MEDIUM')
  })

  it('separa la decisión de política del resultado del adaptador simulado', () => {
    const unavailable = scenario('tool-unavailable')
    const uncertain = scenario('uncertain-ack')
    expect(evaluateDemoPolicy(employee, unavailable).decision).toBe('ALLOW')
    expect(evaluateDemoPolicy(employee, uncertain).decision).toBe('ALLOW')
    expect(unavailable.adapterOutcome).toBe('FAILURE')
    expect(uncertain.adapterOutcome).toBe('UNCERTAIN')
  })

  it('deriva la decisión de los atributos del caso, no del identificador del escenario', () => {
    const followUp = scenario('follow-up-review')
    const sameCaseWithDifferentLabel = { ...followUp, id: 'review-eligible' as const }
    expect(evaluateDemoPolicy(employee, followUp).decision).toBe('REQUIRE_APPROVAL')
    expect(evaluateDemoPolicy(employee, sameCaseWithDifferentLabel).decision).toBe('REQUIRE_APPROVAL')
  })

  it('deniega perfiles de catálogo que no tienen ejecución completa', () => {
    expect(evaluateDemoPolicy(employeeById('finanzas'), scenario('review-eligible')).decision).toBe('DENY')
  })
})
