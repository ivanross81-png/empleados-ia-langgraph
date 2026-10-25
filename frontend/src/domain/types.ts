export type PolicyDecision = 'ALLOW' | 'DENY' | 'REQUIRE_APPROVAL'
export type RunScenario = 'review-eligible' | 'follow-up-review' | 'closed-case' | 'tool-unavailable' | 'uncertain-ack'
export type ExecutionScenario = RunScenario | LegacyRunScenario | 'HISTORICAL'
export type DemoActionType = 'MARK_REVIEWED' | 'PREPARE_FOLLOW_UP'
export type DemoAdapterOutcome = 'CONFIRMED' | 'FAILURE' | 'UNCERTAIN'
export type EmployeeExecutionMode = 'FULL_DEMO' | 'PROFILE_ONLY'
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH'
export type LegacyRunScenario = 'approval' | 'allow' | 'deny' | 'failure' | 'uncertain'
export type ExecutionStatus = 'PENDING' | 'RUNNING' | 'WAITING_APPROVAL' | 'COMPLETED' | 'FAILED' | 'CANCELLED' | 'OUTCOME_UNCERTAIN'
export type ExecutionOutcome = 'SUCCESS' | 'POLICY_DENIED' | 'HUMAN_REJECTED' | 'FAILURE' | 'UNCERTAIN' | 'CANCELLED'
export type ActionStatus = 'PROPOSED' | 'WAITING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'DENIED' | 'INVOKED' | 'SUCCEEDED' | 'FAILED' | 'UNCERTAIN'
export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED'
export type EventKind = 'request' | 'start' | 'read' | 'analysis' | 'proposal' | 'policy' | 'approval' | 'tool' | 'result' | 'failure' | 'reconciliation'

export interface DigitalEmployee {
  id: string
  name: string
  role: string
  department: string
  description: string
  purpose: string
  capabilities: string[]
  tasks: string[]
  integrations: string[]
  version: string
  status: 'ACTIVE' | 'PAUSED' | 'DRAFT'
  executionMode: EmployeeExecutionMode
  lastActivity: string
  initials: string
  color: string
  isDemo: boolean
}

export interface ProposedAction {
  id: string
  name: string
  summary: string
  reason: string
  targetReference: string
  /** Missing only on migrated read-only history from a previous prototype schema. */
  arguments?: DemoActionArguments
  risk: RiskLevel
  policyDecision: PolicyDecision
  policyVersion: string
  status: ActionStatus
  idempotencyKey: string
  digest: string
  proposedAt: string
}

export type DemoActionArguments =
  | { actionType: 'MARK_REVIEWED'; invoiceIds: string[]; reviewStatus: 'REVIEWED' }
  | { actionType: 'PREPARE_FOLLOW_UP'; invoiceIds: string[]; destination: 'LOCAL_DRAFTS'; templateId: 'collections-follow-up-v1' }

export interface SyntheticInvoice {
  id: string
  customerReference: string
  amount: number
  daysOverdue: number
  status: 'OPEN' | 'CLOSED'
  contactEligible: boolean
}

export interface DemoActionDefinition {
  type: DemoActionType
  name: string
  summary: string
  reason: string
}

export interface DemoScenario {
  id: RunScenario
  title: string
  description: string
  badge: string
  employeeId: string
  taskName: string
  inputLabel: string
  invoices: SyntheticInvoice[]
  action: DemoActionDefinition
  adapterOutcome: DemoAdapterOutcome
}

export interface PolicyEvaluation {
  decision: PolicyDecision
  reason: string
  risk: RiskLevel
  policyVersion: string
}

export interface Approval {
  id: string
  executionId: string
  employeeId: string
  actionId: string
  actionDigest: string
  title: string
  reason: string
  risk: 'LOW' | 'MEDIUM' | 'HIGH'
  requiredRole: string
  status: ApprovalStatus
  requestedAt: string
  decidedAt?: string
  decidedBy?: string
  decisionReason?: string
}

export interface ExecutionEvent {
  id: string
  kind: EventKind
  title: string
  description: string
  timestamp: string
  decision?: PolicyDecision
  reference?: string
}

export interface ExecutionRecord {
  id: string
  employeeId: string
  employeeVersion: string
  taskName: string
  scenario: ExecutionScenario | LegacyRunScenario
  status: ExecutionStatus
  outcome?: ExecutionOutcome
  failureCode?: string
  requestedAt: string
  startedAt?: string
  completedAt?: string
  durationMs?: number
  requestedBy: string
  inputLabel: string
  invoiceCount: number
  amountTotal: number
  summary: string
  correlationId: string
  action?: ProposedAction
  approvalId?: string
  events: ExecutionEvent[]
  attempts: number
  sideEffectCount: number
}

export interface Integration {
  id: string
  name: string
  category: 'CRM' | 'ERP' | 'CORREO' | 'DATOS'
  description: string
  status: 'SIMULATED' | 'AVAILABLE' | 'FUTURE'
  capabilities: string[]
  permissions: string[]
  initials: string
  accent: string
}

export interface PlatformState {
  executions: ExecutionRecord[]
  approvals: Approval[]
  recoveryNotice?: string
}

export interface ApprovalActor {
  name: string
  role: string
  authorized: boolean
}
