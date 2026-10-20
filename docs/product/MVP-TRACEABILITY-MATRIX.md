# MVP Traceability Matrix

**Status:** Proposed companion to MVP-PRD.md; non-normative until the MVP scope is accepted  
**Revision:** 2026-10-20

This matrix connects MVP requirements to existing architectural authority and acceptance evidence. It is an implementation aid, not a replacement for architecture documents or ADRs.

## 1. Requirement-to-contract mapping

| Requirement | Architectural authority | Verification evidence | Gate |
|---|---|---|---|
| MVP-FR-01: start and inspect an execution | 02 §§2–6; 04; 05 API contracts | API contract test plus web-console end-to-end run | M1/M3 |
| MVP-FR-02: pin immutable versions | 03 domain model; 04 runtime; 05 persistence | Execution and audit record contain employee/task/policy versions; mutation of a released version is rejected | M1 |
| MVP-FR-03: process invoices and draft a recommendation | 01 §§3, 6, 8; 03 domain model; 08 context | Labelled golden cases, output schema validation and operator review | M3 |
| MVP-FR-04: deterministic action outcomes | 06 security/governance; ADR-005 | Positive and negative OPA policy tests for ALLOW, DENY and REQUIRE_APPROVAL | M2 |
| MVP-FR-05: governed action boundary | 07 MCP integration; 06 security/governance | Direct tool/backend call without gateway authorization is denied; allowed call passes through gateway and is audited | M2 |
| MVP-FR-06: durable human approval | 03 domain model; 04 §§21–22; 05 §10.1; ADR-014 | Approval wait survives worker restart; authorized decision is attributable and idempotent; aging does not auto-reject/cancel | M2 |
| MVP-FR-07: no duplicate effects | 04 reliability/idempotency; 05 persistence; ADR-003 | Same request key creates one execution; timeout after mock success and retry create one simulated effect | M1/M3 |
| MVP-FR-08: inspect progress and outcome | 02 control plane; 05 API contracts; 09 observability | Operator inspects state, actions, approvals, policy decisions and outcome by execution ID | M2/M3 |
| MVP-FR-09: reconstruct audit trail | 06 audit/governance; 09 observability/evaluation; INVARIANTES-Y-PRUEBAS.md | Automated assertions for actor, execution, versions, policy, approval, action key and result; redaction scan | M1–M4 |
| MVP-FR-10: enforce budget safely | 04 runtime; 09 §12.1; DP-18 and DP-4 | Budget checked before each new call; exhaustion blocks new calls without blindly interrupting an in-flight external effect | M3 |
| MVP-FR-11: restricted artifacts, if included | ADR-013; 05 artifact contract; 06 security | Only catalogue entries execute; output/resource bounds enforced; no secrets and egress denied | M3/M4 |
| MVP-FR-12: reproducible installation | 10 deployment/operations; ADR-001 | Clean-environment install, health checks and synthetic scenario pass from runbook | M1/M4 |

## 2. Security and reliability acceptance cases

| Test ID | Scenario | Expected result |
|---|---|---|
| MVP-T-01 | Valid request with a new idempotency key | One execution is created and a stable ID is returned |
| MVP-T-02 | Same request and key submitted twice | One logical execution; no duplicate simulated effect |
| MVP-T-03 | Policy returns DENY | No tool side effect; reason and decision version are audited |
| MVP-T-04 | Policy returns REQUIRE_APPROVAL | Workflow waits durably; no effect before approval |
| MVP-T-05 | Approval submitted by an unauthorized user | Request is rejected and audited; workflow remains pending |
| MVP-T-06 | Proposal changes after approval | Existing approval is invalidated; new approval is required |
| MVP-T-07 | Worker is terminated while approval is pending | Workflow resumes with approval state intact |
| MVP-T-08 | Mock integration commits an effect but response times out | Retry does not duplicate the effect; uncertain outcome remains reconcilable |
| MVP-T-09 | Model attempts direct tool invocation or gateway bypass | Integration boundary denies access |
| MVP-T-10 | Prompt injection asks to reveal secrets or exceed permissions | Policy/authorization remains unchanged; no secret appears in state, output or logs |
| MVP-T-11 | Per-execution budget is exhausted | No new model/tool calls start; status is typed and auditable |
| MVP-T-12 | Artifact request exceeds catalogue/resource limits | Service refuses safely with typed result; no shell/code execution or network egress |
| MVP-T-13 | Runtime database role queries a domain table | Permission denied |
| MVP-T-14 | Approval reaches 24 h, 72 h and 7 d aging thresholds | Notice/escalation/review occur; no implicit approval, rejection or cancellation |
| MVP-T-15 | Restore drill from documented backup | Observed recovery is recorded against DP-18 RPO/RTO objectives |
| MVP-T-16 | Synthetic low-risk evaluation suite runs on pinned configuration | At least 95% success; zero unauthorized action; corpus limitations reported |

## 3. Evidence record template

Each result must record:

- Test and requirement IDs.
- Commit SHA and build/image versions.
- Environment and configuration profile.
- Dataset version and random seed where applicable.
- Commands executed and actual exit/result.
- Expected and observed result.
- Skipped checks and reason.
- Defect/reference, owner and retest date for failures.
- Whether the result proves document structure, implementation behavior, licence status or legal approval. These evidence categories must not be conflated.

## 4. Open gates at the time of writing

The documents define decisions and targets, not executed evidence. The following remain gates until tests/reviews are recorded:

- DP-1: PostgreSQL checkpointer failure/recovery, retention and duplicate-effect tests.
- DP-2: implementation and security/resource/egress tests for the restricted artifact-generation service.
- DP-3: product-owner acceptance of the first channel; this proposal recommends the first-party web console.
- DP-4: exact quota-cut behavior around in-flight external effects.
- DP-5/DP-6: component compatibility and licence/legal review of the distributable artifact.
- DP-20: Temporal Search Attributes registration/contract tests.
- RPO/RTO and performance: measure in repeatable runs; do not present target values as achieved.
- Pilot connector and real-data use: explicit customer, risk, identity and data-classification approval.

## 5. Decision rule

A row is complete only when reproducible evidence exists. A document that describes a test, a green documentation CI run or an accepted ADR does not prove the application behavior has passed its test.