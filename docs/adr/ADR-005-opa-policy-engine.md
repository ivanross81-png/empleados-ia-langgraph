# ADR-005 — OPA as Deterministic Policy Engine

**Status:** Accepted

## Context
LLMs cannot be trusted as authorization mechanisms. Policies must be deterministic, testable and reviewable.

## Decision
OPA is the reference policy decision point and returns ALLOW, DENY or REQUIRE_APPROVAL.

## Consequences
Policy becomes independently testable and auditable. Business policy modeling requires disciplined ownership and versioning.
