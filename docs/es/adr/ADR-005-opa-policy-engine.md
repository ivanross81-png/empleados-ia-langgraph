# ADR-005 — OPA como Motor de Políticas Determinista

**Estado:** Aceptado

## Contexto
No se puede confiar en los LLM como mecanismo de autorización. Las políticas deben ser deterministas, testeables y revisables.

## Decisión
OPA es el punto de decisión de políticas de referencia y devuelve ALLOW, DENY o REQUIRE_APPROVAL.

## Consecuencias
La política se vuelve testeable y auditable de forma independiente. El modelado de políticas de negocio requiere propiedad (ownership) y versionado disciplinados.