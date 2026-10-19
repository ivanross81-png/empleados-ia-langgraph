# ADR-011 — Free-licence-only stack

**Status:** Proposed (awaiting product-owner acceptance)

## Context
The platform is sold as a closed proprietary product, both as multi-tenant SaaS and as a private installation delivered to the customer. Enterprise buyers (banks, insurers, regulated sectors) audit the stack. The current reference stack contains components whose licences are **not free**: Redis 8 (RSALv2/SSPLv1/AGPLv3 tri-licence), HashiCorp Vault (BUSL-1.1), and optional components under AGPL-3.0 (Grafana, Loki, MinIO) which are free but impose obligations on a closed distributed bundle.

The product owner decided on 2026-10-19: **use free licences exclusively.**

Inventory and per-component evidence: `docs/reference/STACK-LICENCIAS.md` (§0.bis policy, §2 inventory, §3 risks). This ADR converts that criterion into a normative rule of the package.

## Decision
Only components under **free/libre licences approved by OSI/FSF** may be used. Licences that are merely "source-available" (BUSL, RSALv2, SSPLv1, ELv2, "commons clause" variants or any licence with an *Additional Use Grant*) are **prohibited without exception**, because they restrict use and not only distribution.

Within free licences the order of preference is:

1. **Permissive**: MIT, BSD-2/3-Clause, Apache-2.0, MPL-2.0, PostgreSQL License, ISC, LGPL.
2. **Copyleft**: AGPL-3.0 / GPL-3.0 are free, but they impose obligations on a closed distributed bundle (source of the component and notices; AGPL additionally on network use of a modified work). They are therefore **not part of the reference stack**: introducing one requires an explicit exception in an ADR, justified by a capability that no permissive component provides.

The reference stack is **100% permissive**:

| Function | Component | Licence |
|---|---|---|
| Agent runtime / durability | LangGraph, LangChain core, Temporal server + SDKs + UI | MIT |
| Model gateway | LiteLLM (core only, never `enterprise/`) | MIT |
| Policy | OPA | Apache-2.0 |
| Secrets | **OpenBao** (replaces HashiCorp Vault/BUSL) | MPL-2.0 |
| Transient cache/coordination | **Valkey** (replaces Redis 8) | BSD-3-Clause |
| Domain persistence | PostgreSQL + pgvector | PostgreSQL License |
| DLP/PII | Presidio | MIT |
| Observability | OpenTelemetry Collector, Prometheus, **Perses** (dashboards), **VictoriaLogs** or OpenSearch (logs) — replaces Grafana/Loki | Apache-2.0 |
| LLM tracing | Langfuse (MIT) — never `ee/` | MIT (+ proprietary `ee/`) |
| Artifact object store | **SeaweedFS**, or the customer's S3, or PostgreSQL LOB — replaces MinIO | Apache-2.0 / n-a |
| API/data | FastAPI, Pydantic, SQLAlchemy, HTTPX | MIT / BSD-3-Clause |

Rules that follow:

- a **licence gate in CI**: no new dependency enters without a declared, classified licence (permissive / copyleft / prohibited), and the full transitive tree is scanned;
- an **SBOM per release** plus `THIRD-PARTY-NOTICES`, including the private-installation bundle;
- **no dependency may forbid offering the product as a hosted service**, and none may require an exclusive compute/inference provider;
- proprietary per-directory code (`enterprise/`, `ee/`, `wl/`) is never activated, and CI fails if product code imports from those directories;
- this policy does not apply to services the customer already operates (their IdP, their S3, their ERP) nor to non-distributed development tooling.

## Consequences
- Vault, Redis, Grafana, Loki and MinIO leave the reference stack; substitution is mandatory, not optional. OpenBao and Valkey are drop-in/API-compatible for our uses, so the technical impact is contained; dashboards and logs require an operational evaluation before substitution is final.
- Normative documents that name a replaced component must be updated in the same revision: `00-INDEX.md`, `02` §4, `05` §1, `09` §2, `ADR-007` (implementation note: Vault → free MPL equivalent), and the `docs/es/` mirrors.
- A capability that only exists in a non-free or AGPL component requires a new ADR with the exception, the obligation assumed and the exit plan. Without that ADR, the capability is not delivered.
- Legal review is still required for the licence *variants* picked at packaging time (container image digests may differ from the source repository).

## Alternatives considered
- **Keep Redis/Vault and accept AGPL or BUSL**: rejected — restricts the hosted-service model and adds audit findings for a component that has a free, API-compatible replacement.
- **Permissive-only for new components, grandfathering the existing ones**: rejected — the reference stack already has replacements identified and verified, so a grandfather clause would only postpone the debt.
- **Source-available with an ADR exception path**: rejected by the owner's decision (free licences *exclusively*).
