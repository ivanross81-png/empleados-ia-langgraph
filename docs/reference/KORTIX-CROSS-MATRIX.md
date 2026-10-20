---
type: reference
status: active
created: 2026-10-19
updated: 2026-10-19
tags: [digital-employee, kortix, cruce, matriz, brechas, trazabilidad]
---

# Cruce Kortix/Suna ↔ arquitectura propia — inventario, matriz de brechas y acciones

> **No normativo.** Documento de trabajo (entregables **A** inventario y **C** matriz del encargo). La fuente de verdad sigue siendo el paquete normativo (`docs/architecture/00-10` + `docs/adr/`) y `docs/es/` para lectura humana. Las modificaciones propuestas y aplicadas se registran en [[REGISTRO-CAMBIOS-DOCUMENTALES-2026-10-19]]; lo que no puede cerrarse por análisis documental queda en [[DECISIONES-PENDIENTES]].
>
> **Estado de los cuadros:** §A.4.bis, §A.6.bis y §C.1.bis se agregaron en la **auditoría** del 2026-10-19 y describen ese momento; §C.5 es la **verificación posterior** del mismo día, que comprueba el estado publicado y **corrige lo que sobrevivió** (V-1…V-8); **§C.6 registra las decisiones del responsable del producto** de esa misma fecha (`ADR-012`–`ADR-014`, DP-1/DP-2/DP-5/DP-6/DP-18/DP-19/DP-20 y validadores publicados en `tools/docs-verify/`), que es lo más reciente. Donde un cuadro anterior diga "anotado, no sustituido", vale lo que dice §C.5: tras la aceptación de `ADR-011`, la sustitución es **normativa**.
>
> Insumos: [[KORTIX-INVESTIGACION-v0.14.3]] (capacidades verificadas de Kortix, IDs `K-nn`) · [[STACK-LICENCIAS]] (licencias del stack) · [[KORTIX-analisis-y-licencias]] (veredicto BASE/REFERENCIA).
>
> **Actualización (auditoría del 2026-10-19):** este documento se completó con el estado vigente de cada hallazgo. Las secciones marcadas `bis` (A.4.bis, A.6.bis, C.1.bis) son las que hay que leer para saber **qué está resuelto solo en el papel**, qué sigue pendiente de prueba y qué requiere una decisión de producto o una revisión de licencias. Estados usados: `ABIERTO`, `RESUELTO_DOCUMENTALMENTE`, `PENDIENTE_DE_PRUEBA`, `PENDIENTE_DE_DECISION`, `PENDIENTE_DE_LICENCIA`, `DESCARTADO`, `SUPERSEDIDO`. Informe completo: [[AUDITORIA-CONSISTENCIA-2026-10-19]].

---

# PARTE A — Inventario de la documentación existente

**Fecha de inventario:** 2026-10-19. **Base:** archivos reales del proyecto, verificados con validadores no destructivos (`check-docs.py`: enlaces relativos, wikilinks, referencias a documentos del paquete, sintaxis de bloques Mermaid, duplicados; `check-parity.py`: paridad estructural inglés↔español).

> **Corrección de la auditoría 2026-10-19.** La primera versión de este inventario declaraba 62 archivos `.md`. El recuento real al momento de aquel inventario era **68**, y tras los tres documentos de esta auditoría es **71**. Los demás totales del cuadro también estaban desactualizados (ADR: 10, no 11; espejo español: 27, no 29) y quedan corregidos acá.

## A.1 Documentos y jerarquía

| Grupo | Ubicación | Archivos | Rol |
|---|---|---|---|
| Raíz del proyecto | `README.md`, `00-INDEX.md`, `DOCUMENT-MANIFEST.md`, `EXPLICACION-NO-TECNICA.md` | 4 | Punto de entrada, índice de trabajo, manifiesto e inventario, explicación para no técnicos |
| Arquitectura (normativa) | `docs/architecture/00..10` | 11 | Contrato arquitectónico. v0.1.0, creada 2026-09-21, revisada 2026-10-19, "Normative baseline" |
| Decisiones (normativas) | `docs/adr/ADR-001..014` | 14 | 14 ADRs `Accepted` (deployment, LangGraph, Temporal, MCP, OPA, PostgreSQL, secrets, DLP, evaluación, LLM gateway, **política de licencias libres**, **almacén de checkpoints**, **frontera de cómputo** y **envejecimiento de aprobaciones**) — `ADR-011` pasó a `Accepted` el 2026-10-19 y `ADR-012`–`ADR-014` se crearon `Accepted` ese mismo día |
| Desarrollo (normativo) | `docs/development/` | 5 | Guidelines, coding standards, testing, security rules, contrato para agentes de código |
| Espejo en español | `docs/es/` (misma estructura + `README.md` y `DOCUMENT-MANIFEST.md`) | 30 | **Lectura humana**; el paquete inglés sigue siendo el normativo |
| Referencia (no normativa) | `docs/reference/` | 16 | Anexo de runtime (superseded), SPIKE Fase 1, análisis Kortix, investigación Kortix, matriz de cruce, licencias, registro de cambios, decisiones pendientes, auditoría de consistencia, registro de la auditoría, matriz de invariantes, verificación posterior, registro de la verificación, **registro de las decisiones del responsable** y **preparación de compatibilidad y licencias** |

## A.2 Decisiones vigentes (lo que NO debe cambiarse sin ADR)

1. **Execution** es la unidad de trabajo; trigger/canal/evento solo la provocan (`00` §4, `03` §14).
2. **Temporal** dueña de la durabilidad; **LangGraph** dueño de la cognición (`ADR-002`, `ADR-003`, `04` §2, `02` §4).
3. **OPA/Rego** = motor determinístico con decisión explícita `ALLOW|DENY|REQUIRE_APPROVAL` (`ADR-005`, `06` §4).
4. **MCP** como protocolo preferido; el **MCP Gateway** es el punto de enforcement (`ADR-004`, `07`).
5. **PostgreSQL** = system of record del dominio; Temporal = del workflow; Redis nunca fuente de verdad (`ADR-006`, `05` §1).
6. **LiteLLM** como gateway de modelos, sin autorización de negocio (`ADR-010`).
7. **Despliegue dedicado single-tenant** como modelo inicial; multi-tenancy dinámica **non-goal** (`ADR-001`, `01` §7, `02` §11).
8. **Versiones publicadas inmutables**; cada Execution conserva las versiones exactas (`03` §12).
9. Sin Kubernetes, sin Kafka, sin service mesh, sin browser/shell sin restricción, sin vector DB propia, sin IdP propio, sin servidor MCP universal (`00` §8).
10. Separación **control plane / execution plane** (`02` §2–3).

## A.3 Temas cubiertos con solidez

- Modelo de ejecución end-to-end (trigger → execution → workflow → agente → política → acción → observación) y su invariante "la IA propone, el sistema autoriza".
- Contrato de herramientas y de gateway (pipeline de 13 pasos en `04` §6; responsabilidades en `07` §4).
- Secretos fuera de prompt/estado/memoria/logs (`04` §8, `06` §7, `07` §8, `ADR-007`).
- DLP/PII y clasificación de datos (`06` §8–9, `ADR-008`).
- Prompt injection y contenido externo como dato (`04` §17, `06` §10, `08` §14).
- Idempotencia, reintentos por clasificación, DLQ, saga/compensación, cancelación (`04` §12–15, §18).
- Presupuestos de ejecución (duración, iteraciones, tool calls, tokens, costo) (`04` §16).
- Contexto, memoria y retrieval híbrido con ACL previa (`08`, `05` §18).
- Observabilidad vs auditoría separadas; evaluación y gates de release (`09`).
- Despliegue Compose sin Kubernetes, DR, upgrades expand/contract, respuesta a incidentes (`10`).

## A.4 Temas **parcialmente** cubiertos (concepto presente, sin detalle operativo)

| Tema | Dónde está | Qué falta |
|---|---|---|
| Integración LangGraph ↔ Temporal (frontera de durabilidad) | `04` §2/§4, SPIKE §2 | Política explícita de checkpointer, re-ejecución de nodos, streaming, subgrafos, versionado del grafo y **dónde vive el estado del checkpointer** |
| Persistencia del estado del agente | `04` §4 | El checkpointer es un **tercer** almacén de estado no declarado en `05` §1 |
| Calendarización de triggers | `03` §5, `05` §11 | Zona horaria, jitter, clave por slot, misfire/catch-up, límites de corrida, pausa global |
| Aprobaciones | `03` §8, `05` §10, `04` §11 | Read model/cola, aging, expiración, delegación, separación de funciones en el flujo |
| Auditoría | `05` §5, `09` §6 | Taxonomía y convención de nombres de acciones; cobertura "una fila por request" |
| Identidad empresarial | `06` §2 | SAML/OIDC concreto, SCIM, MFA obligatoria, política de sesión, mapeo grupos→roles |
| Progreso en vivo / tiempo real | `09` §3 | Contrato de **stream de eventos de ejecución** para consola y aprobaciones |
| Archivos y artefactos | `05` §3 ("por referencia") | Contrato de artefacto: registro, clasificación, retención, acceso, límites |
| Secretos: entrega al ejecutor | `06` §7, `07` §8 | Modo de exposición (valor real vs intermediación), redacción de eco, verificación |
| Control operativo del runtime | `10` §12 (para operadores) | Semántica de **steer/interrupt/pausar/terminar** un turno y quién está autorizado |
| Costos | `04` §16, `09` §12 | Enforcement de cuotas por tenant/empleado/tarea y comportamiento al agotarse; metering para el modelo SaaS |
| Licencias del stack | — | Ausente por completo antes de [[STACK-LICENCIAS]] |

## A.4.bis Estado de los temas parciales tras las modificaciones (revisión de auditoría, 2026-10-19)

La columna *Qué falta* del cuadro A.4 describe el estado **antes** de las modificaciones. Este cuadro registra qué pasó después, sin borrar el análisis original. `RESUELTO_DOCUMENTALMENTE` significa que el contrato ya está escrito, **no** que esté implementado ni probado.

| Tema | Estado al 2026-10-19 | Dónde quedó | Falta todavía |
|---|---|---|---|
| Frontera LangGraph ↔ Temporal | `RESUELTO_DOCUMENTALMENTE` (con una ambigüedad corregida en esta auditoría: el punto 5 de `04` §21.2 se leía como si el checkpointer debiera administrar las esperas humanas) | `04` §21.1–21.4 (tabla de las cinco nociones de durabilidad) | `PENDIENTE_DE_PRUEBA`: DP-1, DP-16 |
| Persistencia del estado del agente | `RESUELTO_DOCUMENTALMENTE` (tercer almacén declarado y acotado) | `05` §1, `04` §21.2, `06` §17 | Backend y modo de durabilidad: DP-1 |
| Calendarización de triggers | `RESUELTO_DOCUMENTALMENTE` | `03` §5.1 | `PENDIENTE_DE_PRUEBA`: slot perdido/duplicado |
| Aprobaciones | `RESUELTO_DOCUMENTALMENTE` | `05` §10.1, `03` §8 | Prueba de ciclo de vida (I-04); umbral de *aging*: DP-18 |
| Auditoría | `RESUELTO_DOCUMENTALMENTE` | `05` §5.1/§5.2, `09` §6 | Versionado de la taxonomía: DP-13 |
| Identidad empresarial | `RESUELTO_DOCUMENTALMENTE` | `06` §2.1 | Prueba de integración con un IdP real |
| Progreso en vivo / tiempo real | `RESUELTO_DOCUMENTALMENTE` | `05` §20, `09` §3 | Prueba de reconexión y orden |
| Archivos y artefactos | `RESUELTO_DOCUMENTALMENTE` | `05` §21, `08` §13 | Medio de almacenamiento: DP-11 |
| Secretos: entrega al ejecutor | `RESUELTO_DOCUMENTALMENTE` | `06` §7.1, `07` §8 | Prueba de fuga y de sonda (I-02) |
| Control operativo del runtime | `RESUELTO_DOCUMENTALMENTE` (incluye ahora la semántica lectura/comando: `04` §22) | `04` §22, `05` §1 | Prueba de contrato (I-13) |
| Costos | `RESUELTO_DOCUMENTALMENTE` (diseño de cuotas) | `09` §12.1, `10` §18 | Umbrales y efecto del corte: DP-4, DP-18 |
| Licencias del stack | `RESUELTO_DOCUMENTALMENTE` como política **aceptada** (`ADR-011` Accepted, 2026-10-19) + inventario verificado | `STACK-LICENCIAS`, `ADR-011` (Accepted), `REGISTRO-CAMBIOS-2026-10-19-ADR-011-ACEPTADO` | `PENDIENTE_DE_PRUEBA` (compatibilidad de las sustituciones), `PENDIENTE_DE_LICENCIA` (transitivas y artefacto empaquetado): DP-5, DP-6 |

Además, dos brechas que estaban ausentes y hoy tienen contrato: **versionado de workflows y workers** (`04` §24, con *patching* y cutover por versión) y **ciclo de instalación/actualización privada** (`10` §17).

## A.5 Preguntas abiertas ya presentes en los documentos

- SPIKE §5: si la separación Temporal↔LangGraph no se implementa limpia (`S-01..S-03`), **se abre un ADR** en vez de parchear.
- `04` §16: valores concretos de presupuesto; `09` §7: herramienta de evaluación a adoptar (Ragas/DeepEval "o equivalente").
- `10` §9: RPO/RTO por despliegue (a definir con el cliente).
- `01` §8: umbrales de aceptación de las métricas de éxito (no fijados).

## A.6 Contradicciones y defectos documentales detectados

| # | Hallazgo | Evidencia | Gravedad |
|---|---|---|---|
| C-1 | **Tercer almacén de estado no declarado.** `05` §1 declara dos autoridades de estado (PostgreSQL del dominio, persistencia de Temporal), pero LangGraph 1.x persiste su propio estado vía *checkpointer*, y `04` §4 exige que el estado sea "explícito y serializable" sin decir **dónde vive ni por cuánto tiempo**. Un checkpointer guarda el estado del grafo —incluidos resultados de herramientas— en otro almacén: contradice el principio "los payloads grandes van por referencia" y el invariante "ningún secreto en el estado del agente" si no se declara su política. | `04` §4, `05` §1, `04` §20 | **Alta** (corrección + seguridad de datos) |
| C-2 | **Referencias cruzadas a secciones inexistentes.** El SPIKE cita "doc `10` §89" y "doc `10` §66"; el índice del vault cita "`10-DEPLOYMENT-OPERATIONS.md` / doc §89". Esas secciones viven **solo** en el anexo no normativo (`RUNTIME-EXECUTION-FULL-ANNEX`), que está marcado *SUPERSEDIDO*. | `SPIKE` §4 y §6; `00-INDEX.md` línea 28; `10` (16 secciones) | Media (trazabilidad) |
| C-3 | **Manifiesto con frase corrupta.** `DOCUMENT-MANIFEST.md` termina con una oración generada con un signo de pregunta ("The requested “17 documents” are delivered as … ?") que describe un pedido externo y no el paquete real, y no menciona `docs/reference/`. | `DOCUMENT-MANIFEST.md` línea 32 | Baja (calidad documental) |
| C-4 | **Riesgo de deriva bilingüe.** `docs/es/` es un espejo mantenido a mano (los textos en español son más extensos que el original normativo, p.ej. `04`: 6.933 B vs 5.832 B). Nada obliga a sincronizarlos: cualquier cambio en inglés queda desincronizado si no se replica. | `docs/es/architecture/*` | Media (mantenimiento) |
| C-5 | **`00-INDEX.md` no lista los documentos de `docs/reference/`** más allá de dos, así que un lector nuevo no descubre el material de investigación. | `00-INDEX.md` §7 | Baja |
| C-6 | **Fuente de verdad de las licencias ausente.** El requisito "dependencias compatibles con comercialización propietaria" (contexto del proyecto) no tenía ningún artefacto que lo verificara. | — | **Alta** (viabilidad comercial) |

## A.6.bis Estado de las contradicciones y defectos al 2026-10-19

Se conserva la tabla A.6 como registro histórico del hallazgo original y se agrega su resolución. Nota de la auditoría: **C-1 estaba parcialmente resuelto** (los contratos se escribieron, el almacén quedó declarado y acotado), pero su redacción introdujo una ambigüedad nueva en el punto 5 de `04` §21.2, corregida en esta revisión.

| # | Estado al 2026-10-19 | Evidencia de la resolución | Pendiente real |
|---|---|---|---|
| C-1 | **RESUELTO_DOCUMENTALMENTE** (con corrección de redacción) | `04` §21.1–21.4, `05` §1, `06` §17, `dev/CODING-STANDARDS` | `PENDIENTE_DE_PRUEBA` (DP-1, DP-16) |
| C-2 | **RESUELTO_DOCUMENTALMENTE** | Nota de trazabilidad en `SPIKE-FASE1-FOUNDATION-investigacion.md` (numeración §89/§64/§66 marcada como heredada y supersedida) + `00-INDEX.md` con la misma nota | Nada: las secciones citadas ya no se presentan como vigentes |
| C-3 | **RESUELTO_DOCUMENTALMENTE** | `DOCUMENT-MANIFEST.md` §7 con tablas nuevas y registro de revisiones (§8); la frase corrupta no existe en el archivo | Nada |
| C-4 | **RESUELTO_DOCUMENTALMENTE en el proceso, con riesgo residual de mantenimiento** | Espejo actualizado en las mismas secciones + validador de paridad `check-parity.py` ejecutado (29 pares, 2 divergencias detectadas y corregidas) | Verificación de paridad automatizada en el repositorio (propuesta P-27) |
| C-5 | **RESUELTO_DOCUMENTALMENTE** | `00-INDEX.md` lista todo `docs/reference/` y `00-ARCHITECTURE-INDEX.md` §10 lo tabula | Nada |
| C-6 | **RESUELTO_DOCUMENTALMENTE como inventario y política aceptada** | `STACK-LICENCIAS.md`, `ADR-011` (Accepted, 2026-10-19), `06` §18 | Compatibilidad probada (DP-5, DP-6), SBOM/license gate, revisión legal |
| **C-7** (nueva) | **RESUELTO_DOCUMENTALMENTE** — cantidades del paquete desactualizadas en tres lugares (`00-INDEX.md` decía 26 archivos y citaba `docs/DOCUMENT-MANIFEST.md`; este documento declaraba 62 archivos; el espejo `docs/es/DOCUMENT-MANIFEST.md` seguía en 26 y conservaba el párrafo de borrador) | Correcciones en `00-INDEX.md`, `DOCUMENT-MANIFEST.md` §7.1–7.2, `docs/es/DOCUMENT-MANIFEST.md` y este documento (A.1) | Nada |
| **C-8** (nueva) | **RESUELTO_DOCUMENTALMENTE** — trazabilidad de metadatos incompleta: `ADR-002`–`ADR-010` sin fecha y 01–10/guías sin `created`/`updated` | Campos `Created`/`Updated` en los 11 normativos y las 5 guías (EN y ES) y `Date` en los 11 ADR (EN y ES); las fechas exactas no registradas se declaran como tales, no se inventan | Completar la fecha real de ADR-002–010 si se recupera del historial |
| **C-9** (nueva) | **RESUELTO_DOCUMENTALMENTE** — el cuadro C.2 declaraba "Aplicado" en propuestas con avance parcial (K-T1 lectura/comando, K-T2 *patching*, P-20 defectos documentales) | Contratos agregados (`04` §22, `04` §24, paridad y manifiesto corregidos) y estados reclasificados en §C.2 y §C.1.bis | Nada documental; las pruebas siguen pendientes |

## A.7 Juicio de conjunto

La arquitectura está **bien especificada en lo que es su diferencial** (gobernanza, límites de seguridad, ejecución gobernada, durabilidad) y **delgada en lo operativo y en lo de venta** (identidad empresarial, contratos de UI/progreso, artefactos, cuotas, licencias y la letra chica de LangGraph/Temporal). No hay contradicciones de diseño: hay **omisiones** y **dos defectos documentales**. Por eso la estrategia correcta es **ampliar secciones**, no rediseñar.

---

# PARTE C — Matriz de cruce

**Cómo leerla.** `Estado del cruce` ∈ {completo, parcial, ausente, alternativo, descartado, pendiente, no-incorporar}. Cada fila cierra con la **acción documental**: `P-nn` para propuestas (ver §C.2 y el registro de cambios) o `D-nn` para descartes (ver §C.3). Los IDs `K-nn` remiten a [[KORTIX-INVESTIGACION-v0.14.3]].

## C.1 Matriz de trazabilidad

### Runtime de agentes y durabilidad

| ID | Capacidad Kortix | Evidencia | Documento propio | Diseño actual | Estado | Brecha concreta | Propuesta | Justificación | Impacto | Prioridad | Acción documental | Validación |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| K-01 | Empleado = configuración versionada en git (`kortix.yaml`, `agents/`, `skills/`) | `project__agents.mdx`, `project__manifest.mdx` | `03` §12, `05` §2 | Versiones inmutables en PostgreSQL; sin formato de archivo | alternativo | No hay representación **diffable/exportable** de una definición de empleado | P-15: empaquetado export/import de definiciones versionadas (revisable en PR) **sin** mover la autoridad a git | Facilita revisión, auditoría y portabilidad entre entornos; habilita "empleado como código" sin abandonar el control plane | dominio, operación | P2 | `03` (nueva subsección), `10` | Decisión de diseño + prototipo de export/import |
| K-04/K-05/K-06/K-16 | Permisos por herramienta con `ask`, regla más específica gana, grants deny-by-default, stop autorizado | `project__agents.mdx` | `03` §9–10, `06` §3–4, `07` §7 | OPA devuelve `REQUIRE_APPROVAL`; least privilege; herramientas acotadas por tarea | **parcial** | Falta declarar (a) que `REQUIRE_APPROVAL` **sostiene** la ejecución en vez de fallar, (b) que la política puede evaluarse con granularidad de **argumentos**, (c) precedencia de reglas | P-16: ampliar semántica de decisión y granularidad | Evita implementaciones que fallan la acción en lugar de esperar; hace explícita la granularidad que ya permite OPA | seguridad, runtime | P1 | `06` §4, `03` §9 | Test de política con dos reglas solapadas |
| K-12/K-21/K-25 | Cada sesión corre en un **sandbox** ("computadora") con imagen, `sudo`, Docker | `work__runtime.mdx`, `apps/kortix-sandbox-agent-server/README.md` | `00` §8 (non-goals: sin shell/browser irrestrictos), `07` | El empleado **solo** actúa vía herramientas MCP; no tiene entorno de cómputo propio | **ausente / pendiente** | No está definido **dónde** produce un empleado entregables que requieran cómputo (planillas, archivos, scripts) | P-14: **declarar la brecha y decidir** (no adoptar el modelo de Kortix). Opciones: (a) sin cómputo propio (solo herramientas), (b) ejecución de código efímera y sin red con artefactos versionados | Cierra un hueco de alcance del producto y evita que aparezca por la puerta de atrás en una implementación | seguridad, runtime, UX | **P1 (decisión)** | `04` (sección de preguntas abiertas), [[DECISIONES-PENDIENTES]] | Decisión de producto + revisión de seguridad |
| K-15/K-16 | Control en vivo: `steer`, `queue`, `interrupt`, detener el turno | `work__sessions.mdx` | — (solo `10` §12 para operadores) | No definido | **ausente** | Una ejecución de días necesita **instrucciones y correcciones en vuelo** sin matarla: no hay semántica ni autorización | P-09: semántica de control de ejecución (pausar/reanudar, inyectar directiva, interrumpir, terminar) + quién puede hacerlo | Operación real: un humano debe poder corregir el rumbo de una ejecución viva con auditoría | runtime, seguridad, UX | P1 | `04` (nueva sección), `05` (API) | Prueba de integración: directiva en vuelo + auditoría |
| K-19 | Espera humana: la pregunta se guarda **fuera** del sandbox; reanudación explícita | `sdk__sessions.mdx`, `work__sessions.mdx` | `04` §11, `03` §8 | Temporal espera una señal durable; aprobación atada a acción/versión/contexto | **completo** (nuestra solución es más fuerte) | — | No incorporar nada; usar K-19 solo como evidencia de que el patrón es exigible en el mercado | — | — | — | — | — |
| K-20 | Sin motor de workflows: cola en PostgreSQL con `SKIP LOCKED` | `apps/api/src/workers/job-queue-worker.ts` | `ADR-003`, `04` §2–3 | Temporal dueño de durabilidad | **alternativo** | Ninguna: confirma que mantener Temporal es un diferencial, no un lujo | No incorporar | — | — | No incorporar | — | — |
| K-18 | Auto-recuperación de una corrida cuando el sandbox muere | `work__sessions.mdx` | `04` §13/§15/§20 | Reintentos clasificados + recuperación de worker + DLQ | completo | — | No incorporar | — | — | — | — | — |

### Ciclo de vida de LangGraph y Temporal (llenado con documentación oficial de las dependencias)

| ID | Capacidad | Fuente | Documento propio | Diseño actual | Estado | Brecha concreta | Propuesta | Justificación | Impacto | Prioridad | Acción documental | Validación |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| K-L1 | **Checkpointer y modos de durabilidad** (`exit`/`async`/`sync`) de LangGraph: persiste estado del grafo por hilo y permite resume/time-travel | `docs.langchain.com/oss/python/langgraph/checkpointers` (verificado 2026-10-19) | `04` §4, `05` §1 | `04` §4 exige estado serializable; `05` §1 declara **dos** almacenes | **parcial (C-1)** | No se declara el almacén del checkpointer, ni su clasificación/retensión, ni qué modo de durabilidad usar | P-01: declarar el checkpointer como **almacén de estado del runtime**, confinado al ciclo corto, con política de retención, clasificación y "por referencia" | Evita un tercer almacén silencioso con datos sensibles y evita doble durabilidad en conflicto con Temporal | datos, seguridad, runtime | **P0** | `04` (nueva sección), `05` §1/§3, `06` | Spike S-01/S-02 del SPIKE + prueba de "sin doble durabilidad" |
| K-L2 | **`interrupt()` re-ejecuta el nodo completo al reanudar**; los efectos previos al `interrupt` deben ser idempotentes; no envolver `interrupt` en `try/except`; `interrupt` no pasa por el manejador de errores ni por las políticas de reintento | `docs.langchain.com/oss/python/langgraph/interrupts` | `04` §11, §12 | Solo dice "Temporal espera una señal durable" | **parcial** | Falta la **regla de re-ejecución**: es la causa número uno de efectos duplicados al reanudar | P-01 (misma sección): regla de idempotencia de efectos previos a la aprobación + prohibición de capturar la interrupción | Corrección: sin esto, un resume puede duplicar un efecto externo ya ejecutado | corrección, seguridad | **P0** | `04`, `dev/CODING-STANDARDS` | Test: aprobación tras dos reanudaciones no duplica efecto |
| K-L3 | **Versionado del grafo**: renombrar/borrar nodos rompe hilos pausados; patrón de *versión de comportamiento* registrada en el estado | `docs.langchain.com/oss/python/langgraph/backward-compatibility` | `03` §12, `04` §10 | Versiones inmutables de definiciones; nada sobre el **grafo** en vuelo | **ausente** | Puede haber ejecuciones pausadas cuando cambia la definición del empleado | P-01: regla de compatibilidad de grafos en vuelo (versión registrada en el estado + branch por versión) | Evita ejecuciones irrecuperables tras un cambio de definición | dominio, runtime | P1 | `04`, `03` §12 | Prueba: ejecución pausada sobrevive a un cambio de grafo |
| K-T1 | **Temporal: consultas, señales y updates con validadores** (query no muta; signal muta y no devuelve; update es sincrónico y trazable) | `docs.temporal.io/develop/python/message-passing` | `04` §2–3, `05` §10 | Menciona "signals" y esperas; no distingue query/signal/update | **parcial** | Falta precisar qué se usa para **leer** progreso (query) y para **comandar** (signal/update) | P-06/P-09: usar query para el read model de progreso y signal/update para comandos operativos | Evita usar señales para leer estado y evita mutaciones no validadas | API, runtime | P1 | `04`, `05` | Prueba: consulta de progreso sin mutar estado |
| K-T2 | **Versionado de workflows**: *patching* (`patched()`), *worker versioning*, cutover por nuevo nombre, prueba de replay determinista | `docs.temporal.io/develop/python/versioning` | `10` §10 (upgrades expand/contract) | Nada sobre versionado de workflows en vuelo | **ausente** | Un cambio en el workflow puede romper ejecuciones abiertas (error de determinismo) | P-17: política de versionado de workflows y de workers + prueba de replay en CI | Evita el fallo más común al evolucionar un sistema durable | operación, corrección | P1 | `04`, `10`, `dev/TESTING-STRATEGY` | Prueba de replay en CI |
| K-T3 | **Schedules**: pausa (con nota), backfill, políticas de solapamiento (`Skip`/`BufferOne`/`BufferAll`), límites; **Schedule ≠ workflow pausado** | `docs.temporal.io/schedules` | `03` §5, `05` §11 | Trigger `SCHEDULE` sin semántica temporal | **parcial** | Falta la política de solapamiento y el manejo de slots perdidos | P-05: declarar política de solapamiento y catch-up por trigger | Comportamiento predecible para tareas recurrentes (cobranzas diarias) y para su recuperación | dominio, operación | P1 | `03`, `04` | Prueba: dos slots superpuestos con política definida |
| K-T4 | **Continue-As-New**, historia y límites; reintentos con errores **no reintentables**; heartbeats de actividad | `docs.temporal.io/workflow-execution/continue-as-new`, `/retry-policies` | `10` §6, `04` §13 | Continue-As-New mencionado; reintentos clasificados | completo | La clasificación de errores no reintentables existe; falta la referencia al mecanismo de Temporal | P-17 (nota) | Trazabilidad de la implementación | operación | P2 | `10` | — |
| K-T5 | **Observabilidad**: métricas Prometheus del SDK, tracing OTel, **Search Attributes** para visibilidad por consulta | `docs.temporal.io/develop/python/observability` | `09` §2–4 | OTel + Prometheus + Langfuse | **completo** | Falta el uso de Search Attributes para búsquedas operativas (p. ej. "ejecuciones esperando aprobación del empleado X") | P-07 (nota): Search Attributes para la cola de aprobaciones | Hace operable la cola de aprobaciones sin tablas ad-hoc | operación, UX | P2 | `09` | — |

### Identidad, IAM, secretos y auditoría

| ID | Capacidad Kortix | Evidencia | Documento propio | Diseño actual | Estado | Brecha concreta | Propuesta | Justificación | Impacto | Prioridad | Acción documental | Validación |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| K-47/K-48 | SSO SAML 2.0 multi-IdP con verificación de dominio y **enforcement** que revoca sesiones; **SCIM 2.0** | `accounts__identity.mdx` | `06` §2 | "OIDC/OAuth2 o IdP empresarial" (una línea) | **parcial** | Sin requisitos de SSO/SCIM/provisionamiento, la venta a banca/seguros se traba en seguridad del cliente | P-03: requisitos de identidad empresarial (SSO con verificación de dominio, provisioning SCIM, mapeo grupos→roles, enforcement con revocación) | Requisito de compra real: sin esto no hay alta en un cliente regulado | seguridad, operación | P1 | `06` §2, `10` | Validación de seguridad + prueba de integración con un IdP |
| K-49 | MFA obligatoria por cuenta, política de sesión (máximo e idle), revocación de sesiones, lista de dispositivos | `accounts__identity.mdx` | `06` §2 | No contemplado | **ausente** | Control de acceso humano incompleto para uso empresarial | P-03 | Cierra el requisito de acceso humano, no solo el de servicio | seguridad | P1 | `06` §2 | Prueba: sesión que excede el máximo recibe 401 |
| K-50/K-51 | Secretos: **tres modos de exposición**, intermediación de egress con redacción de eco, grants por agente, verificación por sondas | `project__secrets.mdx` | `06` §7, `07` §8, `ADR-007` | "El gateway resuelve la credencial; el modelo nunca la ve"; inyección tardía | **parcial** | Nuestro invariante protege prompt/estado/logs, pero **no define cómo llega la credencial al ejecutor** (valor real en proceso vs intermediación) ni cómo verificar que no se filtró | P-11: modos de exposición de credenciales + redacción de eco + sondas de verificación | Un empleado que ejecuta código o usa HTTP crudo puede exfiltrar una credencial de entorno: la política actual no lo cubre | seguridad | P1 | `06` §7, `07` §8, `dev/SECURITY-RULES` | Prueba de fuga + prueba de sonda |
| K-52/K-53/K-54 | Auditoría: **una fila por request**, taxonomía `dominio.recurso.verbo`, route template, filtrado por prefijo, export | `audit-actions.mdx` | `05` §5, `09` §6 | Evento de auditoría con actor/acción/recurso/ejecución/política/resultado; append-oriented | **parcial** | No hay **contrato de nombres** ni garantía de cobertura total de accesos (hoy la auditoría se piensa por acción de negocio, no por request) | P-04: taxonomía de acciones auditadas + regla de cobertura "toda operación que toca datos o ejecuta una acción deja fila" + filtro/export | Convierte la auditoría en evidencia verificable y comparable; permite responder "quién vio este dato" | seguridad, operación | P1 | `05` §5, `09` §6 | Revisión de seguridad + prueba de contrato de auditoría |
| K-27 | Políticas y aprobaciones de conector con cola de aprobaciones | `connect__connectors.mdx` | `06` §4, `07` §4 | OPA + motor de aprobación | completo | El **motor de políticas** de Kortix es config de aplicación (no versionada) | No incorporar su enfoque; mantener OPA como decisión versionada y testable | — | — | No incorporar | — | — |

### Herramientas, MCP y conectores

| ID | Capacidad Kortix | Evidencia | Documento propio | Diseño actual | Estado | Brecha concreta | Propuesta | Justificación | Impacto | Prioridad | Acción documental | Validación |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| K-26 | Conector gestionado: la credencial **nunca entra al sandbox**; auditoría por llamada | `connect__connectors.mdx` | `07` §8, `04` §8 | Igual forma (el gateway resuelve credenciales) | **completo** | — | Refuerza el invariante; citarlo como evidencia externa | — | — | — | — | — |
| K-29 | **Cuentas OAuth por usuario** (conectores ≠ conexiones ≠ cuentas), *connect links* en sesión | `connect__connectors.mdx` | `07`, `06` §3 | Solo credenciales **de servicio** en Vault/KMS | **ausente** | Escenarios "actuar en nombre de una persona" (su correo, su calendario, su CRM) no tienen diseño: consentimiento, ciclo de vida del token delegado, revocación | P-13: modelar conectores con identidad **de usuario** (on-behalf-of) con consentimiento, caducidad y revocación, separados de los de servicio | Es la diferencia entre "el empleado escribe desde una casilla genérica" y "el empleado actúa como el usuario, con su auditoría" | seguridad, dominio, API | P1 | `07` (nueva sección), `06` §3 | Revisión de seguridad + decisión de producto |
| K-28 | Kortix como **servidor** MCP hacia clientes externos | `connect__mcp.mdx` | `00` §8 (non-goal: servidor MCP universal) | Excluido explícitamente | **descartado** | — | No incorporar en MVP | — | — | No incorporar | — | — |

### Automatizaciones, canales y modelos

| ID | Capacidad Kortix | Evidencia | Documento propio | Diseño actual | Estado | Brecha concreta | Propuesta | Justificación | Impacto | Prioridad | Acción documental | Validación |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| K-31/K-32/K-33/K-34/K-35/K-39 | Cron 6 campos + **timezone IANA**, **jitter**, **clave por slot**, misfire/catch-up, límites de corrida, pausa global, concurrencia de provisión | `connect__triggers.mdx`, `trigger-schedule.jitter.test.ts` | `03` §5, `05` §11 | `SCHEDULE` + scheduler que crea ejecuciones | **parcial** | Sin zona horaria, clave por slot y política de solapamiento, un cron de cobranzas puede correr dos veces o perderse un día | P-05: semántica de calendarización (zona horaria, jitter, clave por slot, política de solapamiento, límites, pausa) | Corrección de negocio: duplicar o perder una corrida diaria es un incidente | dominio, operación | P1 | `03` §5, `04` | Prueba: slot perdido y slot duplicado |
| K-36/K-37/K-38 | Webhooks con **HMAC-SHA256 obligatorio**, ventana de replay ±300 s, **dedupe por event-id**, semántica de códigos | `trigger-webhook-auth.ts`, `webhook-delivery.ts` | `05` §11 | Exige firma/autenticación, frescura, protección de replay, versión de esquema, idempotencia | **completo** | Falta el **detalle de la clave de deduplicación** (por event-id emitido por el proveedor, no por request) y la recomendación de responder 2xx en skip | P-05 (nota): dedupe por id de evento del proveedor + ventana de replay | Evita doble ejecución cuando el proveedor reintenta | API, corrección | P2 | `05` §11 | Prueba de reintento con mismo event-id |
| K-40 | Canales (Slack/Teams/email/Telegram) con vinculación de identidad, join policy y stop desde el canal | `connect__channels.mdx` | `01` §4, `03` §5 (`CHANNEL`) | Canal como disparador; sin diseño de identidad de canal | **parcial (P2)** | Sin *join policy* ni vinculación de identidad, un canal compartido permitiría a cualquiera dirigir al empleado | P-18: requisitos mínimos de canal (vinculación de identidad, política de acceso al hilo, autorización por acción, stop) — **cuando** se implemente el primer canal | Seguridad: el canal es una superficie de entrada no autenticada si no se diseña | seguridad, UX | P2 | `03` §5 (nota), [[DECISIONES-PENDIENTES]] | Decisión de producto + revisión de seguridad |
| K-41 | Gateway de modelos con routing/fallback y *offer vs allow* | `project__models.mdx` | `ADR-010`, `09` §12 | LiteLLM con routing/fallback/costos | **completo** | "Ofrecer ≠ permitir" (un modelo oculto igual corre) es un matiz de gobierno que conviene fijar | P-12 (nota): política de modelos permitidos por empleado/tarea | Evita que un modelo no aprobado se use por un nombre no listado | seguridad | P2 | `09` | — |
| K-42/K-43 | Cupos por créditos, corte por saldo, presupuestos por clave | `credits.mdx` | `04` §16, `09` §12 | Presupuestos por ejecución; costo observado | **parcial** | No hay **enforcement** de cuotas por tenant/empleado/tarea ni comportamiento definido al agotarse; no hay **metering** para el modelo SaaS | P-12: cuotas con corte explícito + medición de consumo facturable | Control de costos y base del modelo comercial SaaS | operación, negocio | P1 | `09` §12, `10` | Decisión de producto + prueba de corte |

### Archivos, despliegue y operación

| ID | Capacidad Kortix | Evidencia | Documento propio | Diseño actual | Estado | Brecha concreta | Propuesta | Justificación | Impacto | Prioridad | Acción documental | Validación |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| K-22/K-23/K-24 | Cuatro almacenes de archivos con límites, adjuntos, previews por puerto | `work__runtime.mdx`, `sdk__sessions.mdx` | `05` §3 ("por referencia"), `08` §13 | Nada sobre artefactos | **ausente** | Un empleado que produce entregables (informe, planilla, PDF) no tiene contrato de artefacto: dónde vive, cómo se clasifica, quién lo ve, cuánto se retiene | P-08: contrato de **artefactos** (registro, propietario, clasificación, retención, acceso, límites de tamaño, almacenamiento por referencia) | Sin esto, el "trabajo terminado" no es recuperable ni gobernable; y los archivos son el canal de fuga más común | datos, seguridad, API | P1 | `05` (nueva sección), `08` §13 | Revisión de seguridad + criterios de retención |
| K-55/K-56 | Self-host con **dependencia externa de compute** y modos de alcance | `host__index.mdx` | `10` §1, `02` §10 | Compose propio sin dependencias externas de ejecución | **alternativo (mejor)** | Ninguna: es una ventaja propia | No incorporar | — | — | No incorporar | — | — |
| K-57/K-59/K-60/K-61 | Bootstrap idempotente, `doctor`, **upgrade con rollback automático**, backups por snapshot, cierre de registro | `host__index.mdx` | `10` §10–§13 | Upgrades controlados, health checks, DR, escaneo | **parcial** | Falta el ciclo de **instalación/arranque/actualización** como contrato operativo (bootstrap idempotente, auto-diagnóstico, rollback de release, cierre de registro) | P-17: sección de instalación y ciclo de actualización en instalación privada | Un cliente on-prem necesita un procedimiento repetible y reversible | operación | P2 | `10` (nueva sección) | Prueba de instalación limpia + rollback |
| K-58 | Consola de administración de plataforma (`/admin`) | `host__index.mdx` | `02` §1 (Web Console), `10` §12 | Consola web mencionada; funciones de operador listadas | **parcial** | No hay contrato de funciones administrativas de plataforma (a nivel instalación, distinto de tenant) | P-17 (nota) | Separa operación de plataforma de operación de negocio | operación | P2 | `10` | — |
| K-63 | **Kortix Capture** (grabación 24/7 del puesto de trabajo) | `capture__index.mdx` | `01` §9, `06` | Fuera de alcance | **descartado / pendiente** | Es vigilancia laboral: plantea riesgo legal (protección de datos personales) y de marca | No incorporar al producto en MVP; dejar constancia del descarte | Costo reputacional y legal desproporcionado al valor | legal, negocio | No incorporar | [[DECISIONES-PENDIENTES]] | Decisión de producto |
| K-62 | Apps hospedadas (releases, máquinas, volúmenes, snapshots) | `apps.mdx` | `01` §6, `02` §11 | El producto no es un PaaS de hosting | **no-incorporar** | — | No incorporar | Convierte el producto en algo distinto; sin demanda identificada | — | No incorporar | — | — |
| K-64 | Superficies cliente múltiples (web/desktop/mobile/TUI) y SDK | `clients.mdx`, `tui.mdx`, `sdk__*.mdx` | `02` §1 | Solo consola web | **parcial (P2)** | Sin contrato de **streaming** ni SDK, cada cliente futuro reinventa la lectura de estado | P-06: contrato de stream de eventos (SSE/WS) como base de todos los clientes | Un contrato único evita N integraciones divergentes | API, UX | P1 (el stream) / P2 (clientes) | `05` (nueva sección), `09` §3 | Prueba de reconexión y orden |
| K-65 | API pública con `code` estable, `Idempotency-Key`, paginación, rate limits con cabeceras, OpenAPI servido por la instancia | `api.mdx` | `05` §8–§19 | Todo esto ya está definido (códigos estables, idempotencia, cursores, versionado) | **completo** | Falta servir OpenAPI por la instancia y publicar cabeceras de rate limit | P-19 (mejora menor): `/openapi.json` y cabeceras de límite | Autoservicio y cliente generado; menos fricción de integración | API | P2 | `05` | Revisión de contrato |
| K-66 | Hechos de stack: RLS multi-tenant, sin pgvector, cola en PostgreSQL, Supabase | `tree.json`, `packages/db/*` | `ADR-001`, `ADR-006` | Single-tenant + pgvector + Temporal | **alternativo** | Confirma que nuestro aislamiento por despliegue y nuestra búsqueda híbrida son decisiones **distintas y deliberadas** | No incorporar | — | — | No incorporar | — | — |

## C.1.bis Estado de cada hallazgo al 2026-10-19 (auditoría de consistencia)

La matriz C.1 se conserva como estaba al momento del cruce. Este cuadro es el **estado vigente** de cada hallazgo, con la taxonomía de la auditoría. Regla de lectura: **`RESUELTO_DOCUMENTALMENTE` no significa implementado ni validado**; `PENDIENTE_DE_PRUEBA` significa que el contrato existe y falta demostrar el comportamiento; `PENDIENTE_DE_DECISION` / `PENDIENTE_DE_LICENCIA` significan que el documento no puede cerrarlo.

| ID | Estado | Respaldo documental | Validación pendiente | Siguiente acción |
|---|---|---|---|---|
| K-01 | `RESUELTO_DOCUMENTALMENTE` (formato provisional) | `03` §15 | `PENDIENTE_DE_DECISION`: formato y flujo de revisión (DP-12) | Definir formato y probar promoción entre entornos |
| K-04/K-05/K-06/K-16 | `RESUELTO_DOCUMENTALMENTE` | `06` §4.1, `03` §9 | `PENDIENTE_DE_PRUEBA`: política con dos reglas solapadas; suspensión ante `REQUIRE_APPROVAL` | Escribir el caso de prueba de política |
| K-12/K-21/K-25 | `PENDIENTE_DE_DECISION` (brecha declarada) | `04` §25, DP-2 | Decisión de producto + revisión de seguridad | Decidir si el empleado computa y con qué aislamiento |
| K-15/K-16 | `RESUELTO_DOCUMENTALMENTE` | `04` §22 (incluye lectura/comando) | `PENDIENTE_DE_PRUEBA`: directiva en vuelo + auditoría (I-13) | Prueba de integración del control en vivo |
| K-19 | `RESUELTO_DOCUMENTALMENTE` (superadora) | `04` §11, `03` §8, `05` §10 | `PENDIENTE_DE_PRUEBA` (ciclo de vida de la aprobación, I-04) | Mantener; usar K-19 como evidencia de mercado |
| K-20 | `DESCARTADO` | `ADR-003`, `04` §2–3 | — | No incorporar |
| K-18 | `RESUELTO_DOCUMENTALMENTE` | `04` §13/§15/§20 | `PENDIENTE_DE_PRUEBA`: recuperación tras caída del worker | Incluir en la prueba de DP-16 |
| K-L1 | `RESUELTO_DOCUMENTALMENTE` | `04` §21.2 (almacén acotado, clasificación, retención, por referencia), `05` §1, `06` §17 | `PENDIENTE_DE_PRUEBA`: DP-1 (costo, caída a mitad de nodo, borrado por retención) | Ejecutar la prueba comparativa de DP-1 |
| K-L2 | `RESUELTO_DOCUMENTALMENTE` | `04` §21.3 (regla de reejecución), `dev/CODING-STANDARDS` | `PENDIENTE_DE_PRUEBA`: dos reanudaciones no duplican efecto | Caso de prueba de idempotencia (I-05) |
| K-L3 | `RESUELTO_DOCUMENTALMENTE` | `04` §21.4 | `PENDIENTE_DE_PRUEBA`: ejecución pausada sobrevive a un cambio de grafo | Incluir en la prueba de versionado |
| K-T1 | `RESUELTO_DOCUMENTALMENTE` **(al 2026-10-19; antes figuraba solo como propuesta)** | `04` §22 (queries para leer, signals/updates para comandar), `05` §1 | `PENDIENTE_DE_PRUEBA`: consulta que no muta; comando con payload inválido rechazado | Prueba de contrato (I-13) |
| K-T2 | `RESUELTO_DOCUMENTALMENTE` **(el mecanismo de *patching* y el cutover por versión se agregaron en esta auditoría)** | `04` §24, `10` §10 | `PENDIENTE_DE_PRUEBA`: replay en CI | Prueba de replay en la tubería de integración |
| K-T3 | `RESUELTO_DOCUMENTALMENTE` (parcial en el detalle de backfill) | `03` §5.1 (base horaria, identidad de slot, misfire, solapamiento) | `PENDIENTE_DE_PRUEBA`: dos slots superpuestos; **el *backfill* explícito de slots históricos no está especificado** | Probar solapamiento; evaluar si el backfill se necesita |
| K-T4 | `RESUELTO_DOCUMENTALMENTE` | `10` §6, `04` §13, §24 | `PENDIENTE_DE_PRUEBA`: Continue-As-New con historia larga | Prueba de renovación de historia |
| K-T5 | `RESUELTO_DOCUMENTALMENTE` (2026-10-19) | Conjunto mínimo definido en `04` §22.1 (`TenantId`, `EmployeeId`, `ApprovalStatus`, `ApprovalType`, `ApprovalPriority`, `AssignedGroup`, `ApprovalDueAt`, `ApproverSubjectId` opcional) | Atributos definidos por decisión del responsable; **no son fuente de verdad** ni mecanismo de autorización. Queda `PENDIENTE_DE_PRUEBA`: registro con tipos y compatibilidad con la versión de Temporal (DP-20) |
| K-47/K-48 | `RESUELTO_DOCUMENTALMENTE` | `06` §2.1 | `PENDIENTE_DE_PRUEBA`: integración real con un IdP | Prueba con un proveedor de identidad |
| K-49 | `RESUELTO_DOCUMENTALMENTE` | `06` §2.1 | `PENDIENTE_DE_PRUEBA`: sesión que excede el máximo recibe 401 | Prueba de política de sesión |
| K-50/K-51 | `RESUELTO_DOCUMENTALMENTE` | `06` §7.1, `07` §8, `ADR-007` | `PENDIENTE_DE_PRUEBA`: fuga y sonda (I-02) | Prueba de fuga con herramienta que ejecuta código |
| K-52/K-53/K-54 | `RESUELTO_DOCUMENTALMENTE` | `05` §5.1–§5.2, `09` §6 | `PENDIENTE_DE_PRUEBA`: contrato de auditoría; versionado de la taxonomía (DP-13) | Probar exportación con nombres retirados |
| K-27 | `DESCARTADO` (se mantiene OPA) | `06` §4, `07` §4 | — | No incorporar |
| K-26 | `RESUELTO_DOCUMENTALMENTE` | `07` §8, `04` §8 | `PENDIENTE_DE_PRUEBA` (misma que I-02) | Usar K-26 como evidencia externa |
| K-29 | `RESUELTO_DOCUMENTALMENTE` (requisitos) | `07` §8.1, `06` §3 | `PENDIENTE_DE_DECISION`: consentimiento y UX (DP-10); `PENDIENTE_DE_PRUEBA`: revocación sin *fallback* | Diseñar el flujo de consentimiento |
| K-28 | `DESCARTADO` | `00` §8 | — | No incorporar |
| K-31..K-35/K-39 | `RESUELTO_DOCUMENTALMENTE` | `03` §5.1, `05` §11 | `PENDIENTE_DE_PRUEBA`: slot perdido y duplicado | Prueba de calendarización |
| K-36/K-37/K-38 | `RESUELTO_DOCUMENTALMENTE` | `05` §11 | `PENDIENTE_DE_PRUEBA`: reintento con el mismo identificador de evento | Prueba de deduplicación |
| K-40 | `PENDIENTE_DE_DECISION` (nota aplicada) | `03` §5.2, `04` §25, DP-3 | Decisión de producto + revisión de seguridad | Elegir el primer canal y sus requisitos |
| K-41 | `RESUELTO_DOCUMENTALMENTE` | `ADR-010`, `09` §12 | `PENDIENTE_DE_PRUEBA`: modelo no listado no se usa por alias | Probar política de modelos permitidos |
| K-42/K-43 | `RESUELTO_DOCUMENTALMENTE` (diseño de corte) | `09` §12.1, `10` §18 | `PENDIENTE_DE_DECISION`: umbrales (DP-4, DP-18); `PENDIENTE_DE_PRUEBA`: corte con efecto externo | Fijar umbrales y probar el corte |
| K-22/K-23/K-24 | `RESUELTO_DOCUMENTALMENTE` | `05` §21, `08` §13 | `PENDIENTE_DE_DECISION`: medio de almacenamiento (DP-11) | Elegir almacén y probar ciclo de vida |
| K-55/K-56 | `DESCARTADO` (ventaja propia) | `10` §1, `02` §10 | — | No incorporar |
| K-57/K-59/K-60/K-61 | `RESUELTO_DOCUMENTALMENTE` | `10` §17 | `PENDIENTE_DE_PRUEBA`: instalación limpia y rollback | Prueba de instalación y reversión |
| K-58 | `RESUELTO_DOCUMENTALMENTE` (nota) | `10` §12/§17 | `PENDIENTE_DE_DECISION`: alcance del panel de plataforma | Definir funciones administrativas |
| K-63 | `DESCARTADO` (con reserva de decisión de producto) | `01` §9, `06`, DP-2 (contexto) | Decisión de producto si un cliente lo pidiera | No incorporar |
| K-62 | `DESCARTADO` | `01` §6, `02` §11 | — | No incorporar |
| K-64 | `RESUELTO_DOCUMENTALMENTE` (el stream) / `PENDIENTE_DE_DECISION` (la multiplicidad de clientes) | `05` §20, `09` §3 | `PENDIENTE_DE_PRUEBA`: reconexión y orden | Probar el contrato de stream |
| K-65 | `RESUELTO_DOCUMENTALMENTE` | `05` §8–§22 | `PENDIENTE_DE_PRUEBA`: OpenAPI servido por la instancia y cabeceras de límite | Agregar a la prueba de contrato de API |
| K-66 | `DESCARTADO` (decisión propia distinta) | `ADR-001`, `ADR-006` | — | No incorporar |
| C-1..C-6 | `RESUELTO_DOCUMENTALMENTE` (ver A.6.bis) | — | Pruebas indicadas arriba | Ver A.6.bis |
| Hallazgos en curso de prueba | `PENDIENTE_DE_PRUEBA` | DP-1, DP-4, DP-7, DP-13, DP-15, DP-16, DP-18 | Requieren ejecución | Ver `INVARIANTES-Y-PRUEBAS.md` §1 |

## C.2 Resumen de propuestas (lo que sí se hizo o se propone)

Estados posibles: `Aplicado` (el contrato está en el normativo), `Aplicado parcialmente` (parte del contrato se agregó después, ver §C.1.bis), `Aplicado como propuesta` (el texto declara la brecha/pregunta, sin decisión), `Propuesto` (redactado, sin efecto normativo) y `Pendiente`. **`Aplicado` describe el estado del documento, no una validación técnica.**

| Propuesta | Descripción | Prioridad | Documentos | Estado |
|---|---|---|---|---|
| P-01 | Declarar el **checkpointer** de LangGraph: dónde vive el estado, clasificación, retención, "por referencia"; regla de **re-ejecución de nodos** e idempotencia de efectos previos a `interrupt`; compatibilidad de grafos en vuelo | **P0** | `04`, `05`, `06` | Aplicado |
| P-02 | Inventario de **licencias del stack** + reglas de incorporación de dependencias (license gate, SBOM, lista de revisión, prohibiciones) | **P0** | `STACK-LICENCIAS` (nuevo), `06` §18, `ADR-011` | Inventario y regla aplicados; `ADR-011` **Aceptado el 2026-10-19** (antes `Propuesto`) y **pendientes** la puerta en CI, el SBOM y la verificación transitiva |
| P-03 | Requisitos de **identidad empresarial**: SSO con verificación de dominio, SCIM, MFA obligatoria, política de sesión, revocación, mapeo grupos→roles | P1 | `06` §2 | Aplicado |
| P-04 | **Taxonomía de acciones auditadas** + cobertura "toda operación deja fila" + filtro/export | P1 | `05` §5, `09` §6 | Aplicado |
| P-05 | **Semántica de calendarización**: zona horaria IANA, jitter, clave por slot, misfire/catch-up, política de solapamiento, límites de corrida, pausa global; dedupe por event-id en webhooks | P1 | `03` §5, `05` §11, `04` | Aplicado |
| P-06 | **Stream de eventos de ejecución** (progreso en vivo, reconexión, orden, autorización) como base de consola y cola de aprobaciones | P1 | `05` (nueva), `09` §3 | Aplicado |
| P-07 | **Cola de aprobaciones**: read model, aging, expiración, delegación, separación de funciones, revocación de una aprobación vigente | P1 | `05` §10, `03` §8 | Aplicado |
| P-08 | **Contrato de artefactos y archivos**: registro, propietario, clasificación, retención, acceso, límites, almacenamiento por referencia | P1 | `05` (nueva), `08` §13 | Aplicado |
| P-09 | **Control de ejecución en vivo**: pausar/reanudar, inyectar directiva, interrumpir, terminar; autorización y auditoría | P1 | `04` (nueva), `05` | Aplicado |
| P-10 | **Delegación a subagentes** (si se usa): profundidad máxima, herencia de permisos, presupuesto, trazas | P1 | `04` (nueva) | Aplicado (regla) |
| P-11 | **Modos de exposición de credenciales** + redacción de eco + sondas de verificación | P1 | `06` §7, `07` §8 | Aplicado |
| P-12 | **Cuotas y corte** por tenant/empleado/tarea + metering facturable | P1 | `09` §12, `10` (nueva) | Aplicado |
| P-13 | **Conectores con identidad de usuario** (on-behalf-of): consentimiento, caducidad, revocación, auditoría | P1 | `07` (nueva), `06` §3 | Aplicado |
| P-14 | **Brecha declarada**: ¿el empleado necesita entorno de cómputo propio para producir entregables? (decisión, no diseño) | P1 (decisión) | `04` (nueva), `DECISIONES-PENDIENTES` | Aplicado como brecha declarada |
| P-15 | **Empaquetado de definiciones** (export/import diffable revisable) sin mover la autoridad al repositorio | P2 | `03` (nueva) | Aplicado como propuesta |
| P-16 | **Semántica de decisión**: `REQUIRE_APPROVAL` sostiene (no falla); granularidad a nivel de argumentos; precedencia de reglas | P1 | `06` §4, `03` §9 | Aplicado |
| P-17 | **Ciclo de instalación y actualización** en instalación privada (bootstrap idempotente, auto-diagnóstico, rollback de release, cierre de registro) + versionado de workflows/workers | P2 | `10` | Aplicado |
| P-18 | Requisitos mínimos de **canal** (vinculación de identidad, política de acceso al hilo, autorización por acción, stop) | P2 | `03` §5 (nota), `DECISIONES-PENDIENTES` | Aplicado (nota) |
| P-19 | Publicar **OpenAPI** por instancia y cabeceras de rate limit | P2 | `05` | Aplicado (nota) |
| P-20 | **Defectos documentales**: manifiesto (frase corrupta), referencias a secciones del anexo supersedido, sincronización `es/` | P2 | `00-INDEX`, `DOCUMENT-MANIFEST`, `SPIKE`, anexo | Aplicado parcialmente en la revisión del 2026-10-19; **completado en la auditoría del 2026-10-19** (contadores, espejo del manifiesto, espejos en español) |
| P-21 | **Semántica de lectura frente a comando** en la capa durable (*query* para leer, *signal*/*update* para comandar, con payload validado) | P1 | `04` §22, `05` §1 | Aplicado en la auditoría (cierra el avance parcial de K-T1) |
| P-22 | ***Patching* de workflows y cutover por versión de worker** como implementación de referencia del versionado durable | P1 | `04` §24 | Aplicado en la auditoría (cierra el avance parcial de K-T2) |
| P-23 | **Modalidades comerciales separadas del límite arquitectónico** (instalación privada vs SaaS futuro, sin habilitar multi-tenencia dinámica) | P1 | `01` §7.1, `10` §1 | Aplicado en la auditoría |
| P-24 | **Formalización de `ADR-011` en capas** (decisión de producto / aceptación formal / compatibilidad técnica / verificación de licencias / validación legal) y **renombre** de los componentes salientes en los normativos | P1 | `ADR-011`, `ADR-007`, `02` §4, `04`, `05` §1, `06` §7, `07`, `09` §2, `10` §1–§3, `00-INDEX`, DP-17 | Aplicado; `ADR-011` **Aceptado el 2026-10-19** y **renombres aplicados** (registro `REGISTRO-CAMBIOS-2026-10-19-ADR-011-ACEPTADO`); quedan las pruebas de compatibilidad (DP-5, DP-6) |
| P-25 | **Metadatos de trazabilidad** por documento (`Created`/`Updated`, `Date` en ADR, frontmatter en los documentos de referencia) | P2 | Todos los normativos (EN/ES), `DECISIONES-PENDIENTES` | Aplicado en la auditoría; las fechas no registradas se declaran como tales |
| P-26 | **Matriz de invariantes y pruebas** con fuente normativa, riesgo, prueba, estado y fase | P1 | `INVARIANTES-Y-PRUEBAS.md` (nuevo) | Aplicado en la auditoría |
| P-27 | **Verificación de paridad inglés↔español automatizada** en el repositorio (no solo ejecutada a mano) | P2 | `docs/es/**` | **Parcialmente aplicado (2026-10-19)** por autorización del responsable: los validadores viven en `tools/docs-verify/` y se ejecutan con `python3 tools/docs-verify/verify_docs.py` (enlaces, rutas documentadas, inventarios/manifiestos/ADR y paridad). El **workflow de CI está preparado y pendiente de publicar**: el token de publicación no tiene el alcance `workflow` de GitHub. **No** es prueba de consistencia semántica ni validación técnica |

## C.3 Descartes explícitos (capacidades evaluadas y **no** incorporadas)

| Capacidad Kortix | Por qué se descarta |
|---|---|
| Motor de workflows de PostgreSQL/cola con `SKIP LOCKED` (K-20) | Nuestra necesidad de esperas de días, timers y recuperación excede una cola; Temporal ya es decisión válida (`ADR-003`). Ninguna necesidad identificada que lo justifique. |
| Completado por modelo / plantillas de stack | Irrelevante. |
| Multi-tenancy compartida con RLS (K-66) | Contradice `ADR-001` (aislamiento por despliegue) y complica la promesa de aislamiento de credenciales. Se mantiene la decisión. |
| Consulta SQL directa a la base desde el "empleado" (K-21) | El acceso a datos debe pasar por herramientas tipadas y política, no por acceso directo a tablas. |
| "Razonamiento" propio / entrenamiento de modelos | Fuera de alcance; el producto no es un laboratorio de modelos. |
| Marketplace de skills/prompts (K-11) | Sin demanda identificada en el MVP; la curación de definiciones es responsabilidad del control plane. |
| Servidor MCP universal / dirección entrante (K-28) | Ya excluido como non-goal (`00` §8). |
| Apps hospedadas / PaaS (K-62) | Cambia la naturaleza del producto; no hay necesidad que lo justifique. |
| Captura 24/7 del puesto de trabajo (K-63) | Riesgo legal y reputacional desproporcionado; **decisión de producto pendiente** por si un cliente lo pidiera (ver `DECISIONES-PENDIENTES`). |
| Telemetría de puesto de trabajo / device management | Ídem K-63. |
| Clientes desktop/mobile/TUI (K-64) | P2: primero el contrato de stream y la consola web; la multiplicidad de clientes no aporta al MVP. |
| Billing por créditos y planes de consumo prepago (K-42) | Se adopta solo el **principio** (medición y corte); el modelo comercial concreto es decisión de negocio, no arquitectura documentada. |
| `network_egress` declarativo sin enforcement (K-59/MKT) | Declaración sin mecanismo: si se hace egress, debe aplicarse de verdad o no declararse. |

## C.4 Cobertura por documento (después de los cambios de P-01..P-20)

| Documento | Efecto del cruce |
|---|---|
| `00-ARCHITECTURE-INDEX.md` | Se agregó el registro de documentos de referencia y la nota de cambios; sin cambios de principios |
| `01-PRODUCT-VISION.md` | Sin cambios (alcance intacto) |
| `02-ENTERPRISE-ARCHITECTURE.md` | Sin cambios de límites; el cruce confirmó la separación control/ejecución |
| `03-DOMAIN-MODEL.md` | Ampliado: semántica de Trigger/calendarización (P-05), semántica de decisión de política (P-16), empaquetado de definiciones (P-15) |
| `04-RUNTIME-EXECUTION-ARCHITECTURE.md` | Ampliado: checkpointer y re-ejecución (P-01), control en vivo (P-09), subagentes (P-10), versionado de workflows (P-17), preguntas abiertas (P-14, P-18) |
| `05-PERSISTENCE-API-CONTRACTS.md` | Ampliado: almacén del checkpointer (P-01), auditoría (P-04), aprobaciones (P-07), artefactos (P-08), stream de eventos (P-06), OpenAPI (P-19) |
| `06-SECURITY-GOVERNANCE.md` | Ampliado: identidad empresarial (P-03), semántica de decisión (P-16), modos de exposición de credenciales (P-11), conectores de usuario (P-13) |
| `07-MCP-INTEGRATION-ARCHITECTURE.md` | Ampliado: conectores de usuario (P-13), exposición de credenciales (P-11) |
| `08-MEMORY-KNOWLEDGE-CONTEXT.md` | Ampliado: artefactos como fuente de contexto y su retención (P-08) |
| `09-OBSERVABILITY-EVALUATION.md` | Ampliado: stream de eventos (P-06), cuotas y corte (P-12), auditoría vs acciones (P-04), modelos permitidos |
| `10-DEPLOYMENT-OPERATIONS.md` | Ampliado: instalación/actualización privada (P-17), metering comercial (P-12) |
| ADRs | **Ninguna decisión arquitectónica previamente aceptada fue cambiada.** `ADR-007` recibe una *nota de implementación* (qué producto satisface "Vault o equivalente"), `ADR-011` se agrega con sus capas de formalización separadas y **pasa a `Accepted` el 2026-10-19** por decisión del responsable, y todos los ADR ganan su campo de fecha. Con la aceptación, los cambios de nombre de componentes en los normativos dejaron de ser anotaciones y son **sustituciones normativas** (`00-INDEX`, `02` §4, `04`, `05` §1, `06` §7, `07`, `09` §2, `10` §1–§3, `ADR-007` y espejos ES) |
| `docs/es/**` | Espejo actualizado en los mismos puntos (mitigación de C-4) |

## C.5 Verificación posterior (2026-10-19)

Revisión de seguimiento sobre el estado **publicado** (commit `8c881ea`), pedida expresamente para comprobar si las correcciones declaradas por la auditoría seguían vigentes en los archivos. Informe: `VERIFICACION-POST-AUDITORIA-2026-10-19.md`; cambios: `REGISTRO-CAMBIOS-2026-10-19-VERIFICACION-POST-AUDITORIA.md`.

Estados posibles: `RESUELTO` (corregido en esta revisión), `YA_ESTABA` (la corrección previa seguía vigente; **no reproducible** como hallazgo), `ABIERTO` (pendiente de decisión humana), `NO_APLICA` (la mención es histórica, comparativa o de investigación y **debe permanecer**).

| ID | Hallazgo residual | Archivo · sección | Qué afirmaba la auditoría previa | Estado encontrado en el repositorio | Corrección aplicada | Validación | Riesgo que permanece |
|---|---|---|---|---|---|---|---|
| **V-1** | Los **dos manifiestos** describían `ADR-011` con su estado **anterior** a la aceptación | `DOCUMENT-MANIFEST.md` §7.0 fila 22 · `docs/es/DOCUMENT-MANIFEST.md` §7.0 fila 22 | La auditoría corrigió inventarios y contadores; la aceptación actualizó la bitácora pero **no** la columna de estado de la tabla de los 27 normativos | `**Proposed**` / `**Propuesto**` | `**Accepted** (2026-10-19)` / `**Aceptado** (2026-10-19)` | `verify-all.py` §3 (estados EN=ES) y §7 (contadores); diff revisado | Ninguno |
| **V-2** | `00-INDEX.md` afirmaba que no se reescribe código de **Hermes-OS** que "ya funciona" | `00-INDEX.md` §Principios de decisión | Fuera del alcance de la auditoría: no trató afirmaciones sobre **código reutilizable** | Afirmación de código existente y reutilizable, **sin respaldo** en el paquete | Dos viñetas: plataforma **desde cero** (base = paquete documental) y **Hermes-OS es un sistema aparte**, relación pendiente (**DP-19**) | Barrido de menciones + diff | **Abierto:** decisión del responsable (DP-19) |
| **V-3** | `EXPLICACION-NO-TECNICA.md` afirmaba "ya tenemos un proyecto base… reutilizamos lo que ya funciona" | `EXPLICACION-NO-TECNICA.md` §6 | Igual que V-2 | Afirmación de base de código reutilizable, no verificable | Reescrito: **sin código propio** y **sin reutilizar código de sistemas anteriores**; se aprovecha el **diseño**; nota sobre "Hermes-OS" | Diff revisado; §9.3 del encargo | Ninguno documental; alcance del reuso en DP-19 |
| **V-4** | **DP-17** se contradecía: estado "cerrada" vs descripción "todavía no es regla vigente" | `DECISIONES-PENDIENTES.md` DP-17 | La aceptación actualizó estado y capas, **no** la descripción | Descripción con la frase previa a la aceptación | Descripción dividida en **histórico / actual / pendiente** | §9.4 del encargo (coherencia resumen↔descripción) | Ninguno |
| **V-5** | **DP-6** presentaba Vault, Grafana, Loki y MinIO como componentes **del stack objetivo actual** | `DECISIONES-PENDIENTES.md` DP-6 | La aceptación renombró los **normativos**; DP-6 (referencia) quedó sin revisar | Presente del indicativo sobre componentes ya sustituidos | "**Stack evaluado**… hoy **fuera del stack de referencia**", con destino por componente y aviso de que **ninguna sustitución está validada** | Diff revisado; §7 del encargo | Compatibilidad y validación legal siguen **abiertas** (DP-5, DP-6) |
| **V-6** | `ADR-011` §Context hablaba del stack como **actual** ("The current reference stack contains…") | `docs/adr/ADR-011-free-licence-stack.md` §Context · espejo ES | No tratado | Contexto previo a la aceptación, sin aclaración | **Nota** añadida (el contexto no se reescribe): describe la situación **a la fecha de la decisión** y remite a *Consequences* | Diff revisado | Ninguno |
| **V-7** | Presunta persistencia de 26 documentos, ruta `docs/DOCUMENT-MANIFEST.md` y `Redis`/`Vault` en el stack de `00-INDEX.md` | `00-INDEX.md` | La auditoría declaraba haberlas corregido | **No reproducible:** el archivo ya dice **27**, cita `DOCUMENT-MANIFEST.md` (raíz) y muestra **Valkey**/**OpenBao** desde `51f7f686` (recuento y ruta) y `8c881ea` (stack). Pero el histórico **no estaba separado** del vigente | Bloque **Trazabilidad del recuento** (26 inicial → **27** vigente) | Lectura del archivo publicado + `git log -L` de las líneas | Ninguno |
| **V-8** | Menciones de componentes salientes en documentos históricos, de investigación y comparativos | `KORTIX-INVESTIGACION-v0.14.3.md`, `KORTIX-CROSS-MATRIX.md`, `STACK-LICENCIAS.md`, `KORTIX-analisis-y-licencias.md`, anexo supersedido, registros previos | — | **Correctas y necesarias** en su contexto | **NO_APLICA**: no se modifican (regla 4 del encargo) | Barrido por patrón con clasificación por archivo (informe §5) | Lectura cruzada: mitigada por las notas de estado de cada documento |

## C.6 Decisiones del responsable del producto (2026-10-19)

Ocho puntos abiertos quedaron resueltos por el responsable del producto. **Ninguna sustitución queda validada técnicamente y la distribución comercial sigue bloqueada.**

| # | Decisión | Capa alcanzada | Dónde quedó | Qué sigue pendiente |
|---|---|---|---|---|
| D-1 | Hermes-OS: **referencia de diseño**, no sistema a integrar | Decisión **cerrada** | `00-INDEX.md`, `EXPLICACION-NO-TECNICA.md`, DP-19 | Nada; si algún día se propone integrarlo, exige repositorio verificable, contratos y decisión expresa (y ADR si cambia límites) |
| D-2 | Autorizar **pruebas de compatibilidad** y **preparar** la revisión de licencias; distribución comercial **bloqueada** | Autorización dada | DP-5, DP-6, `COMPATIBILIDAD-Y-LICENCIAS-PREPARACION.md` | E-1…E-6: matriz con pruebas reproducibles, inventario directo/transitivo, SBOM, avisos, imágenes por digest y revisión **legal** (que Hermes no emite) |
| D-3 | **Valores iniciales** del MVP (checkpoints, aprobaciones, alertas, costo, presupuesto, delegación, retenciones, RPO/RTO, calidad, seguridad) | Decisión adoptada + diseño documentado | `04` §16/§21.2/§23, `09` §12.1/§13, `10` §9, `01` §8, DP-18 | Validación en producción con evidencia; quién puede cambiar cada valor |
| D-4 | Validadores documentales **publicados**; CI **preparada y pendiente de publicar** | **Parcialmente aplicado** | `tools/docs-verify/`, P-27. El workflow no se pudo publicar: el token de publicación no tiene el alcance `workflow` de GitHub | Publicar `.github/workflows/docs-verify.yml` con un token que tenga ese alcance (o subirlo desde la interfaz web); recordando que un resultado limpio no prueba semántica ni valida tecnología |
| D-5 | **DP-1**: persistencia por paso en PostgreSQL, esquema de runtime separado | Decisión adoptada (**`ADR-012`**) | `04` §21.2, `05` §1, DP-1, I-15 | Pruebas de fallo: costo por paso, caída a mitad de nodo, reanudación, retención, efectos no duplicados |
| D-6 | **DP-2**: sin ejecución arbitraria en el proceso principal; servicio restringido de artefactos | Decisión adoptada (**`ADR-013`**) | `04` §25 (punto 1), DP-2, I-16 | Implementación del servicio y pruebas de aislamiento/egreso/credenciales |
| D-7 | **Search Attributes** mínimos para localizar aprobaciones, sin ser fuente de verdad | Decisión adoptada + contrato documentado | `04` §22.1, `09` §2, DP-20, I-17 | Prueba de contrato: registro con tipos en el namespace y prueba negativa de autorización |
| D-8 | Modalidad **SaaS**: dedicada por cliente en la primera etapa; compartida solo tras validar el aislamiento | Decisión de producto | `01` §7.1, DP-7 | Validar el aislamiento y cerrar el **ADR específico** antes de multi-tenencia compartida |

**Nota de proceso (D-5, D-6 y la semántica de aprobaciones):** las tres cambiaban una frontera o un contrato normativo, así que se formalizaron con `ADR-012`, `ADR-013` y `ADR-014` **antes** de tocar los normativos, conforme a la regla 2 de `DECISIONES-PENDIENTES.md`. `ADR-014` reemplaza el "rechazo por defecto" que `05` §10.1 tenía desde la revisión aditiva del mismo día: **sin cancelación ni rechazo automáticos**.
