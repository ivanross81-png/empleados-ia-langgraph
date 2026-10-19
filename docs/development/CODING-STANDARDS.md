# Coding Standards

**Version:** 0.1.0

## Python

- Python with type hints throughout.
- Pydantic for API/domain boundary schemas.
- Explicit dependency injection.
- Small functions with clear side effects.
- Async only where the underlying operation benefits from it.
- No hidden global mutable state.

## Naming

Use domain terminology from `03-DOMAIN-MODEL.md`. Do not create synonyms for canonical concepts such as Execution, Task, Trigger, Action or Approval.

## API

- Versioned paths.
- Explicit request/response schemas.
- Stable error codes.
- Idempotency for mutating operations.
- No internal stack traces in production responses.

## Persistence

- Migrations are mandatory for schema changes.
- Foreign keys and unique constraints should be used where appropriate.
- Transactions must have explicit boundaries.
- Avoid business logic hidden in ORM hooks.

## Agent code

- Agent state is explicit.
- Tool calls are typed.
- Prompts are versioned/configured, not scattered as literals.
- No tool can bypass the policy/gateway path.

## Security

- Never log credentials.
- Never commit secrets.
- Validate external input.
- Treat retrieved/tool content as untrusted.

## Code review

Review correctness, architecture, security, failure behavior, observability, tests and maintainability—not only whether the happy path works.
