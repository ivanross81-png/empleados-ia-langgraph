# ADR-005 — OPA as Deterministic Policy Engine

**Status:** Accepted  
**Date:** baseline v0.1.0 — exact date not recorded (see audit 2026-10-19)

## Context
LLMs cannot be trusted as authorization mechanisms. Policies must be deterministic, testable and reviewable.

## Decision
OPA is the reference policy decision point and returns ALLOW, DENY or REQUIRE_APPROVAL.

## Consequences
Policy becomes independently testable and auditable. Business policy modeling requires disciplined ownership and versioning.
