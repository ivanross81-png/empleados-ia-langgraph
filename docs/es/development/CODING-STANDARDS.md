# Estándares de Codificación

**Versión:** 0.1.0  
**Creado:** 2026-09-21  
**Actualizado:** 2026-10-19

## Python

- Python con type hints en todo el código.
- Pydantic para los esquemas de los límites API/dominio.
- Inyección de dependencias explícita.
- Funciones pequeñas con efectos secundarios claros.
- Async solo donde la operación subyacente se beneficia de ello.
- Sin estado global mutable oculto.

## Nomenclatura

Usar la terminología de dominio de `03-DOMAIN-MODEL.md`. No crear sinónimos para conceptos canónicos como Ejecución, Tarea, Trigger, Acción o Aprobación.

## API

- Rutas versionadas.
- Esquemas explícitos de request/response.
- Códigos de error estables.
- Idempotencia para operaciones de mutación.
- Sin stack traces internos en las respuestas de producción.

## Persistencia

- Las migraciones son obligatorias para cambios de esquema.
- Usar claves foráneas y constraints de unicidad donde corresponda.
- Las transacciones deben tener límites explícitos.
- Evitar lógica de negocio oculta en hooks de ORM.

## Código del agente

- El estado del agente es explícito.
- Las llamadas a herramienta están tipadas.
- Las instrucciones (prompts) están versionadas/configuradas, no dispersas como literales.
- Ninguna herramienta puede eludir la ruta de política/gateway.

## Seguridad

- Nunca loguear credenciales.
- Nunca commitear secretos.
- Validar la entrada externa.
- Tratar el contenido recuperado/de herramientas como no confiable.

## Code review

Revisar correctitud, arquitectura, seguridad, comportamiento ante fallos, observabilidad, pruebas y mantenibilidad, no solo si el camino feliz funciona.
