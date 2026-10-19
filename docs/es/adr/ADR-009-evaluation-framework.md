# ADR-009 — Evaluación continua del agente

**Estado:** Aceptado

## Contexto
Las pruebas unitarias tradicionales no pueden capturar por completo la trayectoria del agente, la calidad de la recuperación ni la selección de herramientas.

## Decisión
Mantener conjuntos de datos de Evaluación versionados y ejecutar suites de regresión en CI/CD. Ragas, DeepEval o herramientas equivalentes pueden implementar el marco (framework).

## Consecuencias
Los cambios en prompts, modelos y herramientas pasan a ser insumos de release medibles en lugar de cambios informales.