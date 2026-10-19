# ADR-007 — Centralized Secrets Management

**Status:** Accepted  
**Date:** baseline v0.1.0 — exact date not recorded (see audit 2026-10-19)

## Context
Enterprise integrations require credentials that must not leak into prompts, agent state or source code.

## Decision
Use Vault or an equivalent KMS-backed centralized secret manager. The MCP Gateway resolves credentials at execution time.

## Consequences
Credential lifecycle and rotation become explicit operational responsibilities.

## Implementation note (2026-10-19)
"Vault or equivalent" is decided by this ADR; the **specific product** is not. Under the free-licence policy (`ADR-011`) the reference implementation is **OpenBao** (MPL-2.0), which covers the same contract (KMS-backed, dynamic credentials, engine API). This note does not change the decision of this ADR and requires no new ADR: it only records which implementation satisfies it. The credential-exposure modes to the executor are defined in `06` §7.1.
