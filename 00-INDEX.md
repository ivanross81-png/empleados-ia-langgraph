# Empleados IA — LangGraph

Proyecto de la **Digital Employee Platform**: plataforma B2B para construir, operar y gobernar Empleados Digitales que ejecutan trabajo empresarial sobre workflows durables, tools controladas y governance humana.

> **Base documental:** paquete **arquitectura v0.1 canónica** (27 archivos: 11 de arquitectura, 11 ADR y 5 guías de desarrollo) más los espejos en `docs/es/` y los documentos de referencia no normativos. Los documentos de arquitectura son **normativos**: el código debe implementarlos y no redefinirlos silenciosamente; los cambios de límites/seguridad/contratos/exclusión requieren un **ADR**.
>
> **Estado:** línea base `v0.1.0` creada 2026-09-21 · revisada 2026-10-19 (auditoría de consistencia). Inventario y revisiones: `DOCUMENT-MANIFEST.md`.

## Fuentes de verdad

- **`EXPLICACION-NO-TECNICA.md`** — explicación llana del proyecto para compartir con no técnicos.
- **`DOCUMENT-MANIFEST.md`** — inventario de los 27 documentos normativos, los 4 archivos de raíz y el material de referencia, con su rol y sus revisiones.
- **`docs/es/`** — versión en **español (rioplatense)** de los 27 documentos (misma estructura). El paquete **inglés** (`docs/architecture`, `docs/adr`, `docs/development`) sigue siendo la **fuente normativa** para agentes de codificación y referencias cruzadas; `docs/es/` es la lectura humana en castellano.
- **`docs/architecture/00-ARCHITECTURE-INDEX.md`** — índice, reglas normativas y orden de lectura (empezar acá).
- **`docs/adr/`** — decisiones inmutables.
- **`docs/development/`** — reglas para implementar (incluye `CLAUDE-CODE-GUIDELINES.md`).
- **`docs/reference/`** — anexos **no-normativos**: detalle operativo heredado del anexo ARCHITECTURE-03 (supersedido), investigación del SPIKE Fase 1, y el paquete de investigación/cruce con **Kortix/Suna** (`KORTIX-INVESTIGACION-v0.14.3.md`, `KORTIX-CROSS-MATRIX.md`, `STACK-LICENCIAS.md`) más los registros de cambios (revisión documental, auditoría de consistencia y **aceptación de `ADR-011`**), las decisiones pendientes, el informe de auditoría y la matriz de invariantes. Índice completo en `docs/architecture/00-ARCHITECTURE-INDEX.md` §10.

## Stack objetivo

```
FastAPI · PostgreSQL(+pgvector+FTS) · Valkey¹ · Temporal · LangGraph
LiteLLM · OPA · MCP Gateway · OpenBao¹ · OpenTelemetry · Langfuse
```

¹ Sustituciones de referencia por la política de licencias libres (`docs/adr/ADR-011-free-licence-stack.md`, **Aceptado el 2026-10-19**): Valkey reemplaza a Redis 8 y OpenBao a HashiCorp Vault; los paneles pasan de Grafana a Perses y los logs de Loki a VictoriaLogs/OpenSearch. Detalle y evidencia de licencias: `docs/reference/STACK-LICENCIAS.md` §0.bis; trazabilidad del renombre: `docs/reference/REGISTRO-CAMBIOS-2026-10-19-ADR-011-ACEPTADO.md`.

## Principios de decisión (definición con Iván)

- **No se reescribe** lo que ya funciona y es diferenciador (control plane / seguridad / tenancy de Hermes-OS).
- **Sí se cambia de enfoque** en la capa commodity y difícil (el loop de agente): adoptar un executor maduro (LangGraph) detrás de una interfaz intercambiable, no construirlo a mano.
- **Evolución por fases** (`10-DEPLOYMENT-OPERATIONS.md` §17 y el plan de fases del SPIKE en `docs/reference/`): Foundation → Governance → Durable → Enterprise Ops → Scale. *(El detalle histórico de fases vivía en la sección §89 del anexo heredado hoy supersedido: ver nota de trazabilidad en `docs/reference/SPIKE-FASE1-FOUNDATION-investigacion.md`.)*
- Validar en vivo (spike / rebanada vertical) antes de comprometer.

## Origen del contenido

Este proyecto adopta el paquete v0.1 que Iván subió a Nextcloud (`files/ivan/Proyecto Langraph/digital-employee-platform-architecture-v0.1/`). La documentación generada previamente en esta sesión (ARCHITECTURE-03) se conserva como anexo no-normativo en `docs/reference/`.

## Arquitectura núcleo

**Task → Execution → Policy → Action → Outcome**