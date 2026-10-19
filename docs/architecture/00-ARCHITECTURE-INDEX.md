# Digital Employee Platform — Architecture Index

**Version:** 0.1.0  
**Status:** Normative baseline  
**Date:** 2026-09-21  
**Created:** 2026-09-21  
**Updated:** 2026-10-19

## 1. Purpose

This directory is the architectural contract for the Digital Employee Platform: a B2B platform for building, deploying, governing and operating autonomous Digital Employees that execute business work through durable workflows, controlled tools and human governance.

The documents are intentionally layered. Product intent is separated from enterprise architecture, domain semantics, runtime behavior, security, integrations, context, operations and development rules.

## 2. Normative rule

> **Architecture documents are normative. Code must implement the architecture; it must not silently redefine it.**

A change that affects component boundaries, security boundaries, persistence, execution semantics, public contracts, deployment model or governance must be accompanied by an ADR or an explicit architecture revision.

## 3. Reading order

1. `01-PRODUCT-VISION.md` — what the product is.
2. `02-ENTERPRISE-ARCHITECTURE.md` — how the platform is structured.
3. `03-DOMAIN-MODEL.md` — what the business objects mean.
4. `04-RUNTIME-EXECUTION-ARCHITECTURE.md` — how work executes.
5. `05-PERSISTENCE-API-CONTRACTS.md` — durable state and interfaces.
6. `06-SECURITY-GOVERNANCE.md` — security and control model.
7. `07-MCP-INTEGRATION-ARCHITECTURE.md` — controlled enterprise capabilities.
8. `08-MEMORY-KNOWLEDGE-CONTEXT.md` — information and context lifecycle.
9. `09-OBSERVABILITY-EVALUATION.md` — operational visibility and quality.
10. `10-DEPLOYMENT-OPERATIONS.md` — deployment and production operations.
11. ADRs — immutable rationale behind important choices.
12. Development guides — rules for implementation agents and engineers.

## 4. Architecture principles

- **Execution is the unit of work.** A message, schedule or event creates an execution request; it does not directly execute agent code.
- **Triggers and channels are independent.** A scheduled task can send an email; an ERP event can create a ticket; a manual request can produce a Teams message.
- **Temporal owns durability.** Long-running state, retries, timers, cancellation, signals, recovery and human waits belong to the durable workflow layer.
- **LangGraph owns agent cognition.** Reasoning loops, stateful planning and tool-oriented agent behavior belong inside the agent runtime.
- **LLMs propose; deterministic controls authorize.** Model output is untrusted and never constitutes authorization.
- **MCP exposes capabilities; the MCP Gateway enforces access.** MCP is an integration protocol, not the security model.
- **Every external action is policy-checked and audited.**
- **Secrets never enter prompts, agent state, memory or ordinary logs.**
- **External content is data, not instructions.** Prompt injection is treated as an input-security problem.
- **PostgreSQL is the system of record for business/domain state; Temporal is the system of record for workflow state.**
- **Versioned definitions are immutable.** Executions retain the exact versions used.
- **Single-tenant deployment is the initial isolation model.** Dynamic multi-tenancy is not an MVP assumption.

## 5. Canonical runtime

```mermaid
flowchart LR
    T[Trigger] --> ER[Execution Request]
    ER --> TW[Temporal Workflow]
    TW --> LG[LangGraph Runtime]
    LG --> C[Context Manager]
    LG --> L[LLM Gateway]
    LG --> P[Policy / Risk]
    P -->|ALLOW| MG[MCP Gateway]
    P -->|APPROVAL| H[Human Approval]
    H -->|Approved| MG
    MG --> X[Enterprise Systems]
    X --> O[Observation]
    O --> LG
    TW --> AU[Audit]
```

## 6. Source-of-truth rules

| Concern | Authority |
|---|---|
| Product intent | `01-PRODUCT-VISION.md` |
| Component boundaries | `02-ENTERPRISE-ARCHITECTURE.md` |
| Domain semantics | `03-DOMAIN-MODEL.md` |
| Execution behavior | `04-RUNTIME-EXECUTION-ARCHITECTURE.md` |
| Persistence/API contracts | `05-PERSISTENCE-API-CONTRACTS.md` |
| Security/governance | `06-SECURITY-GOVERNANCE.md` |
| MCP behavior | `07-MCP-INTEGRATION-ARCHITECTURE.md` |
| Memory/context | `08-MEMORY-KNOWLEDGE-CONTEXT.md` |
| Observability/evaluation | `09-OBSERVABILITY-EVALUATION.md` |
| Operations | `10-DEPLOYMENT-OPERATIONS.md` |
| Architectural rationale | `docs/adr/` |
| Coding behavior | `docs/development/` |

## 7. Change process

1. Identify the affected architectural contract.
2. Determine whether the change is implementation detail or architectural.
3. For architectural changes, create/update an ADR before implementation.
4. Update affected documents and cross-references.
5. Add or update tests/evaluations.
6. Implement.
7. Record migration and rollback implications.

## 8. Non-goals of the baseline

The baseline does not require Kubernetes, Kafka, service mesh, dynamic multi-tenancy, a custom identity provider, a custom vector database, unrestricted browser automation, unrestricted shell access, or a universal MCP server.

These may be introduced later only when requirements justify them.

## 9. Definition of architectural consistency

An implementation is architecturally consistent when a reviewer can answer:

> Why did this Digital Employee perform this action, using which versions, with which information, under which policy, with which authorization, against which capability, and with what exact result?

If the platform cannot reconstruct that chain, the implementation is incomplete from a governance perspective.

## 10. Reference documents (non-normative)

These documents do not define the architecture; they support it and are the evidence base for changes:

| Document | Purpose |
|---|---|
| `RUNTIME-EXECUTION-FULL-ANNEX-ARCHITECTURE-03.md` | Legacy operational detail; **superseded**, kept for implementation reference |
| `SPIKE-FASE1-FOUNDATION-investigacion.md` | Foundation-phase validation plan and GO/NO-GO thresholds |
| `KORTIX-analisis-y-licencias.md` | Independent assessment of Kortix/Suna as base vs reference, plus its licence |
| `KORTIX-INVESTIGACION-v0.14.3.md` | Capability investigation of Kortix/Suna at a pinned commit, with evidence and status per capability |
| `KORTIX-CROSS-MATRIX.md` | Document inventory, cross-check matrix, gaps, proposals and explicit discards |
| `STACK-LICENCIAS.md` | Licence inventory of the target stack with commercial risk classification |
| `REGISTRO-CAMBIOS-DOCUMENTALES-2026-10-19.md` | Traceability of the 2026-10-19 documentation changes |
| `REGISTRO-CAMBIOS-2026-10-19-AUDITORIA.md` | Traceability of the 2026-10-19 consistency audit (file, section, reason, before/after state, validation) |
| `AUDITORIA-CONSISTENCIA-2026-10-19.md` | Consistency audit report: scope, findings by severity, exact evidence, changes made and risks still open |
| `INVARIANTES-Y-PRUEBAS.md` | Architectural invariants with their normative source, the risk they prevent, the test required, its current state and the phase in which it must run |
| `DECISIONES-PENDIENTES.md` | Decisions that cannot be closed by documentary analysis alone |

Citation rule: the annex and the spike keep **legacy section numbers** (§64, §66, §89…) that do not exist in the normative documents. Always cite the normative document and section; treat legacy numbers as historical pointers only.

## 11. Documentation revision 2026-10-19

Additive revision. Sections were **extended**; no architectural principle, boundary, contract name or ADR was changed. Changes: `03` §5.1–5.2, §15 · `04` §2, §4, §11, §21–25 · `05` §1, §5.1–5.2, §10.1, §11, §20–22 · `06` §2.1–2.2, §4.1, §7.1, §17–18 · `07` §8.1 · `08` §13 · `09` §3, §6, §12.1, §13 · `10` §17–18. Rationale and evidence: `docs/reference/REGISTRO-CAMBIOS-DOCUMENTALES-2026-10-19.md`.

## 12. Consistency audit 2026-10-19

Second revision of the same day: an **audit** of the package rather than an extension of it. No architectural decision was changed and no dependency was added.

- **Corrected:** package counts and inventories (`00-INDEX.md` said 26 files and cited a wrong manifest path; the cross matrix said 62 files; the Spanish mirror of the manifest was stale), metadata traceability (`Created`/`Updated` on the 11 architecture documents and the 5 development guides; `Date` on the 11 ADRs; frontmatter on the reference documents).
- **Clarified:** the durability boundary in `04` §21.2 (the five notions — cognitive run, durable human wait, workflow recovery, failed activity, business results — are now an explicit table); read-versus-command in `04` §22; Temporal patching and worker cutover in `04` §24; the commercial modalities separated from the architectural limit in `01` §7.1.
- **Annotated, not substituted:** the components named in `02` §4, `05` §1, `09` §2 and `00-INDEX.md` carry an explicit "outgoing / reference substitute, pending formal acceptance of `ADR-011`" note. No component was silently renamed and no dependency was introduced.
- **Separated:** `ADR-011` now states its five formalisation layers (product decision, formal acceptance, technical compatibility, licence verification, legal validation) instead of implying that one closes the next.
- Findings, evidence and open risks: `docs/reference/AUDITORIA-CONSISTENCIA-2026-10-19.md`. Change-by-change trace: `docs/reference/REGISTRO-CAMBIOS-2026-10-19-AUDITORIA.md`. Tests still owed: `docs/reference/INVARIANTES-Y-PRUEBAS.md`.
