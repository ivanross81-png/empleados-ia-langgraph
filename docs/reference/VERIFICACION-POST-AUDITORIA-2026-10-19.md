---
type: reference
status: active
created: 2026-10-19
updated: 2026-10-19
tags: [digital-employee, verificacion, auditoria, consistencia, trazabilidad, post-auditoria]
---

# Verificación posterior a la auditoría de consistencia — 2026-10-19

> **No normativo.** Informe de la revisión de seguimiento pedida tras la auditoría. Complementa —no reemplaza— `AUDITORIA-CONSISTENCIA-2026-10-19.md` (hallazgos A-1…A-10) y `REGISTRO-CAMBIOS-2026-10-19-AUDITORIA.md`. Trazabilidad de los cambios de esta revisión: `REGISTRO-CAMBIOS-2026-10-19-VERIFICACION-POST-AUDITORIA.md`. Hallazgos residuales en el cuadro de seguimiento: `KORTIX-CROSS-MATRIX.md` §C.5.

## 1. Objeto, alcance y método

| | |
|---|---|
| **Objeto** | Comprobar el estado **publicado** de la documentación y corregir las inconsistencias residuales demostrables |
| **Rama / commit verificados** | `main` en **`8c881ea232c6dadd937438337932f4786462b402`** (2026-10-19 23:35:48 +0000) |
| **Sincronía** | `git fetch` + comparación de SHA: local = `origin/main`; árbol de trabajo limpio al iniciar |
| **Método** | Lectura directa de los archivos publicados (no del informe previo); barrido por patrón de los términos exigidos; clasificación de cada aparición; `git log -L` para fechar las líneas cuando hacía falta; validadores documentales al final, con salida textual |
| **Alcance** | Documental. **No** se tocó código, dependencias, servicios ni límites arquitectónicos |
| **Lo que NO es** | No es una validación técnica: ninguna capacidad, sustitución de componente ni licencia queda probada por este informe |

**Regla de evidencia aplicada:** una afirmación de un documento no demuestra que exista un repositorio de software; un ADR aceptado no valida una sustitución técnica; y una corrección declarada en un informe anterior no se considera vigente hasta comprobarla en el archivo.

## 2. Verificación de los puntos señalados en el encargo

| # | Punto del encargo | Estado encontrado en el repositorio | Resultado |
|---|---|---|---|
| 1 | `00-INDEX.md` conservaría el recuento de **26** documentos | Dice **27** (11 arquitectura + 11 ADR + 5 guías) desde `51f7f686` | **No reproducible** |
| 2 | `00-INDEX.md` citaría `docs/DOCUMENT-MANIFEST.md` | Cita `DOCUMENT-MANIFEST.md` (raíz) desde `51f7f686` | **No reproducible** |
| 3 | El stack de `00-INDEX.md` mostraría `Redis` y `Vault/KMS` | Muestra **Valkey¹** y **OpenBao¹** desde `8c881ea`, con nota al pie del ADR aceptado | **No reproducible** |
| 4 | El histórico de 26 y el vigente de 27 no estarían distinguidos | Cierto: solo estaba el bloque de 27 | **Residual real** → se agregó el bloque *Trazabilidad del recuento* |
| 5 | Los dos manifiestos describirían `ADR-011` como **Propuesto** | Cierto: `DOCUMENT-MANIFEST.md` §7.0 fila 22 (`**Proposed**`) y su espejo (`**Propuesto**`) | **Residual real** → corregido a `Accepted` / `Aceptado` (V-1) |
| 6 | `DP-17` se contradiría | Cierto: estado "cerrada en su capa documental" vs descripción "todavía no es regla vigente en `docs/architecture`" | **Residual real** → descripción separada en histórico / actual / pendiente (V-4) |
| 7 | `DP-6` presentaría Vault, Grafana, Loki y MinIO como stack **actual** | Cierto: "el stack objetivo incluye componentes no libres…" | **Residual real** → "stack evaluado… hoy fuera del stack de referencia", con destino por componente (V-5) |
| 8 | La explicación no técnica usaría `Redis` y `Vault` para el stack elegido | **No reproducible** en esos términos: ya dice **Valkey** (tabla y "memoria de trabajo") y **OpenBao** (tabla, por qué se eligió, glosario) desde `8c881ea`. Pero afirmaba, en otro pasaje, código reutilizable de un "proyecto base" | **Residual real distinto** → corregido (V-3) |
| 9 | `ADR-011` §Contexto | Describe el stack con presente del indicativo ("The current reference stack contains…"), sin aclarar que es el contexto **previo** a la aceptación | **Residual real** → nota aclaratoria agregada, contexto no reescrito (V-6) |
| 10 | Afirmaciones sobre **código existente o reutilizable** | Dos afirmaciones sin respaldo verificable (ver §3) | **Residual real** → textos corregidos + **DP-19** (V-2, V-3) |

## 3. La ambigüedad sobre código reutilizable (punto 6 del encargo)

**Qué afirmaba la documentación.** `00-INDEX.md` §Principios: *"**No se reescribe** lo que ya funciona y es diferenciador (control plane / seguridad / tenancy de Hermes-OS)"*. `EXPLICACION-NO-TECNICA.md` §6: *"ya tenemos un proyecto base con seguridad y control multi-cliente muy valioso. No lo tiramos: **reutilizamos lo que ya funciona**"*.

**Qué se comprobó.**

- El paquete **no declara** repositorio, alcance, versiones ni **interfaces** de Hermes-OS en ningún documento normativo ni de referencia.
- La única mención con contenido es **comparativa**, dentro del análisis de la referencia externa: *"Control plane / tenancy / SSO propios (Hermes-OS) — no duplicar"* (`KORTIX-analisis-y-licencias.md`), es decir, un criterio de **no duplicación**, no un contrato de integración.
- El repositorio público con ese nombre (`ivanross81-png/herrmes-os`) está **vacío** (0 archivos, sin commits, `pushed_at` 2026-09-10): no es evidencia de una base de código publicada.
- Una afirmación de la documentación **no** demuestra la existencia de un repositorio de software.

**Conclusión.** No hay base de código reutilizable **confirmada** para esta plataforma, y la relación con Hermes-OS **no puede determinarse con la evidencia disponible**. Por eso no se resolvió por inferencia:

1. Los textos ahora dicen que la plataforma **se construye desde cero** y que su base es **este paquete documental** (principios, contratos, ADR, reglas de seguridad), que se preserva y enriquece.
2. **Hermes-OS queda identificado como un sistema aparte**, de otro proyecto, y **no** se afirma que su código forme parte de esta plataforma ni que se reutilice.
3. La cuestión se registra como **DP-19** (`DECISIONES-PENDIENTES.md`), con dos opciones explícitas: **(a)** origen de supuestos de diseño, sin integrar nada; **(b)** sistema externo a integrar, que exige declarar repositorio, alcance e **interfaces** (contratos públicos, límites de seguridad, identidad y tenancy) y evaluar impacto en `02`, `06` y `ADR-001` —posiblemente con un ADR nuevo—. La decisión es del **responsable del producto**.
4. La mención **comparativa** de `KORTIX-analisis-y-licencias.md` **no se modificó**: allí es correcta y necesaria.

## 4. Sincronización de manifiestos, ADR-011, DP-17 y DP-6

- **Manifiestos:** ambos inventarios (§7.0, fila 22) describían `ADR-011` con el estado **anterior** a la aceptación. Corregido a `Accepted` / `Aceptado` (2026-10-19). El historial se conserva: las entradas de la **bitácora** (§8) siguen registrando cuándo se propuso y cuándo se aceptó, y la entrada de la propuesta ya está marcada como superada por la aceptación.
- **`docs/adr/ADR-011-free-licence-stack.md` y espejo:** estado `Accepted` / `Aceptado`, capa de aceptación formal **Hecha**, y ahora una **nota** en §Contexto que aclara que ese contexto describe la situación a la fecha de la decisión. **El texto de contexto no se reescribió** (historia de la decisión).
- **`00-ARCHITECTURE-INDEX.md` §13 (EN/ES):** ya describía la aceptación y los renombres; esta revisión agrega §14 con el resultado de la verificación.
- **DP-17:** resumen y descripción ahora coherentes (ver V-4).
- **Clasificación de pruebas técnicas y legales:** **sin cambios**. DP-5 y DP-6 siguen **abiertas**: compatibilidad de las sustituciones sin probar, árbol transitivo sin verificar (falta SBOM + *license gate*) y validación legal del artefacto distribuido pendiente. La aceptación del ADR **no** cierra ninguna de esas capas.

## 5. Barrido de discrepancias (§7 del encargo): clasificación

Barrido por patrón sobre los 74 archivos `.md`, con clasificación de cada aparición. **Ningún grupo se sustituyó automáticamente.**

| Grupo (archivos) | Menciones de `Redis`/`Vault`/`Grafana`/`Loki`/`MinIO` | Clasificación | Acción |
|---|---|---|---|
| `docs/architecture/*` y espejos (02, 05, 09, 00-ARCHITECTURE-INDEX) | 10 líneas | **Referencia explícita al componente reemplazado** ("Valkey… *replaces Redis 8 per `ADR-011`*"; "Perses… *replaces Grafana*") | **Se conservan**: prohibirlas eliminaría la trazabilidad del cambio |
| `docs/adr/ADR-011` (EN/ES) | 13 líneas | **Contexto y consecuencias de la decisión** (`replaces HashiCorp Vault/BUSL`, alternativa rechazada, "left the reference stack") | Se conservan; se agrega solo la **nota** de §Contexto (V-6) |
| `docs/adr/ADR-007` (EN/ES) | 4 líneas | **Texto de decisión inmutable** ("Use Vault or an equivalent KMS-backed…") + nota de implementación que fija OpenBao | Se conserva (integridad del ADR). Riesgo de lectura cruzada mitigado por la nota |
| `00-INDEX.md`, `README.md` | 2 líneas | **Referencia al componente reemplazado** dentro de la explicación del stack vigente | Se conservan |
| `docs/reference/STACK-LICENCIAS.md` | 45 líneas | **Investigación / inventario comparativo de licencias** (riesgo del componente saliente, candidatos, verificación de licencia) | **No se modifican**: son el registro probatorio |
| `docs/reference/KORTIX-INVESTIGACION-v0.14.3.md`, `KORTIX-CROSS-MATRIX.md`, `KORTIX-analisis-y-licencias.md` | 39 líneas | **Investigación / comparación con la referencia externa** | **No se modifican** (regla 4 del encargo) |
| `docs/reference/REGISTRO-*` (3 registros previos + este) y anexo supersedido | 52 líneas | **Contexto histórico**: describen el estado en su fecha | **No se modifican**; este registro es nuevo |
| `docs/reference/DECISIONES-PENDIENTES.md` | 10 líneas | Mezcla: **pendiente de sustitución/prueba** (DP-5, DP-6) + decisiones | Corregido solo donde describía el stack como **actual** (V-5) |
| Nombres adoptados (**Valkey, OpenBao, Perses, VictoriaLogs, SeaweedFS**) | en 17–25 archivos cada uno | **Componente vigente** en normativos y raíz | Sin cambios |
| **Inconsistencias reales** | 8 hallazgos (**V-1…V-8**) | **Residual** | Corregidas o registradas (`KORTIX-CROSS-MATRIX.md` §C.5) |

Comprobación específica de los términos exigidos: `Proposed`/`Propuesto` del ADR-011 ya **no aparece** como estado vigente en ningún documento (solo en el historial de la bitácora y en los cuadros de estado de la auditoría, donde describe el pasado); los recuentos **26/27** aparecen únicamente como histórico/vigente explícitamente rotulados; y la ruta errónea `docs/DOCUMENT-MANIFEST.md` solo sobrevive citada dentro de los informes que **describen el defecto histórico**.

## 6. Reproducibilidad de las validaciones

- **Validadores usados:** `check-docs.py` (enlaces, referencias a documentos del paquete, Mermaid, duplicados), `check-parity.py` (paridad estructural EN↔ES de los 29 pares) y `verify-all.py` (inventario, metadatos, estados de ADR EN=ES, referencias a secciones existentes, contadores declarados).
- **Limitación registrada, sin simulación:** los tres son **herramientas de la sesión de trabajo y no están en el repositorio**. Se ejecutaron **en esta revisión** y su salida exacta está en el registro de cambios (§3). Los resultados de la auditoría anterior **no** se usaron como evidencia del estado actual: se volvieron a ejecutar.
- **Propuesta de reproducibilidad (P-27, existente):** incorporarlos como herramientas del repositorio, por ejemplo `tools/docs-verify/` con `check_docs.py`, `check_parity.py` y `verify_all.py` sin dependencias más allá de la biblioteca estándar, más una entrada en `README.md` y una tarea de CI que falle con hallazgos. **No se implementó**: publicar código en el repositorio excede el alcance de esta revisión documental y requiere decisión del responsable.
- **Salida exacta de esta corrida:** `check-docs.py` → 74 archivos `.md`, 185 enlaces/referencias verificadas OK, 8 bloques Mermaid OK, 0 basenames duplicados, **0 hallazgos**. `check-parity.py` → **0 divergencias / 29 pares**. `verify-all.py` → inventario 74 (raíz 4 · architecture 11 · adr 11 · development 5 · reference 14 · espejos ES 29), espejos normativos 27 (esperado 27), campos de metadatos faltantes 0, estados de ADR EN=ES 11/11 `Accepted`, referencias cruzadas roídas 0, enlaces roídos 0, cercas impares 0, contadores declarado 74 = real 74, **hallazgos: 0**.
- **Validación manual ejecutada** (los ocho puntos de §9 del encargo): coincidencia de los dos manifiestos en cantidades, rutas, estado de `ADR-011` y bitácora; rutas existentes y stack vigente en `00-INDEX.md`; explicación no técnica sin componentes salientes como actuales; coherencia de DP-17 entre resumen y descripción; `git diff` revisado completo; validadores ejecutados con salida registrada; paridad EN↔ES de los documentos afectados; y declaración explícita de que **esto no es una validación técnica de la arquitectura**.

## 7. Riesgos que permanecen abiertos

| # | Riesgo | Tipo | Dónde se sigue |
|---|---|---|---|
| RP-1 | Ninguna sustitución de componente está validada técnicamente | Técnico | DP-5, DP-6 |
| RP-2 | Árbol transitivo de dependencias y variante de licencia del artefacto distribuido sin verificar | Legal | DP-6, `06` §18, I-11 |
| RP-3 | Relación con Hermes-OS indefinida: si fuera un sistema a integrar, faltan interfaces y podría requerir ADR | Producto/arquitectura | **DP-19** |
| RP-4 | Umbrales cuantitativos sin fijar: las pruebas que dependen de ellos no tienen criterio objetivo | Técnico/producto | DP-18 |
| RP-5 | Paridad EN↔ES verificada **estructuralmente**, no semánticamente; y los validadores viven fuera del repositorio | Mantenimiento | P-27 |
| RP-6 | Alcance de lectura: esta verificación revisó el estado publicado con barridos y validadores, no con lectura línea por línea de los 74 archivos | Documental | Este informe §1 |

## 8. Decisiones humanas necesarias

1. **DP-19** — decidir si Hermes-OS es solo origen de supuestos de diseño **(a)** o un sistema externo a integrar **(b)**; en el caso (b), declarar repositorio, alcance e interfaces.
2. **DP-5 / DP-6** — autorizar y priorizar las pruebas de compatibilidad de Valkey, OpenBao, Perses, VictoriaLogs/OpenSearch y SeaweedFS, y la revisión legal del artefacto empaquetado.
3. **DP-18** — fijar los umbrales y ventanas sin definir.
4. **P-27** — decidir si los validadores documentales se incorporan al repositorio y a CI.
5. **DP-1, DP-2 y las decisiones de producto pendientes** de la auditoría: sin cambios en esta revisión.

## 9. Archivos modificados y justificación

| Archivo | Justificación |
|---|---|
| `DOCUMENT-MANIFEST.md` | Estado vigente de `ADR-011` en el inventario (V-1); inventario de referencia y bitácora actualizados con esta revisión |
| `docs/es/DOCUMENT-MANIFEST.md` | Espejo del anterior (V-1 y mismo inventario) |
| `00-INDEX.md` | Separación del recuento histórico (26) y el vigente (27) (V-7); corrección de las afirmaciones sobre código reutilizable y Hermes-OS (V-2) |
| `EXPLICACION-NO-TECNICA.md` | Eliminación de la afirmación de código reutilizable; la plataforma se construye desde cero (V-3) |
| `docs/reference/DECISIONES-PENDIENTES.md` | DP-17 coherente (histórico/actual/pendiente) (V-4); DP-6 sin presentar componentes sustituidos como actuales (V-5); **DP-19** nueva (RP-3) |
| `docs/adr/ADR-011-free-licence-stack.md` | Nota en §Contexto: describe la situación a la fecha de la decisión (V-6). La decisión no se modifica |
| `docs/es/adr/ADR-011-free-licence-stack.md` | Espejo (V-6) |
| `docs/reference/KORTIX-CROSS-MATRIX.md` | Cuadro de seguimiento §C.5 con V-1…V-8 y nota de estado de los cuadros |
| `docs/architecture/00-ARCHITECTURE-INDEX.md` | Sección §14 con el resultado de la verificación |
| `docs/es/architecture/00-ARCHITECTURE-INDEX.md` | Espejo de §14 |
| `docs/reference/VERIFICACION-POST-AUDITORIA-2026-10-19.md` | **Nuevo**: este informe |
| `docs/reference/REGISTRO-CAMBIOS-2026-10-19-VERIFICACION-POST-AUDITORIA.md` | **Nuevo**: registro de cambios de esta revisión, sin sobrescribir los anteriores |

## 10. Estado final de las inconsistencias

| ID | Inconsistencia | Estado final |
|---|---|---|
| V-1 | Manifiestos con `ADR-011` como `Proposed`/`Propuesto` | **Corregida** |
| V-2 | `00-INDEX.md`: código de Hermes-OS "que ya funciona" | **Corregida** (alcance del reuso → DP-19, abierta) |
| V-3 | `EXPLICACION-NO-TECNICA.md`: "proyecto base… reutilizamos lo que ya funciona" | **Corregida** |
| V-4 | `DP-17`: estado vs descripción | **Corregida** |
| V-5 | `DP-6`: componentes sustituidos presentados como stack actual | **Corregida** |
| V-6 | `ADR-011` §Contexto sin nota de fecha | **Corregida** (nota) |
| V-7 | `00-INDEX.md`: histórico y vigente no separados | **Corregida** (bloque de trazabilidad del recuento) |
| V-8 | Componentes salientes en documentos históricos, de investigación y comparativos | **No aplica** (correctas y necesarias; no se modifican) |

**Criterio de cierre de esta revisión:** el contenido real de los archivos publicados coincide con el estado de decisiones e inventarios declarado en los documentos de autoridad, en los ocho puntos verificados. Lo que sigue abierto es **decisión humana** (DP-19, DP-5, DP-6, DP-18, P-27), no inconsistencia documental.
