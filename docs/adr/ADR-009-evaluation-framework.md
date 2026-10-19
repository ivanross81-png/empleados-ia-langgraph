# ADR-009 — Continuous Agent Evaluation

**Status:** Accepted  
**Date:** baseline v0.1.0 — exact date not recorded (see audit 2026-10-19)

## Context
Traditional unit tests cannot fully capture agent trajectory, retrieval quality or tool selection.

## Decision
Maintain versioned evaluation datasets and run regression suites in CI/CD. Ragas, DeepEval or equivalent tooling may implement the framework.

## Consequences
Prompt, model and tool changes become measurable release inputs rather than informal changes.
