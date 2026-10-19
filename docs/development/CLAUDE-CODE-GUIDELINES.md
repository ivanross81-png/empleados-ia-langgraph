# Claude Code / AI Coding Agent Guidelines

**Version:** 0.1.0  
**Audience:** Claude Code and other coding agents

## 1. Mission

Implement the Digital Employee Platform according to the architecture contract. Optimize for correctness, security, maintainability and incremental delivery—not for changing architecture to make a local task easier.

## 2. Mandatory reading

Before significant work, read:

1. `docs/architecture/00-ARCHITECTURE-INDEX.md`
2. the relevant architecture document(s)
3. relevant ADRs
4. `docs/development/DEVELOPMENT-GUIDELINES.md`
5. `docs/development/SECURITY-RULES.md`

## 3. Never silently change these decisions

- Temporal owns durable execution.
- LangGraph owns agent reasoning.
- LLM output is untrusted.
- OPA/policy authorizes governed actions.
- MCP Gateway controls enterprise tool execution.
- Secrets come from centralized secret management.
- PostgreSQL is domain system of record.
- Execution is the unit of work.
- Published versions are immutable.

If a task appears to require changing one, stop and propose an ADR.

## 4. Implementation workflow

```text
Understand task
 → Locate architecture boundary
 → Inspect existing code
 → Identify contracts/invariants
 → Implement smallest coherent change
 → Add tests
 → Run relevant evaluation
 → Update docs/ADR if needed
```

## 5. Repository exploration

Do not assume a file exists. Inspect the repository and follow existing package conventions. Avoid broad refactors unrelated to the task.

## 6. Dependency changes

Do not add a framework or service merely because it makes one function easier. Explain operational and architectural impact. Dependency changes that alter runtime architecture require an ADR.

## 7. API changes

Treat API/event/tool schemas as contracts. Breaking changes require versioning or an explicit migration strategy.

## 8. Agent changes

When changing prompts, graphs, tools, routing or context construction:

- identify affected evaluations;
- preserve policy boundaries;
- test tool behavior;
- test failure paths;
- measure regression.

## 9. Security

Never weaken authentication, authorization, DLP, secret handling or tool restrictions to make tests pass. If a test is difficult because of a security boundary, build a controlled test fixture.

## 10. Completion criteria

A task is not complete merely because code compiles. It is complete when implementation, tests, observability, documentation and migration implications are addressed.

## 11. Final report

Every coding-agent task should summarize:

- files changed;
- behavior changed;
- tests run;
- architecture documents affected;
- ADRs added/updated;
- known limitations;
- follow-up work.

## 12. Golden rule

> **Do not silently redesign the platform while implementing a feature.**
