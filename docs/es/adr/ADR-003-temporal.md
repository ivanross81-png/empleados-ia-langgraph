# ADR-003 — Temporal para Ejecución Durable

**Estado:** Aceptado

## Contexto
El trabajo del Empleado Digital puede durar días o esperar por humanos. Los reintentos, los temporizadores y la recuperación deben sobrevivir a los reinicios del proceso.

## Decisión
Temporal es dueño del ciclo de vida del flujo de trabajo (workflow) durable, los temporizadores, las señales, los reintentos, la cancelación, la recuperación y las esperas humanas.

## Consecuencias
La complejidad operativa aumenta en relación con una cola dentro del proceso, pero la confiabilidad de ejecución prolongada y la semántica HITL quedan explícitas.