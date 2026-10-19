# Digital Employee Platform — Observability & Evaluation

**Version:** 0.1.0  
**Status:** Normative

## 1. Observability goals

The platform needs to answer two different questions:

1. **Operational:** Is the system healthy?
2. **Agent quality:** Did the Digital Employee do the right work?

These concerns are related but must not be conflated.

## 2. Telemetry stack

Reference components:

- OpenTelemetry for traces/metrics/log correlation;
- Prometheus for metrics;
- Grafana for dashboards;
- Loki or equivalent for logs;
- Langfuse for LLM/agent tracing;
- PostgreSQL for durable audit metadata.

## 3. Correlation identifiers

Every execution should carry:

- execution ID;
- correlation ID;
- causation ID;
- tenant ID;
- employee/task version;
- workflow ID;
- trace ID.

The execution event stream (`05` §20) is the client-facing projection of this telemetry: it exposes the same identifiers so an operator can move from a metric or alert to the exact execution and its events.

## 4. Metrics

### Platform

- request latency;
- error rate;
- queue latency;
- workflow duration;
- worker utilization;
- database latency;
- MCP latency;
- circuit-breaker state.

### Agent

- task completion rate;
- tool-call success;
- policy denials;
- approval rate;
- retries;
- iterations;
- token usage;
- estimated cost;
- human intervention rate.

### Quality

- expected outcome achieved;
- factuality/grounding where measurable;
- tool selection accuracy;
- policy compliance;
- regression score.

## 5. Logging

Logs are structured and should include identifiers rather than embedding large payloads. Secrets and restricted information must be redacted.

## 6. Audit versus logs

Logs are operational and ephemeral. Audit is governance evidence and has controlled retention. They are not interchangeable.

Audit covers **access and data, not only business actions**: reading a classified record, exporting a list, changing a policy, changing access, or acting as another identity all produce an auditable event with the canonical action name defined in `05` §5.1. If a reviewer cannot answer "who saw this data and who authorized this action", the auditing is incomplete.

## 7. Evaluation framework

The platform should maintain a versioned evaluation suite using tools such as Ragas, DeepEval or an equivalent internal harness.

Evaluation datasets should contain representative tasks, expected behaviors, tool constraints and known adversarial cases.

## 8. Regression testing

Every material change to:

- prompts;
- policies;
- tools;
- agent graphs;
- model configuration;
- retrieval;
- context compression

should run the relevant evaluation suite before release.

## 9. Test categories

- deterministic unit tests;
- API contract tests;
- integration tests;
- MCP tests;
- security tests;
- prompt injection tests;
- retrieval tests;
- agent trajectory tests;
- end-to-end business scenarios.

## 10. Golden datasets

A golden dataset contains known representative cases with expected constraints and acceptable outcomes. It should be versioned and reviewed like code.

## 11. LLM evaluation

LLM evaluation must distinguish objective checks from judge-model assessments. Automated judges are useful but are not authoritative for security or authorization.

## 12. Cost observability

Track model, provider, tokens, latency and estimated cost by execution, task and Digital Employee. This supports routing and budget controls.

### 12.1 Quotas and cut-off

*Added 2026-10-19 — closes finding K-42/K-43 of `docs/reference/KORTIX-CROSS-MATRIX.md`.*

Observing cost is not controlling it. Cost control is enforced at defined boundaries:

| Level | Control | Behaviour on exhaustion |
|---|---|---|
| Execution | Budget per execution (`04` §16) | The execution stops with a typed `BUDGET_EXCEEDED` outcome; the partial result is preserved and the action is not left half-executed |
| Task / employee | Consumption ceiling per period | New executions are refused at creation with a stable error; running ones are warned at a configurable threshold |
| Tenant / deployment | Plan quota or entitlement | The control plane refuses to create executions and automation is paused (never silently degraded) |
| Provider key | Rate/cost limit at the gateway | Router falls back to the next permitted provider; if none, the model call fails with a typed error (`04` §13) |

Rules:

- every cut-off is **explicit and auditable**: an execution stopped for budget records who/what stopped it and why;
- consumption is measurable per tenant, employee, task and model — this is also the basis of SaaS commercial metering (`10`);
- "soft" limits (alerting) and "hard" limits (stopping) are different settings, never the same number;
- a cost anomaly alert (`§13`) is not a substitute for a hard limit.

## 13. Alerts

Examples:

- sustained execution failure rate;
- MCP error spike;
- approval queue aging;
- circuit breaker open;
- token/cost anomaly;
- evaluation regression;
- unusual tool-call volume.

Plus, from the cross-check (2026-10-19): approval queue aging beyond SLA (`05` §10.1), executions paused or suspended beyond an expected duration, negative or anomalous cost per execution, control operations issued by operators (pause/interrupt/terminate), and audit-coverage gaps detected by contract tests (`05` §5.2).

## 14. Release gates

A release should not proceed when mandatory security tests fail, contract compatibility breaks or evaluation quality falls below the configured acceptance threshold.

## 15. Privacy

Observability systems must apply the same data-classification controls as the runtime. Traces must not become a backdoor data store.
