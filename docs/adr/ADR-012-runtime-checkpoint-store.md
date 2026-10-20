# ADR-012 — Runtime checkpoint store

**Status:** Accepted (product owner decision, 2026-10-19)  
**Date:** 2026-10-19

## Context
`04` §21.2 fixed the *boundary* of the agent-runtime state store (bounded, not a system of record, retention-limited, no secrets or large payloads) but deliberately left the **durability mode and the backend** undecided, tracked as DP-1. Without a backend, the boundary could not be tested and every implementation would choose implicit behaviour. The product owner decided the starting option and required it to be **proven by tests** before being treated as validated.

## Decision
1. **Per-step LangGraph persistence runs on PostgreSQL**, in a **separate runtime schema** with its **own roles and permissions**, distinct from the domain schema. The runtime role must not be able to read or write domain tables.
2. The checkpoint is **not** a source of truth for business state. **Temporal remains the only durability authority** for the workflow (`ADR-003`); the checkpoint only supports resuming a cognitive run inside the same activity (`04` §21.2).
3. **Durable human waits are Temporal's** (workflow timers + signals). The checkpoint never carries a human wait.
4. **External effects must be idempotent**, or executed as governed actions outside nodes that can be re-executed (`04` §21.3).
5. **Restricted serialization:** secrets, credentials and unnecessary sensitive payloads are excluded from the store; large payloads are persisted **by reference** (`04` §4, `05` §3, `06` §7).
6. **Retention:** checkpoint history is deleted **7 days after the execution reaches a terminal state** — MVP engineering baseline (`DECISIONES-PENDIENTES.md` DP-18), configurable per environment and subject to contract.
7. The store is **not validated** until these failure tests are executed: cost per step; crash in the middle of a node; resume after crash; retention/deletion actually removing history; and absence of duplicated external effects after a resume.

## Consequences
- The boundary becomes **checkable**: a negative test (runtime role querying domain tables) must fail, and it is the basis of the I-15 invariant.
- Deployment gains an asset to provision (schema + roles + its own backup/retention policy), noted in `10`.
- Selecting PostgreSQL avoids introducing a new product into the stack; the licence gate of `ADR-011` therefore does not apply to this decision.
- **Status of this decision:** design decision **adopted by the owner**; **not** technically validated — no test has been executed, so DP-1 stays open in its *test* layer.

## Alternatives considered
- **In-memory only:** rejected — no resume inside a run, and it hides the cost/privacy question instead of answering it.
- **Checkpoints in the domain schema:** rejected — mixes two authorities in one place and makes the separation unauditable.
- **External object store:** rejected for the MVP — adds a dependency, a perimeter and a classification burden without a demonstrated need.
