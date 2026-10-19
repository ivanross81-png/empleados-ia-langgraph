# ADR-011 — Stack con licencias libres únicamente

**Estado:** Aceptado (aceptación del responsable de producto el 2026-10-19)  
**Fecha:** 2026-10-19

## Contexto
La plataforma se comercializa como producto propietario cerrado, tanto en SaaS multiempresa como en instalación privada entregada al cliente. Los compradores empresariales (bancos, aseguradoras, sectores regulados) auditan el stack. El stack de referencia actual contiene componentes cuya licencia **no es libre**: Redis 8 (tri-licencia RSALv2/SSPLv1/AGPLv3), HashiCorp Vault (BUSL-1.1) y componentes opcionales bajo AGPL-3.0 (Grafana, Loki, MinIO), que son libres pero imponen obligaciones sobre un bundle cerrado distribuido.

El responsable de producto decidió el 2026-10-19: **usar licencias libres exclusivamente.**

> **Nota (verificación posterior, 2026-10-19):** este *Contexto* describe la situación **a la fecha de la decisión**. Esos componentes **ya no forman parte del stack de referencia**: salieron con la aceptación —ver *Consecuencias*— y los documentos normativos hoy nombran sus equivalentes libres.

Inventario y evidencia por componente: `docs/reference/STACK-LICENCIAS.md` (§0.bis política, §2 inventario, §3 riesgos). Este ADR convierte ese criterio en regla normativa del paquete.

## Decisión
Solo pueden usarse componentes bajo **licencias libres aprobadas por OSI/FSF**. Las licencias que son meramente "source-available" (BUSL, RSALv2, SSPLv1, ELv2, variantes con "commons clause" o cualquier licencia con *Additional Use Grant*) quedan **prohibidas sin excepción**, porque restringen el uso y no solo la distribución.

Dentro de las licencias libres, el orden de preferencia es:

1. **Permisivas**: MIT, BSD-2/3-Clause, Apache-2.0, MPL-2.0, PostgreSQL License, ISC, LGPL.
2. **Copyleft**: AGPL-3.0 / GPL-3.0 son libres, pero imponen obligaciones sobre un bundle cerrado distribuido (fuente del componente y avisos; AGPL además ante uso por red de una obra modificada). Por eso **no forman parte del stack de referencia**: incorporar una exige una excepción explícita en un ADR, justificada por una capacidad que ningún componente permisivo provea.

El stack de referencia queda **100% permisivo**:

| Función | Componente | Licencia |
|---|---|---|
| Runtime de agentes / durabilidad | LangGraph, LangChain core, Temporal server + SDKs + UI | MIT |
| Gateway de modelos | LiteLLM (solo el núcleo, nunca `enterprise/`) | MIT |
| Política | OPA | Apache-2.0 |
| Secretos | **OpenBao** (reemplaza HashiCorp Vault/BUSL) | MPL-2.0 |
| Caché/coordinación transitoria | **Valkey** (reemplaza Redis 8) | BSD-3-Clause |
| Persistencia de dominio | PostgreSQL + pgvector | PostgreSQL License |
| DLP/PII | Presidio | MIT |
| Observabilidad | OpenTelemetry Collector, Prometheus, **Perses** (paneles), **VictoriaLogs** u OpenSearch (logs) — reemplazan Grafana/Loki | Apache-2.0 |
| Tracing LLM | Langfuse (MIT) — nunca `ee/` | MIT (+ `ee/` propietaria) |
| Object store de artefactos | **SeaweedFS**, o el S3 del cliente, o LOB en PostgreSQL — reemplaza MinIO | Apache-2.0 / n-a |
| API/datos | FastAPI, Pydantic, SQLAlchemy, HTTPX | MIT / BSD-3-Clause |

Reglas derivadas:

- **license gate en CI**: ninguna dependencia nueva entra sin licencia declarada y clasificada (permisiva / copyleft / prohibida), y se escanea el árbol transitivo completo;
- **SBOM por release** más `THIRD-PARTY-NOTICES`, incluido el bundle de instalación privada;
- **ninguna dependencia puede prohibir ofrecer el producto como servicio hospedado**, ni exigir un proveedor exclusivo de cómputo o inferencia;
- el código propietario por directorio (`enterprise/`, `ee/`, `wl/`) nunca se activa, y CI falla si el código de producto importa de esos directorios;
- la política no aplica a servicios que el cliente ya opera (su IdP, su S3, su ERP) ni a herramientas de desarrollo que no se distribuyen.

## Consecuencias
- Vault, Redis, Grafana, Loki y MinIO salieron del stack de referencia en la aceptación (2026-10-19); la sustitución es obligatoria, no opcional. OpenBao y Valkey son compatibles a nivel de API para nuestros usos, así que el impacto técnico está contenido; paneles y logs requieren una evaluación operativa antes de cerrar la sustitución.
- Los documentos normativos que nombraban un componente reemplazado se actualizaron en la misma revisión — `00-INDEX.md`, `02` §4, `05` §1, `09` §2, `06` §7, `10` §1, `ADR-007` (nota de implementación: Vault → equivalente libre MPL) y los espejos `docs/es/` — con trazabilidad en `docs/reference/REGISTRO-CAMBIOS-2026-10-19-ADR-011-ACEPTADO.md`.
- Una capacidad que solo exista en un componente no libre o AGPL requiere un ADR nuevo con la excepción, la obligación asumida y el plan de salida. Sin ese ADR, la capacidad no se entrega.
- Sigue siendo necesaria la revisión legal de las *variantes* de licencia elegidas al empaquetar (los digests de imágenes de contenedor pueden diferir del repositorio fuente).

## Estado de esta decisión (capas separadas)

Este ADR mezcla una decisión de producto, un acto de aceptación formal y varias verificaciones técnicas/legales. Se siguen por separado y **ninguna implica la siguiente**:

| Capa | Estado al 2026-10-19 | Dónde |
|---|---|---|
| **Decisión de producto** (responsable: licencias libres exclusivamente) | **Tomada** — directiva del responsable de producto, 2026-10-19 | Este ADR, *Contexto*; `docs/reference/REGISTRO-CAMBIOS-DOCUMENTALES-2026-10-19.md` §4.1 |
| **Aceptación formal de este ADR** | **Hecha** — el responsable de producto aceptó este ADR el 2026-10-19; la política es regla normativa del paquete desde esa fecha | Campo de estado de este ADR; `docs/reference/REGISTRO-CAMBIOS-2026-10-19-ADR-011-ACEPTADO.md` |
| **Compatibilidad técnica de las sustituciones** | **Pendiente** — Valkey y OpenBao son compatibles a nivel de API para nuestros usos; Perses, VictoriaLogs/OpenSearch y SeaweedFS requieren evaluación operativa | DP-5, DP-6 |
| **Verificación de licencias** | **Hecha** para los componentes directos listados en `docs/reference/STACK-LICENCIAS.md`; **abierta en el árbol transitivo** hasta que existan el SBOM y el license gate | `STACK-LICENCIAS` §0.bis, §4 |
| **Validación legal** | **Pendiente** — no se revisó la variante de licencia del artefacto empaquetado (digests de imágenes, avisos incluidos) | DP-6 |

La aceptación vuelve **normativa** la sustitución: los componentes nombrados en `00-INDEX.md`, `02` §4, `05` §1, `09` §2, `06` §7, `10` §1 y `ADR-007` fueron **renombrados** a sus equivalentes libres en la misma revisión (ver el registro citado), no solo anotados. Verificar una licencia sigue **sin** ser validar técnicamente una sustitución, y ninguna de las dos reemplaza las pruebas pendientes de DP-5 y DP-6.

## Alternativas consideradas
- **Mantener Redis/Vault y aceptar AGPL o BUSL**: rechazado — restringe el modelo de servicio hospedado y suma hallazgos de auditoría por un componente que tiene reemplazo libre y compatible a nivel de API.
- **Permisivas solo para componentes nuevos, dejando los existentes como están**: rechazado — el stack de referencia ya tiene los reemplazos identificados y verificados; una cláusula de "abuelo" solo postergaría la deuda.
- **Source-available con camino de excepción por ADR**: rechazado por la decisión del responsable (licencias libres *exclusivamente*).
