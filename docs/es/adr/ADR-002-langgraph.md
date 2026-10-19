# ADR-002 — LangGraph como Runtime del agente

**Estado:** Aceptado

## Contexto
La plataforma requiere razonamiento de agente con estado, loops, uso condicional de herramientas y estado de grafo explícito.

## Decisión
LangGraph es el runtime cognitivo para los grafos de agente del Empleado Digital. No es el motor de flujo de trabajo (workflow) durable y no es dueño de la autorización.

## Consecuencias
La lógica del agente puede evolucionar de forma independiente de la ejecución durable. La durabilidad del flujo de trabajo (workflow) permanece fuera del grafo del agente.