# Empleados IA — LangGraph

Proyecto de la **Digital Employee Platform**: plataforma B2B para construir, operar y gobernar Empleados Digitales que ejecutan trabajo empresarial sobre workflows durables, tools controladas y governance humana.

> **Base documental:** paquete **arquitectura v0.1 canónica** (26 archivos). Los documentos de arquitectura son **normativos**: el código debe implementarlos y no redefinirlos silenciosamente; los cambios de límites/seguridad/contratos/exclusión requieren un **ADR**.

## Fuentes de verdad

- **`EXPLICACION-NO-TECNICA.md`** — explicación llana del proyecto para compartir con no técnicos.
- **`docs/DOCUMENT-MANIFEST.md`** — inventario de los 26 documentos y su rol.
- **`docs/es/`** — versión en **español (rioplatense)** de los 26 documentos (misma estructura). El paquete **inglés** (`docs/architecture`, `docs/adr`, `docs/development`) sigue siendo la **fuente normativa** para agentes de codificación y referencias cruzadas; `docs/es/` es la lectura humana en castellano.
- **`docs/architecture/00-ARCHITECTURE-INDEX.md`** — índice, reglas normativas y orden de lectura (empezar acá).
- **`docs/adr/`** — decisiones inmutables.
- **`docs/development/`** — reglas para implementar (incluye `CLAUDE-CODE-GUIDELINES.md`).
- **`docs/reference/`** — anexos **no-normativos**: detalle operativo heredado del anexo ARCHITECTURE-03 (supersedido), investigación del SPIKE Fase 1, y el paquete de investigación/cruce con **Kortix/Suna** (`KORTIX-INVESTIGACION-v0.14.3.md`, `KORTIX-CROSS-MATRIX.md`, `STACK-LICENCIAS.md`) más el registro de cambios y las decisiones pendientes. Índice completo en `docs/architecture/00-ARCHITECTURE-INDEX.md` §10.

## Stack objetivo

```
FastAPI · PostgreSQL(+pgvector+FTS) · Redis · Temporal · LangGraph
LiteLLM · OPA · MCP Gateway · Vault/KMS · OpenTelemetry · Langfuse
```

## Principios de decisión (definición con Iván)

- **No se reescribe** lo que ya funciona y es diferenciador (control plane / seguridad / tenancy de Hermes-OS).
- **Sí se cambia de enfoque** en la capa commodity y difícil (el loop de agente): adoptar un executor maduro (LangGraph) detrás de una interfaz intercambiable, no construirlo a mano.
- **Evolución por fases** (`10-DEPLOYMENT-OPERATIONS.md` §17 y el plan de fases del SPIKE en `docs/reference/`): Foundation → Governance → Durable → Enterprise Ops → Scale. *(El detalle histórico de fases vivía en la sección §89 del anexo heredado hoy supersedido: ver nota de trazabilidad en `docs/reference/SPIKE-FASE1-FOUNDATION-investigacion.md`.)*
- Validar en vivo (spike / rebanada vertical) antes de comprometer.

## Origen del contenido

Este proyecto adopta el paquete v0.1 que Iván subió a Nextcloud (`files/ivan/Proyecto Langraph/digital-employee-platform-architecture-v0.1/`). La documentación generada previamente en esta sesión (ARCHITECTURE-03) se conserva como anexo no-normativo en `docs/reference/`.

## Arquitectura núcleo

**Task → Execution → Policy → Action → Outcome**