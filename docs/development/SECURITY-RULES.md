# Security Rules for Development

**Version:** 0.1.0

## Mandatory rules

1. Never put secrets in source code.
2. Never pass raw credentials to an LLM.
3. Never trust model output as authorization.
4. Never execute arbitrary tool names without allowlisting/registry validation.
5. Never treat retrieved text as trusted instructions.
6. Never bypass the MCP Gateway for governed external actions.
7. Every mutable external action requires an execution identity.
8. Every governed action requires a policy decision.
9. Approval must be durable and auditable.
10. Sensitive telemetry must be redacted.
11. External events require authentication and replay protection.
12. Destructive operations require explicit policy and, where configured, human approval.
13. Dependencies and containers must be scanned.
14. Security-relevant changes require tests.

## Data handling

Classify data before external transfer. Apply DLP rules before external LLM calls and memory persistence.

## Incident response

If credential leakage is suspected: revoke/rotate first, preserve safe audit evidence, disable affected integrations, then investigate.
