---
type: reference
status: active
created: 2026-10-19
updated: 2026-10-19
tags: [digital-employee, auditoria, registro-de-cambios, trazabilidad]
---

# Registro de cambios — auditoría de consistencia 2026-10-19

> **No normativo.** Trazabilidad de la auditoría documental del 2026-10-19 sobre `https://github.com/ivanross81-png/empleados-ia-langgraph`.
> No sobrescribe `REGISTRO-CAMBIOS-DOCUMENTALES-2026-10-19.md` (revisión aditiva del mismo día): este es el registro de la **auditoría** posterior.
> **Commit auditado:** `51f7f686c5542334115774ab757a7e586e11dd31` (rama `main`) — el estado publicado antes de esta auditoría.
> Informe completo: `AUDITORIA-CONSISTENCIA-2026-10-19.md`.

## 1. Cómo leer este registro

| Columna | Significado |
|---|---|
| **Archivo / sección** | Ruta relativa al repositorio y sección afectada |
| **Motivo** | Hallazgo que obliga el cambio (con su identificador cuando aplica) |
| **Estado anterior** | Qué decía el documento |
| **Estado nuevo** | Qué dice ahora |
| **Validación** | Cómo se comprobó el cambio (y qué **no** queda validado por él) |

Reglas respetadas: no se eliminó ningún documento; no se reemplazó un archivo completo cuando bastaba una edición localizada (las dos únicas reescrituras —`README.md` y `docs/es/DOCUMENT-MANIFEST.md`— se justifican abajo); no se renombró ningún módulo, entidad, servicio ni interfaz; no se cambió ninguna decisión arquitectónica aceptada; no se agregó ninguna dependencia del producto; no se escribió código funcional.

## 2. Correcciones de inventario y autoridad documental

| Archivo / sección | Motivo | Estado anterior | Estado nuevo | Validación |
|---|---|---|---|---|
| `00-INDEX.md` §Base documental y §Fuentes de verdad | C-7: contadores e índices desactualizados | "26 archivos"; `docs/DOCUMENT-MANIFEST.md` (ruta inexistente) | "27 archivos (11 arquitectura, 11 ADR, 5 guías)"; `DOCUMENT-MANIFEST.md` | Recuento real de archivos por categoría; `verify-all.py` §1 y §7 |
| `00-INDEX.md` §Fuentes de verdad | C-5: no se listaba el material de referencia | Mención parcial | Lista completa de `docs/reference/` (incluidos auditoría e invariantes) | `verify-all.py` §5 (enlaces y wikilinks), `check-docs.py` |
| `00-INDEX.md` §Stack objetivo | P-24: nombres de componentes vs estado real de la decisión | `Redis`, `Vault/KMS` sin nota | `Valkey¹`, `OpenBao¹` con nota al pie que declara el estado **Propuesto** de `ADR-011` | Revisión manual contra `ADR-011`; `INVARIANTES-Y-PRUEBAS` I-11 |
| `DOCUMENT-MANIFEST.md` §7.1–7.2 | C-7: el manifiesto no inventariaba los archivos de raíz ni el paquete completo | 27 normativos, sin raíz ni totales | Tabla de raíz (4 archivos) e inventario completo por categoría con el total de `.md` | `verify-all.py` §1/§7 compara el total declarado con el real |
| `DOCUMENT-MANIFEST.md` §7 (referencia) y §8 | C-7 y trazabilidad | 8 documentos de referencia; registro hasta la revisión aditiva | 11 documentos de referencia; registro con la entrada de auditoría | `verify-all.py` §5 |
| `docs/es/DOCUMENT-MANIFEST.md` (reescrito) | C-4/C-7: el espejo conservaba 26 filas, no tenía §7/§8 y mantenía el párrafo de borrador eliminado en inglés | Versión obsoleta | Espejo fiel del manifiesto inglés, con las mismas tablas y registros | `check-parity.py` (paridad estructural); lectura cruzada sección por sección |
| `README.md` (reescrito) | C-5/E: el punto de entrada del repositorio no describía el paquete, su autoridad ni su estado | 3 líneas de referencia al índice | Estructura, reglas de autoridad, estado de la política de licencias y validación | Lectura contra `00-INDEX.md`, `DOCUMENT-MANIFEST.md` y `00-ARCHITECTURE-INDEX.md` |
| `docs/es/README.md` (reescrito) | C-4: espejo mínimo, sin estado ni estructura | 5 líneas | Espejo del nuevo `README.md`, adaptado a la carpeta de lectura humana | `check-parity.py` |

## 3. Aclaraciones de contratos (normativos)

Todas son **ampliaciones o precisiones**; ninguna cambia un principio, una frontera ni un nombre de contrato.

| Archivo / sección | Motivo | Estado anterior | Estado nuevo | Validación |
|---|---|---|---|---|
| `docs/architecture/04-RUNTIME-EXECUTION-ARCHITECTURE.md` §21.2 (punto 5) | **Hallazgo A-1 (Alta): ambigüedad** — la frase "un modo que solo persiste al salir no alcanza para ejecuciones que pueden esperar a un humano" podía leerse como obligación de que el checkpointer administre las esperas humanas, contradiciendo el punto 2 de la misma sección | Una frase que mezclaba cinco nociones distintas | Tabla explícita de las cinco nociones (corrida cognitiva, espera humana duradera, recuperación del workflow, activity fallida, resultados de negocio) con su dueño, más la regla de que el almacén de checkpoints nunca sostiene una espera humana ni estado de negocio, y remisión a DP-1 | Contraste con `04` §21.1 y §21.2 (puntos 1–4), con `05` §1 y con `ADR-003`; **no se cerró DP-1** (sigue exigiendo la prueba comparativa) |
| `docs/architecture/04` §22 (nuevo bloque) | **Hallazgo A-2 (Media): avance parcial declarado como aplicado** — K-T1 (lectura/comando) figuraba como propuesta y el cuadro C.2 lo daba por aplicado | Solo se hablaba de "signals" | Contrato de lectura frente a comando: *queries* para leer (no mutan), *signals*/*updates* para comandar (payload validado, idempotente) | Verificación por búsqueda de términos (`query`, `signal`, `update`) antes y después |
| `docs/architecture/04` §24 (viñeta nueva) | **Hallazgo A-2** — K-T2 (*patching*) no estaba especificado | Regla general de versionado | *Patching* dentro del workflow, nuevo tipo/versión para cambios no parcheables y cutover por versión de worker | Contraste con la documentación oficial de Temporal ya citada en `KORTIX-CROSS-MATRIX` C.1 |
| `docs/architecture/05` §1 | P-24 y K-T1 | Tabla de autoridades sin anotación; sin relación lectura/comando | Anotación de `Redis` como saliente con sustituto de referencia y nota de que el progreso se lee con *queries* y se comanda con *signals*/*updates* | Recuento de filas de la tabla (4 autoridades, sin cambios de autoridad) |
| `docs/architecture/09` §2 | P-24 y K-T5 | `Grafana`, `Loki` sin anotación | Anotación de componentes salientes con sustitutos de referencia + nota de que nombrar un componente no es aprobarlo (*license gate* de `06` §18) + *Search Attributes* como mecanismo previsto de consulta operativa | Contraste con `STACK-LICENCIAS` y `ADR-011` |
| `docs/architecture/02` §4 | P-24 | Filas `Vault/KMS` y `Redis` sin estado | Anotación de implementación (OpenBao o KMS equivalente MPL/Apache) y de componente saliente (`Valkey`) | Contraste con `ADR-007` y `ADR-011` |
| `docs/architecture/01` §7.1 (nueva) | **Hallazgo A-3 (Alta): coherencia del modelo comercial** — se hablaba de SaaS multiempresa en el contexto del proyecto pero los documentos solo describían despliegue dedicado, sin declarar la relación entre ambos | §7 nombraba solo el despliegue dedicado y una frase sobre multi-tenencia futura | Tabla de modalidades comerciales (instalación privada = modelo inicial; SaaS = objetivo de largo plazo) con el límite explícito: la multi-tenencia dinámica sigue siendo *non-goal* y requeriría su propio ADR | Contraste con `ADR-001`, `02` §11 y `10` §1; el límite arquitectónico no se movió |
| `docs/architecture/10` §1 | Coherencia con `01` §7.1 | Sin remisión | Remisión a `01` §7.1 | `verify-all.py` §4 (referencia a sección existente) |
| `docs/es/architecture/{01 §7.1, 02 §4, 03 §9, 04 §21.2 y §22 y §24, 05 §1, 09 §2, 10 §1}` | C-4: paridad | Espejos sin los puntos anteriores; `03` §9 sin la remisión a `06` §4.1 que sí tenía el inglés | Espejos equivalentes en español | `check-parity.py` (secciones, Mermaid, tablas, referencias cruzadas y marcas de fecha coincidentes) |

## 4. ADR: trazabilidad y separación de capas

| Archivo / sección | Motivo | Estado anterior | Estado nuevo | Validación |
|---|---|---|---|---|
| `docs/adr/ADR-011` (nueva sección *Status of this decision*) y su espejo | **Hallazgo A-4 (Alta)**: el ADR mezclaba decisión de producto, aceptación formal, compatibilidad técnica, verificación de licencias y validación legal | `Proposed (awaiting product-owner acceptance)` y consecuencias que daban por hecha la sustitución | Cinco capas con su estado real; regla de que ninguna implica la siguiente y de que los renombres en los normativos son **anotaciones** hasta la aceptación | Contraste con el estado del propio ADR (`Proposed`) y con `DECISIONES-PENDIENTES` DP-17 |
| `docs/adr/ADR-007` (nueva *Implementation note*) y su espejo | P-24 | "Vault o un KMS equivalente", sin decir qué producto | Nota: la implementación de referencia es OpenBao (MPL-2.0); **la decisión del ADR no cambia** y no se requiere un ADR nuevo | Lectura del propio ADR: la decisión es "Vault o equivalente", el producto no estaba decidido |
| `docs/adr/ADR-002`–`ADR-011` (EN y ES) | C-8: faltaba el campo de fecha | Sin fecha | `**Date:**` / `**Fecha:**`; para `ADR-002`–`ADR-010` se declara explícitamente que la fecha exacta no está registrada (no se inventa) | `verify-all.py` §2 y §3 |

## 5. Metadatos de trazabilidad

| Archivo | Motivo | Estado anterior | Estado nuevo | Validación |
|---|---|---|---|---|
| 11 documentos de `docs/architecture` + 11 espejos | C-8 | `Version`/`Status` sin fechas | `Created: 2026-09-21` y `Updated: 2026-10-19` (espejos: `Creado`/`Actualizado`) | `verify-all.py` §2 (0 campos faltantes) |
| 5 guías de `docs/development` + 5 espejos | C-8 | Solo `Version` | Ídem | `verify-all.py` §2 |
| `docs/reference/DECISIONES-PENDIENTES.md` | C-8: era el único documento de referencia sin *frontmatter* | Sin *frontmatter* | *Frontmatter* con `type/status/created/updated/tags` | `verify-all.py` §2; comparación con los demás documentos de referencia |
| 2 documentos de referencia (anexo y SPIKE) | Cosmético: líneas de metadatos consecutivas sin salto de línea markdown | Renderizado en una sola línea | Salto de línea agregado | Inspección del encabezado |

## 6. Documentos nuevos (entregables de la auditoría)

| Archivo | Motivo | Rol | Validación |
|---|---|---|---|
| `docs/reference/AUDITORIA-CONSISTENCIA-2026-10-19.md` | Entregable A del encargo | Informe: commit auditado, alcance, resumen ejecutivo, hallazgos por gravedad con evidencia exacta, cambios realizados, riesgos abiertos y resultado de los validadores por categoría | `verify-all.py` §5 (los demás documentos lo enlazan y el enlace resuelve) |
| `docs/reference/REGISTRO-CAMBIOS-2026-10-19-AUDITORIA.md` | Entregable D | Este registro | Autorreferencia; verificado por `verify-all.py` §1 |
| `docs/reference/INVARIANTES-Y-PRUEBAS.md` | Entregable G | Matriz de invariantes: invariante, fuente normativa, ADR, riesgo, prueba, estado de la prueba y fase | Revisión de que cada invariante remite a una sección normativa existente (`verify-all.py` §4) |

## 7. Actualizaciones de la matriz de cruce y de las decisiones pendientes

| Archivo / sección | Motivo | Estado anterior | Estado nuevo | Validación |
|---|---|---|---|---|
| `KORTIX-CROSS-MATRIX.md` §A.1 y nota de inventario | C-7 | "62 archivos" y totales sin actualizar | Recuento real y corrección declarada | Recuento de archivos por categoría |
| `KORTIX-CROSS-MATRIX.md` §A.4.bis (nueva) | Entregable B: la matriz no debía seguir mostrando como ausente lo ya documentado | Solo el cuadro A.4 con el estado previo | Estado posterior por tema (`RESUELTO_DOCUMENTALMENTE`, `PENDIENTE_DE_PRUEBA`, etc.) | Contraste de cada fila contra la sección normativa citada |
| `KORTIX-CROSS-MATRIX.md` §A.6.bis (nueva) | Entregable B | Solo el cuadro A.6 con las contradicciones originales | Estado de C-1..C-6 + nuevas C-7, C-8, C-9 | Contraste con el contenido real de los archivos citados |
| `KORTIX-CROSS-MATRIX.md` §C.1.bis (nueva) | Entregable B: estado vigente por hallazgo con la taxonomía pedida | La matriz C.1 con el estado del cruce | Tabla por ID (estado, respaldo, validación pendiente, siguiente acción) | Contraste fila por fila con el documento normativo citado |
| `KORTIX-CROSS-MATRIX.md` §C.2 (encabezado, P-02, P-20 y nuevas P-21..P-27) | **Hallazgo A-2**: P-20 figuraba como "Aplicado" sin estarlo del todo; P-02 omitía el estado del ADR | "Aplicado" sin matices | Estados explícitos (`Aplicado`, `Aplicado parcialmente`, `Propuesto`, `Pendiente`) y columnas nuevas para el trabajo de esta auditoría | Verificación documental de cada propuesta contra su archivo |
| `KORTIX-CROSS-MATRIX.md` §C.4 (fila ADRs) y nota de cabecera | C-9 | "Ningún ADR modificado" y sin taxonomía declarada | Fila actualizada y taxonomía de estados en la cabecera | Lectura contra `docs/adr/` |
| `DECISIONES-PENDIENTES.md` §Resumen de estados (nueva), DP-5, DP-6, DP-17, DP-18 (nueva) | Entregable C: solo se actualizó lo que tenía evidencia de cambio de estado | Sin cuadro de estados; DP-5/DP-6 decían "verificadas" sin distinguir verificación de validación; DP-17 sin capas | Cuadro de estados; distinción explícita verificación/validación; DP-17 con las cinco capas; DP-18 registra los umbrales que **no** se inventan | Evidencia citada en cada fila; ninguna entrada se cerró por inferencia |

## 8. Índices arquitectónicos

| Archivo / sección | Motivo | Estado anterior | Estado nuevo | Validación |
|---|---|---|---|---|
| `docs/architecture/00-ARCHITECTURE-INDEX.md` §10 | Entregable E | 8 documentos de referencia | 11, con los tres nuevos | `verify-all.py` §5 |
| `docs/architecture/00-ARCHITECTURE-INDEX.md` §12 (nueva) y su espejo | Entregable E | Solo §11 (revisión aditiva) | §12: auditoría (corregido, aclarado, anotado, separado) | Lectura cruzada con este registro |
| `docs/es/architecture/00-ARCHITECTURE-INDEX.md` §10/§12 | C-4 | Espejo sin las entradas nuevas | Espejo actualizado | `check-parity.py` |

## 9. Lo que este registro NO declara

1. **Ninguna validación técnica.** Cada sustitución de componente, cada contrato nuevo y cada invariante sigue sin prueba (ver `INVARIANTES-Y-PRUEBAS.md`).
2. **Ninguna decisión de producto tomada.** DP-1 a DP-18 siguen abiertas salvo la decisión de producto sobre licencias (tomada y registrada en el registro de la revisión aditiva §4.1), cuya **aceptación formal del ADR-011 continúa pendiente**.
3. **Ninguna aprobación legal.** La revisión de licencias se hizo sobre repositorios de origen, no sobre artefactos empaquetados.
4. **Ningún cambio de dependencias** del proyecto de software.
