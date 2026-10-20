# Digital Employee Platform — arquitectura canónica (v0.1.0)

Documentación normativa de la plataforma de **Empleados Digitales**: agentes que ejecutan trabajo empresarial sobre workflows durables, herramientas gobernadas y aprobación humana.

**Estado:** línea base `v0.1.0` creada el 2026-09-21 · revisión aditiva y auditoría de consistencia el 2026-10-19.

## Por dónde empezar

1. `docs/architecture/00-ARCHITECTURE-INDEX.md` — mapa del paquete, reglas de autoridad y orden de lectura.
2. `DOCUMENT-MANIFEST.md` — inventario real (30 archivos normativos, 4 de raíz, material de referencia) y registro de revisiones.
3. `EXPLICACION-NO-TECNICA.md` — la misma arquitectura explicada sin jerga.

## Qué contiene

| Ubicación | Contenido | Autoridad |
|---|---|---|
| `docs/architecture/00`–`10` | Arquitectura, dominio, runtime, persistencia/API, seguridad, MCP, memoria, observabilidad, despliegue | **Normativo** — el código debe implementarlo |
| `docs/adr/ADR-001`–`014` | Decisiones arquitectónicas inmutables (una por decisión) | **Normativo** — cambiarlas requiere un ADR nuevo |
| `docs/development/` | Guías para implementar: flujo, estándares, pruebas, reglas de seguridad y contrato para agentes de código | **Normativo** para la implementación |
| `docs/es/` | Espejo en español (rioplatense) de los 30 documentos normativos, para lectura humana | No normativo — el inglés manda |
| `docs/reference/` | Investigación (Kortix/Suna), inventario de licencias, matriz de cruce, auditoría, decisiones pendientes, invariantes y anexo heredado | **No normativo** |

## Reglas del paquete

- El **inglés** es la fuente normativa; `docs/es/` debe reflejarlo fielmente.
- Un cambio de límites, seguridad, contratos o exclusiones **requiere un ADR**; no se hace por edición silenciosa.
- Las decisiones **aceptadas** son reglas vigentes: `ADR-011` (política de licencias libres) está **aceptado** desde el 2026-10-19, así que el stack de referencia usa Valkey, OpenBao, Perses, VictoriaLogs/OpenSearch y SeaweedFS en lugar de Redis, Vault, Grafana, Loki y MinIO (`docs/reference/STACK-LICENCIAS.md`). Lo que está propuesto se marca como tal y no se aplica.
- Una **brecha documentada** no es una brecha resuelta: lo que falta probar o decidir se registra en `docs/reference/DECISIONES-PENDIENTES.md`.
- El stack de referencia está sujeto a la política de **licencias libres** (`docs/adr/ADR-011-free-licence-stack.md`, `docs/reference/STACK-LICENCIAS.md`).

## Validación

El paquete se verifica con comprobaciones deterministas y **reproducibles**, publicadas en el repositorio: `python3 tools/docs-verify/verify_docs.py` comprueba enlaces y referencias locales, existencia de las rutas documentadas, inventarios y manifiestos, estados de ADR y referencias cruzadas, y paridad estructural inglés/español.

La **integración continua está activa**: `.github/workflows/docs-verify.yml` ejecuta `verify_docs.py` en cada push y PR contra `main` y **falla** ante hallazgos demostrables (para publicarlo hubo que agregar el alcance `workflow` al token de GitHub).

Un resultado limpio es una **condición necesaria, no suficiente**: no prueba consistencia semántica ni valida técnicamente las tecnologías del stack. Estado de las últimas corridas: `docs/reference/AUDITORIA-CONSISTENCIA-2026-10-19.md` §8 y `docs/reference/REGISTRO-CAMBIOS-2026-10-19-DECISIONES-RESPONSABLE.md`.
