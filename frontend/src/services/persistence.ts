import type {
  ActionStatus,
  Approval,
  ApprovalStatus,
  EventKind,
  ExecutionEvent,
  ExecutionOutcome,
  ExecutionRecord,
  ExecutionStatus,
  ExecutionScenario,
  LegacyRunScenario,
  PlatformState,
  PolicyDecision,
  ProposedAction,
} from '../domain/types'
import { createSeedState } from '../data/seed'
import { actionDigest } from '../domain/policy'

export const CURRENT_STORAGE_KEY = 'digital-employee-prototype-v3'
export const LEGACY_STORAGE_KEY = 'digital-employee-prototype-v2'
export const OLDER_STORAGE_KEY = 'digital-employee-prototype-v1'
export const PERSISTENCE_SCHEMA_VERSION = 3 as const

export interface SimulatedEffect {
  idempotencyKey: string
  executionId: string
  actionId: string
  operation: string
  resultSummary: string
  committedAt: string
  acknowledgement: 'CONFIRMED' | 'UNCERTAIN'
}

export interface StoragePort {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
}

export interface LoadedPlatformSnapshot {
  state: PlatformState
  effects: SimulatedEffect[]
  source: 'fresh' | 'current' | 'migrated' | 'recovered'
  notice?: string
}

const executionStatuses: ExecutionStatus[] = ['PENDING', 'RUNNING', 'WAITING_APPROVAL', 'COMPLETED', 'FAILED', 'CANCELLED', 'OUTCOME_UNCERTAIN']
const executionOutcomes: ExecutionOutcome[] = ['SUCCESS', 'POLICY_DENIED', 'HUMAN_REJECTED', 'FAILURE', 'UNCERTAIN', 'CANCELLED']
const actionStatuses: ActionStatus[] = ['PROPOSED', 'WAITING_APPROVAL', 'APPROVED', 'REJECTED', 'DENIED', 'INVOKED', 'SUCCEEDED', 'FAILED', 'UNCERTAIN']
const approvalStatuses: ApprovalStatus[] = ['PENDING', 'APPROVED', 'REJECTED']
const policyDecisions: PolicyDecision[] = ['ALLOW', 'DENY', 'REQUIRE_APPROVAL']
const scenarios: ExecutionScenario[] = ['review-eligible', 'follow-up-review', 'closed-case', 'tool-unavailable', 'uncertain-ack', 'HISTORICAL']
const legacyScenarios: LegacyRunScenario[] = ['approval', 'allow', 'deny', 'failure', 'uncertain']
const eventKinds: EventKind[] = ['request', 'start', 'read', 'analysis', 'proposal', 'policy', 'approval', 'tool', 'result', 'failure', 'reconciliation']

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value)
const isString = (value: unknown): value is string => typeof value === 'string'
const isOptionalString = (value: unknown): value is string | undefined => value === undefined || isString(value)
const isDate = (value: unknown): value is string => isString(value) && Number.isFinite(Date.parse(value))
const isNonNegativeInteger = (value: unknown): value is number => Number.isInteger(value) && Number(value) >= 0
const isFiniteNonNegative = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value) && value >= 0
const isOneOf = <T extends string>(value: unknown, values: readonly T[]): value is T => typeof value === 'string' && values.includes(value as T)

function isProposedAction(value: unknown): value is ProposedAction {
  if (!isRecord(value)) return false
  return isString(value.id) && isString(value.name) && isString(value.summary) && isString(value.reason) &&
    isString(value.targetReference) && isOneOf(value.risk, ['LOW', 'MEDIUM', 'HIGH']) &&
    isOneOf(value.policyDecision, policyDecisions) && isString(value.policyVersion) &&
    isOneOf(value.status, actionStatuses) && isString(value.idempotencyKey) &&
    isString(value.digest) && isDate(value.proposedAt) &&
    (value.arguments === undefined || isDemoActionArguments(value.arguments))
}

function isDemoActionArguments(value: unknown): boolean {
  if (!isRecord(value) || !Array.isArray(value.invoiceIds) || value.invoiceIds.length === 0 || !value.invoiceIds.every(isString)) return false
  if (value.actionType === 'MARK_REVIEWED') return value.reviewStatus === 'REVIEWED'
  return value.actionType === 'PREPARE_FOLLOW_UP' && value.destination === 'LOCAL_DRAFTS' && value.templateId === 'collections-follow-up-v1'
}

function isExecutionEvent(value: unknown): value is ExecutionEvent {
  if (!isRecord(value)) return false
  return isString(value.id) && isOneOf(value.kind, eventKinds) && isString(value.title) &&
    isString(value.description) && isDate(value.timestamp) &&
    (value.decision === undefined || isOneOf(value.decision, policyDecisions)) && isOptionalString(value.reference)
}

function isExecution(value: unknown): value is ExecutionRecord {
  const compatibleScenarios = [...scenarios, ...legacyScenarios]
  if (!isExecutionWithScenario(value, compatibleScenarios)) return false
  const execution = value as ExecutionRecord
  return execution.scenario === 'HISTORICAL' || legacyScenarios.includes(execution.scenario as LegacyRunScenario) || !execution.action || execution.action.arguments !== undefined
}

function isLegacyExecution(value: unknown): value is ExecutionRecord {
  return isExecutionWithScenario(value, legacyScenarios)
}

function isExecutionWithScenario(value: unknown, allowedScenarios: readonly string[]): boolean {
  if (!isRecord(value)) return false
  return isString(value.id) && isString(value.employeeId) && isString(value.employeeVersion) &&
    isString(value.taskName) && isOneOf(value.scenario, allowedScenarios) &&
    isOneOf(value.status, executionStatuses) &&
    (value.outcome === undefined || isOneOf(value.outcome, executionOutcomes)) &&
    isDate(value.requestedAt) && isOptionalString(value.startedAt) &&
    (value.startedAt === undefined || isDate(value.startedAt)) && isOptionalString(value.completedAt) &&
    (value.completedAt === undefined || isDate(value.completedAt)) &&
    (value.durationMs === undefined || isFiniteNonNegative(value.durationMs)) &&
    isOptionalString(value.failureCode) && isString(value.requestedBy) && isString(value.inputLabel) &&
    isNonNegativeInteger(value.invoiceCount) && isFiniteNonNegative(value.amountTotal) &&
    isString(value.summary) && isString(value.correlationId) &&
    (value.action === undefined || isProposedAction(value.action)) && isOptionalString(value.approvalId) &&
    Array.isArray(value.events) && value.events.length <= 10_000 && value.events.every(isExecutionEvent) &&
    isNonNegativeInteger(value.attempts) && isNonNegativeInteger(value.sideEffectCount)
}

function isApproval(value: unknown): value is Approval {
  if (!isRecord(value)) return false
  return isString(value.id) && isString(value.executionId) && isString(value.employeeId) &&
    isString(value.actionId) && isString(value.actionDigest) && isString(value.title) &&
    isString(value.reason) && isOneOf(value.risk, ['LOW', 'MEDIUM', 'HIGH']) &&
    isString(value.requiredRole) && isOneOf(value.status, approvalStatuses) && isDate(value.requestedAt) &&
    isOptionalString(value.decidedAt) && (value.decidedAt === undefined || isDate(value.decidedAt)) &&
    isOptionalString(value.decidedBy) && isOptionalString(value.decisionReason)
}

export function isPlatformState(value: unknown): value is PlatformState {
  if (!isRecord(value) || !Array.isArray(value.executions) || !Array.isArray(value.approvals)) return false
  if (value.executions.length > 5_000 || value.approvals.length > 5_000 ||
    !value.executions.every(isExecution) || !value.approvals.every(isApproval) || !isOptionalString(value.recoveryNotice)) return false
  const executions = value.executions as ExecutionRecord[]
  const approvals = value.approvals as Approval[]
  const executionIds = new Set(executions.map((execution) => execution.id))
  const approvalIds = new Set(approvals.map((approval) => approval.id))
  if (executionIds.size !== executions.length || approvalIds.size !== approvals.length) return false
  if (approvals.some((approval) => {
    const execution = executions.find((item) => item.id === approval.executionId)
    return !execution?.action || execution.action.id !== approval.actionId
  })) return false
  return executions.every((execution) => {
    if (execution.status === 'WAITING_APPROVAL' && !execution.approvalId) return false
    if (!execution.approvalId) return true
    const approval = approvals.find((item) => item.id === execution.approvalId)
    return Boolean(approval && approval.executionId === execution.id)
  })
}

function isLegacyPlatformState(value: unknown): value is PlatformState {
  if (!isRecord(value) || !Array.isArray(value.executions) || !Array.isArray(value.approvals)) return false
  if (value.executions.length > 5_000 || value.approvals.length > 5_000 ||
    !value.executions.every(isLegacyExecution) || !value.approvals.every(isApproval) || !isOptionalString(value.recoveryNotice)) return false
  const executions = value.executions as ExecutionRecord[]
  const approvals = value.approvals as Approval[]
  const executionIds = new Set(executions.map((execution) => execution.id))
  const approvalIds = new Set(approvals.map((approval) => approval.id))
  if (executionIds.size !== executions.length || approvalIds.size !== approvals.length) return false
  if (approvals.some((approval) => {
    const execution = executions.find((item) => item.id === approval.executionId)
    return !execution?.action || execution.action.id !== approval.actionId
  })) return false
  return executions.every((execution) => {
    if (execution.status === 'WAITING_APPROVAL' && !execution.approvalId) return false
    if (!execution.approvalId) return true
    const approval = approvals.find((item) => item.id === execution.approvalId)
    return Boolean(approval && approval.executionId === execution.id)
  })
}

function isSimulatedEffect(value: unknown): value is SimulatedEffect {
  if (!isRecord(value)) return false
  return isString(value.idempotencyKey) && isString(value.executionId) && isString(value.actionId) &&
    isString(value.operation) && isString(value.resultSummary) && isDate(value.committedAt) &&
    isOneOf(value.acknowledgement, ['CONFIRMED', 'UNCERTAIN'])
}

function hasValidEffectLedger(value: unknown, state: PlatformState): value is SimulatedEffect[] {
  if (!Array.isArray(value) || value.length > 10_000 || !value.every(isSimulatedEffect)) return false
  const effects = value as SimulatedEffect[]
  const keys = effects.map((effect) => effect.idempotencyKey)
  if (new Set(keys).size !== keys.length) return false
  const executions = state.executions
  const approvals = state.approvals
  const linkedEffectsAreValid = effects.every((savedEffect) => {
    const execution = executions.find((item) => item.id === savedEffect.executionId)
    const action = execution?.action
    if (!action || action.id !== savedEffect.actionId || action.idempotencyKey !== savedEffect.idempotencyKey || action.policyDecision === 'DENY') return false
    if (action.policyDecision !== 'REQUIRE_APPROVAL') return true
    const approval = approvals.find((item) => item.id === execution.approvalId)
    return Boolean(approval && approval.status === 'APPROVED' && approval.actionId === action.id && approval.actionDigest === action.digest && actionDigest(action) === approval.actionDigest)
  })
  if (!linkedEffectsAreValid) return false
  return executions.every((execution) => {
    if (['PENDING', 'RUNNING', 'WAITING_APPROVAL', 'OUTCOME_UNCERTAIN'].includes(execution.status)) return true
    return execution.sideEffectCount === effects.filter((effect) => effect.executionId === execution.id).length
  })
}

function isPersistedSnapshot(value: unknown): value is { schemaVersion: 3; state: PlatformState; effects: SimulatedEffect[] } {
  if (!isRecord(value) || value.schemaVersion !== PERSISTENCE_SCHEMA_VERSION || !isPlatformState(value.state) || !Array.isArray(value.effects)) return false
  return hasValidEffectLedger(value.effects, value.state)
}

function isLegacySnapshot(value: unknown): value is { schemaVersion: 2; state: PlatformState; effects: SimulatedEffect[] } {
  if (!isRecord(value) || value.schemaVersion !== 2 || !isLegacyPlatformState(value.state)) return false
  return hasValidEffectLedger(value.effects, value.state)
}

function migrateLegacyState(state: PlatformState): PlatformState {
  return {
    executions: state.executions.map((execution) => ({
      ...execution,
      scenario: execution.employeeId === 'cobranzas' && legacyScenarios.includes(execution.scenario as LegacyRunScenario)
        ? execution.scenario as LegacyRunScenario
        : 'HISTORICAL',
    })),
    approvals: state.approvals,
  }
}

export function effectsFromExecutions(state: PlatformState): SimulatedEffect[] {
  const effects = new Map<string, SimulatedEffect>()
  for (const execution of state.executions) {
    const action = execution.action
    if (!action || execution.sideEffectCount === 0 || effects.has(action.idempotencyKey)) continue
    effects.set(action.idempotencyKey, {
      idempotencyKey: action.idempotencyKey,
      executionId: execution.id,
      actionId: action.id,
      operation: action.name,
      resultSummary: execution.summary,
      committedAt: execution.completedAt ?? action.proposedAt,
      acknowledgement: execution.status === 'OUTCOME_UNCERTAIN' ? 'UNCERTAIN' : 'CONFIRMED',
    })
  }
  return [...effects.values()]
}

function freshSnapshot(notice?: string): LoadedPlatformSnapshot {
  const state = createSeedState()
  return { state, effects: effectsFromExecutions(state), source: 'fresh', ...(notice ? { notice } : {}) }
}

function parseJSON(value: string): unknown {
  return JSON.parse(value) as unknown
}

export function loadPlatformSnapshot(storage?: StoragePort): LoadedPlatformSnapshot {
  if (!storage) return freshSnapshot()
  try {
    const current = storage.getItem(CURRENT_STORAGE_KEY)
    if (current !== null) {
      let parsed: unknown
      try { parsed = parseJSON(current) } catch { return freshSnapshot('Los datos locales estaban dañados; se restauró el conjunto sintético inicial.') }
      if (isPersistedSnapshot(parsed)) return { state: parsed.state, effects: parsed.effects, source: 'current' }
      return freshSnapshot('Los datos locales tenían una versión o estructura incompatible; se restauró el conjunto sintético inicial.')
    }

    const previous = storage.getItem(LEGACY_STORAGE_KEY)
    if (previous !== null) {
      let parsed: unknown
      try { parsed = parseJSON(previous) } catch { return freshSnapshot('Los datos locales de la versión anterior estaban dañados; se restauró el conjunto sintético inicial.') }
      if (!isLegacySnapshot(parsed)) return freshSnapshot('Los datos locales de la versión anterior no pudieron validarse; se restauró el conjunto sintético inicial.')
      const migratedState = migrateLegacyState(parsed.state)
      const migrated = { schemaVersion: PERSISTENCE_SCHEMA_VERSION, state: migratedState, effects: parsed.effects }
      if (!isPersistedSnapshot(migrated)) return freshSnapshot('El snapshot anterior no conserva coherencia entre acciones y efectos; se restauró el conjunto sintético inicial.')
      return { state: migrated.state, effects: migrated.effects, source: 'migrated', notice: 'Se migró el snapshot versionado anterior; su historial quedó marcado como demostración histórica.' }
    }

    const legacy = storage.getItem(OLDER_STORAGE_KEY)
    if (legacy === null) return freshSnapshot()
    let parsed: unknown
    try { parsed = parseJSON(legacy) } catch { return freshSnapshot('Los datos locales anteriores estaban dañados; se restauró el conjunto sintético inicial.') }
    if (!isLegacyPlatformState(parsed)) return freshSnapshot('Los datos locales anteriores no pudieron validarse; se restauró el conjunto sintético inicial.')
    const migratedState = migrateLegacyState(parsed)
    const migrated = { schemaVersion: PERSISTENCE_SCHEMA_VERSION, state: migratedState, effects: effectsFromExecutions(migratedState) }
    if (!isPersistedSnapshot(migrated)) return freshSnapshot('El estado anterior no conservaba coherencia entre acciones y efectos; se restauró el conjunto sintético inicial.')
    return { state: migrated.state, effects: migrated.effects, source: 'migrated', notice: 'Se migró el estado local anterior; sus ejecuciones quedaron marcadas como historial demostrativo.' }
  } catch {
    return freshSnapshot('El almacenamiento local no está disponible; la sesión continúa con datos sintéticos en memoria.')
  }
}

export function savePlatformSnapshot(storage: StoragePort | undefined, state: PlatformState, effects: SimulatedEffect[]): boolean {
  if (!storage) return false
  const persistedState: PlatformState = { executions: state.executions, approvals: state.approvals }
  const snapshot = { schemaVersion: PERSISTENCE_SCHEMA_VERSION, state: persistedState, effects }
  if (!isPersistedSnapshot(snapshot)) return false
  try {
    storage.setItem(CURRENT_STORAGE_KEY, JSON.stringify(snapshot))
    return true
  } catch {
    return false
  }
}
