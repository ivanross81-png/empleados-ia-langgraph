---
type: reference
status: active
created: 2026-10-19
updated: 2026-10-19
tags: [digital-employee, licencias, adr-011, aceptacion, trazabilidad, auditoria]
---

# Registro de cambios documentales — Aceptación de `ADR-011` (2026-10-19)

> **No normativo.** Registra el acto de aceptación de `ADR-011 — Stack con licencias libres únicamente` y las modificaciones documentales que ese acto habilita. Complementa [[REGISTRO-CAMBIOS-2026-10-19-AUDITORIA|el registro de la auditoría]] (que describe los cambios previos, cuando la política estaba en estado `Propuesto`) y [[AUDITORIA-CONSISTENCIA-2026-10-19|el informe de auditoría]].

## 1. Objeto y autoridad

- **Acto:** el responsable de producto acepta `ADR-011` (*"1 aceptado"*), 2026-10-19.
- **Efecto:** la política de licencias libres exclusivas pasa de **criterio de selección** a **regla normativa del paquete**. Las anotaciones "componente saliente / sustituto de referencia, pendiente de aceptación de `ADR-011`" dejan de ser la formulación vigente: los normativos **nombran el componente adoptado**.
- **Alcance de este registro:** solo los renombres y las notas de estado que dependen de la aceptación. **No** se cambió ninguna decisión arquitectónica previa, **no** se agregó ninguna dependencia, **no** se implementó código y **no** se cerró ninguna brecha de prueba (licencia verificada ≠ sustitución validada).

## 2. Estado de partida

- Rama `main`; commit de partida de la aceptación: `df6aa7c04dd1cadf26c6b2ac5b4357313044a6d0` (auditoría de consistencia, 2026-10-19).
- Paquete: 71 archivos `.md`; `ADR-011` en estado `Proposed`; normativos con anotaciones de componente saliente.

## 3. Cambios aplicados

| Archivo | Sección | Motivo | Antes | Después |
|---|---|---|---|---|
| `docs/adr/ADR-011-free-licence-stack.md` (+ espejo ES) | Cabecera | Formalizar la aceptación | `Status: Proposed (awaiting product-owner acceptance)` | `Status: Accepted (product owner acceptance 2026-10-19)` |
| `docs/adr/ADR-011-…` (+ ES) | *Status of this decision* | La capa 2 ya no está pendiente | capa "Formal acceptance" = **Pending**; nota "hasta la aceptación los renombres son anotaciones" | capa = **Done** con fecha y registro; nota: la sustitución es **normativa** y los renombres se aplicaron |
| `docs/adr/ADR-011-…` (+ ES) | *Consequences* | Tiempo verbal y alcance | "leave the reference stack" / "must be updated in the same revision" | "left the reference stack on acceptance (2026-10-19)" / "were updated in the same revision", con el listado real de archivos |
| `docs/adr/ADR-007-secrets-management.md` (+ ES) | Nota de implementación | La política ya es vigente | "Under the free-licence policy (`ADR-011`)" | "in force since `ADR-011` was accepted on 2026-10-19" |
| `docs/architecture/02-ENTERPRISE-ARCHITECTURE.md` (+ ES) | §4 tabla y diagrama | Renombre normativo | fila `Vault/KMS — implementación: OpenBao…` / fila `Redis *(saliente: Valkey)*`; nodo `SEC[Vault/KMS]` | fila `OpenBao` / fila `Valkey`; nodo `SEC[OpenBao/KMS]` |
| `docs/architecture/04-RUNTIME-EXECUTION-ARCHITECTURE.md` (+ ES) | §8 diagrama de credenciales | Renombre normativo | `→ Vault/KMS` | `→ OpenBao/KMS` |
| `docs/architecture/05-PERSISTENCE-API-CONTRACTS.md` (+ ES) | §1 texto y tabla de autoridades | Renombre normativo | "Redis is transient infrastructure" / fila `Redis *(saliente: Valkey…)*` | "Valkey is transient infrastructure" / fila `Valkey` |
| `docs/architecture/06-SECURITY-GOVERNANCE.md` (+ ES) | §7 Secretos | Renombre normativo | "Use Vault or an equivalent KMS-backed secret manager" | "Use OpenBao (or an equivalent free-licence KMS-backed secret manager — `ADR-007`, `ADR-011`)" |
| `docs/architecture/07-MCP-INTEGRATION-ARCHITECTURE.md` (+ ES) | Diagrama MCP | Renombre normativo | `MG --> SEC[Vault/KMS]` | `MG --> SEC[OpenBao/KMS]` |
| `docs/architecture/09-OBSERVABILITY-EVALUATION.md` (+ ES) | §2 stack de referencia | Renombre normativo | `Grafana` / `Loki` *(componente saliente…pendiente de aceptación de `ADR-011`)* | `Perses` *(Apache-2.0; reemplaza a Grafana)* / `VictoriaLogs u OpenSearch` *(reemplazan a Loki)*; nota: política **vigente desde la aceptación** |
| `docs/architecture/10-DEPLOYMENT-OPERATIONS.md` (+ ES) | §1 lista de servicios; §3 configuración | Renombre normativo | `redis`; "Vault/KMS para los secretos" | `valkey`; "OpenBao para los secretos"; "OpenBao puede ser externo al despliegue" |
| `00-INDEX.md` | Tabla de stack (nota al pie) | Estado real | "`ADR-011`, estado: Propuesto … siguen nombrando el componente saliente" | "Aceptado el 2026-10-19 … los paneles pasan de Grafana a Perses y los logs de Loki a VictoriaLogs/OpenSearch" |
| `README.md` / `docs/es/README.md` | Reglas del paquete | Estado real | "Las decisiones propuestas (`ADR-011`, estado `Proposed`) no son reglas vigentes" | "Las decisiones aceptadas son reglas vigentes: `ADR-011` … está aceptado desde el 2026-10-19" + tabla de `docs/es/adr` con 11 ADR aceptados |
| `EXPLICACION-NO-TECNICA.md` | Glosario y tablas | Coherencia del lenguaje no técnico | "La Memoria de Trabajo (Redis)", "La Caja Fuerte (Vault)" | "La Memoria de Trabajo (Valkey)", "La Caja Fuerte (OpenBao)" |
| `docs/reference/STACK-LICENCIAS.md` | §0.bis, §1, §2 | Estado real | política "Propuesto … criterio de selección"; "efecto pendiente de la aceptación"; "Decisión pendiente" (Vault); OpenBao "candidato" | política **ACEPTADA**; efecto **aplicado** con lista de archivos; "Decidido: OpenBao"; OpenBao **adoptado** |
| `docs/reference/DECISIONES-PENDIENTES.md` | Resumen, DP-5, DP-17 | Estado por capas | capa 2 "Pendiente"; "no se renombró ningún componente"; criterio de cierre completo pendiente | capa 2 **Hecha**; renombres **aplicados**; criterio de cierre **parcialmente cumplido** (pruebas de DP-5/DP-6 abiertas) |
| `docs/reference/KORTIX-CROSS-MATRIX.md` | §A.1, §A.4, §A.6, §C.2, §C.4 | Estado del cruce | "`ADR-011` en estado `Proposed`"; C-6 con `PENDIENTE_DE_DECISION`; P-02/P-24 "propuesto/pendiente" | 11 ADR `Accepted`; C-6 resuelto documentalmente; P-02 y P-24 con la aceptación aplicada |
| `docs/reference/AUDITORIA-CONSISTENCIA-2026-10-19.md` | A-4, A-8, §9 R-4, §10 | Cierre de hallazgos | "la aceptación sigue pendiente"; R-4 "política sin fuerza normativa plena" | hallazgos **cerrados con la aceptación**; R-4 reformulado (queda la fuerza *técnica*: pruebas y licencias transitivas) |
| `docs/architecture/00-ARCHITECTURE-INDEX.md` (+ ES) | §11/§12 revisión | Registrar el acto | segunda revisión del día (auditoría) | tercera entrada: aceptación de `ADR-011` y renombres |
| `DOCUMENT-MANIFEST.md` (+ espejo ES) | §7.2 y §8 | Inventario y bitácora | 11 documentos de referencia, 71 `.md`, `ADR-011` Propuesto | 12 documentos de referencia, 72 `.md`, entrada de bitácora de la aceptación |

## 4. Verificación (no destructiva, ejecutada)

| Control | Resultado |
|---|---|
| `check-docs.py` | 72 archivos `.md`, enlaces y referencias internas OK, bloques Mermaid OK, 0 hallazgos |
| `check-parity.py` | 29 pares EN↔ES sin divergencia estructural (incluye los archivos renombrados y sus espejos) |
| `verify-all.py` | 0 hallazgos: estados de ADR EN=ES (ahora **11 `Accepted`/`Aceptado`**), campos de metadatos, referencias a secciones existentes, contadores declarados vs reales |
| `grep` de control | `Redis`, `Vault`, `Grafana`, `Loki` y `MinIO` no aparecen como componentes **nuestros** en `docs/architecture/`, `docs/adr/`, `docs/es/`, `00-INDEX.md`, `README.md` ni `EXPLICACION-NO-TECNICA.md`; permanecen solo en documentos históricos o como referencia explícita a lo reemplazado |

## 5. Lo que NO cambió (para evitar interpretaciones falsas)

- **Ninguna brecha de prueba quedó cerrada.** Valkey, OpenBao, Perses, VictoriaLogs/OpenSearch y SeaweedFS siguen **sin evaluación operativa** (DP-5, DP-6). La aceptación es una decisión de política, no un resultado técnico.
- **Ninguna decisión arquitectónica previa fue alterada:** `ADR-007` sigue diciendo "Vault o equivalente"; lo que cambia es qué implementación lo satisface y que ahora es normativo.
- **No se introdujeron dependencias ni código**, no hay servicios creados ni cambios de versión.
- **No se eliminó ningún documento histórico:** los registros anteriores conservan los nombres salientes porque describen el estado de ese momento.
- **La validación legal sigue pendiente** (variantes de licencia del artefacto empaquetado, avisos, SBOM del árbol transitivo).

## 6. Pendientes que abre o deja abiertos

1. Prueba de compatibilidad de las sustituciones (DP-5, DP-6) antes de comprometerlas en el despliegue.
2. SBOM + *license gate* en CI y `THIRD-PARTY-NOTICES` (`06` §18).
3. Revisión legal de las variantes empaquetadas (digests de imágenes).
4. Ítems 2, 4 y 5 de la lista de intervenciones del informe de auditoría (umbrales de DP-18, decisiones de runtime y modalidades comerciales): **sin cambios**, quedan como estaban.
