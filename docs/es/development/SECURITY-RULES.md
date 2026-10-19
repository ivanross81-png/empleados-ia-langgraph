# Reglas de Seguridad para el Desarrollo

**Versión:** 0.1.0  
**Creado:** 2026-09-21  
**Actualizado:** 2026-10-19

## Reglas obligatorias

1. Nunca poner secretos en el código fuente.
2. Nunca pasar credenciales en crudo a un LLM.
3. Nunca confiar en la salida del modelo como autorización.
4. Nunca ejecutar nombres de herramientas arbitrarios sin validación de allowlist/registry.
5. Nunca tratar el texto recuperado como instrucciones confiables.
6. Nunca eludir el MCP Gateway para acciones externas gobernadas.
7. Toda acción externa mutable requiere una identidad de ejecución.
8. Toda acción gobernada requiere una decisión de política.
9. La aprobación debe ser durable y auditable.
10. La telemetría sensible debe estar redactada.
11. Los eventos externos requieren autenticación y protección contra replay.
12. Las operaciones destructivas requieren política explícita y, donde esté configurado, aprobación humana.
13. Las dependencias y los contenedores deben escanearse.
14. Los cambios relevantes para la seguridad requieren pruebas.

## Manejo de datos

Clasificar los datos antes de la transferencia externa. Aplicar las reglas de Prevención de fuga de datos (DLP) antes de las llamadas externas al LLM y de la persistencia en memoria.

## Respuesta ante incidentes

Si se sospecha fuga de credenciales: revocar/rotar primero, preservar evidencia de auditoría segura, deshabilitar las integraciones afectadas y luego investigar.
