import type { PolicyDecision, RunScenario } from './types'

export function decidePolicy(scenario: RunScenario): PolicyDecision {
  if (scenario === 'approval') return 'REQUIRE_APPROVAL'
  if (scenario === 'deny') return 'DENY'
  return 'ALLOW'
}

/** Stable demonstration fingerprint only; it is not a cryptographic authorization token. */
export function actionDigest(action: { id: string; name: string; targetReference: string; summary: string }): string {
  const canonical = `${action.id}|${action.name}|${action.targetReference}|${action.summary}`
  let hash = 2166136261
  for (let index = 0; index < canonical.length; index += 1) {
    hash ^= canonical.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return `demo-${(hash >>> 0).toString(16).padStart(8, '0')}`
}

export function decisionLabel(decision: PolicyDecision): string {
  return decision === 'ALLOW' ? 'Permitida por política' : decision === 'DENY' ? 'Denegada por política' : 'Requiere aprobación'
}
