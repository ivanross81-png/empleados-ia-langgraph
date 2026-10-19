# ADR-010 — Puerta de enlace LLM

**Estado:** Aceptado  
**Fecha:** línea base v0.1.0 — fecha exacta no registrada (ver auditoría 2026-10-19)

## Contexto
La plataforma necesita abstracción de proveedor, enrutamiento de modelos, respaldos (fallbacks), contabilidad de costos y cuotas sin acoplar el código del agente a un SDK de proveedor.

## Decisión
Usar LiteLLM o una abstracción de puerta de enlace equivalente. No es responsable de la autorización de negocio, de la autorización MCP ni de la política del empleado.

## Consecuencias
Los proveedores pueden cambiarse de forma centralizada y el uso de modelos puede observarse de manera consistente.
