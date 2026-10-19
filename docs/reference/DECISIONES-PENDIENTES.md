---
type: reference
status: active
created: 2026-10-19
updated: 2026-10-19
tags: [digital-employee, decisiones-pendientes, brechas, validacion, trazabilidad]
---

# Decisiones pendientes

> **Naturaleza:** documento **no normativo** de control. Registra decisiones que **no pueden cerrarse** con análisis documental y requieren prueba técnica, decisión de producto, validación de seguridad, revisión de licencias o evaluación de coste/rendimiento.
> **Regla:** mientras una entrada figure aquí, **no es una decisión adoptada**. La documentación normativa describe el estado actual; este documento describe lo que aún falta decidir y cómo se validaría.
> **Origen:** cruce Kortix/Suna ↔ arquitectura propia (2026-10-19). Ver `KORTIX-CROSS-MATRIX.md`.

## Formato

Cada entrada: **DP-n** · tema · *tipo de validación* · estado · descripción · opciones · criterio de cierre · documento afectado.

Tipos de validación: `PRUEBA` (spike/benchmark), `PRODUCTO` (decisión del responsable), `SEGURIDAD`, `LICENCIA`, `COSTE`/`RENDIMIENTO`.

**Advertencia de lectura:** *verificar* y *validar* no son lo mismo. Una licencia **verificada** es una licencia leída en la fuente del proyecto; una sustitución **validada** exige además una prueba de comportamiento en nuestros usos. Y ninguna de las dos cierra por sí sola una decisión de producto.

## Resumen de estados (revisión de auditoría, 2026-10-19)

| DP | Tema | Tipo | Estado |
|---|---|---|---|
| DP-1 | Modo de durabilidad del runtime del agente | PRUEBA | abierta (frontera más precisa en `04` §21.2; falta la prueba comparativa) |
| DP-2 | Entorno de ejecución ("sandbox") del empleado | PRODUCTO+SEGURIDAD | abierta |
| DP-3 | Superficies de canal | PRODUCTO+SEGURIDAD | abierta |
| DP-4 | Cuotas: corte y efecto | PRODUCTO+COSTE | abierta (diseño en `09` §12.1; umbrales sin definir) |
| DP-5 | Redis → Valkey | LICENCIA+PRUEBA | política **aceptada** (ADR-011) y renombre **aplicado**; compatibilidad **no validada** |
| DP-6 | Sustituciones por licencia (Grafana/Loki/MinIO/Vault) | LICENCIA | licencias directas **verificadas**; técnico y legal **pendientes** |
| DP-7 | Aislamiento multiempresa: mecanismo de enforcement | SEGURIDAD | abierta |
| DP-8 | Base vectorial dedicada | COSTE+RENDIMIENTO | línea base fija; ampliación no decidida |
| DP-9 | OPA externo vs embebido | PRUEBA+COSTE | línea base fija; despliegue abierto |
| DP-10 | Conectores delegados: consentimiento y UX | PRODUCTO+SEGURIDAD | requisitos fijados; diseño abierto |
| DP-11 | Almacenamiento de artefactos | COSTE+OPERACIÓN | contrato fijado; medio no decidido |
| DP-12 | Empaquetado y promoción de definiciones | PRODUCTO | provisional (`03` §15) |
| DP-13 | Versionado de la taxonomía de auditoría | PRUEBA+PRODUCTO | taxonomía fijada; compatibilidad abierta |
| DP-14 | Metering y entitlements en instalación privada | PRODUCTO+LICENCIA | diseño propuesto |
| DP-15 | Observabilidad de la corrida interna | PRUEBA+COSTE | abierta |
| DP-16 | Frontera workflow durable ↔ corrida de agente | PRUEBA | frontera decidida; umbral operativo a probar |
| DP-17 | Hacer normativa la política de licencias libres | PRODUCTO+LICENCIA | decisión de producto **tomada** y ADR **aceptado (2026-10-19)**; renombres **aplicados**; pruebas de compatibilidad pendientes (DP-5/DP-6) |
| DP-18 | Umbrales cuantitativos y ventanas de retención sin definir | PRODUCTO+PRUEBA | abierta (nueva en la auditoría) |

Ninguna entrada se cierra por inferencia: cada cierre exige la validación declarada y queda registrado con fecha, evidencia y documento actualizado.

---

## DP-1 · Modo de durabilidad del runtime del agente

- **Tipo:** PRUEBA
- **Estado:** abierta
- **Descripción:** `04` §21 fija la frontera (el checkpointer no es autoridad de lifecycle) pero no fija **modo de durabilidad** ni backend del almacén de checkpoints. Falta decidir si la corrida de agente persiste por paso (durable) o solo al salir del nodo, y con qué backend (el mismo PostgreSQL del dominio, o un almacén propio del runtime).
- **Opciones:** (a) persistencia por paso en PostgreSQL con namespace separado y retención corta; (b) persistencia al salir, reanudando por *replay* del input de la activity desde Temporal; (c) almacén del runtime dedicado.
- **Criterio de cierre:** prueba comparativa de (1) costo por paso, (2) comportamiento ante caída del worker a mitad de nodo, (3) verificación de que un artefacto de checkpoint nunca se convierte en fuente de verdad. Debe demostrar que el borrado por retención no rompe reanudaciones válidas.
- **Afecta:** `04` §4/§21, `05` §1, `06` §17.

## DP-2 · Entorno de ejecución del empleado ("sandbox")

- **Tipo:** PRODUCTO + SEGURIDAD
- **Estado:** abierta (brecha registrada en `04` §25)
- **Descripción:** la arquitectura da capacidades solo vía herramientas gobernadas; no define dónde **computa** el empleado para producir entregables (planillas, informes, scripts). Sin decidir esto, la promesa "produce trabajo terminado" queda apoyada en herramientas externas.
- **Opciones:** (a) no ofrecer cómputo local en el MVP (entregables vía herramientas/conectores); (b) entorno efímero por ejecución, sin red y sin credenciales, con artefactos gobernados (`05` §21); (c) servicio de documentos dedicado (plantillas + render) en lugar de cómputo libre.
- **Criterio de cierre:** decisión de producto + diseño de aislamiento revisado por seguridad (sin egreso, sin exposición de credenciales — ver `06` §7.1, §12) + prueba de fuga de datos.
- **Afecta:** `04` §25, `06` §12, `05` §21, `10`.

## DP-3 · Superficies de canal (primer canal conversacional)

- **Tipo:** PRODUCTO + SEGURIDAD
- **Estado:** abierta (`04` §25, `03` §5.2)
- **Descripción:** no está decidido qué canales se ofrecen (web chat propio, correo, Slack/Teams, WhatsApp, Telegram) ni con qué política de identidad/acceso se habilitan.
- **Criterio de cierre:** elegir el primer canal y documentar: vinculación de identidad, política de acceso al hilo/sesión, autorización por acción, detención de una ejecución desde el canal, auditoría de todo mensaje recibido.
- **Afecta:** `03` §5.2, `04` §25, `06` §3.

## DP-4 · Cuotas: dónde se aplica el corte y con qué efecto

- **Tipo:** PRODUCTO + COSTE
- **Estado:** abierta (diseño propuesto en `09` §12.1)
- **Descripción:** falta definir los valores y el punto exacto de corte por tenant/empleado/tarea, y el comportamiento esperado de una ejecución que se detiene por presupuesto en medio de un efecto externo.
- **Criterio de cierre:** definir umbrales, y probar el corte en una ejecución con acción externa ya ejecutada (debe quedar reconciliable, no "a medias").
- **Afecta:** `09` §12.1, `04` §16/§22, `10` §18.

## DP-5 · Redis vs Valkey (licencias del stack)

- **Tipo:** LICENCIA + PRUEBA
- **Estado:** **sustitución obligatoria** por la política de licencias libres exclusivas (`STACK-LICENCIAS` §0.bis); queda la prueba de compatibilidad
- **Descripción:** la versión evaluada de Redis es tri-licencia (RSALv2 · SSPLv1 · AGPLv3), **ninguna licencia libre permisiva**, y el producto es SaaS propietario. La única opción admisible es **Valkey (BSD-3-Clause)**; la variante AGPL de Redis queda también fuera del stack por la política.
- **Criterio de cierre:** prueba de compatibilidad de los usos reales (caché, límites de tasa, coordinación transitoria, si se usa pub/sub o scripts Lua) contra Valkey fijado por versión. La variante AGPL de Redis queda también fuera del stack: Valkey la reemplaza sin obligaciones.
- **Estado de las capas (actualizado 2026-10-19 tras la aceptación de `ADR-011`):** licencia de Valkey **verificada** en la fuente del proyecto (BSD-3-Clause); **renombre aplicado** en los normativos (`02` §4, `05` §1, `10` §1, `00-INDEX.md` y espejos ES): Valkey es hoy el componente nombrado; compatibilidad técnica **no validada** (sin prueba); decisión de producto **tomada y formalizada** por `ADR-011` **Aceptado**.
- **Afecta:** `docs/reference/STACK-LICENCIAS.md` §0.bis/§3.1, `05` §1, `02` §4, `00-INDEX.md`, `10`.

## DP-6 · Licencias condicionales del stack de IA/observabilidad

- **Tipo:** LICENCIA
- **Estado:** pendiente de revisión por componente; bajo la política de licencias libres exclusivas (`STACK-LICENCIAS` §0.bis) los componentes no libres y los AGPL salen del stack de referencia → **sustitución obligatoria**
- **Descripción:** el stack objetivo incluye componentes no libres o con edición enterprise: Vault (BUSL-1.1), Grafana y Loki (AGPL-3.0), MinIO (AGPL-3.0), y el servidor de observabilidad de LLM evaluado incluye licencia adicional para su edición enterprise (`ee/`).
- **Criterio de cierre:** por cada componente: versión exacta fijada, licencia libre declarada y clasificada (permisiva / copyleft), y decisión de uso (OSS vs edición enterprise — esta última **descartada** por la política). Sustituciones **obligatorias**: Grafana → **Perses** (Apache-2.0), Loki → **VictoriaLogs**/OpenSearch (Apache-2.0), MinIO → **SeaweedFS** (Apache-2.0), Vault → **OpenBao** (MPL-2.0) — con licencia **verificada** el 2026-10-19 en la fuente de cada proyecto.
- **Estado de las capas (auditoría 2026-10-19):** licencias directas **verificadas** (no *validadas* técnicamente); el árbol **transitivo** sigue sin verificar hasta que existan el SBOM y el *license gate* de `06` §18; la **variante de licencia del artefacto empaquetado** (digests de imágenes, avisos incluidos) **no fue revisada** → validación legal **pendiente**. **Garage** quedó sin licencia verificada: no debe proponerse como sustituto hasta verificarla.
- **Afecta:** `docs/reference/STACK-LICENCIAS.md` §0.bis/§3.3–3.6, `06` §18, `10` §17, `ADR-011`.

## DP-17 · Hacer normativa la política de licencias libres exclusivas

- **Tipo:** PRODUCTO + LICENCIA
- **Estado:** **CERRADA en su capa documental** el 2026-10-19: `ADR-011` (`docs/adr/ADR-011-free-licence-stack.md` + espejo `docs/es/adr/`) pasó a **Aceptado** por decisión del responsable de producto y los normativos fueron **renombrados** a los equivalentes libres. Trazabilidad: `docs/reference/REGISTRO-CAMBIOS-2026-10-19-ADR-011-ACEPTADO.md`. Lo que sigue abierto no es la política, sino su **compatibilidad técnica** (DP-5, DP-6) y la **validación legal** de las variantes empaquetadas.
- **Descripción:** el responsable del producto dispuso *"usemos licencias libres exclusivamente"*. La política quedó aplicada como **criterio** en el inventario no normativo (`STACK-LICENCIAS` §0.bis) y redactada como ADR; el paquete exige que una política de stack se fije con ADR **antes de implementar**, así que todavía no es regla vigente en `docs/architecture`.
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

## DP-18 · Umbrales cuantitativos y ventanas de retención sin definir

- **Tipo:** PRODUCTO + PRUEBA
- **Estado:** abierta (registrada en la auditoría 2026-10-19)
- **Descripción:** varios contratos normativos exigen un umbral o una ventana que **no está definido** en ninguna parte. No se inventan valores: se registran acá. Al menos: (a) ventana de retención del almacén de checkpoints por clasificación (`04` §21.2); (b) umbral de *aging* de aprobaciones y de pausas prolongadas que dispara alerta (`09` §11); (c) desvío de costo considerado anómalo (`09` §11/§12.1); (d) ventana de retención de auditoría y de la telemetría interna del agente (`05`, `09` §12, DP-15); (e) límites de profundidad y concurrencia de delegación (`04` §23); (f) valores de presupuesto por ejecución (`04` §16); (g) ventana de retención de la taxonomía de auditoría retirada (DP-13); (h) RPO/RTO por despliegue (`10` §9); (i) umbrales de aceptación de métricas de éxito (`01` §8).
- **Opciones:** fijarlos como valores por defecto documentados por entorno (recomendado para las ventanas técnicas) o dejarlos configurables con un valor por defecto obligatorio y techo por política.
- **Criterio de cierre:** cada umbral queda declarado con su unidad, su valor por defecto y quién puede cambiarlo; las pruebas de DP-4/DP-15/DP-16 usan esos valores en lugar de suposiciones.
- **Afecta:** `04` §16/§21.2/§23, `01` §8, `05`, `09` §11/§12, `10` §9.

## DP-7 · Aislamiento multiempresa: mecanismo único de enforcement

- **Tipo:** SEGURIDAD
- **Estado:** abierta
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
- **Criterio de cierre:** definir retención por tipo de traza, probar redacción de datos sensibles y demostrar que la reconstrucción de una ejecución para auditoría sigue siendo posible sin conservar prompts completos de forma indefinida.
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
2. Cerrar una entrada que cambie una decisión arquitectónica exige un **ADR** antes de modificar los documentos normativos.
3. Las entradas de tipo LICENCIA bloquean el empaquetado de la instalación privada hasta resolverse.
4. Este documento se actualiza cuando se cierra una entrada (marcándola cerrada con fecha, evidencia y documento actualizado), no se reescribe.
