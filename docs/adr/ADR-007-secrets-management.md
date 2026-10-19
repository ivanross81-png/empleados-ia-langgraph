# ADR-007 — Centralized Secrets Management

**Status:** Accepted

## Context
Enterprise integrations require credentials that must not leak into prompts, agent state or source code.

## Decision
Use Vault or an equivalent KMS-backed centralized secret manager. The MCP Gateway resolves credentials at execution time.

## Consequences
Credential lifecycle and rotation become explicit operational responsibilities.
