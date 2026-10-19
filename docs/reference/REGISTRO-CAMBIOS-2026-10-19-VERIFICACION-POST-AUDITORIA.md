---
type: reference
status: active
created: 2026-10-19
updated: 2026-10-19
tags: [digital-employee, verificacion, trazabilidad, post-auditoria, consistencia]
---

# Registro de cambios — Verificación posterior a la auditoría (2026-10-19)

> **No normativo.** Registra las correcciones de esta revisión de seguimiento. **No sustituye** los registros anteriores: `REGISTRO-CAMBIOS-DOCUMENTALES-2026-10-19.md` (revisión aditiva), `REGISTRO-CAMBIOS-2026-10-19-AUDITORIA.md` (auditoría) y `REGISTRO-CAMBIOS-2026-10-19-ADR-011-ACEPTADO.md` (aceptación del ADR). El informe asociado es `VERIFICACION-POST-AUDITORIA-2026-10-19.md`.

## 1. Estado de partida y método

- **Rama y commit verificados:** `main` en `8c881ea232c6dadd937438337932f4786462b402` (2026-10-19 23:35:48 +0000). Repositorio local sincronizado con `origin/main` (`git fetch` + comparación de SHA); árbol de trabajo limpio antes de empezar.
- **Método:** lectura directa de los archivos publicados (no del informe de auditoría previo), barrido por patrón de los términos exigidos por el encargo y clasificación de cada aparición; validadores documentales ejecutados al final, con su salida textual registrada.
- **Regla aplicada:** una afirmación de un documento **no** es evidencia de que exista un repositorio de software; un ADR aceptado **no** valida una sustitución técnica; y una corrección declarada en un informe anterior **no** se da por vigente hasta comprobarla en el archivo.

## 2. Cambios aplicados

| Archivo | Sección | Motivo | Antes | Después |
|---|---|---|---|---|
| `DOCUMENT-MANIFEST.md` | §7.0 fila 22 | El manifiesto describía `ADR-011` con su estado **anterior** a la aceptación | `**Proposed** — free-licence-only stack policy` | `**Accepted** (2026-10-19) — free-licence-only stack policy` |
| `docs/es/DOCUMENT-MANIFEST.md` | §7.0 fila 22 | Espejo del anterior | `**Propuesto** — política de stack con licencias libres únicamente` | `**Aceptado** (2026-10-19) — política de stack con licencias libres únicamente` |
| `00-INDEX.md` | §Base documental | El recuento vigente y el histórico no estaban separados (riesgo de leer 26 como actual) | solo el bloque de 27 archivos | bloque nuevo **Trazabilidad del recuento**: línea base inicial 26 (2026-09-21) → vigente **27** (por `ADR-011`); espejo ES con los mismos 27 |
| `00-INDEX.md` | §Principios de decisión | Afirmaba que "no se reescribe lo que ya funciona" citando control plane/seguridad/tenancy de **Hermes-OS**: afirmaba código reutilizable inexistente en el paquete | una viñeta "No se reescribe… (…de Hermes-OS)" | dos viñetas: la plataforma **se construye desde cero** (base = este paquete documental) y **Hermes-OS es un sistema aparte** cuya relación está pendiente de decisión (DP-19) |
| `EXPLICACION-NO-TECNICA.md` | §6 | Afirmaba "ya tenemos un proyecto base… reutilizamos lo que ya funciona" (código reutilizable no confirmado) | "vs. rehacer desde cero el sistema interno anterior: … reutilizamos lo que ya funciona" | "vs. empezar sin diseño previo": **sin código propio** y **sin reutilizar código de sistemas anteriores**; se construye desde cero y lo que se aprovecha es el **diseño** (este paquete). Nota aclaratoria sobre "Hermes-OS" como **sistema distinto** |
| `DECISIONES-PENDIENTES.md` | DP-17 (descripción) | La descripción contradecía su propio estado: seguía diciendo que la política "todavía no es regla vigente" | un solo párrafo mezclando historia y estado | tres párrafos separados: **estado histórico previo**, **estado actual** (ADR aceptado, política normativa) y **trabajo pendiente** (compatibilidad, árbol transitivo, validación legal) |
| `DECISIONES-PENDIENTES.md` | DP-6 | Presentaba Vault, Grafana, Loki y MinIO como componentes **del stack objetivo actual** | "el stack objetivo incluye componentes no libres o con edición enterprise: Vault…, Grafana y Loki…, MinIO…" | "el **stack evaluado** incluía … hoy **fuera del stack de referencia**", con la sustitución aplicada (→ OpenBao, Perses, VictoriaLogs/OpenSearch, SeaweedFS), la edición `ee/` **descartada** y la aclaración de que **ninguna sustitución está validada técnicamente** |
| `DECISIONES-PENDIENTES.md` | DP-6 (capas) | La etiqueta de fecha sugería estado previo a la aceptación | "Estado de las capas (auditoría 2026-10-19)" | "Estado de las capas (revisado tras la aceptación de `ADR-011`, 2026-10-19)" + frase explícita: la aceptación **no** cierra ninguna capa técnica ni legal |
| `DECISIONES-PENDIENTES.md` | Resumen + §DP-19 | Cuestión sin decisión: relación con Hermes-OS | inexistente | **DP-19 nueva** (opciones (a) referencia de diseño / (b) sistema a integrar, con criterio de cierre y afectados) y fila en el resumen |
| `docs/reference/KORTIX-CROSS-MATRIX.md` | §C.5 (nueva) + nota de cabecera | Los hallazgos residuales deben quedar en el registro de hallazgos | — | sección **C.5 · Verificación posterior (2026-10-19)** con V-1…V-6 y su estado final |
| `docs/architecture/00-ARCHITECTURE-INDEX.md` | §14 | Registrar la revisión de seguimiento | — | sección **14. Post-audit verification 2026-10-19** (EN) |
| `docs/es/architecture/00-ARCHITECTURE-INDEX.md` | §14 | Espejo | — | sección **14. Verificación posterior 2026-10-19** (ES) |
| `DOCUMENT-MANIFEST.md` y espejo ES | §7.2 y §8 | Inventario y bitácora | 12 documentos de referencia, 72 `.md` | **14** de referencia y **74** `.md` (por los dos documentos de esta revisión); entrada nueva en la bitácora |

## 3. Validación ejecutada (salida textual al final de la revisión)

| Control | Resultado |
|---|---|
| `check-docs.py` (validador de enlaces, referencias a documentos del paquete, Mermaid y duplicados) | **74** archivos `.md`; **185** enlaces/referencias verificadas OK; **8** bloques Mermaid OK; 0 basenames duplicados; **0 hallazgos** |
| `check-parity.py` (paridad estructural EN↔ES de los 29 pares) | **0 divergencias / 29 pares** |
| `verify-all.py` (inventario, metadatos, estados de ADR EN=ES, referencias a secciones existentes, contadores declarados) | inventario: raíz 4 · `docs/architecture` 11 · `docs/adr` 11 · `docs/development` 5 · `docs/reference` 14 · espejos ES 27 (+2 de raíz) = **74**; espejos normativos **27 (esperado 27)**; campos de metadatos faltantes **0**; estados de ADR EN=ES **11/11 `Accepted`**; referencias cruzadas roídas **0**; enlaces roídos **0**; cercas impares **0**; contadores: **manifiesto declara 74, real 74**; **hallazgos: 0** |
| Comprobaciones manuales exigidas por el encargo | (1) los dos manifiestos coinciden en cantidades, rutas, estado de `ADR-011` y bitácora; (2) `00-INDEX.md` cita rutas existentes y describe el stack vigente; (3) la explicación no técnica no presenta componentes salientes como actuales; (4) DP-17 es coherente entre resumen y descripción; (5) `git diff` revisado |
| Límite registrado | Los tres validadores **no están en el repositorio**: viven fuera de él (herramientas de la sesión). No se sumaron al paquete porque el encargo prohíbe agregar código del producto y no se pidió publicarlos; se propone su incorporación como propuesta **P-27** (ver informe §6). **No se fingió su integración.** |

## 4. Lo que esta revisión **no** hizo

- **No** cambió ninguna decisión arquitectónica aceptada, ni límites, ni contratos, ni dependencias, ni una línea de código del producto.
- **No** cerró ninguna prueba: DP-5 y DP-6 siguen abiertas; la aceptación del ADR-011 no valida sustituciones.
- **No** renombró componentes en documentos históricos, de investigación o de comparación: `KORTIX-INVESTIGACION-v0.14.3.md`, `KORTIX-CROSS-MATRIX.md` (matriz de licencias), `STACK-LICENCIAS.md` (inventario comparativo) y los tres registros anteriores conservan sus menciones, porque allí son **correctas y necesarias**.
- **No** reescribió el historial: los registros previos se conservan íntegros y este es un registro nuevo.
