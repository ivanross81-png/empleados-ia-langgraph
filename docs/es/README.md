# Plataforma de Empleado Digital — Paquete de arquitectura (espejo en español)

Este paquete contiene la línea base arquitectónica v0.1 de la Digital Employee Platform.

Empiece por `docs/es/architecture/00-ARCHITECTURE-INDEX.md`.

Los documentos de arquitectura son normativos. Las guías de desarrollo y los ADR restringen los cambios de implementación.

**Estado:** línea base `v0.1.0` (2026-09-21), revisada el 2026-10-19. Inventario completo, reglas de autoridad y registro de revisiones: `DOCUMENT-MANIFEST.md` (y su espejo `docs/es/DOCUMENT-MANIFEST.md`). El paquete **inglés** es el normativo; esta carpeta es el espejo de lectura humana.

## Estructura

| Ubicación | Contenido | Autoridad |
|---|---|---|
| `docs/es/architecture/` | 11 documentos: arquitectura, dominio, runtime, persistencia/API, seguridad, MCP, memoria, observabilidad, despliegue | Espejo del normativo |
| `docs/es/adr/` | 14 decisiones arquitectónicas (las 14 aceptadas, incluida la política de licencias libres y, desde el 2026-10-19, el almacén de checkpoints, la frontera de cómputo y la semántica de aprobaciones) | Espejo del normativo |
| `docs/es/development/` | 5 guías para implementar (flujo, estándares, pruebas, seguridad, contrato para agentes de código) | Espejo del normativo |
| `docs/es/product/` | Propuesta de PRD del MVP, plan de entrega y matriz de trazabilidad; requiere aceptación del responsable | Propuesto / no normativo |
| `docs/reference/` | Material no normativo: investigación, licencias, matriz de cruce, auditoría, invariantes y decisiones pendientes (sin espejo: se conserva solo en un idioma) | No normativo |

## Reglas

- El **inglés** es la fuente normativa; este espejo debe reflejarlo fielmente y no introduce decisiones propias.
- Un cambio de límites, seguridad, contratos o exclusiones **requiere un ADR**.
- Las decisiones **aceptadas** son reglas vigentes (`ADR-011`, política de licencias libres, aceptado el 2026-10-19); lo que está propuesto se marca como tal y no se aplica.
- Lo que falta probar o decidir se registra en `docs/reference/DECISIONES-PENDIENTES.md`; los invariantes y sus pruebas, en `docs/reference/INVARIANTES-Y-PRUEBAS.md`.
