# Document Manifest

| # | File | Role |
|---:|---|---|
| 1 | `docs/architecture/00-ARCHITECTURE-INDEX.md` | Architecture map and authority rules |
| 2 | `docs/architecture/01-PRODUCT-VISION.md` | Product definition and scope |
| 3 | `docs/architecture/02-ENTERPRISE-ARCHITECTURE.md` | System architecture |
| 4 | `docs/architecture/03-DOMAIN-MODEL.md` | Domain model |
| 5 | `docs/architecture/04-RUNTIME-EXECUTION-ARCHITECTURE.md` | Runtime/execution |
| 6 | `docs/architecture/05-PERSISTENCE-API-CONTRACTS.md` | Persistence and APIs |
| 7 | `docs/architecture/06-SECURITY-GOVERNANCE.md` | Security/governance |
| 8 | `docs/architecture/07-MCP-INTEGRATION-ARCHITECTURE.md` | MCP/tool integration |
| 9 | `docs/architecture/08-MEMORY-KNOWLEDGE-CONTEXT.md` | Memory/RAG/context |
| 10 | `docs/architecture/09-OBSERVABILITY-EVALUATION.md` | Observability/evaluation |
| 11 | `docs/architecture/10-DEPLOYMENT-OPERATIONS.md` | Deployment/operations |
| 12 | `docs/adr/ADR-001-deployment-model.md` | Deployment decision |
| 13 | `docs/adr/ADR-002-langgraph.md` | LangGraph decision |
| 14 | `docs/adr/ADR-003-temporal.md` | Temporal decision |
| 15 | `docs/adr/ADR-004-mcp.md` | MCP decision |
| 16 | `docs/adr/ADR-005-opa-policy-engine.md` | Policy decision |
| 17 | `docs/adr/ADR-006-postgresql.md` | Persistence decision |
| 18 | `docs/adr/ADR-007-secrets-management.md` | Secrets decision |
| 19 | `docs/adr/ADR-008-dlp-pii-protection.md` | DLP decision |
| 20 | `docs/adr/ADR-009-evaluation-framework.md` | Evaluation decision |
| 21 | `docs/adr/ADR-010-llm-gateway.md` | LLM gateway decision |
| 22 | `docs/adr/ADR-011-free-licence-stack.md` | **Accepted** (2026-10-19) — free-licence-only stack policy |
| 23 | `docs/development/DEVELOPMENT-GUIDELINES.md` | Engineering workflow |
| 24 | `docs/development/CODING-STANDARDS.md` | Coding standards |
| 25 | `docs/development/TESTING-STRATEGY.md` | Testing strategy |
| 26 | `docs/development/SECURITY-RULES.md` | Security rules |
| 27 | `docs/development/CLAUDE-CODE-GUIDELINES.md` | AI coding-agent contract |

## 7. Documentation set

The architecture package contains 27 files: 11 architecture documents, 11 ADRs and 5 development guides. They are the normative baseline; `docs/es/` mirrors them in Spanish for human reading.

### 7.1 Package root

| File | Role |
|---|---|
| `README.md` | Entry point for the repository: what the package is and how to read it |
| `00-INDEX.md` | Working index of the project: sources of truth, target stack, decision principles |
| `DOCUMENT-MANIFEST.md` | This file: inventory, authority and revision log |
| `EXPLICACION-NO-TECNICA.md` | Plain-language explanation for non-technical readers |

### 7.2 Whole-package inventory (verified 2026-10-19)

| Category | Files |
|---|---|
| Normative (English): `docs/architecture` (11), `docs/adr` (11), `docs/development` (5) | 27 |
| Spanish mirrors: `docs/es/architecture`, `docs/es/adr`, `docs/es/development` | 27 |
| Spanish mirrors of root files: `docs/es/README.md`, `docs/es/DOCUMENT-MANIFEST.md` | 2 |
| Package root (English) | 4 |
| Non-normative reference: `docs/reference/` | 14 |
| **Total `.md` files** | **74** |

Non-normative reference material lives in `docs/reference/` and is listed in `00-ARCHITECTURE-INDEX.md` §10:

| File | Role |
|---|---|
| `docs/reference/RUNTIME-EXECUTION-FULL-ANNEX-ARCHITECTURE-03.md` | Legacy operational detail (superseded) |
| `docs/reference/SPIKE-FASE1-FOUNDATION-investigacion.md` | Foundation-phase validation plan |
| `docs/reference/KORTIX-analisis-y-licencias.md` | Kortix/Suna base-vs-reference assessment and licence analysis |
| `docs/reference/KORTIX-INVESTIGACION-v0.14.3.md` | Kortix/Suna capability investigation (pinned commit, per-capability evidence) |
| `docs/reference/KORTIX-CROSS-MATRIX.md` | Documentation inventory, cross-check matrix, gaps and proposals (with the 2026-10-19 audit status per finding) |
| `docs/reference/STACK-LICENCIAS.md` | Target-stack licence inventory and commercial risk |
| `docs/reference/REGISTRO-CAMBIOS-DOCUMENTALES-2026-10-19.md` | Change log for the 2026-10-19 revision |
| `docs/reference/REGISTRO-CAMBIOS-2026-10-19-AUDITORIA.md` | Change log for the 2026-10-19 consistency audit |
| `docs/reference/AUDITORIA-CONSISTENCIA-2026-10-19.md` | Consistency audit report (scope, findings by severity, evidence, open risks) |
| `docs/reference/INVARIANTES-Y-PRUEBAS.md` | Architectural invariants, their normative source and the test each one requires |
| `docs/reference/REGISTRO-CAMBIOS-2026-10-19-ADR-011-ACEPTADO.md` | Change log for the acceptance of `ADR-011` and the resulting component renames |
| `docs/reference/VERIFICACION-POST-AUDITORIA-2026-10-19.md` | Post-audit verification report: what was checked, what was reproducible, the reusable-code question and open risks |
| `docs/reference/REGISTRO-CAMBIOS-2026-10-19-VERIFICACION-POST-AUDITORIA.md` | Change log for the post-audit verification (V-1…V-8) |
| `docs/reference/DECISIONES-PENDIENTES.md` | Open decisions requiring test, legal review or product judgement |

## 8. Revision log

- **2026-09-21** — v0.1.0 initial normative baseline (26 files).
- **2026-10-19** — additive revision after the Kortix/Suna cross-check: sections extended in `03`, `04`, `05`, `06`, `07`, `08`, `09`, `10`; no ADR modified; no principle or contract name changed. Detail: `docs/reference/REGISTRO-CAMBIOS-DOCUMENTALES-2026-10-19.md`.
- **2026-10-19 (later)** — `ADR-011` added as **Proposed**: free-licence-only stack, per the product owner's decision. Its acceptance (and the consequent component-name updates in `00-INDEX`, `02` §4, `05` §1, `09` §2, `ADR-007` and the Spanish mirrors) was pending. Detail: `docs/reference/DECISIONES-PENDIENTES.md` DP-17. **(Accepted the same day: see the entry below.)**
- **2026-10-19 (audit)** — consistency audit of the whole package: inventories and counts corrected (the package is 27 normative files, not 26), `Created`/`Updated`/`Date` metadata added to every normative header, the LangGraph/Temporal durability boundary clarified in `04` §21.2, read-versus-command semantics and Temporal patching documented, the commercial modalities separated from the architectural limit in `01` §7.1, ADR-011 formalisation layers stated, and the Spanish mirror of this manifest brought up to date. Evidence and findings: `docs/reference/AUDITORIA-CONSISTENCIA-2026-10-19.md`.
- **2026-10-19 (ADR-011 accepted)** — the product owner accepted `ADR-011` (**Proposed → Accepted**) and, with it, the substitution became normative: the replaced components were renamed in `00-INDEX.md`, `02` §4, `04`, `05` §1, `06` §7, `07`, `09` §2, `10` §1–§3, the `ADR-007` implementation note, the Spanish mirrors and the non-technical explanation. **No architectural decision was changed and no test was closed.** Detail: `docs/reference/REGISTRO-CAMBIOS-2026-10-19-ADR-011-ACEPTADO.md`.
- **2026-10-19 (post-audit verification)** — follow-up review of the **published** files, which found residues the previous revisions had not reached: both manifests still showed `ADR-011` with its pre-acceptance status (now `Accepted`), `DP-17` contradicted its own state, `DP-6` presented substituted components as the current stack, `ADR-011` §Context lacked its date note, and `00-INDEX.md` did not separate the historical count (26) from the current one (**27**). Claims of **reusable code** were removed: the platform is built **from scratch** on this documentary package, and the Hermes-OS question is registered as **DP-19**. **No architectural decision was changed and no test was closed** (DP-5, DP-6 remain open). Report: `docs/reference/VERIFICACION-POST-AUDITORIA-2026-10-19.md`; trace: `docs/reference/REGISTRO-CAMBIOS-2026-10-19-VERIFICACION-POST-AUDITORIA.md`.
