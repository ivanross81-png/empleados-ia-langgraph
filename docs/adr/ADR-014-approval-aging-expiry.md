# ADR-014 — Approval aging and expiry semantics

**Status:** Accepted (product owner decision, 2026-10-19)  
**Date:** 2026-10-19

## Context
`05` §10.1 (added in the 2026-10-19 additive revision, closing K-19/K-27) defined the approval queue read model and stated that **"an approval that expires must produce a deterministic outcome (reject by default)"**, without defining the windows. The product owner decided the opposite in one specific respect — **no automatic cancellation or rejection** — plus the initial aging windows for the MVP. Because the change affects the **semantics of a normative contract** (what happens to a pending approval), it is made through this ADR instead of by silent editing.

## Decision
1. **No automatic cancellation and no automatic rejection.** An approval that ages does **not** produce a negative automatic outcome. Silence is never a decision.
2. Backup human behaviour is **progressive escalation**, with MVP engineering baselines (configurable per environment, `DECISIONES-PENDIENTES.md` DP-18):
   | Stage | Window | What happens |
   |---|---|---|
   | Notice | 24 hours | The approver and the queue owner are notified (`09` §13) |
   | Escalation | 72 hours | The approval escalates to the next level (`AssignedGroup` / role) |
   | Review | 7 days | The case is listed for operational review; the execution stays durably waiting |
3. The execution **stays suspended durably** while it waits (`ADR-003`): the wait is a Temporal timer plus the durable approval record, not a poll.
4. Expiry semantics can still be **configured explicitly per policy** (for example, a tenant policy that rejects after N days), but it is an **explicit policy decision recorded in the approval itself and in the audit trail**, never a default hidden in code.
5. Operational location of pending approvals is done through the **operational Search Attributes** of `04` §22.1, which are an index for filtering, **not** the source of truth of approval state (`05` §1).

## Consequences
- The queue can grow: an ignored approval is visible as an **aging metric**, not silently resolved by the system. That is the intended behaviour — a human decision that matters should not disappear by timeout.
- The `05` §10.1 sentence about "reject by default" is replaced by this semantics; the deterministic **idempotency** of a submitted decision is unchanged.
- **Status of this decision:** design decision **adopted by the owner**; the windows are an MVP engineering baseline, **not** a contractual SLA, and are pending validation in production (DP-18 stays open in its validation layer).

## Alternatives considered
- **Reject by default on expiry:** rejected — it converts inaction into a negative business decision without an accountable human, and it can silently kill an execution that a person would have approved.
- **Approve by default:** rejected — worse: it authorizes an external action nobody authorized.
- **No aging at all (infinite silence):** rejected — the queue becomes invisible, which is exactly finding K-19.
