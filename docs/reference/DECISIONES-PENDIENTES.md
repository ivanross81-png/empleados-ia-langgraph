---
type: reference
status: active
created: 2026-10-19
updated: 2026-10-19
tags: [digital-employee, decisiones-pendientes, brechas, validacion, trazabilidad]
---

# Decisiones pendientes

> **Naturaleza:** documento **no normativo** de control. Registra decisiones que **no pueden cerrarse** con análisis documental y requieren prueba técnica, decisión de producto, validación de seguridad, revisión de licencias o evaluación de coste/rendimiento.
> **Regla:** mientras una entrada figure aquí, **no es una decisión adoptada**. La documentación normativa describe el estado actual; este documento describe lo que aún falta decidir y cómo se validaría. **Excepción desde el 2026-10-19:** una entrada puede tener la **decisión adoptada** y seguir aquí por su **prueba** o su **validación legal** pendientes; en ese caso se dice explícitamente en qué capa está cerrada y en cuál no (ver *Capas de estado*, abajo).
> **Origen:** cruce Kortix/Suna ↔ arquitectura propia (2026-10-19). Ver `KORTIX-CROSS-MATRIX.md`.

## Formato

Cada entrada: **DP-n** · tema · *tipo de validación* · estado · descripción · opciones · criterio de cierre · documento afectado.

Tipos de validación: `PRUEBA` (spike/benchmark), `PRODUCTO` (decisión del responsable), `SEGURIDAD`, `LICENCIA`, `COSTE`/`RENDIMIENTO`.

**Advertencia de lectura:** *verificar* y *validar* no son lo mismo. Una licencia **verificada** es una licencia leída en la fuente del proyecto; una sustitución **validada** exige además una prueba de comportamiento en nuestros usos. Y ninguna de las dos cierra por sí sola una decisión de producto.

## Resumen de estados (revisión de auditoría, 2026-10-19)

| DP | Tema | Tipo | Estado |
|---|---|---|---|
| DP-1 | Modo de durabilidad del runtime del agente | PRUEBA | **decisión adoptada** (`ADR-012`, 2026-10-19: PostgreSQL, esquema de runtime separado, retención 7 días); **prueba de fallo pendiente** |
| DP-2 | Entorno de ejecución ("sandbox") del empleado | PRODUCTO+SEGURIDAD | **decisión adoptada** (`ADR-013`, 2026-10-19: sin ejecución arbitraria en el proceso principal; servicio restringido de artefactos); **implementación y pruebas pendientes** |
| DP-3 | Superficies de canal | PRODUCTO+SEGURIDAD | abierta |
| DP-4 | Cuotas: corte y efecto | PRODUCTO+COSTE | diseño en `09` §12.1 + **línea base de valores fijada** (DP-18); falta la prueba del corte con efecto externo en curso |
| DP-5 | Redis → Valkey | LICENCIA+PRUEBA | política **aceptada** (ADR-011) y renombre **aplicado**; **pruebas de compatibilidad autorizadas** (2026-10-19), sin ejecutar |
| DP-6 | Sustituciones por licencia (Grafana/Loki/MinIO/Vault) | LICENCIA | licencias directas **verificadas**; **pruebas y preparación de la revisión legal autorizadas** (2026-10-19); técnico y legal **pendientes** |
| DP-7 | Aislamiento multiempresa: mecanismo de enforcement | SEGURIDAD | abierta; **condición de producto añadida** (2026-10-19): la multi-tenencia compartida espera al aislamiento validado + ADR propio |
| DP-8 | Base vectorial dedicada | COSTE+RENDIMIENTO | línea base fija; ampliación no decidida |
| DP-9 | OPA externo vs embebido | PRUEBA+COSTE | línea base fija; despliegue abierto |
| DP-10 | Conectores delegados: consentimiento y UX | PRODUCTO+SEGURIDAD | requisitos fijados; diseño abierto |
| DP-11 | Almacenamiento de artefactos | COSTE+OPERACIÓN | contrato fijado; medio no decidido |
| DP-12 | Empaquetado y promoción de definiciones | PRODUCTO | provisional (`03` §15) |
| DP-13 | Versionado de la taxonomía de auditoría | PRUEBA+PRODUCTO | taxonomía fijada; **criterio de conservación de equivalencias fijado** (2026-10-19); compatibilidad abierta |
| DP-14 | Metering y entitlements en instalación privada | PRODUCTO+LICENCIA | diseño propuesto |
| DP-15 | Observabilidad de la corrida interna | PRUEBA+COSTE | **retención fijada** (2026-10-19: trazas 14 días con redacción, prompts desactivados, depuración 7 días bajo autorización); redacción a probar |
| DP-16 | Frontera workflow durable ↔ corrida de agente | PRUEBA | frontera decidida; umbral operativo a probar |
| DP-17 | Hacer normativa la política de licencias libres | PRODUCTO+LICENCIA | decisión de producto **tomada** y ADR **aceptado (2026-10-19)**; renombres **aplicados**; pruebas de compatibilidad **autorizadas** y pendientes (DP-5/DP-6) |
| DP-18 | Umbrales cuantitativos y ventanas de retención | PRODUCTO+PRUEBA | **valores adoptados** el 2026-10-19 (línea base de ingeniería del MVP); **validación en producción pendiente** |
| DP-19 | Relación con **Hermes-OS** | PRODUCTO+ARQUITECTURA | **CERRADA** el 2026-10-19: opción (a), referencia de diseño **sin integración** |
| DP-20 | Atributos operativos (Search Attributes) | PRODUCTO+PRUEBA | **conjunto mínimo definido** el 2026-10-19 (`04` §22.1); **prueba de contrato pendiente** |

Ninguna entrada se cierra por inferencia: cada cierre exige la validación declarada y queda registrado con fecha, evidencia y documento actualizado.

### Capas de estado (vocabulario obligatorio desde el 2026-10-19)

Una entrada puede estar cerrada en una capa y abierta en otra, y **ninguna capa implica la siguiente**. Al reportar el estado de una decisión hay que decir cuál de estas cinco es:

| Capa | Qué significa |
|---|---|
| **Decisión adoptada** | El responsable del producto decidió el rumbo y quedó registrado (ADR, este documento o el normativo afectado) |
| **Diseño documentado** | El contrato está escrito en `docs/architecture` / `docs/adr`, con sus límites |
| **Prueba ejecutada** | Existe una corrida reproducible con resultado registrado (entorno, versión, salida) |
| **Verificación de licencia** | La licencia fue leída en la fuente del proyecto y clasificada |
| **Aprobación legal** | Una persona con esa responsabilidad revisó el artefacto distribuible. **Hermes no emite aprobaciones legales** |

---

## DP-1 · Modo de durabilidad del runtime del agente

- **Tipo:** PRUEBA
- **Estado:** **decisión adoptada** el 2026-10-19 (`ADR-012`); **prueba pendiente**
- **Decisión (responsable del producto, 2026-10-19):** persistencia **por paso** de LangGraph en **PostgreSQL**, con un **esquema de runtime separado** y permisos propios. El checkpoint **no** es fuente de verdad del negocio; **Temporal sigue siendo la única autoridad de durabilidad** del workflow; las esperas humanas prolongadas se gestionan con Temporal; los efectos externos deben ser idempotentes o ejecutarse como acciones gobernadas fuera de nodos que puedan reejecutarse. Serialización restringida, excluyendo secretos y cargas sensibles innecesarias; retención de 7 días tras el estado terminal (DP-18). Formalizado en `ADR-012`, aplicado en `04` §21.2 y `05` §1.
- **Descripción:** `04` §21 fija la frontera (el checkpointer no es autoridad de lifecycle); `ADR-012` fija ahora el backend y el modo. Lo que falta es la **evidencia**: sin pruebas, el almacén no está validado.
- **Capas:** decisión **adoptada**; diseño **documentado**; prueba **sin ejecutar**.
- **Criterio de cierre:** ejecutar las pruebas de `ADR-012`: (1) costo por paso, (2) caída del worker a mitad de nodo, (3) reanudación, (4) retención y borrado que no rompa reanudaciones válidas, (5) ausencia de efectos externos duplicados. Cada una con entorno, versión y resultado registrados.
- **Afecta:** `docs/adr/ADR-012`, `04` §4/§21, `05` §1, `06` §17, `10` (aprovisionamiento del esquema y sus roles).

## DP-2 · Entorno de ejecución del empleado ("sandbox")

- **Tipo:** PRODUCTO + SEGURIDAD
- **Estado:** **decisión adoptada** el 2026-10-19 (`ADR-013`); **implementación y pruebas pendientes**
- **Decisión (responsable del producto, 2026-10-19):** en el MVP **no se permite ejecución arbitraria de código del agente dentro del proceso principal**. Los entregables los produce un **servicio restringido de generación de artefactos**: bibliotecas y plantillas aprobadas, límites de recursos, ausencia de secretos y restricciones de red. La **ejecución arbitraria en un sandbox efímero** queda como evolución posterior y exige una decisión específica y pruebas de aislamiento. Formalizado en `ADR-013`, aplicado en `04` §25 (punto 1).
- **Opciones (histórico):** (a) no ofrecer cómputo local en el MVP; (b) entorno efímero por ejecución, sin red y sin credenciales; (c) servicio de documentos dedicado (plantillas + render) en lugar de cómputo libre. **La decisión tomada combina (a) con (c)**, y deja (b) para después del MVP.
- **Capas:** decisión **adoptada**; diseño **documentado**; implementación **no existe**; prueba de aislamiento **sin ejecutar**.
- **Criterio de cierre:** servicio implementado con su catálogo de plantillas y bibliotecas aprobadas + diseño de aislamiento revisado por seguridad (sin egreso, sin exposición de credenciales — ver `06` §7.1, §12) + prueba de fuga de datos + prueba de que exceder los límites falla con error tipado.
- **Afecta:** `docs/adr/ADR-013`, `04` §25, `06` §12, `05` §21, `10`.

## DP-3 · Superficies de canal (primer canal conversacional)

- **Tipo:** PRODUCTO + SEGURIDAD
- **Estado:** abierta (`04` §25, `03` §5.2)
- **Descripción:** no está decidido qué canales se ofrecen (web chat propio, correo, Slack/Teams, WhatsApp, Telegram) ni con qué política de identidad/acceso se habilitan.
- **Criterio de cierre:** elegir el primer canal y documentar: vinculación de identidad, política de acceso al hilo/sesión, autorización por acción, detención de una ejecución desde el canal, auditoría de todo mensaje recibido.
- **Afecta:** `03` §5.2, `04` §25, `06` §3.

## DP-4 · Cuotas: dónde se aplica el corte y con qué efecto

- **Tipo:** PRODUCTO + COSTE
- **Estado:** abierta (diseño propuesto en `09` §12.1) — la **línea base de valores** quedó fijada el 2026-10-19 (DP-18: perfil por ejecución, umbrales de anomalía, reglas de aplicación antes de iniciar llamadas y de no interrumpir efectos en curso)
- **Descripción:** falta definir el valor exacto de corte **por tenant/empleado/tarea** (el perfil por ejecución ya tiene valores) y probar el comportamiento de una ejecución detenida por presupuesto en medio de un efecto externo.
- **Criterio de cierre:** definir umbrales, y probar el corte en una ejecución con acción externa ya ejecutada (debe quedar reconciliable, no "a medias").
- **Afecta:** `09` §12.1, `04` §16/§22, `10` §18.

## DP-5 · Redis vs Valkey (licencias del stack)

- **Tipo:** LICENCIA + PRUEBA
- **Estado:** **sustitución obligatoria** por la política de licencias libres exclusivas (`STACK-LICENCIAS` §0.bis); queda la prueba de compatibilidad
- **Descripción:** la versión evaluada de Redis es tri-licencia (RSALv2 · SSPLv1 · AGPLv3), **ninguna licencia libre permisiva**, y el producto es SaaS propietario. La única opción admisible es **Valkey (BSD-3-Clause)**; la variante AGPL de Redis queda también fuera del stack por la política.
- **Criterio de cierre:** prueba de compatibilidad de los usos reales (caché, límites de tasa, coordinación transitoria, si se usa pub/sub o scripts Lua) contra Valkey fijado por versión. La variante AGPL de Redis queda también fuera del stack: Valkey la reemplaza sin obligaciones.
- **Estado de las capas (actualizado 2026-10-19 tras la aceptación de `ADR-011`):** licencia de Valkey **verificada** en la fuente del proyecto (BSD-3-Clause); **renombre aplicado** en los normativos (`02` §4, `05` §1, `10` §1, `00-INDEX.md` y espejos ES): Valkey es hoy el componente nombrado; compatibilidad técnica **no validada** (sin prueba); decisión de producto **tomada y formalizada** por `ADR-011` **Aceptado**.
- **Autorización del responsable (2026-10-19):** autorizadas las **pruebas de compatibilidad** de las sustituciones aceptadas por `ADR-011` y la **preparación** de la revisión de licencias del artefacto distribuible. Fijar versiones concretas y probar los **usos reales**: caché, límites de tasa, coordinación transitoria y pub/sub o scripts Lua **si se usan**.
- **Versión de referencia (verificada 2026-10-19 vía API de GitHub):** **Valkey 9.1.2** (BSD-3-Clause, release 2026-09-01). Criterio de cierre: prueba de los usos reales contra esa versión, con evidencia registrada.
- **Afecta:** `docs/reference/STACK-LICENCIAS.md` §0.bis/§3.1, `05` §1, `02` §4, `00-INDEX.md`, `10`, `docs/reference/COMPATIBILIDAD-Y-LICENCIAS-PREPARACION.md`.

## DP-6 · Licencias condicionales del stack de IA/observabilidad

- **Tipo:** LICENCIA
- **Estado:** pendiente de revisión por componente; bajo la política de licencias libres exclusivas (`STACK-LICENCIAS` §0.bis) los componentes no libres y los AGPL salen del stack de referencia → **sustitución obligatoria**
- **Descripción:** el **stack evaluado** incluía componentes no libres o con edición enterprise que hoy están **fuera del stack de referencia** por la política de licencias libres y fueron sustituidos en los documentos normativos con la aceptación de `ADR-011` (2026-10-19): **Vault** (BUSL-1.1) → OpenBao; **Grafana** y **Loki** (AGPL-3.0) → Perses y VictoriaLogs/OpenSearch; **MinIO** (AGPL-3.0) → SeaweedFS. Queda un componente **evaluado** —el servidor de observabilidad de LLM— cuya edición `ee/` trae licencia adicional: está **descartado** por la política y no se activa. **Ninguna de estas sustituciones está validada técnicamente.**
- **Criterio de cierre:** por cada componente: versión exacta fijada, licencia libre declarada y clasificada (permisiva / copyleft), y decisión de uso (OSS vs edición enterprise — esta última **descartada** por la política). Sustituciones **obligatorias**: Grafana → **Perses** (Apache-2.0), Loki → **VictoriaLogs**/OpenSearch (Apache-2.0), MinIO → **SeaweedFS** (Apache-2.0), Vault → **OpenBao** (MPL-2.0) — con licencia **verificada** el 2026-10-19 en la fuente de cada proyecto.
- **Estado de las capas (revisado tras la aceptación de `ADR-011`, 2026-10-19):** licencias directas **verificadas** (no *validadas* técnicamente); el árbol **transitivo** sigue sin verificar hasta que existan el SBOM y el *license gate* de `06` §18; la **variante de licencia del artefacto empaquetado** (digests de imágenes, avisos incluidos) **no fue revisada** → validación legal **pendiente**. **Garage** quedó sin licencia verificada: no debe proponerse como sustituto hasta verificarla. La aceptación del ADR **no** convierte ninguna de estas capas en cerrada.
- **Autorización del responsable (2026-10-19):** autorizadas las **pruebas de compatibilidad** y la **preparación de la revisión de licencias** del artefacto distribuible. **La distribución comercial queda bloqueada** hasta completar las verificaciones requeridas y obtener la revisión legal correspondiente. Hermes **puede** ejecutar comprobaciones automatizadas y preparar evidencias, y **no puede** declarar una aprobación legal.
- **Preparación en curso (2026-10-19):** `docs/reference/COMPATIBILIDAD-Y-LICENCIAS-PREPARACION.md` reúne la matriz de sustituciones con **versiones de referencia verificadas** en la fuente de cada proyecto, los usos a probar y los entregables a producir: matriz de compatibilidad con pruebas reproducibles, inventario de dependencias directas y transitivas, **SBOM** del artefacto empaquetado, verificación de licencias y avisos incluidos, inventario de imágenes y versiones exactas, e informe de riesgos con los puntos que necesitan revisión legal. **Ninguno de esos entregables está producido**: no existe todavía artefacto empaquetado del que extraer un SBOM — y por eso la revisión legal no puede iniciarse sobre algo que no existe.
- **Versiones de referencia verificadas (API de GitHub, 2026-10-19):** OpenBao **v2.7.1** (MPL-2.0) · Perses **v0.54.0** (Apache-2.0) · VictoriaLogs **v1.53.0** (Apache-2.0) · OpenSearch **3.9.0** (Apache-2.0) · SeaweedFS **4.48** (Apache-2.0) · Valkey **9.1.2** (BSD-3-Clause). Verificar la **variante de licencia del artefacto distribuible** sigue pendiente.
- **Afecta:** `docs/reference/STACK-LICENCIAS.md` §0.bis/§3.3–3.6, `06` §18, `10` §17, `ADR-011`, `docs/reference/COMPATIBILIDAD-Y-LICENCIAS-PREPARACION.md`.

## DP-17 · Hacer normativa la política de licencias libres exclusivas

- **Tipo:** PRODUCTO + LICENCIA
- **Estado:** **CERRADA en su capa documental** el 2026-10-19: `ADR-011` (`docs/adr/ADR-011-free-licence-stack.md` + espejo `docs/es/adr/`) pasó a **Aceptado** por decisión del responsable de producto y los normativos fueron **renombrados** a los equivalentes libres. Trazabilidad: `docs/reference/REGISTRO-CAMBIOS-2026-10-19-ADR-011-ACEPTADO.md`. Lo que sigue abierto no es la política, sino su **compatibilidad técnica** (DP-5, DP-6) y la **validación legal** de las variantes empaquetadas.
- **Descripción y estado histórico:** el responsable del producto dispuso *"usemos licencias libres exclusivamente"* (2026-10-19). **Antes de la aceptación**, la política era un **criterio de selección** aplicado en el inventario no normativo (`STACK-LICENCIAS` §0.bis) y **no era regla vigente** en `docs/architecture`.
- **Estado actual (desde el 2026-10-19):** `ADR-011` está **aceptado**, así que la política **es regla normativa** del paquete y los documentos normativos **nombran los componentes libres** (ver *Renombres aplicados*, abajo).
- **Trabajo que sigue pendiente:** (a) **compatibilidad técnica** de las sustituciones (DP-5, DP-6) — ninguna sustitución está probada; (b) verificación del **árbol transitivo** de dependencias (SBOM + *license gate* de `06` §18); (c) **validación legal** de la variante de licencia del artefacto que se distribuya (digests de imágenes, avisos incluidos).
- **Contenido del ADR-011 (Aceptado el 2026-10-19):** solo licencias libres OSI/FSF; *source-available* no libre (BUSL, RSALv2, SSPLv1, ELv2, "commons clause", *Additional Use Grant*) **prohibida sin excepción**; dentro de las libres, permisivas por defecto y copyleft (AGPL/GPL) solo por ADR de excepción con obligación asumida y plan de salida; el **stack de referencia queda 100% permisivo** (OpenBao, Valkey, Perses, VictoriaLogs/OpenSearch, SeaweedFS); license gate en CI + SBOM + `THIRD-PARTY-NOTICES`; nunca activar `enterprise/`/`ee/`/`wl/`; nada que prohíba ofrecer el producto como servicio hospedado o imponga proveedor exclusivo.
- **Renombres aplicados en la misma revisión de la aceptación:** `00-INDEX.md` (tabla de stack: `Valkey`, `OpenBao`), `02` §4 (filas y etiqueta del diagrama), `04` (diagrama de credenciales), `05` §1 (tabla de autoridades), `06` §7 (secretos), `07` (diagrama MCP), `09` §2 (`Perses`, `VictoriaLogs`/`OpenSearch`), `10` §1–§3 (servicios y configuración), nota de implementación de `ADR-007`, espejos `docs/es/` y `EXPLICACION-NO-TECNICA.md`. Registro: `REGISTRO-CAMBIOS-2026-10-19-ADR-011-ACEPTADO.md`.
- **Estado por capas (auditoría 2026-10-19).** Son cinco cosas distintas y ninguna implica la siguiente:

| Capa | Estado | Evidencia / dónde |
|---|---|---|
| **1. Decisión de producto** (licencias libres exclusivamente) | **Tomada** el 2026-10-19 por el responsable | `STACK-LICENCIAS` §0.bis; `REGISTRO-CAMBIOS-DOCUMENTALES-2026-10-19.md` §4.1 |
| **2. Aceptación formal del ADR-011** | **Hecha** — el responsable de producto aceptó el ADR el 2026-10-19 | `ADR-011` (*Estado de esta decisión*), espejo ES, `REGISTRO-CAMBIOS-2026-10-19-ADR-011-ACEPTADO.md` |
| **3. Compatibilidad técnica de las sustituciones** | **Pendiente** — sin pruebas; Valkey/OpenBao son compatibles a nivel de API para nuestros usos, pero eso no está demostrado | DP-5, DP-6 |
| **4. Verificación de licencias** | **Hecha** para los componentes directos; **abierta** en el árbol transitivo (falta SBOM + license gate) | `STACK-LICENCIAS` §0.bis/§4, `06` §18 |
| **5. Validación legal** | **Pendiente** — variante de licencia del artefacto empaquetado sin revisar | DP-6 |

- **Estado documental (aplicado el 2026-10-19):** con el ADR aceptado, los componentes salientes fueron **renombrados** en los normativos — `00-INDEX.md`, `02` §4, `04` (diagrama de credenciales), `05` §1, `06` §7, `07` (diagrama MCP), `09` §2, `10` §1–§3, `ADR-007` y los espejos `docs/es/`, más `EXPLICACION-NO-TECNICA.md` — y las anotaciones del período `Propuesto` quedaron reemplazadas por el nombre del componente adoptado. El renombre es trazable en `REGISTRO-CAMBIOS-2026-10-19-ADR-011-ACEPTADO.md`.
- **Criterio de cierre (parcialmente cumplido):** ADR-011 **Aceptado** ✔ y renombres **aplicados y verificados con los validadores** ✔; sigue pendiente la prueba de compatibilidad de las sustituciones (DP-5, DP-6) antes de comprometerlas en el despliegue.
- **Afecta:** `docs/adr/ADR-011`, `docs/adr/ADR-007`, `00-INDEX.md`, `01` §7.1, `02`, `05`, `09`, `06` §18, `10`, `docs/development/*`, `docs/reference/STACK-LICENCIAS.md`.

## DP-18 · Umbrales cuantitativos y ventanas de retención

- **Tipo:** PRODUCTO + PRUEBA
- **Estado:** **valores adoptados** el 2026-10-19 por el responsable del producto; **validación en producción pendiente**
- **Naturaleza de estos valores:** **línea base de ingeniería para el MVP**, configurable por entorno y perfil de tarea. **No** son un SLA comercial, ni una obligación legal, ni una validación técnica: requieren evidencia antes de presentarse como alcanzados.

| Ámbito | Valor inicial |
|---|---|
| Checkpoints del runtime | Eliminación **7 días después** de que la ejecución alcance un estado terminal (`ADR-012`) |
| Aprobaciones | Aviso a las **24 h**, escalamiento a las **72 h**, revisión a los **7 días**; **sin cancelación ni rechazo automático** (`ADR-014`) |
| Ejecución sin progreso inesperado | Aviso a los **15 min**, alerta crítica a los **60 min**, excluyendo esperas explícitas |
| Anomalía de costo | Por encima de **2× la mediana** del perfil y versión, ventana móvil de **30 días**, con al menos **20 observaciones** |
| Perfil inicial de bajo costo (por ejecución) | **15 min** de cómputo activo, **20** llamadas al modelo, **40** llamadas a herramientas, **50.000** tokens, **USD 2** de presupuesto estimado |
| Delegación | Profundidad máxima **3**; **5** agentes delegados concurrentes y **3** acciones externas concurrentes por ejecución |
| Auditoría | **365 días** por defecto, sujeto a contrato y requisitos aplicables |
| Logs operativos | **30 días** |
| Trazas detalladas del agente | **14 días** con redacción de datos sensibles; prompts completos **desactivados por defecto**; depuración temporal de hasta **7 días** bajo autorización |
| Taxonomía de auditoría retirada | Conservar **equivalencias** durante la ventana de retención y el margen de migración que corresponda (DP-13) |
| Piloto (recuperación) | **RPO 24 h** / **RTO 8 h** |
| Producción (objetivo futuro) | **RPO 1 h** / **RTO 4 h**, no contractual, condicionado a pruebas de restauración |
| Calidad | ≥ **95 %** de éxito en el conjunto representativo de tareas de bajo riesgo; sin regresiones superiores a **2 puntos porcentuales** sin justificación aprobada |
| Seguridad | **100 %** de cumplimiento de las pruebas deterministas de autorización; **cero** acciones externas no autorizadas en el conjunto de pruebas |

- **Reglas de aplicación (2026-10-19):** los límites monetarios y operativos se aplican **antes** de iniciar nuevas llamadas o acciones; **no** se interrumpen efectos externos en curso sin gestión del resultado y reconciliación (`04` §16/§18, `09` §12.1).
- **Dónde está aplicado:** `04` §16 (presupuesto), `04` §21.2 (checkpoints), `04` §23 (delegación), `05` §10.1 y `ADR-014` (aprobaciones), `09` §13 (alertas y retención de evidencia), `09` §12.1 (anomalía de costo), `10` §9 (RPO/RTO), `01` §8 (aceptación).
- **Capas:** decisión **adoptada**; diseño **documentado**; prueba **sin ejecutar**; la validación en producción exige evidencia.
- **Criterio de cierre:** cada valor probado en su escenario (corte por presupuesto, envejecimiento de aprobación, detección de anomalía, restauración, evaluación de calidad) con evidencia registrada. Quién puede cambiar cada valor queda por definir en el plano de control.
- **Afecta:** `04` §16/§21.2/§23, `01` §8, `05` §10.1, `09` §12.1/§13, `10` §9, `ADR-012`, `ADR-014`.

## DP-19 · Relación con Hermes-OS (origen de supuestos de diseño o sistema externo a integrar)

- **Tipo:** PRODUCTO + ARQUITECTURA
- **Estado:** **CERRADA** el 2026-10-19 — **opción (a)**, referencia de diseño, **sin integración**
- **Decisión (responsable del producto, 2026-10-19):** *"Hermes-OS es una referencia de diseño y **no** un sistema que debamos integrar por defecto"*. La plataforma **se construye desde cero**; la arquitectura y la documentación existente se conservan como **base de diseño**, pero **no se presupone que exista código reutilizable**. **No se crean dependencias de integración** con Hermes-OS sin tres cosas: repositorio verificable, contratos identificados y una decisión posterior expresa.
- **Descripción (histórico):** el paquete afirmaba que "no se reescribe lo que ya funciona y es diferenciador (control plane / seguridad / tenancy de **Hermes-OS**)" (`00-INDEX.md`) y que se "reutiliza lo que ya funciona" de "un proyecto base con seguridad y control multi-cliente" (`EXPLICACION-NO-TECNICA.md` §6). Ninguna de las dos afirmaciones tenía respaldo verificable **dentro de este paquete**: no declara repositorio, alcance ni interfaces de Hermes-OS, y el repositorio público con ese nombre (`ivanross81-png/herrmes-os`) está **vacío** (0 archivos, sin commits). Ambas afirmaciones fueron corregidas en la verificación posterior (V-2, V-3).
- **Opción (b) — descartada:** integrarlo como sistema externo exigiría declarar **repositorio**, **alcance** e **interfaces** (contratos públicos, límites de seguridad, identidad y tenancy) y evaluar impacto en `02`, `06` y `ADR-001`; **no** es la decisión vigente. Si en el futuro se propone, requiere repositorio verificable, contratos identificados y decisión expresa — y ADR si cambia límites.
- **Capas:** decisión **adoptada** y cerrada; los textos normativos y de raíz ya reflejan que no hay código reutilizable.
- **Afecta:** `00-INDEX.md`, `EXPLICACION-NO-TECNICA.md`, `docs/reference/KORTIX-analisis-y-licencias.md` (mención **comparativa**: no se modifica), `04` §25, `02`, `06`, `ADR-001`.

## DP-20 · Atributos operativos (Search Attributes) de aprobaciones

- **Tipo:** PRODUCTO + PRUEBA
- **Estado:** **conjunto mínimo definido** el 2026-10-19; **prueba de contrato pendiente**
- **Decisión (responsable del producto, 2026-10-19):** atributos mínimos `TenantId`, `EmployeeId`, `ApprovalStatus`, `ApprovalType`, `ApprovalPriority`, `AssignedGroup`, `ApprovalDueAt`, y `ApproverSubjectId` **opcional** (solo con identificador opaco) para una bandeja personal. Documentado en `04` §22.1, con la regla de que **sirven para localizar y filtrar workflows, no como fuente de verdad** del estado de negocio, ni mecanismo de autorización, ni garantía de aislamiento: la API verifica permisos y lee el detalle de la aprobación desde el almacén de dominio.
- **Capas:** decisión **adoptada**; diseño **documentado**; prueba **sin ejecutar**.
- **Criterio de cierre:** prueba de contrato: registrar los atributos con sus tipos en el namespace de Temporal de la versión en uso; verificar que un workflow pendiente se localiza por cada filtro declarado; y una prueba negativa de que **ninguna** decisión de autorización se deriva de un atributo (búsqueda por atributo con identidad sin permiso debe fallar igual).
- **Afecta:** `04` §22.1, `09` §2, `05` §10.1, `06` §3.

## DP-7 · Aislamiento multiempresa: mecanismo único de enforcement

- **Tipo:** SEGURIDAD
- **Estado:** abierta — **condición de producto añadida el 2026-10-19:** una modalidad SaaS con **recursos compartidos** se evalúa **solo después de validar el aislamiento** y cerrar un ADR específico; hasta entonces la primera etapa productiva son instalaciones dedicadas (`01` §7.1)
- **Descripción:** la arquitectura exige aislamiento fuerte por tenant. La investigación de referencia mostró un esquema donde una parte importante de las tablas no tenía row-level security y el aislamiento de clientes descansaba en una única revocación de permisos — patrón frágil que conviene no replicar.
- **Opciones:** (a) esquema por tenant; (b) row-level security obligatoria en todas las tablas multiempresa + revocaciones; (c) base por tenant.
- **Criterio de cierre:** prueba negativa automatizada (un tenant no puede leer ni escribir datos de otro por ninguna ruta, incluida la de administración) + regla de que toda tabla nueva multiempresa nace con la protección aplicada por defecto.
- **Afecta:** `06` §3, `05` §1, `10`.

## DP-8 · Base vectorial / recuperación

- **Tipo:** COSTE + RENDIMIENTO
- **Estado:** línea base fijada (PostgreSQL + pgvector), ampliación no decidida
- **Descripción:** la línea base usa pgvector; la investigación muestra productos que ofrecen recuperación con más capas. Falta decidir el umbral (volumen/latencia/calidad) que justificaría una base vectorial dedicada.
- **Criterio de cierre:** benchmark con volumen y consultas representativas del caso de negocio; decisión solo si el umbral se supera.
- **Afecta:** `08`, `10`.

## DP-9 · Política: motor externo (OPA) vs evaluación embebida

- **Tipo:** PRUEBA + COSTE
- **Estado:** línea base fija (OPA/Rego como referencia), decisión de despliegue abierta
- **Descripción:** falta decidir si OPA corre como servicio aparte o embebido en el proceso de enforcement, y cómo se distribuyen y versionan las políticas a los puntos de decisión.
- **Criterio de cierre:** medir latencia por decisión y complejidad operativa (¿un servicio más que instalar en cliente?) y verificar que la evaluación es determinista y auditable en ambos modos.
- **Afecta:** `06` §4/§4.1, `10` §17.

## DP-10 · Conectores delegados a usuario: alcance y consentimiento

- **Tipo:** PRODUCTO + SEGURIDAD
- **Estado:** requisitos fijados (`07` §8.1), diseño de UX/consentimiento abierto
- **Descripción:** falta definir el flujo de consentimiento (por usuario, por conector), la UI de permisos y la política de revocación cuando la persona cambia de rol.
- **Criterio de cierre:** diseño revisado + prueba de que una delegación revocada produce error tipado y **no** un fallback a credencial de servicio.
- **Afecta:** `07` §8.1, `06` §2.1, `05` §5.1 (auditoría de doble identidad).

## DP-11 · Almacenamiento de artefactos

- **Tipo:** COSTE + OPERACIÓN
- **Estado:** contrato fijado (`05` §21), medio de almacenamiento no decidido
- **Descripción:** falta elegir el almacén de contenido (sistema de archivos del host con permisos, servicio de objetos compatible con S3, o el almacén de documentos de la suite de colaboración ya usada en el laboratorio) y si forma parte del backup/restore de la instalación privada.
- **Criterio de cierre:** prueba de ciclo de vida (crear, versionar, retener, borrar preservando el registro de auditoría) y verificación de que entra en el backup (`10` §9/§17).
- **Afecta:** `05` §21, `08` §13, `10`.

## DP-12 · Empaquetado y promoción de definiciones

- **Tipo:** PRODUCTO
- **Estado:** **provisional** (`03` §15)
- **Descripción:** export/import de definiciones (empleado, tareas, disparadores, skills, políticas) como paquete diffeable para promoción de entornos y control de cambios del cliente. Falta decidir el formato, si incluye políticas y permisos, y el flujo de revisión.
- **Criterio de cierre:** definir formato y probar una promoción desarrollo → producción con **nuevas versiones inmutables** (sin mutar publicadas) y sin secretos en el paquete.
- **Afecta:** `03` §12/§15, `05` §14.

## DP-13 · Versionado de la taxonomía de auditoría

- **Tipo:** PRUEBA + PRODUCTO
- **Estado:** taxonomía fijada (`05` §5.1), mecanismo de compatibilidad abierto
- **Descripción:** falta decidir cómo se versionan y renombran los nombres canónicos de acción sin romper exportaciones históricas de clientes.
- **Criterio de conservación (responsable del producto, 2026-10-19):** conservar las **equivalencias** de los nombres retirados durante la **ventana de retención** y el **margen de migración** que corresponda, de modo que una exportación histórica siga resolviendo. El margen concreto queda por fijar (DP-18).
- **Criterio de cierre:** probar una exportación de auditoría que contenga nombres retirados y verificar resolución durante la ventana de retención.
- **Afecta:** `05` §5.1/§14, `09` §6.

## DP-14 · Metering y entitlements en instalación privada

- **Tipo:** PRODUCTO + LICENCIA
- **Estado:** diseño propuesto (`10` §18), mecanismo no decidido
- **Descripción:** falta definir si el metering se reporta online, offline o se deshabilita, y cómo se verifica el archivo de entitlements de una instalación privada sin introducir un mecanismo de control remoto que el cliente rechace.
- **Criterio de cierre:** decisión comercial + revisión de que el mecanismo no debilita ningún control de seguridad (`10` §18).
- **Afecta:** `10` §18, `06` §18.

## DP-15 · Observabilidad de la corrida interna del agente

- **Tipo:** PRUEBA + COSTE
- **Estado:** abierta
- **Descripción:** `09` exige trazabilidad por ejecución, pero falta decidir cuánta telemetría interna del runtime se conserva (trazas de pasos, prompts, salidas) frente a costo de almacenamiento y riesgo de exposición de datos personales.
- **Retención fijada (2026-10-19, DP-18):** **trazas detalladas del agente 14 días** con redacción de datos sensibles; **prompts completos desactivados por defecto**; depuración temporal de hasta **7 días** bajo autorización; auditoría **365 días**; logs operativos **30 días**.
- **Criterio de cierre:** probar la **redacción** de datos sensibles en las trazas y demostrar que la reconstrucción de una ejecución para auditoría sigue siendo posible sin conservar prompts completos de forma indefinida.
- **Afecta:** `09` §3/§6/§12, `06` §17, `05` §3.

## DP-16 · Frontera entre workflow durable y corrida de agente

- **Tipo:** PRUEBA
- **Estado:** frontera **decidida**; umbral operativo a probar
- **Descripción:** la frontera está fijada (`04` §21: Temporal es la única autoridad de durabilidad). Falta validar en la práctica qué pasos del agente ameritan ser *activities* separadas y cuáles deben quedar dentro de la misma corrida (costo de eventos vs granularidad de recuperación).
- **Criterio de cierre:** prueba de una ejecución de referencia con caída de worker y aprobación humana; medir número de eventos generados y verificar recuperación correcta sin re-ejecutar efectos ya aplicados.
- **Afecta:** `04` §21, `05` §1, `10` §6.

---

## Reglas de uso

1. Una entrada se cierra solo con la validación declarada; hasta entonces, la implementación **no debe** decidirla implícitamente.
2. Cerrar una entrada que cambie una decisión arquitectónica exige un **ADR** antes de modificar los documentos normativos. **Aplicado el 2026-10-19:** `ADR-012` (almacén de checkpoints, DP-1), `ADR-013` (frontera de cómputo, DP-2) y `ADR-014` (semántica de aprobaciones, que reemplaza el "rechazo por defecto" de `05` §10.1).
3. Las entradas de tipo LICENCIA bloquean el empaquetado de la instalación privada hasta resolverse. **Estado 2026-10-19:** pruebas y preparación autorizadas (DP-5, DP-6), pero la **distribución comercial sigue bloqueada** hasta completar las verificaciones y obtener la revisión legal.
4. Este documento se actualiza cuando se cierra una entrada (marcándola cerrada con fecha, evidencia y documento actualizado), no se reescribe.
5. Toda entrada se reporta por **capas** (decisión adoptada / diseño documentado / prueba ejecutada / verificación de licencia / aprobación legal). Una capa cumplida **no** implica la siguiente, y **Hermes no emite aprobaciones legales**.
