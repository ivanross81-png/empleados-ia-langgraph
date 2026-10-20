# MVP Product Requirements — Digital Employee Platform

**Status:** Proposed for product-owner acceptance; non-normative until explicitly accepted  
**Revision:** 2026-10-20  
**Language authority:** English is the normative source once this proposal is accepted  
**Architecture authority:** Existing architecture documents and accepted ADRs remain authoritative

## 1. Executive summary

This proposal defines the smallest end-to-end product slice that can demonstrate the platform's differentiator: a Digital Employee completes bounded business work through a durable workflow, proposes actions, submits them to deterministic policy controls, obtains human approval when required, executes only through a governed tool boundary, and leaves an auditable result.

The recommended first use case is a **Collections Digital Employee**. The first demonstrator uses synthetic overdue-invoice data and a simulated collections/CRM adapter. It does not contact real customers or mutate production systems. A pilot with a real customer system is a later release gate, not an implicit feature of the demonstrator.

The MVP is deliberately one employee, one workflow, one minimal web console, one dedicated installation, and one simulated business integration. Its purpose is to validate execution, governance, recovery and operations before expanding the product.

## 2. Decisions and authority

This document is a product proposal, not an architectural replacement. Until the product owner accepts it, it must not be treated as an approved scope baseline.

The following constraints are already defined by accepted architecture or ADRs and are not reopened here:

- Build the platform from scratch; this repository's architecture and documents are the design baseline, not reusable application code.
- Temporal owns durable workflow lifecycle; LangGraph owns agent cognition within the defined boundary.
- PostgreSQL is the business system of record; runtime checkpoints use a separate runtime schema and are not business truth.
- External actions are evaluated by deterministic policy and executed through the governed integration boundary.
- No arbitrary agent-authored code executes in the API, worker or agent-runtime process in the MVP.
- Approval aging never silently approves, rejects or cancels an action.
- The first production deployment is dedicated per customer. Shared-resource dynamic multi-tenancy is out of scope.
- The accepted licence policy and the outstanding technical/legal validation gates remain in force.

## 3. Product outcome

The MVP must prove that a business user can assign a bounded task to a Digital Employee and receive a completed, traceable result without allowing model output to bypass policy, permission checks or human approval.

### Target users

| User | Need |
|---|---|
| Operations user | Start an execution, see its progress and inspect the result |
| Approver | Review the proposed action and approve or reject it with an attributable decision |
| Deployment administrator | Configure the single-customer installation, integrations, budgets and access |
| Product/operator engineer | Diagnose failures using execution history, audit events and metrics |

### Business hypothesis

A governed Digital Employee can reduce manual preparation and follow-up work for a repetitive collections process while retaining human control over external communication. The MVP must measure task outcome quality, operator effort, exceptions, cost and end-to-end duration; it must not claim savings until a pilot produces evidence.

## 4. Recommended first vertical slice: Collections

### Input

A user starts a collections run from the web console. The run receives a bounded batch of synthetic overdue invoices with customer reference, amount, due date, days overdue, status and contact eligibility. The schema must use synthetic identifiers and must not contain real personal or financial data.

### Processing

1. Validate the request, identity, employee version and idempotency key.
2. Create an execution request and start a Temporal workflow.
3. Read invoices through a typed adapter and construct a bounded context.
4. Use LangGraph and the configured LLM gateway to classify the case, explain the recommendation and draft a follow-up message.
5. Evaluate the proposed operation using versioned deterministic policy. The LLM's own statement that an action is safe is never an authorization decision.
6. Route ALLOW, DENY and REQUIRE_APPROVAL outcomes through distinct, testable paths.
7. For an approval-required action, persist the approval record and wait durably in Temporal. Display it in the web console. Apply the accepted aging/escalation semantics; never reject or cancel merely because time passed.
8. On approval, revalidate the current authorization and policy constraints immediately before executing the action.
9. Invoke only the simulated collections tool through the MCP Gateway or approved integration boundary. The simulator records the intended communication in a test outbox; it sends nothing to a real customer.
10. Persist the outcome, relevant versions, policy decision, approver identity and audit events; display the final status.

### Testable action classes

- **ALLOW:** a low-risk, reversible update in the simulated system, such as marking a case as reviewed.
- **DENY:** a forbidden action, such as acting on an ineligible or closed case.
- **REQUIRE_APPROVAL:** preparing or dispatching a simulated customer follow-up that requires explicit approval under the MVP policy.
- **Failure/reconciliation:** simulate a timeout after the mock system records an operation; retry must not duplicate the operation, and an uncertain outcome must be visible for reconciliation.

The action classes above are illustrative defaults for synthetic data. Before any real connector or customer communication is enabled, the owner of the pilot must approve the business policy and risk classification.

## 5. MVP functional requirements

| ID | Requirement | Acceptance evidence |
|---|---|---|
| MVP-FR-01 | Start a run manually from a minimal web console or the documented API | Request accepted, execution ID returned, status visible |
| MVP-FR-02 | Pin employee, task and policy versions to each execution | Versions visible in execution details and audit |
| MVP-FR-03 | Process a synthetic overdue-invoice batch and generate a structured recommendation plus draft | Golden scenarios produce schema-valid output and expected business labels |
| MVP-FR-04 | Enforce deterministic ALLOW, DENY and REQUIRE_APPROVAL outcomes | Positive and negative policy tests pass |
| MVP-FR-05 | Execute approved actions only through the governed MCP/integration boundary | Direct access bypass test fails; approved gateway path succeeds |
| MVP-FR-06 | Support durable human approval, rejection, aging and escalation | Approval survives worker restart; decision is attributable and idempotent |
| MVP-FR-07 | Prevent duplicate external effects on request retries and uncertain responses | Repeated request/action key produces one simulated business effect |
| MVP-FR-08 | Show execution state, action history, approval status and final outcome | Operator can inspect a complete end-to-end run |
| MVP-FR-09 | Record audit and operational telemetry correlated to an execution | Evidence reconstructs actor, versions, policy, approval and result without relying on prompt text |
| MVP-FR-10 | Enforce execution budget before starting new model/tool calls | Budget exhaustion stops new work safely and leaves a typed, reconcilable state |
| MVP-FR-11 | Provide a restricted artifact-generation path only if report/file output is included | Approved templates, bounded resources, no secrets and no default network egress |
| MVP-FR-12 | Start from a clean dedicated development environment using documented commands | Independent operator can install, seed synthetic data and run the demo |

## 6. User experience

The recommended first surface is a minimal first-party web console. This is a scope proposal for the MVP; it does not silently close DP-3 until the product owner accepts the channel decision.

The console needs only:
- a list of executions and their states;
- a form to start the Collections run with a selected synthetic batch;
- an execution detail view with recommendations, policy outcomes and audit timeline;
- an approvals queue with approve/reject actions and a reason field;
- a clear indication of simulated versus real integrations;
- a controlled stop/cancel request where the workflow contract allows it.

No Slack, Teams, WhatsApp, Telegram, email ingestion or external conversational channel is included in the first slice. Channel identity linking and authorization must be separately specified before any such surface is added.

## 7. Scope included

- One dedicated single-tenant deployment.
- One Digital Employee definition: Collections.
- One manual trigger and one bounded workflow.
- One minimal web console and documented API operations needed by that console.
- Synthetic invoice data and a simulated CRM/collections adapter.
- Temporal workflow durability and LangGraph cognition with the accepted PostgreSQL checkpoint boundary.
- Versioned policy decisions with ALLOW, DENY and REQUIRE_APPROVAL paths.
- Human approval and the accepted no-automatic-rejection aging semantics.
- Idempotency, typed errors, cancellation rules and reconciliation for uncertain external results.
- Execution budgets, token/cost accounting, audit events and basic operational metrics.
- A reproducible local/dedicated deployment definition and test suite.

## 8. Explicit non-goals

- Real customer contact or production writes in the demonstrator.
- A production connector for an unspecified enterprise system. The pilot must choose one with a design partner.
- Multiple Digital Employees, autonomous multi-agent swarms or dynamic agent creation.
- Shared-resource dynamic multi-tenancy or a multi-customer SaaS control plane.
- Arbitrary Python, shell, browser automation or model-authored code execution.
- A visual workflow editor or general-purpose workflow designer.
- A connector marketplace or universal integration catalogue.
- Multiple channels, enterprise-wide omnichannel identity, SCIM or complex self-service onboarding.
- Generic long-term memory/RAG for every use case; use only the bounded context necessary for this task.
- Kubernetes, service mesh or extra infrastructure without measured need.
- Claims of production availability, cost savings or legal compliance without evidence.

## 9. Security and governance requirements

1. The model proposes; deterministic policy and authorization controls decide.
2. Every external action carries an execution identity, pinned versions, action idempotency key and attributable actor.
3. The MCP Gateway/integration boundary rejects calls that lack the required policy decision and authorization context.
4. The approval record is bound to the exact proposed action or immutable action digest; material changes invalidate the approval and require a new decision.
5. Approver identity and permission are checked on submission, and action permission is rechecked immediately before execution.
6. Secrets are referenced at execution time and never placed in prompts, LangGraph state, artifacts or ordinary logs.
7. External content is untrusted data; it cannot change tool permissions or policy.
8. Synthetic data only in demo/CI. Real customer data requires an explicit data-classification and deployment decision.
9. The runtime checkpoint role cannot read or write domain tables.
10. Default network egress from artifact generation is denied. No arbitrary code execution is introduced.
11. Logging and tracing redact sensitive values. Prompt capture remains disabled by default as already decided.
12. Any uncertain external side effect must become a typed reconciliation state rather than being retried blindly.

## 10. Measurable acceptance baseline

The existing DP-18 values apply as the initial engineering baseline, not as a commercial SLA:

- At least 95% success on a reproducible representative set of low-risk cases, with no unapproved regression greater than 2 percentage points.
- 100% pass rate for deterministic authorization/policy tests and zero unauthorized external actions in the tested set.
- A proposed initial evaluation corpus of 100 labelled cases, including normal, boundary, deny, approval and adversarial-input cases. If the selected domain cannot support 100 independent cases, document the reduced set and its limitation before claiming the threshold.
- Successful tests for worker crash and resume, durable approval, idempotent retry, timeout after external success, cancellation, budget exhaustion and audit completeness.
- The initial low-cost run profile stays within the documented ceiling: 15 minutes active compute, 20 model calls, 40 tool calls, 50,000 tokens and an estimated USD 2 model budget per execution. Any changed profile requires recorded approval.
- No secrets in prompts/state/logs and no calls to a real customer destination in the demonstrator.
- Installation, backup/restore instructions and CI checks are reproducible by a second operator.

Latency and concurrency targets for customer production are intentionally not invented here. Record a baseline under a repeatable load test, then set SLOs from the pilot's workload and customer needs.

## 11. Definition of done

The MVP demonstrator is done only when:

- all MVP-FR requirements have linked test evidence;
- the normal, deny, approval and uncertain-side-effect paths work end to end;
- worker restart does not lose a durable approval or create duplicate simulated effects;
- security gates and budget enforcement run before new external work;
- execution versions, policy outcomes, approvals and final outcomes can be audited;
- the evaluation corpus meets its approved quality threshold;
- a clean deployment can be started and tested from the written guide;
- unresolved compatibility, licence and legal gates are visibly recorded and the demonstrator is not represented as commercially cleared.

## 12. Product decisions still requiring explicit confirmation

| Decision | Current recommendation | Gate |
|---|---|---|
| First business case | Collections, because it is already the canonical spike scenario | Owner validates business priority/design partner |
| First channel | Minimal first-party web console; no external channel | Close DP-3 before channel implementation |
| Initial enterprise integration | Simulated adapter for demo; select one real adapter with pilot customer | A real integration needs its own scope, credentials and security review |
| Risk/action policy | ALLOW/DENY/REQUIRE_APPROVAL with illustrative synthetic rules | Owner/business risk owner approves before real side effects |
| Production SLO and capacity | Measure first, set targets with pilot workload | No external SLA until proven |
| Commercial distribution | Blocked until DP-5/DP-6 technical compatibility, SBOM and legal review are completed | Release gate |

## 13. Relationship to the architecture

This PRD narrows the initial product scope; it does not change the component boundaries or contracts. The implementation must follow the architecture index, accepted ADRs, security rules and testing strategy. A change to security boundaries, workflow semantics, persistence authority, deployment isolation or public contracts requires the existing ADR process.

## 14. Review checklist

- [ ] Product owner accepts Collections as the first business case.
- [ ] Product owner accepts the first-party web console as the first surface (DP-3).
- [ ] Business/risk owner approves synthetic ALLOW/DENY/REQUIRE_APPROVAL examples.
- [ ] Design partner and first real connector are identified before a production pilot.
- [ ] Acceptance test corpus and evidence owner are assigned.
- [ ] DP-5/DP-6 release gates are tracked and are not declared closed by this PRD.