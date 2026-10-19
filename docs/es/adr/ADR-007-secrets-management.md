# ADR-007 — Gestión centralizada de secretos

**Estado:** Aceptado  
**Fecha:** línea base v0.1.0 — fecha exacta no registrada (ver auditoría 2026-10-19)

## Contexto
Las integraciones empresariales requieren credenciales que no deben filtrarse en prompts, en el estado del agente ni en el código fuente.

## Decisión
Usar Vault o un gestor de secretos centralizado equivalente respaldado por KMS. La Puerta de enlace MCP resuelve las credenciales en tiempo de ejecución (momento de ejecución).

## Consecuencias
El ciclo de vida de las credenciales y su rotación pasan a ser responsabilidades operativas explícitas.

## Nota de implementación (2026-10-19)
"Vault o equivalente" lo decide este ADR; el **producto concreto** no. Bajo la política de licencias libres (`ADR-011`), la implementación de referencia es **OpenBao** (MPL-2.0), que cubre el mismo contrato (respaldado por KMS, credenciales dinámicas, API de motores). Esta nota no cambia la decisión de este ADR y no requiere un ADR nuevo: solo registra qué implementación la satisface. Los modos de exposición de credenciales al ejecutor están definidos en `06` §7.1.
