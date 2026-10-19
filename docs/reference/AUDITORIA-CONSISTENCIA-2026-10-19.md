---
type: reference
status: active
created: 2026-10-19
updated: 2026-10-19
tags: [digital-employee, auditoria, consistencia, hallazgos, evidencia, trazabilidad]
---

# Auditoría de consistencia de la arquitectura de Empleados Digitales — 2026-10-19

> **No normativo.** Informe de la auditoría documental pedida sobre el paquete canónico de la plataforma de Empleados Digitales. No diseña arquitectura nueva, no investiga el mercado otra vez y no implementa código.
> **Regla de lectura:** una brecha **resuelta documentalmente** no está implementada ni validada. Lo que falta probar o decidir está en `DECISIONES-PENDIENTES.md` y `INVARIANTES-Y-PRUEBAS.md`.

## 1. Objeto y estado auditado

| Dato | Valor |
|---|---|
| Repositorio | `https://github.com/ivanross81-png/empleados-ia-langgraph` |
| Rama | `main` |
| **Commit auditado** | **`51f7f686c5542334115774ab757a7e586e11dd31`** (2026-10-19 23:07:40 +0000), estado publicado antes de esta auditoría |
| Copia de trabajo | copia canónica del proyecto sincronizada con Nextcloud; el contenido auditado es idéntico al del commit (se verificó archivo por archivo al preparar la publicación) |
| Tamaño del paquete auditado | 68 archivos `.md` (27 normativos en inglés, 27 espejos en español, 2 espejos de raíz, 4 de raíz, 8 de referencia) |
| Documentos producidos por esta auditoría | 3 (`AUDITORIA-CONSISTENCIA-2026-10-19.md`, `REGISTRO-CAMBIOS-2026-10-19-AUDITORIA.md`, `INVARIANTES-Y-PRUEBAS.md`) → el paquete queda en **71 archivos `.md`** |
| Reproducibilidad | los validadores usados son de sólo lectura y su código vive fuera del repositorio (ver §8) |

## 2. Alcance real de la revisión

**Leído íntegramente en esta auditoría:** `README.md`, `00-INDEX.md`, `DOCUMENT-MANIFEST.md`, `docs/es/DOCUMENT-MANIFEST.md`, `docs/es/README.md`, `docs/architecture/00`–`10` (los once, con lectura dirigida en `03`, `05`–`10` y lectura completa de `01`, `02`, `04`), `docs/adr/ADR-001`–`ADR-011` (inglés) y `ADR-007`/`ADR-011` (español), `docs/reference/KORTIX-CROSS-MATRIX.md` (completo), `docs/reference/DECISIONES-PENDIENTES.md` (completo), `docs/reference/INVARIANTES-Y-PRUEBAS.md`.

**Verificado con validadores y búsquedas dirigidas (no leído línea por línea):** el texto completo de `docs/architecture/03`, `06`, `07`, `08`, `10`; las cinco guías de `docs/development/`; los espejos en español en su totalidad; el anexo heredado; `EXPLICACION-NO-TECNICA.md`; `docs/reference/STACK-LICENCIAS.md`, `KORTIX-INVESTIGACION-v0.14.3.md`, `KORTIX-analisis-y-licencias.md` y `SPIKE-FASE1-FOUNDATION-investigacion.md` (leídos en la fase anterior del trabajo, no re-leídos línea por línea ahora).

**Consecuencia honesta:** los hallazgos de esta auditoría se apoyan en evidencia citada con archivo y sección. Las partes no re-leídas línea por línea quedan como **riesgo residual** (§7, R-1): un defecto de redacción que no involucre los contratos verificados podría no haber sido detectado.

## 3. Resumen ejecutivo

La documentación es **coherente en sus decisiones** y no contiene contradicciones de arquitectura. Lo que sí tenía eran **cuatro defectos de consistencia** (dos de ellos de gravedad alta porque podían inducir una implementación equivocada) y **tres defectos documentales menores**, todos ellos corregidos:

1. **Una ambigüedad peligrosa** en la frontera de durabilidad (`04` §21.2): una frase permitía entender que el almacén de checkpoints debía administrar las esperas humanas, en contradicción con el resto de la misma sección. Se reemplazó por una tabla explícita de las cinco nociones de durabilidad con su dueño. **DP-1 sigue abierto**: la tabla fija el contrato, pero el modo y el backend requieren la prueba comparativa.
2. **La matriz de cruce sobreestimaba su propio avance**: tres propuestas figuraban como aplicadas sin estarlo por completo (semántica lectura/comando de K-T1, *patching* de workflows de K-T2, defectos documentales de P-20). Se agregaron los contratos faltantes y se reclasificaron los estados.
3. **El modelo comercial no estaba reconciliado con el límite arquitectónico**: el contexto del producto habla de SaaS multiempresa, pero los documentos sólo describían despliegue dedicado. Ahora `01` §7.1 declara las dos modalidades comerciales y mantiene explícito que la multi-tenencia dinámica sigue siendo *non-goal* y requeriría su propio ADR.
4. **`ADR-011` mezclaba cinco cosas distintas** (decisión de producto, aceptación formal del ADR, compatibilidad técnica, verificación de licencias y validación legal). Ahora el ADR las declara por separado y los normativos que nombran componentes salientes llevan **anotaciones**, no sustituciones silenciosas.

Además se corrigieron: contadores e inventarios desactualizados en tres lugares, ausencia de metadatos de trazabilidad en 32 archivos normativos (equivale a 54 archivos entre inglés y espejos), desincronización del espejo español del manifiesto y del índice arquitectónico, y la ausencia de un registro de umbrales no definidos (DP-18).

No se modificó ninguna decisión arquitectónica aceptada, no se renombró ningún componente en silencio y no se agregó ninguna dependencia.

## 4. Hallazgos

Gravedad: **Alta** = puede inducir una implementación contraria a la intención del diseño o afecta la viabilidad comercial/legal · **Media** = desinforma al lector o rompe trazabilidad · **Baja** = calidad documental. Todos los hallazgos están **corregidos**; ninguno queda abierto como defecto documental.

### 4.1 Gravedad alta

| ID | Hallazgo | Evidencia (antes) | Corrección | Estado |
|---|---|---|---|---|
| **A-1** | **Ambigüedad en la frontera de durabilidad.** `04` §21.2 punto 5 decía: *"The durability mode of the runtime must be chosen explicitly and documented; a mode that persists only on exit is not sufficient for executions that may wait for a human."* Leído junto al punto 2 de la misma sección (*"If a run must survive a long wait (approval, external outage, days of delay), durability is Temporal's responsibility, not the checkpointer's"*), la frase sugería que el checkpointer debía sostener las esperas humanas: dos autoridades para la misma durabilidad. | `docs/architecture/04-RUNTIME-EXECUTION-ARCHITECTURE.md` §21.2 (punto 5), en conflicto con el punto 2 y con `05` §1 | Tabla de las **cinco nociones** (corrida cognitiva → almacén del runtime; espera humana duradera → Temporal; recuperación del workflow → Temporal; activity fallida → política de reintentos de Temporal; resultados de negocio → almacén de dominio) + regla de que el almacén de checkpoints nunca sostiene una espera ni estado de negocio. Espejo ES actualizado | Cerrado documentalmente. La prueba comparativa (DP-1) y la prueba de frontera (DP-16) siguen **pendientes** |
| **A-2** | **La matriz declaraba como aplicado lo que sólo estaba propuesto.** `04` §22 no distinguía *query* de *signal*/*update* (K-T1 seguía "parcial" en C.1 y a la vez P-06/P-09 figuraban como aplicadas en C.2); `04` §24 no nombraba el mecanismo de *patching* de workflows (K-T2); P-20 figuraba como "Aplicado" con el espejo español del manifiesto todavía obsoleto. | `docs/architecture/04` §22 y §24; `KORTIX-CROSS-MATRIX.md` §C.2 (filas P-06, P-09, P-17, P-20); `docs/es/DOCUMENT-MANIFEST.md` con 26 filas y el párrafo de borrador | Contrato de lectura frente a comando en `04` §22; *patching* y cutover por versión de worker en `04` §24; `docs/es/DOCUMENT-MANIFEST.md` reescrito como espejo fiel; estados de §C.2 reclasificados (`Aplicado`, `Aplicado parcialmente`, `Propuesto`, `Pendiente`) y estado por hallazgo en §C.1.bis | Cerrado documentalmente. Las pruebas de contrato (I-13) y de replay siguen **pendientes** |
| **A-3** | **Modelo comercial sin reconciliar con el límite arquitectónico.** El paquete declara un único modelo de despliegue (dedicado por empresa) y una frase sobre multi-tenencia futura, mientras el contexto del producto contempla SaaS multiempresa. Un lector podía interpretar la mención de SaaS como autorización para introducir multi-tenencia dinámica en el MVP. | `docs/architecture/01-PRODUCT-VISION.md` §7; `ADR-001`; `02` §11 | `01` §7.1: tabla de las dos modalidades (instalación privada = inicial; SaaS = objetivo de largo plazo) con el límite explícito de que la multi-tenencia dinámica requiere diseño de aislamiento propio y **su propio ADR**; remisión desde `10` §1. Espejos ES actualizados | Cerrado documentalmente. La modalidad SaaS en sí sigue siendo **decisión de negocio pendiente**, no una autorización arquitectónica |
| **A-4** | **`ADR-011` mezclaba capas distintas.** El ADR estaba en `Proposed` pero sus consecuencias afirmaban la salida de Vault/Redis/Grafana/Loki/MinIO como "obligatoria, no opcional", sin separar la decisión de producto (tomada), la aceptación formal del ADR (pendiente), la compatibilidad técnica (sin probar), la verificación de licencias (hecha para componentes directos) y la validación legal (pendiente). | `docs/adr/ADR-011-free-licence-stack.md` §Consequences; `docs/reference/DECISIONES-PENDIENTES.md` DP-5, DP-6, DP-17 | Sección *Status of this decision* con las cinco capas y su estado real; regla de que una capa no implica la siguiente y de que los renombres en los normativos son **anotaciones** hasta la aceptación; DP-17 con el mismo cuadro; DP-5/DP-6 distinguen explícitamente **licencia verificada** de **sustitución validada** | Cerrado documentalmente. La aceptación del ADR sigue **pendiente de decisión del responsable** (DP-17) |

### 4.2 Gravedad media

| ID | Hallazgo | Evidencia (antes) | Corrección | Estado |
|---|---|---|---|---|
| **A-5** | **Inventarios y contadores desactualizados en tres lugares, más una ruta inexistente.** | `00-INDEX.md`: *"paquete arquitectura v0.1 canónica (26 archivos)"* y *"`docs/DOCUMENT-MANIFEST.md`"* (el archivo está en la raíz); `KORTIX-CROSS-MATRIX.md` §A.1: *"62 archivos `.md`, 416 KB"*, ADR *"10"*, espejo español *"27"*; `docs/es/DOCUMENT-MANIFEST.md`: 26 filas sin `ADR-011` y sin §7/§8 | Correcciones en los tres archivos; el manifiesto (y su espejo) ahora inventaría raíz, normativos, espejos y referencia con el **total real** de archivos, verificado por el validador | Cerrado · verificado por `verify-all.py` §1, §5 y §7 |
| **A-6** | **Trazabilidad de metadatos incompleta.** Los 11 documentos de arquitectura y las 5 guías declaraban versión y estado pero **ninguna fecha**; 10 de los 11 ADR no tenían campo de fecha; `DECISIONES-PENDIENTES.md` era el único documento de referencia sin *frontmatter*. | Encabezados de `docs/architecture/*`, `docs/development/*`, `docs/adr/*`; `docs/reference/DECISIONES-PENDIENTES.md` | `Created: 2026-09-21` / `Updated: 2026-10-19` en los normativos y las guías (y sus espejos); `Date` en los 11 ADR; *frontmatter* en el documento que faltaba. **Para `ADR-002`–`ADR-010` la fecha exacta no está registrada y se declara como tal: no se inventó** | Cerrado · `verify-all.py` §2 (0 campos faltantes) y §3 |
| **A-7** | **Deriva bilingüe sin verificación automatizada.** El espejo español del manifiesto había quedado obsoleto (conservaba incluso el párrafo de borrador eliminado en inglés) y `03` §9 del español no tenía la remisión a `06` §4.1 que sí tenía el inglés. Nada obligaba a detectarlo. | `docs/es/DOCUMENT-MANIFEST.md`; `docs/es/architecture/03-DOMAIN-MODEL.md` §9 vs `docs/architecture/03-DOMAIN-MODEL.md` §9 | Espejo del manifiesto reescrito; remisión agregada en `03` §9 (ES); **validador de paridad estructural** `check-parity.py` sobre los 29 pares inglés↔español: secciones, bloques Mermaid, tablas, referencias cruzadas y marcas de fecha | Cerrado · `check-parity.py` → 0 divergencias tras las correcciones. Queda **propuesto** (P-27) integrar la verificación al repositorio |
| **A-8** | **Nombres de componentes sin relación con el estado real de la decisión.** `02` §4 (`Vault/KMS`, `Redis`), `05` §1 (`Redis`), `09` §2 (`Grafana`, `Loki`) y `00-INDEX.md` nombraban componentes no libres o AGPL sin indicar que la política vigente los considera salientes ni que sus sustitutos están pendientes de aceptación formal. | `docs/architecture/02` §4, `05` §1, `09` §2; `00-INDEX.md` §Stack objetivo; `ADR-007` | **Anotaciones** explícitas ("componente saliente / sustituto de referencia, pendiente de aceptación formal de `ADR-011`"), nota de implementación en `ADR-007` (OpenBao), nota en `09` §2 de que nombrar un componente no es aprobarlo (*license gate* de `06` §18) y nota al pie en `00-INDEX.md`. **Ningún componente fue renombrado en silencio** | Cerrado documentalmente. La sustitución efectiva sigue **pendiente** (DP-5, DP-6, DP-17) |
| **A-9** | **Verificación de licencias presentada como validación.** DP-5 y DP-6 declaraban las sustituciones "verificadas 2026-10-19", lo que podía leerse como validadas técnicamente, y no registraban la limitación sobre dependencias transitivas ni la falta de revisión legal del artefacto empaquetado. | `DECISIONES-PENDIENTES.md` DP-5, DP-6 | Se distingue explícitamente *verificado* (licencia leída en la fuente) de *validado* (comportamiento probado); se declara abierto el árbol transitivo hasta que existan SBOM y *license gate*; se declara pendiente la revisión legal del artefacto empaquetado; se registra que **Garage quedó sin licencia verificada** y no debe proponerse como sustituto | Cerrado documentalmente · `INVARIANTES-Y-PRUEBAS.md` I-11 |
| **A-10** | **Hallazgo abierto (P2), no un defecto:** el uso concreto de los *Search Attributes* de Temporal para consultas operativas (por ejemplo, la cola de aprobaciones) no estaba especificado, aunque `09` §2 ya los menciona como mecanismo previsto. | `KORTIX-CROSS-MATRIX.md` fila K-T5 | Se mantiene **`ABIERTO`** en §C.1.bis y se agregó la mención del mecanismo en `09` §2. **No se cerró por redacción**: requiere definir los atributos concretos | Abierto (P2) |

### 4.3 Gravedad baja

| ID | Hallazgo | Corrección | Estado |
|---|---|---|---|
| **A-11** | Líneas de metadatos consecutivas sin salto de línea markdown en dos documentos de referencia (se renderizaban en una sola línea). | Salto agregado. | Cerrado |
| **A-12** | Los umbrales cuantitativos exigidos por varios contratos (retención de checkpoints, *aging* de aprobaciones, desvío de costo anómalo, profundidad de delegación, presupuestos, RPO/RTO, umbrales de éxito) **no estaban definidos ni registrados**. | Se registran como **DP-18** en lugar de inventar valores. | Cerrado como registro; **abierto** como decisión |
| **A-13** | El `README.md` de raíz no describía el paquete, su autoridad ni su estado (era el punto de entrada del repositorio público). | Reescrito (EN) con estructura, reglas de autoridad, estado de la política de licencias y validación; espejo ES creado. | Cerrado |

## 5. Lo que la auditoría **no** encontró (comprobado, no supuesto)

- **Estados de ADR coherentes entre idiomas:** los 11 ADR declaran el mismo estado en inglés y en español (10 `Accepted`/`Aceptado`, `ADR-011` `Proposed`/`Propuesto`) — `verify-all.py` §3.
- **Sin decisiones aceptadas modificadas:** ninguna regla, frontera, entidad, interfaz ni nombre de contrato cambió; las ampliaciones se registran sección por sección en el registro de cambios.
- **Sin dependencias agregadas ni código funcional:** esta auditoría no tocó código ni manifiestos de dependencias.
- **Sin secretos, credenciales, IPs internas ni nombres de clientes** en el paquete (verificado por barrido previo a la publicación y por revisión de los documentos nuevos).
- **Sin caracteres CJK** ni contenido fuera de español/inglés en ningún archivo del paquete.
- **Referencias cruzadas a secciones:** todas resuelven, salvo las numeraciones **heredadas** del anexo supersedido (`10` §66, `10` §89), que están marcadas como históricas y justificadas en la nota de trazabilidad del SPIKE y en `00-ARCHITECTURE-INDEX` §10 (regla de cita).

## 6. Cambios realizados

Detalle cambio por cambio (archivo, sección, motivo, estado anterior, estado nuevo, validación): `REGISTRO-CAMBIOS-2026-10-19-AUDITORIA.md`. Resumen:

| Grupo | Alcance |
|---|---|
| Contratos normativos ampliados o precisados | `04` §21.2 (tabla de durabilidad), `04` §22 (lectura/comando), `04` §24 (*patching*), `01` §7.1 (modalidades comerciales), `10` §1 (remisión), anotaciones en `02` §4, `05` §1, `09` §2, `00-INDEX` |
| ADR | `ADR-011` (sección de capas), `ADR-007` (nota de implementación), fecha en los 11 ADR |
| Metadatos de trazabilidad | 11 documentos de arquitectura + 5 guías + 11 ADR, en inglés y español (54 archivos), más *frontmatter* de un documento de referencia |
| Espejos en español | Mismas secciones que el inglés (9 documentos) + manifiesto reescrito + `README` |
| Índices y manifiesto | `00-INDEX.md`, `DOCUMENT-MANIFEST.md` (+ espejo), `00-ARCHITECTURE-INDEX.md` §10/§12 (+ espejo), `README.md` |
| Referencia no normativa | `KORTIX-CROSS-MATRIX.md` (§A.1, §A.4.bis, §A.6.bis, §C.1.bis, §C.2, §C.4), `DECISIONES-PENDIENTES.md` (resumen, DP-5, DP-6, DP-17, DP-18) |
| Documentos nuevos | `AUDITORIA-CONSISTENCIA-2026-10-19.md`, `REGISTRO-CAMBIOS-2026-10-19-AUDITORIA.md`, `INVARIANTES-Y-PRUEBAS.md` |

## 7. Riesgos que permanecen abiertos

| ID | Riesgo | Tipo | Dónde se sigue |
|---|---|---|---|
| **R-1** | **Alcance de lectura.** Cinco documentos normativos y las cinco guías se auditaron con validadores y búsquedas dirigidas, no con lectura línea por línea: un defecto de redacción que no afecte a los contratos verificados podría no haberse detectado. | Documental | Este informe §2. Mitigación: validadores estructurales + revisión por secciones en la próxima revisión |
| **R-2** | **Ninguna capacidad está probada.** Los 14 invariantes de `INVARIANTES-Y-PRUEBAS.md` están "sin prueba": no existe código de producto todavía. El riesgo es declarar cumplido un invariante sin evidencia. | Técnico | `INVARIANTES-Y-PRUEBAS.md` §1/§2 |
| **R-3** | **Durabilidad sin decidir.** El contrato de la frontera está claro, pero el modo y el backend del almacén de checkpoints siguen sin decisión ni medición (costo por paso, comportamiento ante caída a mitad de nodo, borrado por retención). | Técnico | DP-1, DP-16 |
| **R-4** | **Política de licencias sin fuerza normativa plena.** `ADR-011` sigue en `Proposed`; mientras no sea aceptado, el stack de referencia convive con componentes salientes anotados y sin fecha de salida formal. | Comercial/legal | DP-5, DP-6, DP-17 |
| **R-5** | **Árbol transitivo de dependencias y artefactos empaquetados sin verificar.** La verificación de licencias es de componente directo y sobre repositorios de origen, no sobre las imágenes que se distribuirían. | Legal | DP-6, `06` §18, I-11 |
| **R-6** | **Paridad bilingüe mantenida a mano.** El validador de paridad detecta divergencias estructurales, pero no diferencias de sentido; la paridad semántica sigue siendo responsabilidad humana. | Mantenimiento | C-4, P-27 |
| **R-7** | **Umbrales sin definir.** Nueve tipos de umbral/ventana quedan registrados pero sin valor: las pruebas que dependen de ellos no pueden ejecutarse con criterio objetivo hasta que se fijen. | Técnico/producto | DP-18 |
| **R-8** | **Fecha de los ADR previos no registrada.** `ADR-002`–`ADR-010` carecen de fecha exacta; se declaró así en lugar de inventarla. | Trazabilidad histórica | `verify-all.py` §2 (pasa con la declaración explícita) |

## 8. Validación final (entregable H)

Los validadores son **de sólo lectura** y su código vive **fuera** del repositorio, para no introducir artefactos no pedidos (decisión a revisar: P-27 propone integrar la verificación de paridad al repositorio).

| Validador | Qué comprueba | Resultado de la corrida final |
|---|---|---|
| `check-docs.py` | Enlaces relativos y wikilinks, referencias a documentos del paquete, sintaxis de bloques Mermaid, duplicados, exclusiones de espejos | **71 archivos `.md`**, 142 enlaces/referencias verificadas OK, 8 bloques Mermaid OK, 0 basenames duplicados, **0 hallazgos** |
| `check-parity.py` | Paridad estructural inglés↔español de los 29 pares: secciones numeradas, bloques Mermaid, tablas, referencias cruzadas `NN` §X y marcas de fecha | **0 de 29 archivos con divergencia** (se corrigieron las 2 detectadas: espejo del manifiesto y `03` §9 ES; luego una tercera, el `README` de la carpeta española, al darle la misma estructura de tabla) |
| `verify-all.py` | Inventario por categoría, campos de metadatos, estados de ADR EN=ES, referencias cruzadas a secciones que existen (con las numeraciones heredadas justificadas por contexto), enlaces y wikilinks, balance de bloques de código, contadores declarados vs reales, ausencia de menciones obsoletas ("26 archivos") | **0 hallazgos**. Las 9 incidencias de la primera corrida quedaron resueltas: 5 citas heredadas (ahora con justificación explícita en la misma línea o su contexto), 1 wikilink a un documento que aún no existía, 1 contador del manifiesto, 1 cita a un punto de sección reformulada, 1 contador de 26 archivos |

### 8.1 Informe separado por categoría (pedido del encargo)

| Categoría | Resultado |
|---|---|
| **Errores estructurales** | **0** (inventarios, contadores, metadatos y bloques de código verificados) |
| **Errores de referencias** | **0 sin justificación**: todas resuelven, salvo las numeraciones heredadas del anexo supersedido, declaradas como tales |
| **Divergencias bilingües** | **2 detectadas y corregidas** (espejo del manifiesto; remisión faltante en `03` §9 ES); paridad estructural verificada en los 29 pares |
| **Contradicciones semánticas** | **2 detectadas y corregidas** (A-1 frontera de durabilidad; A-3 modalidades comerciales). Sin contradicciones remanentes conocidas |
| **Pruebas técnicas pendientes** | **14 invariantes** con su prueba definida y sin ejecutar (`INVARIANTES-Y-PRUEBAS.md` §1); ninguna prueba figura como superada |
| **Decisiones de producto o legales pendientes** | **DP-1 a DP-18** (la de licencias: decisión de producto tomada, aceptación formal del ADR pendiente); **ninguna brecha resuelta documentalmente figura como validada** |

## 9. Decisiones que requieren intervención humana

| # | Decisión | Quién | Dónde |
|---|---|---|---|
| 1 | **Aceptar `ADR-011`** (pasar `Proposed` → `Accepted`) y autorizar los renombres de componentes en los normativos | Responsable de producto | DP-17, `ADR-011` |
| 2 | **Elegir el modo y el backend del almacén de checkpoints** tras la prueba comparativa | Arquitectura | DP-1, `04` §21.2 |
| 3 | **Decidir si el empleado tiene entorno de cómputo propio** (afecta la promesa de "trabajo terminado") | Producto + seguridad | DP-2, `04` §25 |
| 4 | **Reconciliar DP-17/DP-18 con el registro de cambios de la revisión aditiva**: el registro del 2026-10-19 §4.1 ya documenta la directiva de licencias; falta el acto formal del ADR | Producto | DP-17 |
| 5 | **Fijar los umbrales** de DP-18 para que las pruebas de DP-4, DP-15 y DP-16 tengan criterio objetivo | Producto + arquitectura | DP-18 |
| 6 | **Definir los *Search Attributes*** de la cola de aprobaciones (única brecha que quedó `ABIERTA`, P2) | Arquitectura | A-10, K-T5 |
| 7 | **Decidir dónde vive la verificación automatizada** de paridad y de documentación (P-27) | Arquitectura | P-27 |
| 8 | **Decidir la modalidad comercial SaaS** y, si avanza, redactar el ADR de aislamiento multiempresa | Producto | A-3, `01` §7.1, `ADR-001` |

## 10. Criterios de aceptación — verificación

| # | Criterio del encargo | Estado |
|---|---|---|
| 1 | Inventarios y cantidades coinciden con los archivos reales | **Cumplido** (`verify-all.py` §1/§7) |
| 2 | La matriz de Kortix refleja el estado actual de cada hallazgo | **Cumplido** (§A.4.bis, §A.6.bis, §C.1.bis) |
| 3 | Ninguna brecha resuelta documentalmente sigue figurando como ausente | **Cumplido** (los cuadros `bis` conservan el estado anterior y agregan el vigente) |
| 4 | Ninguna prueba pendiente figura como validada | **Cumplido** (todos los invariantes: "sin prueba"; DP abiertas) |
| 5 | Sin referencias rotas sin justificación histórica explícita | **Cumplido** (regla de cita del anexo supersedido) |
| 6 | Los espejos en español reflejan la normativa vigente | **Cumplido** (`check-parity.py`, 29 pares) |
| 7 | Decisiones propuestas diferenciadas de las aceptadas | **Cumplido** (estados por ADR y por capa en `ADR-011`) |
| 8 | La frontera LangGraph/Temporal sin ambigüedades contradictorias | **Cumplido** (A-1 corregido; quedan pruebas, no ambigüedades) |
| 9 | Sustituciones alineadas con el estado formal de las decisiones y las pruebas | **Cumplido** (anotaciones, no sustituciones; capas separadas) |
| 10 | Cada modificación trazable y sin cambio silencioso de la arquitectura | **Cumplido** (`REGISTRO-CAMBIOS-2026-10-19-AUDITORIA.md`) |
| 11 | Sin código funcional ni dependencias agregadas | **Cumplido** |
| 12 | Resumen final con archivos, razones, validaciones y decisiones humanas | **Cumplido** (§6, §8, §9) |
