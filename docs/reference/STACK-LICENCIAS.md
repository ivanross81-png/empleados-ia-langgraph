---
type: reference
status: active
created: 2026-10-19
updated: 2026-10-19
tags: [digital-employee, licencias, dependencias, comercializacion, riesgo-legal, stack]
---

# Stack objetivo — inventario de licencias y compatibilidad con comercialización propietaria

> **No normativo.** Complementa [[00-ARCHITECTURE-INDEX|la arquitectura canónica]] (principios, non-goals y ADRs) y [[KORTIX-analisis-y-licencias|el análisis de Kortix/Suna]].
>
> **Por qué existe este documento:** el proyecto se comercializa como **producto propietario cerrado**, en modalidad **SaaS multiempresa** e **instalación privada en cliente**. Esa condición obliga a revisar la licencia de **cada** componente del stack objetivo y de sus dependencias relevantes. Antes de este documento esa verificación no estaba registrada en ningún lado: era una **brecha real** (ver `DECISIONES-PENDIENTES.md`).
>
> **No es asesoramiento legal.** Es un inventario técnico de licencias con fuentes verificables y una clasificación preliminar de riesgo. Las decisiones marcadas como pendientes requieren validación legal.

## 0. Método, fecha y limitaciones

- **Fecha de verificación:** 2026-10-19 (UTC).
- **Método:** lectura del archivo de licencia real (`LICENSE`/`COPYING`/`LICENSE.txt`) en la rama o tag estable del repositorio oficial vía `raw.githubusercontent.com`, cruzado con el campo `license` de la API de GitHub y, para paquetes Python, con el metadato `license` / `license_expression` de PyPI.
- **Versiones:** se registra la última versión estable observada en esa fecha, como referencia de "versión concreta que se pretende usar". La versión exacta a fijar se decide en el `pyproject.toml`/imágenes del repositorio propio, no en este documento.
- **Limitaciones declaradas (importante):**
  1. Solo se auditó el **primer nivel** de dependencias relevantes. El **árbol transitivo completo no está auditado** → se requiere **SBOM + escaneo de licencias en CI** antes de distribuir (ver §4).
  2. Varios componentes tienen **licencia dual por directorio** (núcleo permisivo + carpeta `enterprise/`/`ee/` propietaria). El riesgo no es la licencia, es **usar una feature que vive en esa carpeta**. Se marca explícitamente.
  3. La licencia de una **imagen Docker** puede diferir de la del repositorio fuente (imágenes oficiales con componentes extra). Verificar por digest antes de empaquetar.
  4. Algunas licencias (BUSL, RSALv2, SSPLv1, ELv2) **no son open source** y sus restricciones aplican al **uso**, no solo a la distribución.

## 0.bis Política: licencias libres exclusivamente (directiva del responsable de producto, 2026-10-19)

> **Decisión del responsable del producto:** *"usemos licencias libres exclusivamente"* (primera formulación: *"tenemos que dar prioridad a licencias de uso libre"*).
> **Estado:** redactada como **`ADR-011 — Stack con licencias libres únicamente`** (estado **Propuesto**, `docs/adr/ADR-011-free-licence-stack.md` y espejo `docs/es/adr/`). Hasta su aceptación, este documento la aplica como **criterio de selección**; su conversión en regla normativa del stack queda en `DECISIONES-PENDIENTES.md` **DP-17**.

**Regla:** solo componentes bajo **licencias libres aprobadas por OSI/FSF**. Las licencias meramente *source-available* (BUSL, RSALv2, SSPLv1, ELv2, "commons clause", cualquier *Additional Use Grant*) quedan **prohibidas sin excepción** de camino: restringen el uso, no solo la distribución.

**Orden de preferencia dentro de las licencias libres:**

| Prioridad | Licencias | Regla |
|---|---|---|
| **1 — Libre permisiva** | **MIT, BSD-2/3-Clause, Apache-2.0, MPL-2.0, PostgreSQL License, ISC, LGPL** | Elección por defecto. MPL/LGPL: conservar el componente como archivo separado y sus avisos. |
| **2 — Libre copyleft** | **AGPL-3.0, GPL-3.0** | Son libres, pero **no integran el stack de referencia**: imponen obligaciones sobre un bundle cerrado distribuido (fuente del componente + avisos; AGPL además ante uso por red de una obra modificada). Solo entran con **excepción explícita en un ADR** que justifique una capacidad que ningún componente permisivo provea. |
| **3 — Prohibida** | BUSL-1.1, RSALv2, SSPLv1, ELv2, "commons clause", licencias con *Additional Use Grant*, y toda licencia que impida ofrecer el producto como servicio hospedado o exija un proveedor exclusivo de cómputo/inferencia | Incompatible con producto propietario cerrado comercializado como SaaS. **Sin excepciones.** |

**El stack de referencia queda 100% permisivo.** Sustituciones obligatorias (verificadas 2026-10-19):

| Componente actual | Licencia | Sustituto libre permisivo | Estado |
|---|---|---|---|
| **Redis 8.10.2** | RSALv2 · SSPLv1 · AGPLv3 (ninguna permisiva) | **Valkey** — BSD-3-Clause | **Sustituir** (obligatorio) |
| **HashiCorp Vault** | BUSL-1.1 | **OpenBao** — MPL-2.0, compatible a nivel de API | **Sustituir** (obligatorio; no cambia ADR-007: el ADR dice "Vault o equivalente KMS-backed") |
| **Grafana** (paneles) | AGPL-3.0 | **Perses** — Apache-2.0 | **Sustituir** (obligatorio) |
| **Loki** (logs) | AGPL-3.0 | **VictoriaLogs** — Apache-2.0 · **OpenSearch** — Apache-2.0 | **Sustituir** (obligatorio; antes de fijar, evaluar operación) |
| **MinIO** (object store de artefactos) | AGPL-3.0 | **SeaweedFS** — Apache-2.0 · S3 del cliente · LOB en PostgreSQL | **Sustituir** (obligatorio si se introduce object store) |
| **Grafana** sobre Prometheus (métricas) | AGPL-3.0 | **Perses** (Apache-2.0) sobre Prometheus / **VictoriaMetrics** (Apache-2.0) | **Sustituir** |
| **Ceph** (si se necesita almacenamiento distribuido) | LGPL-2.1 | — | Aceptable (prioridad 1) |
| `enterprise/` · `ee/` · `wl/` de LiteLLM, Langfuse, Weaviate | Propietaria | — | **No activar** (no es una dependencia, es una feature de pago) |

**Alcance de la política:** aplica a todo componente que se distribuya o se ejecute dentro del producto (runtime, servicios, imágenes base, herramientas de build instaladas en cliente). **No** aplica a: servicios externos consumidos por API que el cliente ya tiene (por ejemplo su propio S3 o su IdP), herramientas de desarrollo que no se distribuyen, y contenido documental. **Garage quedó no verificado** (ruta de licencia no encontrada en la rama consultada): no usarlo como sustituto hasta verificarlo.

**Efecto sobre documentos normativos (pendiente de la aceptación del ADR-011):** `00-INDEX.md` (nombra `Redis` y `Vault/KMS`), `02` §4 (tabla: fila `Redis`), `05` §1 (tabla de autoridades: `Redis`), `09` §2 (`Grafana`, `Loki`) y la nota de implementación en `ADR-007` (Vault → equivalente libre MPL), con sus espejos en `docs/es/`.

## 1. Resumen de riesgo (semáforo)

> Lectura bajo la política de §0.bis: **🟡 y 🔴 dejan de ser "aceptables con condiciones" y pasan a ser deuda a resolver** salvo que el componente sea irremplazable y el ADR lo justifique.

| Nivel | Significado | Componentes |
|---|---|---|
| 🟢 **OK** | Licencia permisiva (MIT/BSD/Apache-2.0/PostgreSQL/MPL-2.0). Sin obligaciones relevantes para producto cerrado. | LangGraph, LangChain core, Temporal (server + SDKs + UI), OPA, LiteLLM (núcleo), PostgreSQL, pgvector, FastAPI, Pydantic, SQLAlchemy, Presidio, OpenBao, Prometheus, OpenTelemetry Collector, Docker Compose, Qdrant, Valkey |
| 🟡 **OK con condiciones** | Permisiva **excepto** ciertos directorios/features propietarios, copyleft libre que igual se sustituye por política, o licencia que exige conservar avisos/atribución. | LiteLLM (`enterprise/`), Langfuse (`ee/`), Weaviate (`wl/`), MCP (spec en transición MIT→Apache-2.0). **Grafana/Loki (AGPL-3.0) salen del stack por §0.bis** (sustitución obligatoria: Perses / VictoriaLogs). |
| 🔴 **Fuera del stack (sustituir)** | Copyleft fuerte, source-available con restricción de uso, o vendor lock comercial. Bajo §0.bis **no son admisibles** en el stack de referencia. | **Redis 8** (RSALv2/SSPLv1/AGPLv3 → **Valkey**), **HashiCorp Vault** (BUSL-1.1 → **OpenBao**), **Grafana y Loki** (AGPL-3.0 → **Perses** / **VictoriaLogs**), **MinIO** (AGPL-3.0 → **SeaweedFS**), **Kortix/Suna** (ELv2 + White-Label; no es dependencia, es referencia) |

**Los dos riesgos que más impactan al modelo de negocio:**

1. **Redis 8** ya no es BSD: es **tri-licencia RSALv2 / SSPLv1 / AGPLv3** (elección del usuario) y **ninguna de las tres es OSI-aprobada salvo AGPL**. Si el bundle se entrega en instalación privada, la variante AGPL impone obligaciones de copyleft; RSALv2/SSPLv1 restringen ofrecerlo como servicio. → Alternativa directa: **Valkey** (BSD-3-Clause, fork de Redis 7.2 mantenido por la Linux Foundation), que además es API-compatible para nuestros usos (caché/coordinación transitoria, `02-ENTERPRISE-ARCHITECTURE.md` §4).
2. **HashiCorp Vault** es **BUSL-1.1** desde la versión 1.15.0 (licenciante IBM). BUSL permite uso en producción bajo el *Additional Use Grant*, pero **prohíbe ofrecer un servicio que compita** con el producto licenciado, y sus condiciones cambian por versión. Nuestra arquitectura dice "Vault **o un gestor equivalente KMS-backed**" (ADR-007), así que hay margen: **OpenBao** (MPL-2.0, fork de Vault, API-compatible) es la alternativa con licencia limpia. Decisión pendiente.

## 2. Inventario por componente

### 2.1 Runtime de agentes y durabilidad (núcleo del producto)

| Componente | Rol en la arquitectura | Versión observada (2026-10-19) | Licencia | Notas / riesgo |
|---|---|---|---|---|
| **LangGraph** | Runtime cognitivo del agente (`ADR-002`, doc `04` §2) | `langgraph` **1.2.16** (PyPI, 2026-10-16); `license_expression: MIT` | **MIT** | 🟢 Núcleo MIT. Atribución conservada. |
| `langgraph-checkpoint` / `langgraph-checkpoint-postgres` | Checkpointer corto (persistencia de estado del grafo) | 3.2.0 (2026-10-14) / `<5.0.0,>=4.3.0` | **MIT** (familia LangGraph) | 🟢 Es la pieza que habilita `interrupt()`/resume y durability modes. Ver doc `04` §21. |
| `langchain-core` | Tipos base de LangGraph | 1.6.12 (2026-10-16) | **MIT** | 🟢 |
| **Temporal Server** | Motor de workflows durables (`ADR-003`, doc `04` §3) | **v1.32.1** | **MIT** | 🟢 Auto-hospedable sin costo de licencia. Temporal Cloud es servicio comercial aparte (no lo usamos). |
| **Temporal Python SDK** | Workers/activities | **1.34.0** (2026-09-30) | **MIT** | 🟢 |
| `temporalio/ui-server` (Temporal UI) | Consola operativa de workflows | v2.56.0 | **MIT** | 🟢 |
| **LiteLLM** | Gateway de modelos (`ADR-010`) | **1.106.0** (2026-10-18) | **MIT**, *excepto* `enterprise/` (licencia propia) | 🟡 Usar solo el núcleo; documentar que no se usan features de `enterprise/`. |

### 2.2 Política, secretos, seguridad

| Componente | Rol | Versión observada | Licencia | Notas / riesgo |
|---|---|---|---|---|
| **OPA** | Policy decision point determinístico (`ADR-005`) | **v1.21.3** | **Apache-2.0** | 🟢 |
| **HashiCorp Vault** | Gestor de secretos (`ADR-007`) — **saliente** | **v2.2.0** (texto BUSL aplica desde 1.15.0) | **BUSL-1.1** (source-available, **no libre**) | 🔴 Prohibida por §0.bis. Sustituto obligatorio: **OpenBao v2.7.1 — MPL-2.0** 🟢 (verificado). |
| **OpenBao** | Alternativa API-compatible a Vault | **v2.7.1** | **MPL-2.0** | 🟢 Candidato a sustitución (decisión pendiente, ver `DECISIONES-PENDIENTES.md`). |
| **Microsoft Presidio** | Detección PII para el gateway DLP (doc `06` §8) | 2.2.364 | **MIT** | 🟢 |
| **MCP (especificación + SDKs)** | Protocolo de herramientas (`ADR-004`) | spec revisión **2026-07-28** | Spec en **transición MIT → Apache-2.0**; documentación **CC-BY-4.0** | 🟡 Registrar la revisión de spec usada; la transición no afecta el uso del protocolo, pero sí la trazabilidad. |

### 2.3 Datos, retrieval y persistencia

| Componente | Rol | Versión observada | Licencia | Notas / riesgo |
|---|---|---|---|---|
| **PostgreSQL** | System of record (`ADR-006`) | serie 18.x | **PostgreSQL License** (BSD-like) | 🟢 |
| **pgvector** | Búsqueda vectorial inicial (doc `05` §18, doc `08` §7) | extensión `pgvector` | **PostgreSQL License** | 🟢 |
| **Redis** | Caché / coordinación transitoria (doc `02` §4) — **saliente** | **8.10.2** | **Tri-licencia: RSALv2 · SSPLv1 · AGPLv3** (ninguna permisiva) | 🔴 Prohibida por §0.bis. Sustituto obligatorio: **Valkey (BSD-3-Clause)** 🟢 (verificado). Ver §3.1. |
| **Qdrant** (si se introduce vector DB dedicada, doc `06`/ADR-006 "más adelante") | Retrieval a escala | v1.19.2 | **Apache-2.0** | 🟢 Referencia para el futuro, no adoptado. |
| **Weaviate** (alternativa evaluada) | Retrieval a escala | v1.40.1 | **BSD-3-Clause** fuera de `wl/` | 🟡 No adoptado. |

### 2.4 Observabilidad y evaluación

| Componente | Rol | Versión observada | Licencia | Notas / riesgo |
|---|---|---|---|---|
| **OpenTelemetry Collector** | Trazas/métricas/logs (doc `09` §2) | v0.163.0 | **Apache-2.0** | 🟢 |
| **Prometheus** | Métricas | v3.15.0 | **Apache-2.0** | 🟢 |
| **Grafana** | Dashboards — **saliente** | **v13.2.4** | **AGPL-3.0** | 🔴 Fuera del stack por §0.bis. Sustituto: **Perses** (Apache-2.0, verificado). Ver §3.2/§3.3. |
| **Loki** | Logs — **saliente** | **v3.7.8** | **AGPL-3.0** | 🔴 Fuera del stack por §0.bis. Sustitutos: **VictoriaLogs** o **OpenSearch** (Apache-2.0, verificados). |
| **Langfuse** | Tracing LLM/agente | **v4.64.0** | **MIT**, *excepto* `ee/`, `web/src/ee/`, `worker/src/ee/` (licencia propia) | 🟡 Igual que LiteLLM: política de "no usar `ee/`". Nota: el copyright del archivo MIT figura a nombre de **ClickHouse, Inc.** (cambio societario reciente) → vigilar continuidad del proyecto. |
| **Ragas / DeepEval** (evaluación, doc `09` §7) | Evaluación de agentes/RAG | — | Pendiente de verificar en la versión que se adopte | 🟡 **No verificado en este documento** (límite de cuota de la API durante la auditoría). Tarea abierta: completar antes de fijarlos en `pyproject.toml`. |

### 2.5 Infraestructura y tooling de desarrollo

| Componente | Rol | Versión observada | Licencia | Notas / riesgo |
|---|---|---|---|---|
| **Docker Compose** | Topología de despliegue inicial (doc `10` §1) | v5.6.0 | **Apache-2.0** | 🟢 (Docker Engine/Desktop tienen sus propias condiciones comerciales: verificar la edición que se instala en cliente). |
| **FastAPI** | API/control plane | 0.149.0 | **MIT** | 🟢 |
| **Pydantic** | Schemas de contrato | v2.14.1 | **MIT** | 🟢 |
| **SQLAlchemy** | Acceso a datos | rel_2_1_5 | **MIT** | 🟢 |
| **HTTPX** | Cliente HTTP | 0.28.1 | **BSD-3-Clause** | 🟢 |
| **MinIO** (si se usa como object store para artefactos/payloads grandes, doc `05` §3) — **saliente** | Object store S3-compatible | RELEASE.2025-10-15 | **AGPL-3.0** | 🔴 Fuera del stack por §0.bis. Sustitutos: **SeaweedFS** (Apache-2.0, verificado), S3 del cliente, Ceph (LGPL) o Postgres LOB. Ver §3.4. |
| **Apache Kafka** (si se introduce event bus, hoy *non-goal* doc `00` §8) | Bus de eventos | — | **Apache-2.0** | 🟢 Referencia futura. |

## 3. Riesgos que requieren decisión

### 3.1 Redis 8 vs Valkey (impacto: runtime/datos)

Redis pasó a **tri-licencia (RSALv2 / SSPLv1 / AGPLv3)** desde Redis 8. La arquitectura usa Redis **solo** como caché y coordinación transitoria, nunca como fuente de verdad (`02` §4, `05` §1). Eso hace que la sustitución sea de bajo impacto técnico, y la decisión **no se puede posponer** hasta el empaquetado: cambia imágenes, helm/charts y documentación de despliegue. Bajo §0.bis, **Valkey (BSD-3-Clause)** es la única opción admisible: las variantes RSALv2/SSPLv1 son licencias prohibidas y la AGPL no integra el stack de referencia. → *Sustitución obligatoria; cierre formal tras la prueba de compatibilidad (DP-5).*

### 3.2 Grafana y Loki AGPL-3.0 (impacto: observabilidad/despliegue)

AGPL impone, ante uso por red de una obra **modificada**, ofrecer el código fuente correspondiente a los usuarios. Uso sin modificar y como servicio interno suele ser aceptable, pero **en instalación privada con bundle entregado al cliente** la lectura conservadora exige (i) no modificar, (ii) entregar el código fuente de esos componentes + avisos, o (iii) sustituirlos. La observabilidad **no es el diferencial del producto**: mantener el acoplamiento a dos componentes AGPL agrega pasivo en una due diligence bancaria. → Evaluar componentes permisivos para dashboards/logs, o documentar formalmente la aceptación del AGPL.

### 3.3 Observabilidad con licencia libre (impacto: operación/despliegue)

Grafana y Loki son **AGPL-3.0**: libres, pero con obligaciones que tocan el bundle entregado al cliente (prioridad 2 en §0.bis). Como la observabilidad no es el diferencial del producto, la política empuja a sustituir por componentes permisivos, verificados en crudo el 2026-10-19:

| Función | Actual (AGPL) | Sustituto libre (prioridad 1) | Verificado |
|---|---|---|---|
| Dashboards | Grafana | **Perses** (Apache-2.0) | ✅ `perses/perses/LICENSE` |
| Logs | Loki | **VictoriaLogs** (Apache-2.0) · **OpenSearch** (Apache-2.0) | ✅ `VictoriaMetrics/VictoriaLogs/LICENSE`, `opensearch-project/OpenSearch/LICENSE.txt` |
| Métricas | Prometheus (Apache-2.0, ya libre) + Grafana para visualizar | **Perses** sobre Prometheus; **VictoriaMetrics** (Apache-2.0) como TSDB alternativo | ✅ `prometheus/prometheus` (ya 🟢); `VictoriaMetrics/VictoriaMetrics/LICENSE` |
| Trazas | OpenTelemetry Collector (Apache-2.0, ya libre) + su UI/complementos | Mantener OTel; verificar el componente de UI elegido | — |

Criterio: la sustitución es **obligatoria** bajo §0.bis (AGPL no integra el stack de referencia). Si la evaluación operativa muestra que Perses/VictoriaLogs encarecen la instalación privada más de lo aceptable, la salida **no** es volver a Grafana/Loki: es elegir otro componente permisivo o reducir la ambición de la observabilidad, y si no hubiera alternativa, presentar un ADR de excepción con la obligación asumida y el plan de salida.

### 3.4 Object store de artefactos — MinIO AGPL-3.0 (impacto: artefactos/persistencia)

Solo aplica si se usa un object store propio para artefactos (ver la brecha de artefactos en el cruce con Kortix). MinIO es **AGPL-3.0**. Alternativas libres verificadas: **SeaweedFS** (Apache-2.0, ✅ `seaweedfs/seaweedfs/LICENSE`), S3 del cliente (la licencia es del cliente, no nuestra), Ceph (LGPL), o mantener los payloads grandes dentro de PostgreSQL (documento/`bytea`/LOB) durante el MVP. **Garage** quedó **sin verificar** en esta pasada: no usarlo como sustituto hasta leer su licencia.

### 3.5 Vault BUSL-1.1 (impacto: seguridad/despliegue)

Ver §2.2. El ADR-007 ya dice "Vault **o equivalente**", por lo que **OpenBao no cambia la decisión arquitectónica**: cambia el componente de referencia. Si se adopta, actualizar `ADR-007` con una nota de implementación (no requiere ADR nuevo si el contrato — "gestor KMS-backed, resolución de credenciales en el gateway" — no cambia).

### 3.6 Licencias de doble directorio (`enterprise/`, `ee/`, `wl/`) (impacto: seguridad/observabilidad)

LiteLLM, Langfuse y Weaviate traen código propietario en carpetas específicas. Regla propuesta: **prohibido activar features de `enterprise/`/`ee/`/`wl/`** salvo ADR explícito, y **test/CI que falle** si el código propio importa de esos directorios.

## 4. Reglas propuestas de incorporación de dependencias (para `docs/development`)

Estas reglas no crean arquitectura nueva: operacionalizan el requisito de "dependencias compatibles con comercialización propietaria". Propuesta para incorporar a `docs/development/DEVELOPMENT-GUIDELINES.md` y `SECURITY-RULES.md` (ver registro de cambios):

1. **Solo licencias libres (§0.bis)**: ningún componente entra sin licencia libre OSI/FSF verificada. Dentro de ellas se prefieren las permisivas; una copyleft (AGPL/GPL) exige ADR de excepción con la obligación asumida y el plan de salida; cualquier licencia *source-available* no libre (BUSL/RSALv2/SSPLv1/ELv2) está **prohibida sin excepción**.
2. **License gate en CI**: ninguna dependencia nueva entra sin licencia declarada y clasificada (permisiva / condicional / restringida).
3. **SBOM por release** (CycloneDX) + escaneo de licencias del árbol completo, no solo el primer nivel.
4. **Lista de revisión obligatoria** (requiere aprobación explícita + registro): AGPL/SSPL/RSALv2/BUSL/ELv2 y cualquier "source-available" no OSI.
5. **Prohibido**: toda licencia no libre (SSPLv1, RSALv2, BUSL, ELv2, "commons clause") y cualquier licencia que restrinja ofrecer el producto como servicio hospedado o imponga un proveedor exclusivo.
6. **Atribución**: conservar avisos de copyright y generar `THIRD-PARTY-NOTICES` por release (incluye el bundle de instalación privada).
7. **Derivadas**: no incorporar código de proyectos source-available (por ejemplo Kortix/Suna) ni siquiera "reescrito": la limitación viaja con la obra derivada (ver [[KORTIX-analisis-y-licencias]] §2).
8. **Preferencia por la vía libre también en servicios de plataforma**: si un servicio del stack puede resolverse con un componente permisivo ya presente (por ejemplo PostgreSQL), es preferible a incorporar un componente nuevo con licencia condicional.

## 5. Kortix/Suna (referencia externa, no dependencia)

| Dato | Valor (verificado 2026-10-19) |
|---|---|
| Repo | `github.com/kortix-ai/suna` — rama por defecto **`dev`**, commit `e0eb2243ca8a78c4ae2badd8d9ae65fe82c80f80`, `VERSION` **0.14.3** |
| Licencia | **Elastic License 2.0** — GitHub la reporta como `NOASSERTION` (no OSI) |
| Licencia adicional | **`WHITE-LABEL-LICENSE.md`**: permite rebrandear, reestructurar y **venderlo como servicio hospedado** bajo otras condiciones, con **una contraprestación**: usar **Platinum** (proveedor de compute de los propios autores) como **proveedor exclusivo** de sandboxes/inferencia. Kortix **puede terminar el acuerdo en cualquier momento** con aviso (transición de hasta 90 días) |
| Lectura para nuestro caso | No cambia el veredicto de [[KORTIX-analisis-y-licencias|REFERENCIA, no BASE]]: la puerta de "SaaS propio" existe **solo** atada a un proveedor de compute y a un contrato revocable. Sumar lock-in de compute a un producto propietario cerrado es un pasivo, no una ventaja. |

## 6. Fuentes (verificadas 2026-10-19)

- Archivos de licencia leídos en crudo: `langchain-ai/langgraph/LICENSE` (MIT), `temporalio/temporal` v1.32.1 (MIT), `BerriAI/litellm/LICENSE` (MIT + `enterprise/`), `open-policy-agent/opa` (Apache-2.0, campo `license` de la API), `hashicorp/vault/LICENSE` (BUSL-1.1, licenciante IBM, "Vault Version 1.15.0 or later"), `openbao/openbao` (MPL-2.0), `redis/redis/LICENSE.txt` (tri-licencia RSALv2/SSPLv1/AGPLv3 desde Redis 8), `valkey-io/valkey/COPYING` (BSD-3-Clause), `pgvector/pgvector/LICENSE` (PostgreSQL License), `postgres/postgres/COPYRIGHT`, `grafana/grafana` y `grafana/loki` (AGPL-3.0), `langfuse/langfuse/LICENSE` (MIT + `ee/`), `minio/minio` (AGPL-3.0), `weaviate/weaviate/LICENSE` (BSD-3 + `wl/`), `microsoft/presidio/LICENSE` (MIT), `modelcontextprotocol/modelcontextprotocol/LICENSE` (transición MIT→Apache-2.0, docs CC-BY-4.0), `kortix-ai/suna/LICENSE` (ELv2) y `WHITE-LABEL-LICENSE.md`.
- Versiones: metadatos de PyPI (`langgraph` 1.2.16 — `license_expression: MIT`, `temporalio` 1.34.0 — clasificador MIT, `litellm` 1.106.0) y *releases* de GitHub.
- API de GitHub (campo `license`): usada como **segunda fuente** de cada licencia; se registraron 4 componentes con `NOASSERTION`, resueltos leyendo el archivo de licencia (Redis, Vault, Langfuse, pgvector, Weaviate, Celery, MCP).
