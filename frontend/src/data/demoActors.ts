import type { ApprovalActor } from '../domain/types'

/** Synthetic identity used only in the interactive approval demonstration. */
export const demoApprover: ApprovalActor = {
  name: 'Elena García',
  role: 'Aprobador de cobranzas',
  authorized: true,
}
