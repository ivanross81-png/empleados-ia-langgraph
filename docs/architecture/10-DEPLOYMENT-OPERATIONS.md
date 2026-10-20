# Digital Employee Platform — Deployment & Operations

**Version:** 0.1.0  
**Status:** Normative baseline  
**Created:** 2026-09-21  
**Updated:** 2026-10-19

## 1. Deployment model

The initial production target is a dedicated deployment per enterprise. The platform must be deployable without Kubernetes.

The two commercial modalities (private installation and a future SaaS) and their relationship with this architectural limit are stated in `01` §7.1: an installation dedicated to one customer is the initial model, and serving several organizations from one installation requires its own isolation design and ADR.

A reference Docker Compose topology:

```text
reverse-proxy
frontend
api
worker
mcp-gateway
temporal
temporal-ui
postgres
valkey
litellm
otel-collector
langfuse
```

OpenBao may be external to the deployment.

## 2. Runtime separation

At minimum, API, worker and MCP Gateway should be independently restartable. Temporal and PostgreSQL are infrastructure dependencies.

## 3. Configuration

Configuration is environment-specific and must not contain secrets in source control. Use environment variables for non-secret configuration and OpenBao for secrets.

## 4. Secrets

Secret rotation must not require rebuilding application images. Credentials should be short-lived where the provider supports it.

## 5. Database operations

PostgreSQL requires:

- automated backups;
- restore testing;
- migration versioning;
- connection limits;
- monitoring;
- disk capacity alerts.

## 6. Temporal operations

Temporal requires durable persistence, worker monitoring, task queue monitoring and workflow history controls. Long-running histories should use appropriate Continue-As-New strategies where needed.

## 7. Scaling

Scale independently:

- API replicas;
- agent worker replicas;
- MCP Gateway replicas;
- integration-specific workers where necessary.

Temporal task queues provide a useful isolation/scaling boundary.

## 8. External system protection

Use rate limits, concurrency limits and circuit breakers per integration. A Digital Employee must not overwhelm a legacy ERP simply because the model generated many parallel actions.

## 9. Disaster recovery

Define RPO/RTO per deployment. Backup and restore procedures must be tested, not merely documented.

**MVP engineering baseline (DP-18, 2026-10-19).** Pilot: **RPO 24 hours** and **RTO 8 hours**. Production target — **future, not contractual**, and conditional on passing restore tests: **RPO 1 hour** and **RTO 4 hours**. These are engineering objectives, not a commercial SLA or a legal obligation; `I-12` requires the restore test before either figure is presented as achieved.

The critical durable assets include:

- PostgreSQL;
- Temporal persistence;
- configuration/version definitions;
- knowledge indexes/source data where not reproducible;
- audit records.

## 10. Upgrade strategy

Use rolling or controlled upgrades where possible. Schema migrations should follow expand/contract patterns for compatibility.

## 11. Health checks

Services require liveness/readiness checks. Dependency health should be distinguished from process health.

## 12. Incident response

Operators should be able to:

- pause new executions;
- disable a Digital Employee;
- disable a tool/MCP server;
- open a circuit breaker;
- cancel executions;
- inspect DLQ;
- revoke credentials;
- restore from backup.

## 13. Security operations

Maintain vulnerability scanning, image updates, dependency updates, access reviews, secret rotation and audit review.

## 14. Capacity planning

Track:

- executions/minute;
- concurrent executions;
- average tool calls/execution;
- tokens/execution;
- MCP latency;
- database load;
- workflow history size.

Capacity limits should be explicit rather than discovered through outages.

## 15. Environment strategy

Minimum environments:

- development;
- test/CI;
- staging;
- production.

Production credentials and data must never be reused in development.

## 16. Deployment principle

The architecture should remain valid whether the deployment is a single VM, a small Docker cluster or a later Kubernetes environment. Operational sophistication can increase without changing domain contracts.

## 17. Installation and update cycle for private deployments

*Added 2026-10-19 — closes finding K-57/K-59/K-60/K-61 (P-17) of `docs/reference/KORTIX-CROSS-MATRIX.md`.*

A private installation has a lifecycle of its own; it must be repeatable, diagnosable and reversible by someone who is not the platform team.

| Stage | Minimum contract |
|---|---|
| Bootstrap | A documented, **idempotent** installation path for a clean host (packages, Compose, initial configuration) that can be re-run safely after a failure |
| First sign-in | A defined bootstrap identity (the platform administrator) plus an explicit decision about whether self-registration is open; an installation that leaves sign-up open with unverified email is a vulnerability, not a default |
| Environment configuration | Reachability mode (public domain with TLS, private network, tunnel), allowed egress, DNS wildcards for previews/artifacts, and the list of external dependencies the installation requires |
| Auto-diagnostic | A single command/endpoint that verifies prerequisites, configuration, secret availability, connectivity to declared dependencies and backup readiness, returning actionable failures |
| Backup and restore | Backup covers configuration, secrets material, database, workflow persistence, knowledge data and audit; **restore is tested**, not assumed (`§9`) |
| Update | Prefer an unattended update path with: pre-flight checks, migrations, rollout with health checks, and **automatic rollback** when health fails. The version of every component is pinned (images by digest), and a rollback to the previous release is a documented operation |
| Compatibility | Database and configuration migrations follow expand/contract (`§10`); the supported upgrade path across minor versions is documented so a customer cannot land in an unsupported state |
| Hardening | Documented baseline: only the necessary ports exposed, secrets files with restricted permissions, disabled public API documentation where not required, restricted egress, and audit enabled |
| Decommissioning | A documented and irreversible-by-intent procedure to remove the installation, including the destruction of secret material and, where required, of audit data |

## 18. Commercial metering and entitlements

*Added 2026-10-19 — closes finding K-42 (P-12) of `docs/reference/KORTIX-CROSS-MATRIX.md`.*

The product is sold as SaaS and as private installation; both need the same measured facts, even if the enforcement differs:

- **Metering:** consumption of model tokens/cost, executions, active Digital Employees and storage (knowledge + artifacts), recorded per tenant/period and exportable;
- **Entitlements:** which capabilities are enabled for a tenant/deployment (for example federated identity, SCIM, additional isolation, retention windows) and their state, so that the runtime can refuse cleanly by entitlement rather than by omission;
- **Enforcement point:** entitlement checks happen in the control plane at execution creation and at configuration changes; they never weaken security controls (an entitlement may disable a feature, never a protection);
- **Private installations:** metering may be disabled or reported offline; entitlements are part of the licence file for the deployment and are verified at startup with an auditable state;
- **Separation:** metering data is commercial metadata; it must not duplicate or replace audit records (`09` §6).
