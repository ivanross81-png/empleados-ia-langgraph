# ADR-001 — Dedicated Single-Tenant Deployment

**Status:** Accepted  
**Date:** 2026-09-21

## Context
Enterprise data, credentials and integrations require strong isolation while the product architecture is still evolving. Dynamic multi-tenancy would add isolation complexity before it is necessary.

## Decision
The initial production deployment is dedicated/single-tenant per enterprise environment. The domain model retains `tenant_id` for future evolution, but runtime isolation is primarily a deployment boundary.

## Consequences
- Simpler security boundary.
- Easier credential isolation.
- Higher infrastructure cost per customer.
- Future multi-tenancy remains possible but is not assumed.

## Revisit when
Unit economics or customer scale make shared infrastructure materially necessary and isolation requirements can be demonstrated.
