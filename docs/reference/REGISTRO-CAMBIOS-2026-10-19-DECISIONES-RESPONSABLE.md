---
type: reference
status: active
created: 2026-10-19
updated: 2026-10-19
tags: [digital-employee, registro-cambios, decisiones, adr, trazabilidad, dp]
---

# Registro de cambios — decisiones del responsable del producto (2026-10-19)

> **No normativo.** Traza los cambios aplicados al resolver los ocho puntos abiertos que el responsable del producto autorizó el **2026-10-19**. No reemplaza los registros anteriores: `REGISTRO-CAMBIOS-DOCUMENTALES-2026-10-19.md`, `REGISTRO-CAMBIOS-2026-10-19-AUDITORIA.md`, `REGISTRO-CAMBIOS-2026-10-19-ADR-011-ACEPTADO.md` y `REGISTRO-CAMBIOS-2026-10-19-VERIFICACION-POST-AUDITORIA.md` se conservan intactos.
> **Regla aplicada:** tres de las decisiones cambiaban una frontera o un contrato normativo → **ADR antes de tocar los normativos** (regla 2 de `DECISIONES-PENDIENTES.md`).

## 1. Decisiones recibidas y su destino

| # | Decisión del responsable | Instrumento | Efecto |
|---|---|---|---|
| D-1 | Hermes-OS: **referencia de diseño**, no sistema a integrar | Registro directo | DP-19 **cerrada** (opción a); textos de raíz ajustados |
| D-2 | Autorizar pruebas de compatibilidad y preparar la revisión de licencias; **distribución bloqueada** | Registro directo | DP-5, DP-6 actualizadas; documento de preparación nuevo |
| D-3 | Valores iniciales del MVP (line base de ingeniería) | Registro directo | DP-18 **valores adoptados**; valores escritos en los normativos |
| D-4 | Publicar validadores y conectarlos a CI | Registro directo | `tools/docs-verify/` + workflow de CI; P-27 **aplicado** |
| D-5 | DP-1: persistencia por paso en PostgreSQL, esquema de runtime separado | **`ADR-012`** | `04` §21.2, `05` §1, invariante I-15 |
| D-6 | DP-2: sin ejecución arbitraria en el proceso principal; servicio restringido de artefactos | **`ADR-013`** | `04` §25 (punto 1), invariante I-16 |
| D-7 | Search Attributes mínimos para localizar aprobaciones | Registro directo + contrato | `04` §22.1 nuevo (DP-20), invariante I-17 |
| D-8 | Modalidad SaaS: dedicada por cliente primero; compartida tras validar aislamiento | Registro directo | `01` §7.1, DP-7 |

## 2. Archivos nuevos

| Archivo | Qué es |
|---|---|
| `docs/adr/ADR-012-runtime-checkpoint-store.md` + `docs/es/adr/ADR-012-…` | Decisión del almacén de checkpoints del runtime (PostgreSQL, esquema separado, retención, pruebas exigidas) |
| `docs/adr/ADR-013-agent-compute-boundary.md` + `docs/es/adr/ADR-013-…` | Frontera de cómputo del agente en el MVP (servicio restringido de artefactos; sandbox efímero fuera del MVP) |
| `docs/adr/ADR-014-approval-aging-expiry.md` + `docs/es/adr/ADR-014-…` | Semántica de envejecimiento y vencimiento de aprobaciones (sin cancelación ni rechazo automáticos) |
| `docs/reference/COMPATIBILIDAD-Y-LICENCIAS-PREPARACION.md` | Preparación de DP-5/DP-6: versiones verificadas, usos a probar, entregables (ninguno producido), riesgos |
| `docs/reference/REGISTRO-CAMBIOS-2026-10-19-DECISIONES-RESPONSABLE.md` | Este registro |
| `tools/docs-verify/check_docs.py`, `check_paths.py`, `verify_all.py`, `check_parity.py`, `verify_docs.py` | Validadores publicados (solo biblioteca estándar; sin rutas del laboratorio: el repositorio se toma del argumento o del directorio actual) |
| `.github/workflows/docs-verify.yml` | CI: ejecuta `verify_docs.py` en cada push y PR contra `main` y **falla** ante hallazgos. **Primer intento rechazado**: el token no tenía el alcance `workflow` de GitHub; el responsable lo agregó al PAT el 2026-10-19 y el workflow se publicó en el mismo commit que esta corrección |

## 3. Cambios en documentos normativos

| Archivo · sección | Antes | Después | Motivo |
|---|---|---|---|
| `04` §21.2 (EN/ES) | "el modo de durabilidad… se documenta por despliegue y está cubierto por DP-1 (aún pendiente de la prueba comparativa)" | Modo y backend fijados por **`ADR-012`** (PostgreSQL, esquema de runtime separado, retención 7 días); "la decisión está adoptada, el almacén **no está validado**" | D-5 |
| `04` §16 (EN/ES) | Límites sin valores | **Línea base**: 15 min de cómputo activo, 20 llamadas al modelo, 40 a herramientas, 50.000 tokens, USD 2; reglas de aplicación **antes** de iniciar llamadas y de no interrumpir efectos en curso | D-3 |
| `04` §22.1 (EN/ES) | **No existía** | Nueva subsección: conjunto mínimo de **Search Attributes**, con tipos, propósito y 5 reglas (índice operativo, no fuente de verdad) | D-7 |
| `04` §23 (EN/ES) | "profundidad máxima y delegados concurrentes se configuran por tarea" | Se agrega línea base: profundidad **3**, **5** delegados concurrentes, **3** acciones externas concurrentes | D-3 |
| `04` §25 (punto 1) (EN/ES) | Pregunta abierta sobre el entorno de ejecución | **Decidido** por `ADR-013`: sin ejecución arbitraria en el proceso principal; servicio restringido; sandbox efímero sigue abierto | D-6 |
| `05` §1 (EN/ES) | Almacén del runtime "(acotado, clasificado, con retención limitada)" | "PostgreSQL en un **esquema de runtime separado** con roles propios (`ADR-012`)" | D-5 |
| `05` §10.1 (EN/ES) | "**vencimiento**: una aprobación que vence debe producir un resultado determinista (**rechazo por defecto**)" | "**envejecimiento y escalamiento** (`ADR-014`): **ni cancelación ni rechazo automático**; aviso 24 h, escalamiento 72 h, revisión 7 días" | D-3 (semántica) |
| `09` §2 (EN/ES) | Search Attributes mencionados como mecanismo previsto | Remite al conjunto mínimo de `04` §22.1 y a la regla de que no son fuente de verdad | D-7 |
| `09` §12.1 (EN/ES) | Reglas de corte | Se agregan: límites aplicados **antes** de iniciar llamadas/acciones; efecto externo en curso **no se interrumpe** sin reconciliación; línea base de costo y anomalía | D-3 |
| `09` §13 (EN/ES) | Lista de alertas sin umbrales | Tabla de umbrales iniciales: aprobaciones 24/72/7 d; sin progreso 15/60 min; anomalía 2× mediana (30 días, ≥20 observaciones); retención de la evidencia (auditoría 365 d, logs 30 d, trazas 14 d con redacción, prompts desactivados, depuración 7 d) | D-3 |
| `10` §9 (EN/ES) | "Definir RPO/RTO por despliegue" | Línea base: piloto **RPO 24 h / RTO 8 h**; objetivo futuro **1 h / 4 h**, no contractual y condicionado a pruebas de restauración | D-3 |
| `01` §7.1 (EN/ES) | Modalidades comerciales y límite arquitectónico | Decisión del responsable: primera etapa **dedicada por cliente**; misma base de código y contratos (`tenant_id`, autorización, auditoría, límites); SaaS compartido solo tras validar aislamiento + ADR | D-8 |
| `01` §8 (EN/ES) | Criterios de éxito sin umbrales | Línea base de aceptación: calidad ≥95 % y sin regresión >2 pp; seguridad 100 % de pruebas deterministas de autorización y cero acciones externas no autorizadas | D-3 |
| `00-INDEX.md` | "27 archivos (11 ADR)"; recuento vigente 27; Hermes-OS "pendiente de decisión" | "**30** archivos (14 ADR)"; trazabilidad 26 → 27 → **30**; Hermes-OS **referencia de diseño, no integración** (DP-19 cerrada) | D-1, conteo |
| `README.md` | `ADR-001`–`011`; 27 normativos; validación "no destructiva" | `ADR-001`–**`014`**; **30** normativos; validación **publicada y ejecutada en CI**, con el límite explícito (no prueba semántica ni valida tecnología) | D-4, conteo |
| `docs/es/README.md` | 11 decisiones arquitectónicas | **14** decisiones (incluidas las tres del 2026-10-19) | conteo |
| `docs/architecture/00-ARCHITECTURE-INDEX.md` §10 y §15 (EN/ES) | Sin §15 | §15 con las ocho decisiones y su destino; §10 lista los dos documentos de referencia nuevos | trazabilidad |

## 4. Cambios en documentos de referencia

| Archivo · sección | Cambio |
|---|---|
| `DECISIONES-PENDIENTES.md` | Encabezado con la **excepción de capas**; **tabla resumen** reescrita (DP-1, DP-2, DP-4, DP-5, DP-6, DP-7, DP-13, DP-15, DP-17, DP-18, DP-19 y **DP-20 nueva**); nueva sección **Capas de estado**; DP-1/DP-2 con decisión adoptada y pruebas pendientes; DP-5/DP-6 con autorización, versiones verificadas y entregables; DP-18 con la **tabla completa de valores**; DP-19 **cerrada** (opción a); DP-20 nueva; reglas de uso ampliadas (ADR aplicados, distribución bloqueada, reporte por capas) |
| `KORTIX-CROSS-MATRIX.md` | Nota de estado de los cuadros ampliada; A.1 (14 ADR, espejo 30, referencia 16); §C.1.bis **K-T5 pasa de `ABIERTO` a `RESUELTO_DOCUMENTALMENTE`**; P-27 pasa de "Propuesto" a **Aplicado**; **§C.6 nuevo** con las ocho decisiones (D-1…D-8) y su nota de proceso |
| `INVARIANTES-Y-PRUEBAS.md` | I-09/I-11/I-12/I-14 actualizados (valores fijados, `ADR-011` Aceptado, RPO/RTO, `ADR-012`); **I-15, I-16 e I-17 nuevas**; §3 trazabilidad a `ADR-001`–`ADR-014` |
| `DOCUMENT-MANIFEST.md` + espejo | Filas 23–25 con los ADR nuevos, renumeración de las filas 26–30; recuentos 30/30/16/**82**; nota de herramientas del repositorio; listado de referencia y **bitácora** con la entrada de estas decisiones |

## 5. Lo que NO se hizo (y por qué)

- **No** se declaró validada ninguna sustitución: D-2 autoriza **pruebas**, no las reemplaza. DP-5 y DP-6 siguen abiertas en sus capas de prueba y legal.
- **No** se emitió ninguna aprobación legal y se dejó escrito que Hermes no puede emitirla.
- **No** se inventaron entregables de licencias: no hay artefacto empaquetado ni dependencias en este repositorio, así que el SBOM, el inventario transitivo y el de imágenes quedan **declarados como no producidos**, con su procedimiento.
- **No** se tocaron los documentos históricos, de investigación ni comparativos (`KORTIX-*`, `STACK-LICENCIAS`, anexo supersedido, registros previos): sus menciones de componentes salientes siguen siendo correctas en su contexto.
- **No** se modificó ninguna decisión arquitectónica previa: `ADR-014` **reemplaza** la frase de "rechazo por defecto" de `05` §10.1 (agregada ese mismo día en la revisión aditiva), documentando el cambio en lugar de editarla en silencio.
- **No** se cerró DP-1, DP-2, DP-4, DP-7, DP-13, DP-15, DP-16, DP-18 ni DP-20: tienen decisión adoptada o diseño documentado, y **cero pruebas ejecutadas**.
- **El workflow de CI se publicó en un segundo intento.** El primer push fue rechazado (`refusing to allow a Personal Access Token to create or update workflow`) porque el PAT no tenía el alcance `workflow`; mientras eso estuvo así, la documentación dijo "CI preparada y pendiente de publicar", no "aplicada". Al agregarse el alcance, el workflow se publicó y la documentación pasó a "CI activa". La traza del rechazo se conserva aquí a propósito.

## 6. Validación ejecutada en esta revisión

Los validadores ahora **viven en el repositorio** y se ejecutan con un solo comando:

```bash
python3 tools/docs-verify/verify_docs.py .
```

| Comprobación | Herramienta | Resultado |
|---|---|---|
| Enlaces y referencias locales | `check_docs.py` | 82 archivos `.md`, 188 enlaces/referencias verificadas OK, 8 bloques Mermaid, 0 duplicados, **0 hallazgos** |
| Existencia de rutas documentadas | `check_paths.py` | 586 rutas comprobadas, **0 hallazgos** |
| Inventarios, manifiestos, estados de ADR, refs cruzadas | `verify_all.py` | 14 ADR `Accepted` EN=ES, espejos 30 (esperado 30), metadatos faltantes 0, refs roídas 0, enlaces roídos 0, contadores declarados 82 = reales 82, **0 hallazgos** |
| Paridad estructural EN↔ES | `check_parity.py` | **0 divergencias / 32 pares** |

**Excepción declarada del validador:** `check_paths.py` mantiene una lista de rutas ignoradas, con el motivo escrito en el código. Hoy tiene **una sola** entrada y no oculta ningún problema real: `docs/DOCUMENT-MANIFEST.md`, la ruta defectuosa que los registros de auditoría citan **a propósito** para describir el defecto histórico. (Durante las horas en que el workflow no estaba publicado tuvo una segunda entrada, `.github/workflows/docs-verify.yml`; se retiró al publicarse el archivo, para que la lista no tape un problema real.)

**Lo que esta validación NO prueba:** consistencia semántica, validez técnica de las sustituciones, compatibilidad de versiones ni licencias. El resultado limpio es condición **necesaria, no suficiente**.
