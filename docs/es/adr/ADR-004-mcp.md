# ADR-004 — MCP para la Integración de Herramientas Empresariales

**Estado:** Aceptado

## Contexto
La plataforma debe integrarse con muchos sistemas empresariales sin implementar APIs de agente a medida para cada herramienta.

## Decisión
MCP es el protocolo de integración de herramientas preferido. Un MCP Gateway controlado sigue siendo el límite de cumplimiento (enforcement).

## Consecuencias
La integración se vuelve estandarizada, mientras que la gobernanza del gateway y la gestión del ciclo de vida de los servidores MCP se vuelven críticas.