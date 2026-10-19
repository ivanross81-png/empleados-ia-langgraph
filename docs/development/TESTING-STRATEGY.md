# Testing Strategy

**Version:** 0.1.0

## 1. Test pyramid

```text
                 E2E / Business Scenarios
              Agent Evaluation / Security
           Integration / MCP / Persistence
        Contract / API / Workflow Tests
              Unit / Domain Tests
```

## 2. Unit tests

Cover domain invariants, state transitions, policy helpers, schemas, retry classification and deterministic transformations.

## 3. Contract tests

Validate API, event and MCP schemas. Include backward compatibility and rejection cases.

## 4. Integration tests

Use real PostgreSQL/Temporal/MCP test infrastructure where practical. Verify transaction and failure behavior.

## 5. Security tests

Cover authorization bypass, secret leakage, prompt injection, replay, SSRF/egress restrictions and tool abuse.

## 6. Agent tests

Test:

- tool selection;
- state transitions;
- policy behavior;
- approval behavior;
- recovery;
- context construction.

## 7. Evaluation tests

Maintain golden business scenarios. Measure outcome, trajectory, retrieval quality and policy compliance.

## 8. Failure tests

Explicitly test timeouts, duplicate requests, worker restarts, external outages, partial success, circuit breakers and DLQ recovery.

## 9. CI gates

Minimum gates:

- formatting/linting;
- type checking;
- unit tests;
- security/static analysis;
- contract tests;
- relevant evaluation suite.

## 10. Test data

Synthetic or sanitized enterprise-like data only. Never use production secrets in CI.
