# Development Guidelines

**Version:** 0.1.0  
**Created:** 2026-09-21  
**Updated:** 2026-10-19

## 1. First rule

Read `docs/architecture/00-ARCHITECTURE-INDEX.md` before making architectural changes.

## 2. Before coding

Identify:

1. bounded context;
2. owning component;
3. domain object;
4. public contract affected;
5. security classification;
6. persistence requirements;
7. failure/retry semantics;
8. observability requirements;
9. tests required.

## 3. Architectural changes

Do not solve a local implementation problem by silently changing architecture. Create or update an ADR when component responsibilities, boundaries or invariants change.

## 4. Layering

Prefer:

```text
API → Application → Domain → Infrastructure
```

Agent runtime and integration adapters may have specialized boundaries but must not bypass policy and execution contracts.

## 5. Side effects

External side effects belong behind explicit interfaces and execution context. Make them idempotent whenever possible.

## 6. Errors

Use typed/domain error categories. Do not use generic exception handling to turn every failure into a retry.

## 7. Documentation

Every public contract, architectural behavior and non-obvious security decision must be documented.

## 8. Pull requests

A PR should state affected architecture documents/ADRs, migration impact, security impact, tests and rollback strategy.
