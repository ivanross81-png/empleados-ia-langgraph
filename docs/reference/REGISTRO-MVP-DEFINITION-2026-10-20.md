---
type: reference
status: active
created: 2026-10-20
updated: 2026-10-20
tags: [mvp, product-definition, traceability, vertical-slice]
---

# Initial MVP definition record — 2026-10-20

## Purpose

Record the first MVP-definition package derived from existing architecture. This record is non-normative; it does not replace an ADR or convert proposals into accepted decisions.

## Added documents

| File | Purpose | State |
|---|---|---|
| docs/product/MVP-PRD.md | Scope, users, requirements, exclusions, security and acceptance | Proposed; product-owner acceptance required |
| docs/product/MVP-DELIVERY-PLAN.md | M0–M4 sequence and exit gates | Proposed |
| docs/product/MVP-TRACEABILITY-MATRIX.md | Mapping requirements to contracts and test evidence | Proposed |
| docs/es/product/MVP-PRD.md | Spanish reading mirror of PRD | Proposed |
| docs/es/product/MVP-DELIVERY-PLAN.md | Spanish reading mirror of plan | Proposed |
| docs/es/product/MVP-TRACEABILITY-MATRIX.md | Spanish reading mirror of matrix | Proposed |

## Recommended scope

1. First use case: Collections Digital Employee, already the canonical Foundation spike scenario.
2. First surface: minimal first-party web console; DP-3 remains open until explicit acceptance.
3. First demonstrator: synthetic data and simulated collections/CRM adapter; no real communications or production writes.
4. First functional delivery: one employee, bounded workflow, governed integration, durable human approval and end-to-end traceability.
5. Real integration, pilot hardening and commercial release are later gates; this documentation does not approve them.

## Architecture traceability

The proposal reuses existing contracts, not application code. It references the product vision, enterprise architecture, domain model, runtime execution, persistence/API contracts, security/governance, MCP integration, observability/evaluation, deployment/operations, and ADR-001, ADR-003, ADR-005, ADR-012, ADR-013 and ADR-014.

## Not validated

Writing these documents does not implement or test platform code. DP-1, DP-2, DP-4 and DP-20 technical tests remain open; DP-5/DP-6 compatibility and legal review remain open; DP-3 channel choice remains open; operational targets must be measured in a pilot.

The scope remains a proposal so use case, channel and delivery order are not silently converted into accepted business decisions.