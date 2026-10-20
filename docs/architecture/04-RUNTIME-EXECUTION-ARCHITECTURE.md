# Digital Employee Platform — Runtime & Execution Architecture

**Version:** 0.1.0  
**Status:** Normative  
**Created:** 2026-09-21  
**Updated:** 2026-10-19

## 1. Fundamental execution model

```text
Trigger
  ↓
Execution Request
  ↓
Temporal Workflow
  ↓
LangGraph Agent Runtime
  ↓
Plan → Policy → Action → Tool → External System
  ↓                         ↑
Observation ←───────────────┘
  ↓
Decision / Approval / Retry / Compensation
  ↓
Outcome
```

## 2. Temporal versus LangGraph

**Temporal** owns durable workflow lifecycle:

- retries;
- timers;
- cancellation;
- signals;
- heartbeats;
- recovery;
- long-running execution;
- human waits;
- compensation orchestration.

**LangGraph** owns agent cognition:

- stateful reasoning;
- planning;
- tool-oriented graph execution;
- observation/decision loops;
- bounded agent state.

Neither component replaces the other. The durability boundary is explicit: LangGraph's own persistence (checkpointer) is confined to the short cycle of one agent run inside an activity; Temporal remains the only authority for the durability of the execution (see §21).

**Temporal** is the only authority for orchestration durability. Within an execution, agent-run state may be persisted by the agent runtime for resume inside a single run, but that state is never the source of truth for the execution lifecycle, for approvals, or for business results.

## 3. Temporal workflow

A Workflow coordinates activities and durable state. External calls belong in Activities or dedicated service calls, not in workflow code that must remain deterministic.

Typical Activities:

- load execution context;
- construct model context;
- call LLM Gateway;
- evaluate policy;
- request approval;
- invoke MCP Gateway;
- persist result;
- emit audit event;
- perform compensation.

## 4. Agent state

LangGraph AgentState must be explicit and serializable. It should contain references to durable objects rather than uncontrolled copies of secrets or huge documents.

If the agent runtime persists this state between steps (checkpointer), that persistence is a **runtime store**, not the execution system of record, and is governed by §21.

Example conceptual state:

```yaml
execution_id: UUID
employee_version_id: UUID
task_version_id: UUID
goal: string
plan: object
observations: list
pending_action: object|null
risk_context: object
approval_state: object|null
context_refs: list
budgets: object
iteration: integer
```

## 5. Plan versus Action

The LLM may propose a plan such as:

1. inspect overdue invoices;
2. classify accounts;
3. draft communications;
4. send approved communications.

The plan is not authorization. Each side-effecting action must pass validation, policy, risk and capability enforcement.

## 6. Tool execution pipeline

```text
Model Tool Request
 → Schema Validation
 → Normalization
 → Identity / Scope Check
 → OPA Policy
 → Risk Evaluation
 → Approval if required
 → Credential Resolution
 → Rate Limit
 → Circuit Breaker
 → MCP Invocation
 → Result Validation
 → Audit
 → Observation
```

## 7. MCP Gateway

The gateway should be stateless and horizontally scalable. Responsibilities include authorization, schema validation, policy enforcement, credential resolution, rate/concurrency limiting, circuit breaking, retries, timeouts, idempotency, audit and observability.

## 8. Secrets flow

```text
Tool Request
 → MCP Gateway
 → OpenBao/KMS
 → Short-lived Credential
 → External API
```

Credentials must not be copied into prompts, LangGraph state, persistent memory or normal logs.

## 9. Context lifecycle

```text
Raw State
 → Task Context
 → Memory
 → RAG
 → Tool Results
 → History
 → Relevance Filtering
 → Deduplication
 → Compression
 → DLP/PII Controls
 → Token Budget
 → LLM
```

## 10. DLP

Data sent to external models is classified before transmission. Rules can block external transfer, redact data, prohibit persistence or require human approval.

## 11. Human-in-the-loop

Temporal waits for a durable signal. The process survives worker restarts. Approval must reference the exact action/version/context needed for the decision.

A `REQUIRE_APPROVAL` decision **suspends** the execution; it does not fail the action and it does not roll it back. The runtime resumes the same execution with the human decision as input.

Human-in-the-loop has a second, internal form: the agent runtime may pause its own graph to ask for data or a decision. In that case the runtime may re-execute the node that requested it when work resumes; therefore every side effect performed before an in-graph pause must be idempotent or deferred until after the decision (see §21 and §12).

## 12. Idempotency

A recommended key is:

`tenant_id + execution_id + action_id + attempt`

External APIs should use provider idempotency keys where supported.

## 13. Failure handling

Failure categories:

- validation failure;
- authentication/authorization failure;
- transient network failure;
- rate limit;
- external service outage;
- business rejection;
- policy denial;
- model failure;
- malformed tool output;
- unrecoverable state corruption.

Retries are only applied to errors classified as retryable.

## 14. Saga and compensation

A multi-system operation is not treated as an ACID transaction. If step A succeeds and step B fails, the workflow uses compensation where the external system provides a valid inverse operation. Otherwise it moves to reconciliation/manual recovery.

## 15. DLQ

Unrecoverable executions enter a durable DLQ with:

- failure reason;
- attempts;
- last activity;
- relevant references;
- suggested recovery;
- operator actions.

Operators can inspect, retry, cancel, compensate or reconcile.

## 16. Runtime budgets

Every execution should have limits for:

- total duration;
- iterations;
- tool calls;
- LLM calls;
- tokens;
- estimated cost;
- concurrent actions.

**MVP engineering baseline (DP-18, 2026-10-19).** The initial low-cost profile per execution is: **15 minutes** of active compute, **20** model calls, **40** tool calls, **50,000** tokens and **USD 2** estimated budget. Values are configurable per environment and per task profile; they are a baseline for engineering and testing, **not** a commercial SLA.

Two rules govern enforcement:

1. Limits are applied **before** starting a new model call, tool call or external action: the execution stops at the boundary, with a typed outcome, instead of discovering the overrun afterwards.
2. An **in-flight external effect is not interrupted** without outcome management and reconciliation (`§18`): the cut-off prevents new work and records the pending reconciliation.

## 17. Prompt injection

External content, retrieved documents and tool outputs are untrusted. They may contain instructions that attempt to change agent behavior. The runtime must keep data and control instructions structurally separate and never grant authority merely because text says it should be granted.

## 18. Cancellation

Cancellation is a first-class execution operation. Activities must honor cancellation where possible, and external side effects must use idempotency/reconciliation because cancellation cannot guarantee rollback of already completed external actions.

## 19. Observability

Each execution carries:

- execution ID;
- correlation ID;
- causation ID;
- tenant ID;
- employee/task versions;
- trace context.

Metrics, logs and audit events are separate concerns.

## 20. Runtime invariants

- Every external action is attached to an Execution.
- Every external action has a policy decision.
- Every mutable action is idempotent where possible.
- Every execution is recoverable after worker restart.
- No secret is part of model context.
- Tool outputs are untrusted.
- Version references are immutable.

## 21. LangGraph integration, checkpoints and state boundary

*Added 2026-10-19 — closes gap C-1 of `docs/reference/KORTIX-CROSS-MATRIX.md` (finding K-L1/K-L2/K-L3).*

### 21.1 Responsibilities

The agent runtime is invoked **inside a durable activity**. It receives a bounded input (goal, context references, budgets, tool grants) and returns a structured result (plan, observations, proposed actions, outcome). It does not decide authorization, does not resolve credentials and does not manage timers, cancellations or human waits.

### 21.2 Checkpoint store

Agent-run state may be persisted between steps to allow resume inside a single run and to support inspection. That store is a **runtime store**:

1. It is **not** the system of record for the Execution (`05` §1). Execution status, results and artifacts live in the domain store.
2. It is confined to the **short cycle** of one agent run. If a run must survive a long wait (approval, external outage, days of delay), durability is Temporal's responsibility, not the checkpointer's.
3. It is subject to the same data classification, DLP and retention rules as any other store. No secret, credential, raw token or full external document may be persisted in it; large payloads are stored by reference (`04` §4, `05` §3, `06` §7).
4. It must have a **retention and deletion policy** per classification: checkpoint history is deleted after the execution reaches a terminal state plus the configured retention window, unless the environment explicitly requires longer retention for audit purposes (in which case the audit record is the artifact, not the checkpoint).
5. Durability of the runtime is a **bounded, declared choice**, not an implicit one. The five notions that must not be confused:

| Notion | Owner | What it covers |
|---|---|---|
| Recovery of a **cognitive run** | Agent runtime store (this section) | Re-entering an agent run inside the same activity after a crash of the process that was executing it, within the short cycle |
| **Durable human wait** | Temporal (workflow timers + signals) | An execution waiting hours or days for a person: the workflow is suspended durably and the approval is a `05` §10 record |
| Recovery of the **whole workflow** | Temporal | Replaying the workflow history after worker/process restarts, with timers, retries and signals intact |
| Recovery of a **failed activity** | Temporal retry policy (`§13`) | Re-scheduling the activity that failed, with the classification of retryable vs non-retryable errors |
| Persistence of **business results** | Domain store (PostgreSQL, `05` §1) | Execution status, outcomes, artifacts and audit records |

The checkpoint store therefore never carries a human wait and never carries business state: if a pause must survive longer than the run itself, the runtime returns control to the activity, which waits on a durable signal (`§11`). The durability mode and backend of the agent runtime are fixed by `ADR-012` (product-owner decision, 2026-10-19): per-step persistence in **PostgreSQL**, in a **separate runtime schema** with its own roles and permissions, with history deleted **7 days after the execution reaches a terminal state** (MVP engineering baseline, DP-18). The design decision is adopted, but the store is **not validated**: `ADR-012` lists the failure tests that must be executed (cost per step, crash mid-node, resume, retention, no duplicated external effects). DP-1 therefore stays open in its **test** layer, not in its design layer.

### 21.3 Re-execution on resume

When an agent run resumes after an in-graph pause, the runtime may re-execute the node from its beginning, not from the exact pause point. Therefore:

- side effects must be deferred until after the decision, or be idempotent (keyed like §12);
- an in-graph pause must not be captured by generic error handling or converted into a retry;
- pause and resume must be recorded as execution events (audit and telemetry), with the requesting identity and the decision.

### 21.4 Graph versioning and in-flight executions

A published definition is immutable (`03` §12), but the **graph that is executing** must remain resolvable while an execution is paused:

- the behaviour version in use is recorded in the execution state at the start of the run;
- conditional routing may branch on that recorded version so that executions started under an older definition finish under that definition;
- renaming or removing a node while executions may be paused at it requires either a compatible migration or the completion/cancellation of those executions before deploying the change.

## 22. Runtime control operations

*Added 2026-10-19 — closes finding K-15/K-16 in the cross matrix.*

An execution is not write-only. The following operations are part of the runtime contract, each with authorization, audit and idempotency semantics:

| Operation | Semantics | Who may request | Notes |
|---|---|---|---|
| Pause | The execution stops advancing steps; state is preserved; timers keep running | operator, task owner, or an approver with scope | A paused execution is still open and counts for concurrency |
| Resume | Continues from preserved state | same as pause | Must be idempotent for repeated requests |
| Inject directive | Adds a human instruction/observation to the running agent at its next step, without ending the run | execution owner or operator with scope | The directive is untrusted input: it cannot grant permissions and cannot bypass policy |
| Interrupt turn | Ends the current agent turn after the in-flight action completes, then re-plans | execution owner | Used to stop a wrong plan without cancelling the execution |
| Cancel | First-class cancellation (`§18`) | operator, execution owner, policy | External side effects already performed are not rolled back; reconciliation applies |
| Terminate | Immediate stop; the execution moves to a terminal failed/cancelled state with reason | operator only, and only for containment | Must be auditable as an operator action |

Every control operation produces an auditable event with actor, execution, previous state, requested change and outcome. A control operation never grants new capability to the agent.

**Read versus command (durable layer contract).** The agent runtime and the API layer interact with the durable workflow in two different ways and must not mix them:

- **Reading state and progress** uses **queries**: they do not mutate the workflow and can be issued repeatedly (this is how the event stream of `05` §20 and the approval queue of `05` §10.1 are fed).
- **Ordering a change** uses **signals** (asynchronous, no return value) or **updates** (synchronous, validated): a control operation of the table above carries a validated payload, is idempotent for repeated delivery, and is recorded as an execution event.
- An operation that mutates the execution must never be implemented as a query, and a read must never be implemented as a signal.

### 22.1 Operational Search Attributes

*Added 2026-10-19 — product-owner decision (DP-20); closes finding K-T5 of `docs/reference/KORTIX-CROSS-MATRIX.md`.*

Temporal Search Attributes are used to **locate and filter** executions — for example, the approvals waiting for a person (`05` §10.1). The MVP minimal set is:

| Attribute | Type (Temporal) | Purpose |
|---|---|---|
| `TenantId` | Keyword | Tenant/deployment isolation in queries |
| `EmployeeId` | Keyword | Which Digital Employee the execution belongs to |
| `ApprovalStatus` | Keyword | Whether the execution is waiting for an approval, and in which state |
| `ApprovalType` | Keyword | Class of the pending approval |
| `ApprovalPriority` | Keyword or integer | Queue ordering |
| `AssignedGroup` | Keyword | Group or role that must decide |
| `ApprovalDueAt` | Datetime | Aging and escalation (`ADR-014`) |
| `ApproverSubjectId` | Keyword — **opaque identifier only** | Optional: personal inbox, when one is needed |

Rules:

1. They are an **operational index**. The source of truth for approval state, permissions and business state is the domain store (`05` §1); finding a workflow through an attribute proves nothing about authorization.
2. **The API verifies permissions and reads approval details from the domain store.** An authorization decision is never derived from an attribute value.
3. Values are written with the same discipline as domain data: tenant-scoped, no personal data beyond an opaque identifier, no secrets (`06` §7).
4. Adding or changing an attribute is a **governed change**: it must be registered in the Temporal namespace, documented here with its type, and its types and registration must be compatible with the Temporal version in use — a contract test (DP-20).
5. Attribute-based filtering is **never** the isolation mechanism (`02` §11, `06` §3): isolation does not rest on a revocable protection.

## 23. Delegation (sub-agents, sub-graphs)

*Added 2026-10-19 — closes finding K-03 in the cross matrix.*

If the agent runtime supports delegating work to a sub-graph or sub-agent, delegation is allowed only under these rules:

- the delegated work runs **inside** the same execution and the same enforcement path; it cannot create a new execution or a new identity;
- the delegated context inherits the **intersection** of the parent's tool grants, budgets and policy scope — never a superset;
- maximum delegation depth and maximum concurrent delegates are configured per task and enforced by the runtime. MVP engineering baseline (DP-18, 2026-10-19): maximum depth **3**, **5** concurrent delegated agents and **3** concurrent external actions per execution;
- the parent remains responsible for the outcome; delegated reasoning is untrusted model output like any other;
- delegation is fully traced (which delegate, which context, which tool calls) so the execution can be reconstructed.

## 24. Workflow and worker versioning

*Added 2026-10-19 — closes finding K-T2 in the cross matrix.*

- Durable workflow definitions are code and evolve; a change that alters the sequence of commands of an open execution must be handled by an explicit strategy: compatible change, version branching, or a new workflow version for new executions while old ones finish on the previous one.
- The concrete mechanisms of the durable engine are the reference implementation of that rule: in-workflow *patching* (a version gate inside the workflow that branches behaviour for old and new histories) for small compatible changes, and a **new workflow type or version** for changes that cannot be patched; worker deployments are versioned so that a Task Queue serves compatible code, with cutover per version rather than an in-place replacement.
- Activity and workflow changes that can break replay must be covered by a replay/regression test before release (`09` §8, `docs/development/TESTING-STRATEGY.md`).
- Worker deployments are versioned so that an execution is not silently served by incompatible code.
- Workflow history growth is bounded (§`10` §6); long-lived executions must roll over their history rather than grow indefinitely.

## 25. Open questions (documented, not decided)

*Recorded 2026-10-19. These are gaps with no closed design; they must not be resolved implicitly by an implementation.*

1. **Employee execution environment — decided 2026-10-19 (`ADR-013`).** The MVP does **not** allow arbitrary agent code execution inside the main process. Deliverables are produced by a **restricted artifact-generation service** (approved libraries and templates, resource limits, no secrets, no egress by default), and the artifacts it produces are governed by `05` §21. The **ephemeral sandbox** variant remains open: it requires its own decision and its own isolation tests. Finding K-12/K-21; DP-2 stays open in its implementation and test layers.
2. **Channel surfaces.** When the first conversational channel is implemented, minimum requirements are: identity linking of the human sender, access policy for the session/thread, per-action authorization, ability to stop a run from the channel, and audit of every message that reached the agent (finding K-40).
3. **Cost and quota enforcement.** Which quotas (tenant, employee, task) hard-stop an execution, and what the execution does when a quota is exhausted (finding K-42).
