# SPIKE Fase 1 — Foundation (Investigación y Diseño de Validación)

**Proyecto:** Digital Employee Platform
**Documento:** 09-SPIKE (no-normativo, pre-implementación)
**Estado:** Investigación → propuesta de validación en vivo  
**Fecha:** 2026-09-21

> Este documento NO es normativo. Pertenece a `docs/reference/` porque precede a la
> implementación y valida decisiones (ADR-002 LangGraph, ADR-003 Temporal, ADR-010 LiteLLM)
> antes de comprometer código. Si la validación cambia una decisión, se actualiza el ADR.

---

## 1. Objetivo de la rebanada vertical

Validar **en vivo** la Fase 1 (Foundation) del paquete canónico: un Empleado Digital ejecutando una Task real, de punta a punta, a través del pipeline gobernado, **antes** de escribir producción. No es un prototipo de features: es prueba de que el contrato arquitectónico se puede implementar con el stack elegido sin romper los límites.

## 2. El riesgo central a validar (número 1)

**Temporal ↔ LangGraph: la frontera de durabilidad.**

Hallazgo clave de investigación:
- Temporal es hoy el *backbone durable de facto* bajo los runtimes de agentes (el mismo OpenAI Agents SDK se combina con Temporal desde media 2025).
- LangGraph 1.0 **también** trae checkpointing durable propio (resume, time-travel).

Ambos ofrecen durabilidad. La arquitectura canónica (doc 04) declara **"Temporal dueña de la durabilidad; LangGraph, de la cognición"**. La rebanada debe **probar que esa separación se implementa limpia** y no produce doble-durabilidad en conflicto.

**Decisión operativa a verificar:**
- Temporal es dueña del lifecycle: workflow → activities (load context, run agent, evaluate policy, request approval, invoke MCP, persist, audit, compensate).
- LangGraph corre **dentro de una Activity** como motor cognitivo, con su checkpointer confinado al ciclo corto (o en memoria), mientras Temporal garantiza el resume/durabilidad largo.
- Métrica: cuánto código-puente se necesita para este deslinde y si el resume tras kill del worker funciona con datos consistentes.

## 3. Guión de la rebanada (end-point canónico: Collections)

Nada de chatbot: el caso canónico de `04` (Collections Agent).

```text
Trigger (cron 09:00)
 → ExecutionRequest (con idempotency_key)
 → Temporal Workflow
   → Activity: load context
   → Activity: LangGraph (razona, planea, clasifica riesgo)
   → OPA Policy Decision
       · low → ALLOW (automático)
       · high/irreversible → REQUIRE_APPROVAL → Temporal Signal/Wait (HITL)
   → MCP Gateway → Tool(CRM update) → External(CRM simulado)
   → Observation → LangGraph → continue | complete
   → persist result → audit event → log/metrics
```

Riesgos de negocio simulados (CRM/ERP en contenedor aparte) para mostrar: ALLOW, DENY y APPROVAL, más un **fallo + compensación** y un **cron con resume tras restart del worker**.

## 4. Stack a validar (Fase 1, doc `10` §89 — numeración **heredada** del anexo supersedido; en el normativo vigente, ver `10` §1–§6)

| Componente | Se valida | Evidencia |
|---|---|---|
| **LangGraph 1.0** | state graph, planning, tool-calls, checkpointer corto | resume intra-run |
| **Temporal Python SDK** | workflow+activities, timers, retries, signals, HITL, resume | kill del worker → reanuda |
| **LiteLLM (proxy self-host)** | routing, fallback, key virtual, cost/token accounting | cola hacia el gateway del lab |
| **OPA** | decision ALLOW/DENY/REQUIRE_APPROVAL versionada | cada acción pasa por OPA |
| **MCP Gateway** | enforcement point: schema, auth, rate-limit, idempotency | tool sólo válida tras OPA |
| **FastAPI** | `/api/v1/executions`, `/approvals` | contrato de `05` |
| **PostgreSQL + pgvector + FTS** | System of Record + búsqueda híbrida | versiones inmutables por Execution |

Escenarios: 1 tenant, Empleado Collections, Docker Compose (`10` §1), sin K8s, sin service mesh (non-goals del doc 00).

> **Nota de trazabilidad (2026-10-19):** las referencias a "doc `10` §89" (§4 y §6 de este spike) y "§64/§66" apuntan a la numeración **heredada** del anexo no normativo `RUNTIME-EXECUTION-FULL-ANNEX-ARCHITECTURE-03.md`, que está marcado como supersedido. La ruta de madurez por fases y el esqueleto de repositorio deben citarse desde los documentos normativos (`10-DEPLOYMENT-OPERATIONS.md`) y, si no viven allí todavía, el hueco se registra como decisión pendiente en lugar de citar la numeración vieja.

## 5. Umbrales duros (criterio GO/NO-GO)

La rebanada es aceptable **sólo si** demuestra:

| # | Criterio | Medida / umbral |
|---|---|---|
| S-01 | Deslinde Temporal↔LangGraph limpio | adapter < ~300 LOC; sin duplicación de estado durable entre PG y Temporal |
| S-02 | Resume tras crash | kill del worker en medio de aprobación → reanuda y completa; estado consistente |
| S-03 | HITL durable | aprobación tarda (signal), proceso sobrevive, audit registra el ciclo completo |
| S-04 | Toda acción pasa por OPA + MCP GW | invocación directa al tool fracasa; sólo ALLOW/APPROVED llega al CRM |
| S-05 | Secrets fuera del contexto | ningún secreto en prompt/state/logs (Vault o stub con referencia) |
| S-06 | Idempotencia mutable | retry del mismo execution_id no duplica transacción |
| S-07 | Versionado reproducible | Execution conserva employee/task/policy_version |
| S-08 | Costo/token contabilizado | LiteLLM reporta uso por Execution |

Si S-01..S-03 fallan, la arquitectura tiene un conflicto real de frontera → **se abre un ADR** en vez de parchear.

## 6. Cómo se ejecuta la rebanada

1. Contenedor de spike aparte (no el principal), repositorio esqueleto según `10` §66 (apps/, packages/domain|application|infrastructure/, migrations/); la referencia `10` §66 es **heredada** del anexo supersedido — en el normativo vigente, ver `10` §1–§6.
2. Se difunden: Docker Compose (`frontend, api, worker, temporal, temporal-ui, postgres, redis, mcp-gateway, litellm, otel-collector, langfuse`); Vault incorporado si el entorno lo permite.
3. Se implementa la mínima cantidad de código que permita el guión de la sección 3, respetando `development/CLAUDE-CODE-GUIDELINES.md`.
4. Se corren los 8 umbrales como tests/evidencia (integration + security), estilo del manifest v0.1.
5. Salida: reporte GO/NO-GO + (si aplica) ADR nuevo + actualización de referencias cruzadas.

## 7. Hallazgos de investigación (basados en estado 2026)

- **LangGraph 1.0** está estable desde oct 2025; checkpointing = resume + time-travel. Adopción enterprise (J.P. Morgan, Klarna). MIT.
- **Temporal** es el estándar durable para agentes: cookbook oficial de AI/HITL (signals + `workflow.wait_condition()`), retries de actividades independientes, integra desde OpenAI Agents SDK hasta LangGraph.
- **LiteLLM** es el estándar OSS de gateway: router con retry/fallback, virtual keys, cost tracking, admin UI; self-hostable.
- **Patrón confirmado:** GitHub/blog recommiendan Temporal = backbone durable + LangGraph = cognición (misma separación que la canónica).
- **OPA** sigue siendo el policy-as-code estándar (Rego, versionable, ALLOW/DENY/APPROVAL).

## 8. Referencias

- Paquete canónico: `docs/architecture/00-ARCHITECTURE-INDEX.md` (reglas) y `../development/CLAUDE-CODE-GUIDELINES.md`.
- ADR a confirmar: `ADR-002-langgraph`, `ADR-003-temporal`, `ADR-010-llm-gateway`, `ADR-005-opa-policy-engine`, `ADR-004-mcp`.
- Detalle operativo del runtime: `RUNTIME-EXECUTION-FULL-ANNEX-ARCHITECTURE-03.md` (no-normativo).
