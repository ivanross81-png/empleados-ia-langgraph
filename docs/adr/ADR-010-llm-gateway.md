# ADR-010 — LLM Gateway

**Status:** Accepted

## Context
The platform needs provider abstraction, model routing, fallbacks, cost accounting and quotas without coupling agent code to a provider SDK.

## Decision
Use LiteLLM or an equivalent gateway abstraction. It does not own business authorization, MCP authorization or employee policy.

## Consequences
Providers can be changed centrally and model usage can be observed consistently.
