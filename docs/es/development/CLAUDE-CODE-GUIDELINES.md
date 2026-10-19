# Guía para Claude Code y agentes de codificación

**Versión:** 0.1.0  
**Audiencia:** Claude Code y otros agentes de codificación
**Creado:** 2026-09-21  
**Actualizado:** 2026-10-19

## 1. Misión

Implementar la Plataforma de Empleados Digitales (Digital Employee Platform) según el contrato de arquitectura. Optimizar por correctitud, seguridad, mantenibilidad y entrega incremental; no cambiar la arquitectura para facilitar una tarea local.

## 2. Lectura obligatoria

Antes de un trabajo significativo, leer:

1. `docs/architecture/00-ARCHITECTURE-INDEX.md`
2. los documentos de arquitectura relevantes
3. los ADR relevantes
4. `docs/development/DEVELOPMENT-GUIDELINES.md`
5. `docs/development/SECURITY-RULES.md`

## 3. Nunca cambiar estas decisiones en silencio

- Temporal es propietario de la ejecución durable.
- LangGraph es propietario del razonamiento del agente.
- La salida del LLM no es confiable.
- OPA/política autoriza las acciones gobernadas.
- El MCP Gateway controla la ejecución de herramientas enterprise.
- Los secretos provienen de la gestión centralizada de secretos.
- PostgreSQL es el Sistema de registro oficial del dominio.
- La Ejecución es la unidad de trabajo.
- Las versiones publicadas son inmutables.

Si una tarea parece requerir cambiar uno de estos, detenerse y proponer un ADR.

## 4. Flujo de trabajo (workflow) de implementación

```text
Understand task
 → Locate architecture boundary
 → Inspect existing code
 → Identify contracts/invariants
 → Implement smallest coherent change
 → Add tests
 → Run relevant evaluation
 → Update docs/ADR if needed
```

## 5. Exploración del repositorio

No asumir que un archivo existe. Inspeccionar el repositorio y seguir las convenciones de paquetes existentes. Evitar refactors amplios no relacionados con la tarea.

## 6. Cambios de dependencias

No agregar un framework o servicio solo porque hace más fácil una función. Explicar el impacto operativo y arquitectónico. Los cambios de dependencias que alteran la arquitectura del runtime requieren un ADR.

## 7. Cambios de API

Tratar los esquemas de API/eventos/herramientas como contratos. Los cambios que rompen la compatibilidad requieren versionado o una estrategia explícita de migración.

## 8. Cambios del agente

Al cambiar instrucciones (prompts), grafos, herramientas, routing o construcción de contexto:

- identificar las evaluaciones afectadas;
- preservar los límites de la política;
- probar el comportamiento de las herramientas;
- probar los caminos de fallo;
- medir la regresión.

## 9. Seguridad

Nunca debilitar autenticación, autorización, DLP, manejo de secretos o restricciones de herramientas para que pasen las pruebas. Si una prueba es difícil por un límite de seguridad, construir un fixture de prueba controlado.

## 10. Criterios de finalización

Una tarea no está completa solo porque el código compila. Está completa cuando se abordan la implementación, las pruebas, la observabilidad, la documentación y las implicaciones de migración.

## 11. Informe final

Toda tarea de agente de codificación debe resumir:

- archivos modificados;
- comportamiento modificado;
- pruebas ejecutadas;
- documentos de arquitectura afectados;
- ADR agregados/actualizados;
- limitaciones conocidas;
- trabajo de seguimiento.

## 12. Regla de oro

> **No rediseñar la plataforma en silencio mientras se implementa una funcionalidad.**