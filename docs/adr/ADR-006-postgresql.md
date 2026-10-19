# ADR-006 — PostgreSQL as Primary System of Record

**Status:** Accepted

## Context
The platform needs relational domain state, transactions, audit metadata and initial hybrid retrieval.

## Decision
PostgreSQL is the primary system of record. pgvector and PostgreSQL full-text search provide initial retrieval capabilities.

## Consequences
The initial stack stays compact. A specialized vector database can be introduced later if scale or retrieval requirements justify it.
