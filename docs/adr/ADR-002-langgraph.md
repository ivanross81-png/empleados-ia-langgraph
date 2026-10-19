# ADR-002 — LangGraph as Agent Runtime

**Status:** Accepted

## Context
The platform requires stateful agent reasoning, loops, conditional tool use and explicit graph state.

## Decision
LangGraph is the cognitive runtime for Digital Employee agent graphs. It is not the durable workflow engine and does not own authorization.

## Consequences
Agent logic can evolve independently of durable execution. Workflow durability remains outside the agent graph.
