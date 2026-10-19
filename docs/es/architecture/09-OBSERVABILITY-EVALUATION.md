# Digital Employee Platform — Observabilidad y Evaluación

**Versión:** 0.1.0  
**Estado:** Normativo

## 1. Objetivos de observabilidad

La plataforma debe responder dos preguntas distintas:

1. **Operativa:** ¿El sistema está sano?
2. **Calidad del agente:** ¿El Empleado Digital hizo el trabajo correcto?

Estas inquietudes están relacionadas pero no deben confundirse.

## 2. Pila de telemetría

Componentes de referencia:

- OpenTelemetry para correlación de rastros/métricas/registros;
- Prometheus para métricas;
- Grafana para paneles;
- Loki o equivalente para registros;
- Langfuse para trazado de LLM/agente;
- PostgreSQL para metadatos durables de auditoría.

## 3. Identificadores de correlación

Toda Ejecución debe portar:

- ID de ejecución;
- ID de correlación;
- ID de causación;
- ID de tenant;
- versión de empleado/tarea;
- ID de workflow;
- ID de rastro.

El stream de eventos de ejecución (`05` §20) es la proyección hacia el cliente de esta telemetría: expone los mismos identificadores para que un operador pase de una métrica o alerta a la ejecución exacta y sus eventos.

## 4. Métricas

### Plataforma

- latencia de peticiones;
- tasa de errores;
- latencia de cola;
- duración del workflow;
- utilización del worker;
- latencia de base de datos;
- latencia de MCP;
- estado del cortacircuitos (circuit breaker).

### Agente

- tasa de completamiento de tareas;
- éxito de llamadas de herramienta;
- denegaciones por política;
- tasa de aprobación;
- reintentos;
- iteraciones;
- uso de tokens;
- costo estimado;
- tasa de intervención humana.

### Calidad

- resultado esperado logrado;
- factualidad/anclaje donde sea medible;
- precisión de selección de herramientas;
- cumplimiento de políticas;
- puntaje de regresión.

## 5. Registros (logs)

Los registros son estructurados y deben incluir identificadores en lugar de incorporar payloads grandes. Los Secretos y la información restringida deben redactarse.

## 6. Auditoría versus registros (logs)

Los registros son operativos y efímeros. La Auditoría es evidencia de gobierno y tiene retención controlada. No son intercambiables.

La auditoría cubre **acceso y datos, no solo acciones de negocio**: leer un registro clasificado, exportar una lista, cambiar una política, cambiar un acceso o actuar como otra identidad producen un evento auditable con el nombre canónico de acción definido en `05` §5.1. Si un revisor no puede responder "quién vio este dato y quién autorizó esta acción", la auditoría está incompleta.

## 7. Marco de evaluación

La plataforma debe mantener un paquete de evaluación versionado usando herramientas como Ragas, DeepEval o un harness interno equivalente.

Los datasets de Evaluación deben contener tareas representativas, comportamientos esperados, restricciones de herramientas y casos adversarios conocidos.

## 8. Pruebas de regresión

Todo cambio material en:

- prompts;
- políticas;
- herramientas;
- grafos de agentes;
- configuración de modelos;
- recuperación (retrieval);
- compresión de contexto

debe ejecutar el paquete de evaluación relevante antes del lanzamiento.

## 9. Categorías de pruebas

- pruebas unitarias deterministas;
- pruebas de contratos de API;
- pruebas de integración;
- pruebas de MCP;
- pruebas de seguridad;
- pruebas de inyección de prompts;
- pruebas de recuperación (retrieval);
- pruebas de trayectoria del agente;
- escenarios de negocio de extremo a extremo.

## 10. Datasets dorados (golden datasets)

Un dataset dorado contiene casos representativos conocidos con restricciones esperadas y resultados aceptables. Debe versionarse y revisarse como código.

## 11. Evaluación de LLM

La Evaluación de LLM debe distinguir las comprobaciones objetivas de las evaluaciones con judge. Los jueces automáticos son útiles pero no son autoritativos para seguridad o autorización.

## 12. Observabilidad de costos

Realizar seguimiento de modelo, proveedor, tokens, latencia y costo estimado por ejecución, Tarea y Empleado Digital. Esto sustenta el enrutamiento y los controles de presupuesto.

### 12.1 Cuotas y corte

*Agregado 2026-10-19 — cierra el hallazgo K-42/K-43 de `docs/reference/KORTIX-CROSS-MATRIX.md`.*

Observar el costo no es controlarlo. El control de costo se aplica en fronteras definidas:

| Nivel | Control | Comportamiento al agotarse |
|---|---|---|
| Ejecución | Presupuesto por ejecución (`04` §16) | La ejecución se detiene con un resultado tipado `BUDGET_EXCEEDED`; el resultado parcial se preserva y la acción no queda a mitad de camino |
| Tarea / empleado | Techo de consumo por período | Las ejecuciones nuevas se rechazan al crearse con un error estable; las que están corriendo se avisan en un umbral configurable |
| Tenant / despliegue | Cuota de plan o entitlement | El plano de control rechaza crear ejecuciones y la automatización se pausa (nunca degrada en silencio) |
| Clave de proveedor | Límite de tasa/costo en el gateway | El router hace fallback a la siguiente opción permitida; si no hay, la llamada al modelo falla con error tipado (`04` §13) |

Reglas:

- todo corte es **explícito y auditable**: una ejecución detenida por presupuesto registra quién/qué la detuvo y por qué;
- el consumo es medible por tenant, empleado, tarea y modelo — es también la base del metering comercial SaaS (`10`);
- los límites "blandos" (alertar) y los "duros" (detener) son ajustes distintos, nunca el mismo número;
- una alerta de anomalía de costo (`§13`) no sustituye un límite duro.

## 13. Alertas

Ejemplos:

- tasa sostenida de fallos de ejecución;
- pico de errores de MCP;
- envejecimiento de la cola de aprobaciones;
- cortacircuitos (circuit breaker) abierto;
- anomalía de tokens/costo;
- regresión de evaluación;
- volumen inusual de llamadas de herramienta.

Además, del cruce (2026-10-19): antigüedad de la cola de aprobaciones por encima del SLA (`05` §10.1), ejecuciones pausadas o suspendidas más de lo esperado, costo por ejecución negativo o anómalo, operaciones de control emitidas por operadores (pausar/interrumpir/terminar) y huecos de cobertura de auditoría detectados por pruebas de contrato (`05` §5.2).

## 14. Compuertas de lanzamiento

Un lanzamiento no debe proceder cuando fallan las pruebas de seguridad obligatorias, se rompe la compatibilidad de contratos o la calidad de la evaluación cae por debajo del umbral de aceptación configurado.

## 15. Privacidad

Los sistemas de Observabilidad deben aplicar los mismos controles de clasificación de datos que el runtime. Los rastros no deben convertirse en un almacén de datos de puerta trasera.