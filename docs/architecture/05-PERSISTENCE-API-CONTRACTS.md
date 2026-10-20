# Digital Employee Platform — Persistence & API Contracts

**Version:** 0.1.0  
**Status:** Normative baseline  
**Created:** 2026-09-21  
**Updated:** 2026-10-19

## 1. Persistence strategy

PostgreSQL is the primary system of record for domain state. Temporal persists workflow state through its own persistence layer. Valkey is transient infrastructure and must not become the authoritative store for business state.

A third, **bounded** store exists: the agent-runtime state store (the runtime's own checkpointing), confined to one agent run inside an activity. It is not a system of record and is governed by `04` §21. State authorities are therefore:

| Concern | Authority |
|---|---|
| Domain/business state (employees, tasks, executions, actions, approvals, artifacts) | PostgreSQL |
| Durable workflow lifecycle (timers, signals, retries, waits, recovery) | Temporal persistence |
| Agent-run state inside one run | Agent-runtime store — PostgreSQL in a **separate runtime schema** with its own roles (`ADR-012`); bounded, classified, retention-limited |
| Cache/transient coordination | Valkey *(BSD-3-Clause; replaces Redis 8 per `ADR-011` Accepted)* (never authoritative) |

Progress and status are read from the durable layer with non-mutating **queries**, while commands are delivered as **signals/updates** (`04` §22).

pgvector and PostgreSQL full-text search provide the initial retrieval layer.

## 2. Logical schema

Core tables/entities:

```text
tenants
identities
roles
employees
employee_versions
skills
skill_versions
tasks
task_versions
triggers
executions
actions
approvals
policies
policy_versions
tools
mcp_servers
mcp_server_versions
integrations
memory_items
knowledge_sources
knowledge_chunks
audit_events
outbox_events
```

Every tenant-owned row must carry `tenant_id` unless it is strictly deployment-global infrastructure metadata.

## 3. Execution persistence

`executions` should include:

- UUID primary key;
- tenant ID;
- employee/task version references;
- trigger reference;
- Temporal workflow ID/run ID;
- status;
- timestamps;
- correlation/causation IDs;
- idempotency key;
- input reference;
- output summary/reference;
- failure information;
- cost/token summary.

Large payloads should be stored by reference or in an appropriate object/document store rather than expanding relational rows indefinitely.

## 4. Action persistence

Actions should retain the requested capability, normalized arguments hash/reference, policy decision, risk assessment, approval reference, invocation status, result reference, retry count and compensation status.

Sensitive raw arguments should be classified and protected.

## 5. Audit

Audit is append-oriented. An audit event should capture actor, action, resource, execution, policy, result, timestamp and correlation information without secrets.

### 5.1 Action naming taxonomy

*Added 2026-10-19 — closes finding K-52/K-53 of `docs/reference/KORTIX-CROSS-MATRIX.md`.*

Audited actions use a stable, machine-readable name of the form:

```text
<domain>.<resource>.<verb>
```

- `domain`: the bounded area (`execution`, `action`, `approval`, `policy`, `tool`, `employee`, `task`, `trigger`, `knowledge`, `memory`, `artifact`, `identity`, `secret`, `integration`, `platform`);
- `resource`: the entity type the operation touches;
- `verb`: `create`, `update`, `delete`, `read`, `list`, `invoke`, `approve`, `reject`, `cancel`, `grant`, `revoke`, `export`, `publish`, …

Rules:

1. One operation has one canonical action name; names are part of the contract and are versioned like any other schema (`§14`).
2. A family may be addressed by prefix (for example `execution.` or `approval.`) for filtering and export.
3. The event records the **route/surface** and the operation, not free-form text.
4. Renaming an action is a breaking change; the old name remains resolvable for the retention window.

### 5.2 Coverage rule

Every operation that reads classified data, mutates state, executes an action, changes configuration, or changes access must produce an audit event — including control-plane administration and operator actions on a running execution. Coverage is verified by contract tests (`§19`), not by convention.

## 6. Optimistic concurrency

Mutable control-plane resources should have a version or revision number. Updates should fail on stale revision to prevent silent overwrites.

## 7. Outbox

Changes that must publish integration events should use a transactional outbox pattern:

```text
DB Transaction
 ├─ update domain state
 └─ insert outbox event
          ↓
     Outbox Publisher
          ↓
     Event Bus / Queue
```

This prevents the database commit and event publication from diverging.

## 8. API conventions

Base path: `/api/v1`.

Resources:

- `/tenants`
- `/employees`
- `/tasks`
- `/triggers`
- `/executions`
- `/approvals`
- `/tools`
- `/mcp-servers`
- `/policies`
- `/knowledge`
- `/audit`

Use UUIDs, ISO-8601 timestamps, explicit enums and Pydantic schemas.

## 9. Execution API

`POST /api/v1/executions`

Creates an Execution Request.

Expected behavior:

```json
{
  "task_id": "...",
  "input": {},
  "trigger_type": "API",
  "idempotency_key": "..."
}
```

Response:

```json
{
  "execution_id": "...",
  "status": "QUEUED"
}
```

The endpoint does not synchronously execute the LangGraph agent.

## 10. Approval API

Conceptual endpoints:

- `GET /api/v1/approvals/{approval_id}`
- `POST /api/v1/approvals/{approval_id}/approve`
- `POST /api/v1/approvals/{approval_id}/reject`

The server verifies authorization and signals the durable workflow.

### 10.1 Approval queue (read model)

*Added 2026-10-19 — closes finding K-19/K-27 (cola de aprobaciones) of `docs/reference/KORTIX-CROSS-MATRIX.md`.*

A waiting execution is useless if nobody can see it. The approval queue is a first-class read model:

- `GET /api/v1/approvals?status=PENDING&assignee=me|role|team` — filters: state, required role, employee, task, risk class, age, tenant;
- each item exposes: requested action, exact arguments (or a redacted representation plus reference), risk assessment, policy decision reference, version context, requester, expiry and the execution it belongs to;
- ordering and **aging** are explicit: oldest first by default, with SLA indicators so that approvals lost in a queue are visible as a metric (`09` §13);
- **aging and escalation** (2026-10-19, `ADR-014`): an approval that ages produces **neither cancellation nor automatic rejection** — silence is never a decision. MVP engineering baseline: **notice at 24 hours**, **escalation at 72 hours** and **operational review at 7 days**, with the execution still durably waiting (`ADR-003`). A tenant policy may define an explicit rejection window, but it is recorded in the approval and in the audit trail, never applied as a hidden default;
- **delegation** and **separation of duties** are evaluated at decision time, not at request time;
- an approval already granted but not yet consumed may be **revoked** if policy changes or the action changes; revocation is auditable;
- decisions are idempotent: re-submitting the same decision returns the same result.

The queue is derived from PostgreSQL; the workflow is signalled by the API layer (`06` §6). Approvals are never delivered only through a notification channel: the channel is a convenience, the durable record is the authority.

## 11. Event ingestion API

Event endpoints must validate:

- signature/authentication;
- timestamp/freshness;
- replay protection;
- schema version;
- idempotency;
- tenant mapping.

After quick validation, processing is asynchronous.

Deduplication is keyed on the **event identity emitted by the provider** (its delivery/event id), not on the inbound request: a provider that retries the same event with a new request id must not produce a second execution. When the provider emits no event id, a bounded content+signature window provides the fallback (`§15`). Duplicate deliveries return a success status with an explicit `deduplicated` indicator so that a retrying sender does not escalate.

## 12. Error contract

Use stable machine-readable codes, for example:

```json
{
  "error": {
    "code": "POLICY_DENIED",
    "message": "The requested action is not permitted.",
    "request_id": "..."
  }
}
```

Messages must not expose credentials, internal stack traces or sensitive policy details unnecessarily.

## 13. Pagination/filtering

Collection APIs should support stable cursor pagination for large datasets. Filters and sorting must be explicit and bounded.

## 14. Versioned contracts

Public API schemas, events and tool schemas are versioned. Breaking changes require a new version or compatibility layer.

## 15. Idempotency

Mutating API requests should support idempotency keys. The server returns the original result when the same valid key is replayed within the configured retention window.

## 16. Data retention

Retention is policy-driven by data classification and business requirement. Audit retention is independent from conversational history retention.

## 17. Database constraints

The database should enforce what is safely enforceable:

- foreign keys;
- uniqueness;
- not-null requirements;
- check constraints;
- state transition constraints where practical.

Application logic remains responsible for complex authorization and workflow rules.

## 18. Hybrid retrieval

Knowledge search combines vector similarity with PostgreSQL full-text search. Results are fused using a deterministic strategy such as Reciprocal Rank Fusion before optional reranking.

## 19. Contract testing

MCP, API and event contracts require contract tests. Integration tests must verify both successful and rejected policy paths.

## 20. Execution event stream

*Added 2026-10-19 — closes finding K-64/K-65 (progreso en vivo) of `docs/reference/KORTIX-CROSS-MATRIX.md`.*

An execution may run for days. Clients (console, approval inbox, operator tooling, future SDKs) need a single contract to observe progress without polling the database.

- **Transport:** server-sent events (or an equivalent ordered stream) for progress; commands remain synchronous REST operations, never stream messages.
- **Contract:** each event carries `execution_id`, monotonic sequence number, event type, timestamp, correlation/causation ids and a bounded payload with references rather than full documents.
- **Event types (minimum):** execution state change, plan/step started, step finished, policy decision, approval requested/decided, action proposed/invoked/succeeded/failed, observation, artifact produced, budget threshold, control operation, terminal outcome.
- **Authorization:** the stream is subject to the same authorization as reading the execution; events containing restricted payloads are redacted to a reference and a classification label.
- **Reconnection:** a client reconnecting provides the last sequence number and receives the gap (or an explicit "reload required" signal). Events are never silently lost or reordered.
- **Retention:** the stream is a projection of durable state; a client that was disconnected beyond the retention window must reload state from the REST API.
- **Consumer-agnostic:** the console is the first consumer, not the contract. The stream must not expose internal runtime objects (agent-runtime state, secrets, raw model prompts).

## 21. Artifacts and file handling

*Added 2026-10-19 — closes finding K-22/K-23/K-24 of `docs/reference/KORTIX-CROSS-MATRIX.md`.*

An execution that "produces finished work" produces **artifacts**: generated documents, spreadsheets, exports, images, structured results, or files received as input. They are governed objects, not side effects.

- **Artifact record:** id, tenant, owner execution/action, employee version, type, size, checksum, classification, storage reference, created-at, retention policy, access ACL.
- **Storage:** metadata in PostgreSQL; content by reference in an object/document store (or a bounded byte store) — never inline in relational rows or in the agent-runtime state (`§3`, `04` §21).
- **Classification and DLP:** an artifact inherits the classification of the data it contains; DLP rules apply on creation, on read and on transfer outside the trusted environment (`06` §8).
- **Access:** artifacts are readable only by principals authorized on the owning execution plus explicit grants; a shareable link, if supported, is an explicit, expiring, auditable decision — not a default.
- **Limits:** maximum size per artifact and per execution, maximum number of artifacts per execution, and a per-tenant quota; exceeding a limit fails the producing action with a typed error rather than silently truncating.
- **Retention:** artifacts follow the retention policy of their classification; deleting an artifact referenced by an audit record requires the audit record to survive (reference preserved, content erased).
- **Untrusted content:** an uploaded artifact is untrusted data; it may contain instructions and must never be treated as commands (`04` §17).
- **Provenance:** every artifact links back to the execution, the action and the versions that produced it, so a reviewer can reconstruct how it was created.

## 22. API discovery and client ergonomics

*Added 2026-10-19 — closes finding K-65 of `docs/reference/KORTIX-CROSS-MATRIX.md`.*

- Each deployment serves its own machine-readable contract (`/api/v1/openapi.json` or equivalent) and a health endpoint that does not require authentication.
- Public documentation can be disabled per environment for hardened private deployments (`10`).
- Rate-limited responses return explicit limit headers (`X-RateLimit-Limit`, `-Remaining`, `-Reset`) and, on rejection, `429` with `Retry-After` and a stable error code (`§12`).
- Clients branch only on stable `code` values, never on human-readable text (`§12`).
- API keys, personal tokens and session credentials are distinguishable and revocable individually.
