# Manifiesto de documentos

> Espejo en español de `DOCUMENT-MANIFEST.md` (raíz del paquete). El original **inglés** es el normativo; este archivo existe para lectura humana y debe reflejar fielmente su contenido. Verificación de paridad: `docs/reference/AUDITORIA-CONSISTENCIA-2026-10-19.md` §7.

| # | Archivo | Rol |
|---:|---|---|
| 1 | `docs/architecture/00-ARCHITECTURE-INDEX.md` | Mapa de arquitectura y reglas de autoridad |
| 2 | `docs/architecture/01-PRODUCT-VISION.md` | Definición de producto y alcance |
| 3 | `docs/architecture/02-ENTERPRISE-ARCHITECTURE.md` | Arquitectura del sistema |
| 4 | `docs/architecture/03-DOMAIN-MODEL.md` | Modelo de dominio |
| 5 | `docs/architecture/04-RUNTIME-EXECUTION-ARCHITECTURE.md` | Runtime/ejecución |
| 6 | `docs/architecture/05-PERSISTENCE-API-CONTRACTS.md` | Persistencia y APIs |
| 7 | `docs/architecture/06-SECURITY-GOVERNANCE.md` | Seguridad/gobernanza |
| 8 | `docs/architecture/07-MCP-INTEGRATION-ARCHITECTURE.md` | Integración MCP/herramientas |
| 9 | `docs/architecture/08-MEMORY-KNOWLEDGE-CONTEXT.md` | Memoria/RAG/contexto |
| 10 | `docs/architecture/09-OBSERVABILITY-EVALUATION.md` | Observabilidad/evaluación |
| 11 | `docs/architecture/10-DEPLOYMENT-OPERATIONS.md` | Despliegue/operaciones |
| 12 | `docs/adr/ADR-001-deployment-model.md` | Decisión de despliegue |
| 13 | `docs/adr/ADR-002-langgraph.md` | Decisión de LangGraph |
| 14 | `docs/adr/ADR-003-temporal.md` | Decisión de Temporal |
| 15 | `docs/adr/ADR-004-mcp.md` | Decisión de MCP |
| 16 | `docs/adr/ADR-005-opa-policy-engine.md` | Decisión de política |
| 17 | `docs/adr/ADR-006-postgresql.md` | Decisión de persistencia |
| 18 | `docs/adr/ADR-007-secrets-management.md` | Decisión de secretos |
| 19 | `docs/adr/ADR-008-dlp-pii-protection.md` | Decisión de DLP |
| 20 | `docs/adr/ADR-009-evaluation-framework.md` | Decisión de evaluación |
| 21 | `docs/adr/ADR-010-llm-gateway.md` | Decisión de gateway de LLM |
| 22 | `docs/adr/ADR-011-free-licence-stack.md` | **Aceptado** (2026-10-19) — política de stack con licencias libres únicamente |
| 23 | `docs/development/DEVELOPMENT-GUIDELINES.md` | Flujo de trabajo de ingeniería |
| 24 | `docs/development/CODING-STANDARDS.md` | Estándares de codificación |
| 25 | `docs/development/TESTING-STRATEGY.md` | Estrategia de pruebas |
| 26 | `docs/development/SECURITY-RULES.md` | Reglas de seguridad |
| 27 | `docs/development/CLAUDE-CODE-GUIDELINES.md` | Contrato para agentes de codificación con IA |

## 7. Conjunto documental

El paquete de arquitectura contiene 27 archivos: 11 documentos de arquitectura, 11 ADR y 5 guías de desarrollo. Son la línea base normativa; `docs/es/` los espeja en español para lectura humana.

### 7.1 Raíz del paquete

| Archivo | Rol |
|---|---|
| `README.md` | Punto de entrada del repositorio: qué es el paquete y cómo leerlo |
| `00-INDEX.md` | Índice de trabajo del proyecto: fuentes de verdad, stack objetivo, principios de decisión |
| `DOCUMENT-MANIFEST.md` | Este archivo: inventario, autoridad y registro de revisiones |
| `EXPLICACION-NO-TECNICA.md` | Explicación en lenguaje llano para lectores no técnicos |

### 7.2 Inventario completo del paquete (verificado el 2026-10-19)

| Categoría | Archivos |
|---|---|
| Normativos (inglés): `docs/architecture` (11), `docs/adr` (11), `docs/development` (5) | 27 |
| Espejos en español: `docs/es/architecture`, `docs/es/adr`, `docs/es/development` | 27 |
| Espejos en español de los archivos de raíz: `docs/es/README.md`, `docs/es/DOCUMENT-MANIFEST.md` | 2 |
| Raíz del paquete (inglés) | 4 |
| Referencia no normativa: `docs/reference/` | 14 |
| **Total de archivos `.md`** | **74** |

El material de referencia **no normativo** vive en `docs/reference/` y está listado en `00-ARCHITECTURE-INDEX.md` §10:

| Archivo | Rol |
|---|---|
| `docs/reference/RUNTIME-EXECUTION-FULL-ANNEX-ARCHITECTURE-03.md` | Detalle operativo heredado (supersedido) |
| `docs/reference/SPIKE-FASE1-FOUNDATION-investigacion.md` | Plan de validación de la fase Foundation |
| `docs/reference/KORTIX-analisis-y-licencias.md` | Evaluación Kortix/Suna como base o referencia y análisis de licencias |
| `docs/reference/KORTIX-INVESTIGACION-v0.14.3.md` | Investigación de capacidades de Kortix/Suna (commit fijado, evidencia por capacidad) |
| `docs/reference/KORTIX-CROSS-MATRIX.md` | Inventario documental, matriz de cruce, brechas y propuestas (con el estado de auditoría 2026-10-19 por hallazgo) |
| `docs/reference/STACK-LICENCIAS.md` | Inventario de licencias del stack objetivo y riesgo comercial |
| `docs/reference/REGISTRO-CAMBIOS-DOCUMENTALES-2026-10-19.md` | Registro de cambios de la revisión del 2026-10-19 |
| `docs/reference/REGISTRO-CAMBIOS-2026-10-19-AUDITORIA.md` | Registro de cambios de la auditoría de consistencia del 2026-10-19 |
| `docs/reference/AUDITORIA-CONSISTENCIA-2026-10-19.md` | Informe de auditoría de consistencia (alcance, hallazgos por gravedad, evidencia, riesgos abiertos) |
| `docs/reference/INVARIANTES-Y-PRUEBAS.md` | Invariantes arquitectónicos, su fuente normativa y la prueba que exige cada uno |
| `docs/reference/REGISTRO-CAMBIOS-2026-10-19-ADR-011-ACEPTADO.md` | Registro de cambios de la aceptación de `ADR-011` y de los renombres de componentes que habilita |
| `docs/reference/VERIFICACION-POST-AUDITORIA-2026-10-19.md` | Informe de verificación posterior a la auditoría: qué se comprobó, qué resultó reproducible, la cuestión del código reutilizable y los riesgos abiertos |
| `docs/reference/REGISTRO-CAMBIOS-2026-10-19-VERIFICACION-POST-AUDITORIA.md` | Registro de cambios de la verificación posterior (V-1…V-8) |
| `docs/reference/DECISIONES-PENDIENTES.md` | Decisiones abiertas que requieren prueba, revisión legal o juicio de producto |

## 8. Registro de revisiones

- **2026-09-21** — línea base normativa v0.1.0 (26 archivos).
- **2026-10-19** — revisión aditiva tras el cruce con Kortix/Suna: secciones ampliadas en `03`, `04`, `05`, `06`, `07`, `08`, `09`, `10`; ningún ADR modificado; ningún principio ni nombre de contrato cambiado. Detalle: `docs/reference/REGISTRO-CAMBIOS-DOCUMENTALES-2026-10-19.md`.
- **2026-10-19 (posterior)** — se agrega `ADR-011` como **Propuesto**: stack con licencias libres únicamente, según la decisión del responsable de producto. Su aceptación (y las consiguientes actualizaciones de nombres de componentes en `00-INDEX`, `02` §4, `05` §1, `09` §2, `ADR-007` y los espejos en español) quedaba pendiente. Detalle: `docs/reference/DECISIONES-PENDIENTES.md` DP-17. **(Aceptado ese mismo día: ver la entrada siguiente.)**
- **2026-10-19 (auditoría)** — auditoría de consistencia de todo el paquete: se corrigen inventarios y cantidades (el paquete son 27 archivos normativos, no 26), se agregan metadatos `Creado`/`Actualizado`/`Fecha` a todas las cabeceras normativas, se aclara la frontera de durabilidad LangGraph/Temporal en `04` §21.2, se documentan la semántica de lectura frente a comando y el *patching* de Temporal, se separan las modalidades comerciales del límite arquitectónico en `01` §7.1, se declaran las capas de formalización de ADR-011 y se pone al día este espejo. Evidencia y hallazgos: `docs/reference/AUDITORIA-CONSISTENCIA-2026-10-19.md`.
- **2026-10-19 (ADR-011 aceptado)** — el responsable de producto aceptó `ADR-011` (**Propuesto → Aceptado**) y con eso la sustitución pasó a ser **normativa**: los componentes reemplazados fueron renombrados en `00-INDEX.md`, `02` §4, `04`, `05` §1, `06` §7, `07`, `09` §2, `10` §1–§3, la nota de implementación de `ADR-007`, los espejos en español y la explicación no técnica. **No se cambió ninguna decisión arquitectónica ni se cerró ninguna prueba.** Detalle: `docs/reference/REGISTRO-CAMBIOS-2026-10-19-ADR-011-ACEPTADO.md`.
- **2026-10-19 (verificación posterior)** — revisión de seguimiento de los archivos **publicados**, que encontró residuos que las revisiones anteriores no alcanzaron: los dos manifiestos seguían mostrando `ADR-011` con su estado anterior a la aceptación (ahora `Aceptado`), `DP-17` se contradecía con su propio estado, `DP-6` presentaba componentes sustituidos como el stack actual, el §Contexto de `ADR-011` no tenía su nota de fecha y `00-INDEX.md` no separaba el recuento histórico (26) del vigente (**27**). Se quitaron las afirmaciones sobre **código reutilizable**: la plataforma se construye **desde cero** sobre este paquete documental y la cuestión de Hermes-OS queda registrada como **DP-19**. **No se cambió ninguna decisión arquitectónica ni se cerró ninguna prueba** (DP-5 y DP-6 siguen abiertas). Informe: `docs/reference/VERIFICACION-POST-AUDITORIA-2026-10-19.md`; trazabilidad: `docs/reference/REGISTRO-CAMBIOS-2026-10-19-VERIFICACION-POST-AUDITORIA.md`.
