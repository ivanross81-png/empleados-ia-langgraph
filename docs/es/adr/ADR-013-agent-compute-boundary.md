# ADR-013 — Frontera de cómputo del agente en el MVP

**Estado:** Aceptado (decisión del responsable del producto, 2026-10-19)  
**Fecha:** 2026-10-19

## Contexto
La arquitectura le da al Empleado Digital capacidades exclusivamente a través de **herramientas gobernadas**; nunca definió un entorno donde el empleado pueda *computar* (generar un archivo, armar una planilla, correr un script) para producir un entregable. `04` §25 registró esa brecha como pregunta abierta (hallazgos K-12/K-21; DP-2), con la advertencia de que no debía resolverse implícitamente desde una implementación. El responsable decidió la frontera del MVP.

## Decisión
1. **El MVP no permite ejecución arbitraria de código del agente dentro del proceso principal.** No hay `exec`, ni shell, ni evaluador de código escrito por el modelo en el proceso de API, worker o runtime del agente.
2. Los entregables los produce un **servicio restringido de generación de artefactos** con:
   - **bibliotecas y plantillas aprobadas** de un catálogo cerrado (agregar una es un cambio gobernado, sujeto a la puerta de licencias de `06` §18);
   - **límites de recursos** (CPU, memoria, tiempo de pared, tamaño de salida);
   - **ausencia de secretos**: el servicio no recibe credenciales ni puede resolverlas (`06` §7/§7.1);
   - **restricciones de red**: sin salida por defecto.
3. Los artefactos que produce el servicio son **artefactos gobernados**: les aplican clasificación, retención y reglas de acceso de `05` §21, igual que a cualquier otro artefacto.
4. **La ejecución arbitraria en un sandbox efímero** (sin red, efímero, sin exposición de credenciales) es una **evolución posterior al MVP**: requiere su propia decisión y sus propias pruebas de aislamiento, y **no** queda autorizada por este ADR.

## Consecuencias
- El empleado puede generar entregables **sin** convertir la plataforma en un servicio de ejecución de código: esa es la frontera que mantiene intacto el modelo de seguridad (sin exposición de credenciales, acciones gobernadas).
- La capacidad queda acotada a lo que cubra el catálogo de plantillas y bibliotecas; cada capacidad nueva es una incorporación explícita y auditable en lugar de una propiedad emergente del código arbitrario.
- El servicio necesita sus propios límites, auditoría de cada artefacto generado y una ruta de rechazo con resultado tipado cuando una solicitud los excede.
- **Estado de esta decisión:** decisión de diseño **adoptada por el responsable**; **no** validada técnicamente — el servicio no existe y no se ejecutó ninguna prueba de aislamiento, así que DP-2 sigue abierta en sus capas de *implementación* y *prueba*.

## Alternativas consideradas
- **Ejecución arbitraria de código en el MVP:** rechazada — exigiría un aislamiento que todavía no existe y rompería la promesa de que el modelo nunca alcanza una credencial.
- **Nada de cómputo:** rechazada — limita el producto a "propone acciones" y deja sin cumplir la promesa de trabajo terminado.
- **Delegar la generación a un SaaS externo:** rechazada para el MVP — traslada datos del cliente a un tercero sin una decisión que lo cubra.
