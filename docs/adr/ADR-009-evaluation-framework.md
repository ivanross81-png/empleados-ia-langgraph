# ADR-009 — Continuous Agent Evaluation

**Status:** Accepted

## Context
Traditional unit tests cannot fully capture agent trajectory, retrieval quality or tool selection.

## Decision
Maintain versioned evaluation datasets and run regression suites in CI/CD. Ragas, DeepEval or equivalent tooling may implement the framework.

## Consequences
Prompt, model and tool changes become measurable release inputs rather than informal changes.
