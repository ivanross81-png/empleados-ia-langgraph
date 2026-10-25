import type { ApprovalActor, PlatformState, RunScenario } from '../domain/types'

/** Frontend contract shared by local simulation and a future API adapter. */
export interface PlatformService {
  getSnapshot(): PlatformState
  subscribe(listener: () => void): () => void
  reset(): void
  dismissRecoveryNotice(): void
  startExecution(employeeId: string, scenarioId: RunScenario): string
  decideApproval(approvalId: string, decision: 'APPROVED' | 'REJECTED', actor: ApprovalActor, reason: string): void
  reconcileUncertainExecution(executionId: string, retryWithSameKey?: boolean): void
  cancelExecution(executionId: string): void
}
