# OpenCode guidance

Before changing this repository, follow the existing implementation rules:

- `docs/architecture/00-ARCHITECTURE-INDEX.md` defines document authority and the architecture reading order.
- `docs/development/DEVELOPMENT-GUIDELINES.md` defines implementation workflow and layering.
- `docs/development/CODING-STANDARDS.md` defines code conventions.
- `docs/development/SECURITY-RULES.md` defines mandatory security boundaries.
- `docs/development/TESTING-STRATEGY.md` defines verification expectations.
- `docs/development/CLAUDE-CODE-GUIDELINES.md` is the shared coding-agent contract.

The architecture and accepted ADRs are normative. The documents in `docs/product/` are proposals until accepted. Do not change their scope or any normative document silently. For the frontend prototype, use synthetic data only and label local simulations clearly; never imply that mock behavior is a live backend capability.
