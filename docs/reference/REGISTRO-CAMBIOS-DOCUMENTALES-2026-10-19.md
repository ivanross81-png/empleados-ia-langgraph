# Registro de cambios documentales — 2026-10-19

> **Naturaleza del documento:** registro **no normativo** de trazabilidad. No define arquitectura.
> **Origen:** encargo de investigación de Kortix/Suna + enriquecimiento funcional de la arquitectura existente.
> **Regla aplicada:** revisión **aditiva**. Ningún documento fue eliminado ni reescrito; ningún principio arquitectónico, frontera entre motores, nombre de entidad, contrato público o ADR fue modificado.
> **Paquete de evidencia:** `docs/reference/KORTIX-INVESTIGACION-v0.14.3.md`, `docs/reference/KORTIX-CROSS-MATRIX.md`, `docs/reference/STACK-LICENCIAS.md`.

## 1. Resumen

- Documentos normativos modificados: **8** (`03`, `04`, `05`, `06`, `07`, `08`, `09`, `10`).
- Documentos de índice/manifiesto modificados: **2** (`docs/architecture/00-ARCHITECTURE-INDEX.md`, `DOCUMENT-MANIFEST.md`).
- Espejos en español actualizados: **8** + índice ES.
- Documentos nuevos: **3** de referencia (`STACK-LICENCIAS.md`, `KORTIX-INVESTIGACION-v0.14.3.md`, `KORTIX-CROSS-MATRIX.md`) y **2** de trazabilidad (`REGISTRO-CAMBIOS-DOCUMENTALES-2026-10-19.md`, `DECISIONES-PENDIENTES.md`).
- ADR nuevos o modificados: **ninguno** (ver §4).
- Cambios que introducen dependencias nuevas: **ninguno** (ver §4).
- Validación: `check-docs.py` — 0 hallazgos (ver §6).

## 2. Cambios por documento

### 2.1 `docs/architecture/03-DOMAIN-MODEL.md`

| Sección | Contenido incorporado | Hallazgo que lo motiva | Razón |
|---|---|---|---|
| `§5.1` Semántica de calendarización | Zona horaria explícita, identidad de slot, misfire, solapamiento, límites de corrida, pausa, garantías | K-31/K-32/K-33/K-34/K-35 | Una rutina diaria de negocio que duplica o pierde ejecuciones es un defecto de negocio, no de operación; el modelo de dominio declaraba el tipo `SCHEDULE` sin semántica |
| `§5.2` Disparadores por canal | Requisitos mínimos antes de implementar un canal conversacional | K-40 | El canal es una superficie de entrada no confiable; debía quedar explícito que no otorga autoridad |
| `§9` (nota) | Referencia a la semántica de decisión (`06` §4.1) | K-04/K-05 | Evitar dos definiciones de `REQUIRE_APPROVAL` en el paquete |
| `§15` Empaquetado de definiciones (provisional) | Export/import/revisión de definiciones como paquete derivado | K-01 | Portabilidad y control de cambios de clientes regulados; marcado **provisional**, no decisión cerrada |

### 2.2 `docs/architecture/04-RUNTIME-EXECUTION-ARCHITECTURE.md`

| Sección | Contenido incorporado | Hallazgo | Razón |
|---|---|---|---|
| `§2` (nota) | Frontera de durabilidad: checkpointer confinado a la corrida corta | K-L1/K-L2/K-L3, gap **C-1** | Era el solapamiento más riesgoso entre LangGraph y Temporal |
| `§4` (nota) | El estado persistido del runtime es almacén de runtime, no sistema de registro | Gap C-1 | Cierra el riesgo de que un checkpoint se trate como autoridad de lifecycle |
| `§11` (ampliación) | `REQUIRE_APPROVAL` suspende; pausa interna y re-ejecución del nodo | K-04/K-05/K-16 | Una implementación que convierte la suspensión en fallo es incorrecta; la re-ejecución obliga a idempotencia previa |
| `§21` Integración de LangGraph, checkpoints y frontera de estado | Responsabilidades, almacén del checkpointer, re-ejecución al reanudar, versionado del grafo con ejecuciones en vuelo | Gap C-1 | Fuente de verdad única para la frontera; antes dispersa entre el anexo heredado y el SPIKE |
| `§22` Operaciones de control del runtime | Pausar / reanudar / inyectar directiva / interrumpir turno / cancelar / terminar, con autorización y auditoría | K-15/K-16 | Las operaciones de control no estaban modeladas y son necesarias para contener una ejecución |
| `§23` Delegación (sub-agentes, sub-grafos) | Intersección de permisos, profundidad, trazabilidad, responsabilidad del padre | K-03 | La delegación es una capacidad real del runtime objetivo; sin reglas era un bypass potencial |
| `§24` Versionado de workflows y workers | Estrategia de cambio, replay tests, workers versionados, poda de historial | K-T2 | Evita romper ejecuciones abiertas al desplegar |
| `§25` Preguntas abiertas | Entorno de ejecución del empleado, superficies de canal, enforcement de costos | K-12/K-21, K-40, K-42 | Se documentan como **abiertas**; no se resolvieron por diseño unilateral |

### 2.3 `docs/architecture/05-PERSISTENCE-API-CONTRACTS.md`

| Sección | Contenido incorporado | Hallazgo | Razón |
|---|---|---|---|
| `§1` | Tabla de autoridades de estado (PostgreSQL / Temporal / almacén de runtime / Redis) y frontera con `04` §21 | Gap C-1 | Un solo lugar responde "¿quién es dueño de este estado?" |
| `§5.1` Taxonomía de nombres de acciones | `<dominio>.<recurso>.<verbo>` + reglas de versionado | K-52/K-53 | Los nombres eran inconsistentes en el producto de referencia; como contrato versionado habilita filtrado y exportación |
| `§5.2` Regla de cobertura | Qué operaciones deben auditarse, incluida lectura y administración | K-52/K-53 | Evita auditoría "de acciones de negocio" que no cubre acceso a datos |
| `§10.1` Cola de aprobaciones (read model) | Filtros, aging/SLA, vencimiento determinista, delegación, revocación, idempotencia | K-19/K-27 | Una ejecución suspendida que nadie ve equivale a una ejecución perdida |
| `§11` (ampliación) | Deduplicación keyed en el id de evento del proveedor | K-46 | El proveedor reintenta con otro id de request; deduplicar por request duplica ejecuciones |
| `§20` Stream de eventos de ejecución | SSE, secuencia monótona, tipos mínimos, autorización, reconexión, retención | K-64/K-65 | Progreso en vivo como contrato, no como detalle de la consola |
| `§21` Artefactos y manejo de archivos | Registro, almacenamiento por referencia, clasificación, ACL, límites, retención, procedencia | K-22/K-23/K-24 | Los entregables del empleado no tenían contrato |
| `§22` Descubrimiento de API y ergonomía | OpenAPI por despliegue, cabeceras de rate limit, errores estables | K-65 | Integración de clientes sin acoplamiento a la consola |

### 2.4 `docs/architecture/06-SECURITY-GOVERNANCE.md`

| Sección | Contenido incorporado | Hallazgo | Razón |
|---|---|---|---|
| `§2.1` Requisitos de identidad empresarial | OIDC/SAML 2.0, verificación de dominio, enforcement, SCIM 2.0, mapeo grupos→roles, MFA, política de sesión, baja de personal | K-47/K-48/K-49 | Requisito de compra en banca/seguros: es producto, no entorno del cliente |
| `§2.2` Permisos a nivel de recurso | Concesiones por objeto y principal; personal vs compartido | K-49 | El modelo de autorización solo describía roles |
| `§4.1` Semántica de la decisión | Suspensión, granularidad por argumentos, precedencia, deny by default, no delegable al modelo | K-04/K-05/K-16 | Cierra la ambigüedad que hacía implementable una política incorrecta |
| `§7.1` Exposición de credenciales al ejecutor | Modos intermediado / inyectado / deshabilitado y requisitos | K-50/K-51 | "Nunca en el prompt" no impide que la credencial llegue a un sandbox |
| `§17` Protección del estado del runtime | Clasificación, DLP, retención verificada, acceso auditado, amenaza de inyección vía checkpoints | Gap C-1 | El almacén de runtime es superficie de ataque |
| `§18` Integridad de dependencias y licencias | Licencia declarada, SBOM, revisión antes de instalar en cliente | Gap **C-6** | El modelo comercial propietario obliga a auditar licencias |

### 2.5 `docs/architecture/07-MCP-INTEGRATION-ARCHITECTURE.md`

| Sección | Contenido incorporado | Hallazgo | Razón |
|---|---|---|---|
| `§8` (nota) | Referencia a los modos de exposición de credenciales | K-50/K-51 | Coherencia con `06` §7.1 |
| `§8.1` Conectores con identidad de usuario | Credencial de servicio vs delegada; consentimiento, alcance, tokens, auditoría, falla, prohibición | K-29 | "Actuar como una persona" es un caso de uso comercial central y no estaba modelado |

### 2.6 `docs/architecture/08-MEMORY-KNOWLEDGE-CONTEXT.md`

| Sección | Contenido incorporado | Hallazgo | Razón |
|---|---|---|---|
| `§13` (ampliación) | Artefactos como fuente de contexto gobernada | K-22/K-23/K-24 | Evita que el contenido se lea por ruta de filesystem o desde el estado del runtime |

### 2.7 `docs/architecture/09-OBSERVABILITY-EVALUATION.md`

| Sección | Contenido incorporado | Hallazgo | Razón |
|---|---|---|---|
| `§3` (ampliación) | El stream de eventos expone los mismos identificadores de correlación | K-64/K-65 | Pasar de una alerta a la ejecución exacta |
| `§6` (ampliación) | Auditoría cubre acceso y datos, no solo acciones de negocio | K-52/K-53 | Pregunta de control: "¿quién vio este dato?" |
| `§12.1` Cuotas y corte | Presupuesto por ejecución, techo por tarea, cuota por tenant, límite de proveedor + reglas | K-42/K-43 | Observar costo no es controlarlo |
| `§13` (ampliación) | Nuevas señales: aging de aprobaciones, ejecuciones suspendidas, anomalía de costo, operaciones de operador, huecos de auditoría | K-19/K-27, K-52, K-42 | Cierra el lazo entre controles nuevos y monitoreo |

### 2.8 `docs/architecture/10-DEPLOYMENT-OPERATIONS.md`

| Sección | Contenido incorporado | Hallazgo | Razón |
|---|---|---|---|
| `§17` Ciclo de instalación y actualización en instalaciones privadas | Bootstrap idempotente, primer ingreso, configuración de entorno, autodiagnóstico, backup/restore probado, actualización con rollback, compatibilidad, endurecimiento, baja | K-57/K-59/K-60/K-61 (P-17) | El modelo de instalación privada existía como modalidad comercial sin ciclo de vida documentado |
| `§18` Metering comercial y entitlements | Metering, entitlements, punto de enforcement, instalaciones privadas, separación de auditoría | K-42 (P-12) | Sustenta la comercialización SaaS y privada sin confundirse con auditoría |

### 2.9 Índices y manifiesto

| Archivo | Cambio | Razón |
|---|---|---|
| `docs/architecture/00-ARCHITECTURE-INDEX.md` | Nuevas `§10` (documentos de referencia no normativos) y `§11` (revisión 2026-10-19) | Los documentos de referencia no estaban registrados en el índice normativo y las citas a numeración heredada (§64/§89) eran irresolubles |
| `DOCUMENT-MANIFEST.md` | Reemplazo de un párrafo de borrador interno por `§7` (set documental) y `§8` (registro de revisiones) | El archivo contenía texto de trabajo ("The requested 17 documents…") que no debía constituir manifiesto |
| `00-INDEX.md` | `docs/reference/` actualizado con el paquete Kortix; referencia de fases reanclada a `10` §17 | Trazabilidad de la evolución por fases, antes citada a `§89` (heredado) |
| `docs/reference/SPIKE-FASE1-FOUNDATION-investigacion.md` | Nota de trazabilidad sobre numeración heredada (§64/§66/§89) | Evitar que una cita irresoluble se lea como requisito normativo |

## 3. Documentos nuevos

| Archivo | Tipo | Motivo |
|---|---|---|
| `docs/reference/STACK-LICENCIAS.md` | Referencia | No existía inventario de licencias del stack objetivo; el modelo propietario lo exige (gap C-6) |
| `docs/reference/KORTIX-INVESTIGACION-v0.14.3.md` | Referencia | Entregable B del encargo: capacidades verificadas con evidencia y estado |
| `docs/reference/KORTIX-CROSS-MATRIX.md` | Referencia | Entregables A y C: inventario documental y matriz de cruce |
| `docs/reference/REGISTRO-CAMBIOS-DOCUMENTALES-2026-10-19.md` | Trazabilidad | Entregable E |
| `docs/reference/DECISIONES-PENDIENTES.md` | Trazabilidad | Entregable F |

## 4. Lo que **no** se cambió (y por qué)

### 4.1 Cambios posteriores a la revisión inicial (2026-10-19, mismo día)

**a) Primera directiva.** El responsable del producto dispuso **dar prioridad a las licencias de uso libre**. Se aplicó como **criterio de selección** en `docs/reference/STACK-LICENCIAS.md` (§0.bis, reordenamiento de §3.3–§3.6, ampliación de las reglas de §4 y nueva regla 8) y en `docs/reference/DECISIONES-PENDIENTES.md` (DP-5 y DP-6 reformuladas, DP-17 nueva).

**b) Directiva definitiva: licencias libres exclusivamente.** El responsable precisó la política: **solo licencias libres**. Consecuencias aplicadas:
- `STACK-LICENCIAS.md` §0.bis reescrita (regla única: solo libres OSI/FSF; *source-available* **prohibida sin excepción**; AGPL/GPL fuera del stack de referencia salvo ADR de excepción) y §1/§2/§3/§4 alineadas: Redis, Vault, Grafana, Loki y MinIO marcados **salientes** con sustituto permisivo obligatorio.
- **`docs/adr/ADR-011-free-licence-stack.md` creado en estado `Proposed`** (más espejo `docs/es/adr/ADR-011-free-licence-stack.md`); `DOCUMENT-MANIFEST.md` actualizado (27 archivos, 11 ADR) con entrada de registro de revisión; DP-17 reformulada con el detalle de qué falta al aceptarlo.

**Lo que sigue pendiente y por qué:** el ADR-011 **no** se declaró aceptado ni se renombraron los componentes salientes en los documentos normativos. El paquete exige ADR **antes** de implementar, así que los renombres (`00-INDEX.md`, `02` §4, `05` §1, `09` §2, nota en `ADR-007` y espejos ES) quedan listos para aplicarse en la misma revisión en que el responsable acepte el ADR (DP-17).

### 4.2 Descartes del encargo original

- **No se creó** ninguna arquitectura paralela ni un segundo `system-architecture` / `runtime-architecture`.
- **No se modificó ningún ADR.** Ninguna decisión arquitectónica existente fue reemplazada: se identificaron consecuencias que ya estaban dentro de las decisiones vigentes (por ejemplo, la frontera LangGraph/Temporal de `ADR-002` se hizo operativa, no se cambió).
- **No se introdujo** ninguna dependencia, servicio ni microservicio nuevo. Las alternativas del stack (por ejemplo Valkey en lugar de Redis) quedaron registradas como **sustitución pendiente de prueba de compatibilidad** bajo la política de §4.1, no como componentes adoptados.
- **No se cambió** el motor de agentes (LangGraph) ni el de workflows durables (Temporal).
- **No se resolvieron** por decisión unilateral las brechas de producto (entorno de ejecución, canal, cuotas): quedan como preguntas abiertas en `04` §25 y `DECISIONES-PENDIENTES.md`.
- **No se copió** código, prompts, configuración ni texto protegido del proyecto investigado; la evidencia son citas cortas de documentación pública con su ruta.

## 5. Documentos revisados como parte del análisis de consistencia

`00-ARCHITECTURE-INDEX`, `01-PRODUCT-VISION`, `02-ENTERPRISE-ARCHITECTURE`, `03-DOMAIN-MODEL`, `04-RUNTIME-EXECUTION-ARCHITECTURE`, `05-PERSISTENCE-API-CONTRACTS`, `06-SECURITY-GOVERNANCE`, `07-MCP-INTEGRATION-ARCHITECTURE`, `08-MEMORY-KNOWLEDGE-CONTEXT`, `09-OBSERVABILITY-EVALUATION`, `10-DEPLOYMENT-OPERATIONS`, `docs/adr/*.md`, `docs/development/*.md`, `docs/es/**`, `00-INDEX.md`, `DOCUMENT-MANIFEST.md`, `README.md`, `EXPLICACION-NO-TECNICA.md`, y los documentos de `docs/reference/`.

## 6. Resultado de la validación de consistencia

| Comprobación | Resultado |
|---|---|
| Enlaces relativos `.md` y wikilinks | OK (validador, 0 hallazgos) |
| Bloques Mermaid (tipo y balance) | OK, 8 bloques |
| Duplicados de contenido entre documentos | Ninguno (excluido `docs/es/`, que es espejo intencional) |
| Coherencia de nombres entre documentos (Execution, Task, Digital Employee, Approval, Artifact) | Verificada; los conceptos nuevos se agregaron sin renombrar existentes |
| Separación LangGraph / Temporal | Explícita y única en `04` §21 + tabla de autoridades de `05` §1 |
| Contradicciones detectadas | **Ninguna pendiente.** Se resolvieron: (a) citas a numeración heredada (nota de trazabilidad); (b) párrafo de borrador en el manifiesto (reemplazado); (c) dos posibles definiciones de `REQUIRE_APPROVAL` (unificadas con remisión a `06` §4.1) |
| Nuevas dependencias con licencia incompatible | Ninguna (no se agregaron dependencias) |

## 7. Pendiente de validación humana

Ver `docs/reference/DECISIONES-PENDIENTES.md`. Ninguna propuesta se registró como adoptada.
