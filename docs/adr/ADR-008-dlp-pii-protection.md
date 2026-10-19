# ADR-008 — DLP/PII Gateway Before External LLM Transfer

**Status:** Accepted

## Context
External model providers may receive enterprise information that contains personal, financial or restricted data.

## Decision
Introduce a DLP/PII control point before external LLM transfer. It may classify, redact, tokenize or block content according to policy.

## Consequences
Model quality may be affected by redaction, so evaluation must measure both protection and task quality.
