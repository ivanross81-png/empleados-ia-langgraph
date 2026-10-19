# ADR-007 — Gestión centralizada de secretos

**Estado:** Aceptado

## Contexto
Las integraciones empresariales requieren credenciales que no deben filtrarse en prompts, en el estado del agente ni en el código fuente.

## Decisión
Usar Vault o un gestor de secretos centralizado equivalente respaldado por KMS. La Puerta de enlace MCP resuelve las credenciales en tiempo de ejecución (momento de ejecución).

## Consecuencias
El ciclo de vida de las credenciales y su rotación pasan a ser responsabilidades operativas explícitas.