# MVP Delivery Plan — Vertical Slice

**Status:** Proposed implementation plan; non-normative until the product owner accepts the MVP scope  
**Revision:** 2026-10-20  
**Companion:** MVP-PRD.md  
**Planning principle:** demonstrate one complete, governed workflow before increasing platform breadth

## 1. Delivery strategy

Build a vertical slice around the Collections Digital Employee proposed in MVP-PRD.md. Each increment must leave the repository runnable and provide evidence that the architecture's most important risks are controlled.

Do not implement every architecture box as a separate microservice. Keep the domain/application boundaries clean, but consolidate deployables where practical for the dedicated MVP. Docker Compose is sufficient; Kubernetes, service mesh and shared-tenant SaaS are not prerequisites.

## 2. Sequence and gates

### M0 — Scope lock and implementation contract

**Purpose:** prevent implementation from filling product gaps by assumption.

Deliverables:
- Product owner decision on the Collections use case and first-party web console.
- Confirmed synthetic invoice schema, user roles and action-risk table.
- API and domain contracts for execution creation, status, action proposal, approval decision and outcome.
- One acceptance scenario for ALLOW, one for DENY, one for REQUIRE_APPROVAL and one for uncertain external result.
- Decision log for remaining open items, with owner and closure evidence.

Exit gate:
- DP-3 is closed for the MVP channel, or channel-specific implementation remains explicitly blocked.
- No ambiguity about whether a simulated or real external effect is allowed.
- Each requirement in MVP-PRD.md has at least one test or a named validation activity.

### M1 — Runnable foundation and durable execution

**Purpose:** prove the minimum runtime and persistence boundaries.

Implementation order:
1. Establish configuration, dependency pinning, local Compose topology and synthetic seed data.
2. Implement domain types and API/application interfaces for Execution Request, execution status, version references and idempotency.
3. Provision PostgreSQL domain schema and separate runtime checkpoint schema/roles. Add a negative permission test proving the runtime role cannot access domain tables.
4. Implement a Temporal workflow with typed activities and error classification.
5. Invoke LangGraph only inside the defined cognitive activity; keep Temporal responsible for long-running waits and workflow lifecycle.
6. Add an LLM gateway adapter with deterministic/mock mode for CI and configurable provider mode for local integration tests.
7. Add correlation IDs, structured logs and execution/audit events.

Exit gate:
- A request creates one durable execution and returns an execution ID.
- A duplicate request with the same idempotency key does not create a second logical execution.
- Worker restart/recovery tests pass for the implemented workflow.
- The checkpoint approach passes DP-1 failure tests or the unresolved failure is recorded as a blocker; it is never described as validated prematurely.

### M2 — Governed actions and human approval

**Purpose:** establish the differentiator: no model-proposed action bypasses deterministic controls.

Implementation order:
1. Define a typed action proposal and immutable action digest/idempotency key.
2. Evaluate policy and risk deterministically; include ALLOW, DENY and REQUIRE_APPROVAL.
3. Enforce action execution through MCP Gateway/the approved adapter; direct invocation without the expected authorization context must fail.
4. Persist approval state in the domain system of record. Use Temporal signals/timers for durable waiting, not polling.
5. Add web-console views for execution state, proposal, approver decision and result.
6. Implement aging notice/escalation at the defined 24-hour, 72-hour and 7-day review windows. Never auto-approve, auto-reject or auto-cancel from age alone.
7. Reauthorize immediately before execution and bind approval to the exact action version/digest.

Exit gate:
- ALLOW succeeds, DENY is blocked and REQUIRE_APPROVAL waits durably until an authorized decision.
- Approval survives worker restart and duplicate submissions are idempotent.
- A modified action cannot reuse the old approval.
- A policy/gateway bypass test fails closed.

### M3 — Collections workflow and measured evaluation

**Purpose:** prove end-to-end business usefulness with repeatable evidence.

Implementation order:
1. Load a bounded synthetic invoice batch through a typed simulated adapter.
2. Classify and prioritize cases using deterministic business features plus LLM-generated explanation/draft. Keep business invariants and authorization outside the model.
3. Produce a structured recommendation and draft follow-up. If a downloadable report is included, generate it only through the restricted template/library catalogue defined in ADR-013.
4. Route actions through the three policy outcomes and record the result in a simulated outbox; no real customer contact.
5. Build a labelled golden dataset with normal, boundary, denied, approval and adversarial-input cases.
6. Measure success, policy adherence, tool correctness, cost and duration. Record provider/model and prompt/employee/task/policy versions for repeatability.
7. Handle missing/contradictory data and typed outcomes for unavailable tools or uncertain external results.

Exit gate:
- The approved low-risk evaluation threshold is met.
- Deterministic security tests pass 100%; no unauthorized external action occurs in the set.
- Retries, timeout-after-success and worker restart do not duplicate simulated business effects.
- Operator can trace from initial request through policy, approval and final outcome.

### M4 — Hardening and pilot readiness

**Purpose:** convert the demonstrator into a controlled candidate for a design-partner pilot.

Deliverables:
- Reproducible clean install and configuration; pinned dependency and image versions.
- Backup/restore runbook with observed RPO/RTO, not just target values.
- SBOM generation and licence checks for the actual distributable artifact.
- Compatibility test results for component substitutions in ADR-011.
- Secret-handling, egress restriction, prompt-injection, authorization bypass, artifact resource-limit and log-redaction tests.
- Operational dashboards/alerts for errors, latency, stuck executions, budget consumption, approval aging and queue depth.
- Runbooks for pause/disable, cancellation, incident response and uncertain-action reconciliation.
- Pilot data-processing boundaries and selection of one real connector if required by the design partner.

Exit gate:
- DP-1, DP-2, DP-4 and DP-20 tests have evidence or a documented no-go for the relevant capability.
- DP-5/DP-6 compatibility and licence/legal gates are explicitly tracked; commercial distribution is not marked approved without required review.
- Pilot owner approves the real connector, data classification, action-risk matrix and operating objectives.
- Production RPO/RTO and latency/concurrency SLOs are based on evidence from target workload.

## 3. Critical path

The critical path is:

**scope decision → execution/idempotency contracts → durable workflow → policy/gateway enforcement → durable approval → simulated effect/reconciliation → evaluation evidence → pilot hardening.**

A real CRM/email connector is not on the path to the first demonstrator. It enters only after the governed flow and failure semantics work against the simulator.

## 4. Parallel work that is safe

These activities can proceed in parallel once interfaces are agreed:
- web-console wireframes and API contract examples;
- synthetic dataset and labelled evaluation cases;
- CI harness, formatting/type/security checks and documentation validation;
- compatibility test preparation and SBOM pipeline;
- deployment and recovery runbooks.

Do not parallelize competing implementations of workflow state, approval truth or action authorization. Each must have one defined authority.

## 5. Suggested repository modules

The following is a logical guide, not an instruction to create one service per row:

| Boundary | Responsibility |
|---|---|
| Domain | Execution IDs, immutable versions, action proposal, approvals, result and typed failure states |
| Application | Start execution, evaluate action, submit decision, cancel/reconcile |
| API/Web | Request creation, status/detail, approval queue and decision submission |
| Workflow | Temporal orchestration, timers, retries, signals and recovery |
| Agent runtime | LangGraph cognition inside the bounded activity |
| Policy | Versioned deterministic ALLOW/DENY/REQUIRE_APPROVAL |
| Integration | MCP Gateway and typed simulated collections adapter |
| Persistence | Domain schema, runtime checkpoint schema, audit and artifact metadata |
| Evaluation | Golden cases, deterministic security suite and outcome scoring |
| Operations | Compose, health checks, backup/restore, logs, metrics and runbooks |

Use architecture contracts and accepted ADRs to determine package names and public interfaces before implementation. This table does not authorize a new service boundary.

## 6. Test plan required by increment

| Gate | Required evidence |
|---|---|
| M1 | API/domain contracts; idempotency; runtime DB permissions; Temporal resume; LangGraph checkpoint fault tests |
| M2 | ALLOW/DENY/approval contracts; rejection of unauthorized direct calls; approval identity/action-digest checks; durable wait/restart |
| M3 | Business golden scenarios; 95% low-risk success baseline; zero unauthorized actions; timeout-after-success; budget exhaustion; audit reconstruction |
| M4 | Restore drill; compatibility suite; SBOM/licence review; secret/log redaction; denied egress; resource limits; runbooks |

A design or green documentation CI does not prove that the runtime, security boundary or substituted products have been technically validated.

## 7. Release increments

- **Demo-ready:** M1–M3 pass with synthetic data and simulated external actions.
- **Design-partner pilot candidate:** M4 gates pass, connector and data handling are approved, and operating objectives are measured.
- **Commercially distributable release:** also requires complete licence/legal review and all product release controls.

Do not call the demo “production-ready” or the pilot “commercially cleared” solely because the UI works or CI passes.

## 8. Risks to actively manage

| Risk | Mitigation |
|---|---|
| Scope inflation | One employee, one bounded task, one simulator, one channel |
| Duplicate external effects | Idempotency key, action digest, timeout-after-success tests and reconciliation |
| Model-driven permission escalation | Deterministic policy, gateway enforcement and negative bypass tests |
| Conflicting durability | Temporal lifecycle authority; LangGraph checkpoint limited to the cognitive run |
| Unproven software substitutions | Compatibility evidence and SBOM/legal gates |
| Overclaiming quality from a small corpus | Labelled corpus, disclosed limitations, regression suite and repeated evaluation |
| Cost growth | Per-run budgets checked before new calls and versioned profile configuration |
| Hidden production assumptions | Explicit pilot connector, identity, data classification, SLOs and restore test |

## 9. Completion report format

For each gate, report:
- tested commit and environment;
- requirements covered;
- commands/tests and actual results;
- failures and known limitations;
- open decisions and named owner;
- GO / NO-GO recommendation with evidence.

Never state a test passed if it was not executed. Never close a product, security or legal gate by inference.