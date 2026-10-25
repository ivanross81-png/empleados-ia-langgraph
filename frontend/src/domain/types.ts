export type PolicyDecision = 'ALLOW' | 'DENY' | 'REQUIRE_APPROVAL'
export type RunScenario = 'approval' | 'allow' | 'deny' | 'failure' | 'uncertain'
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
  risk: 'LOW' | 'MEDIUM' | 'HIGH'
  policyDecision: PolicyDecision
  policyVersion: string
  status: ActionStatus
  idempotencyKey: string
  digest: string
  proposedAt: string
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
  scenario: RunScenario
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
