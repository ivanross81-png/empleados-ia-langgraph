# ADR-003 — Temporal for Durable Execution

**Status:** Accepted

## Context
Digital Employee work may last days or wait for humans. Retries, timers and recovery must survive process restarts.

## Decision
Temporal owns durable workflow lifecycle, timers, signals, retries, cancellation, recovery and human waits.

## Consequences
Operational complexity increases relative to an in-process queue, but long-running reliability and HITL semantics are explicit.
