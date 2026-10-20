# Plan de entrega del MVP — Porción vertical

**Estado:** Propuesta de implementación; no normativa hasta aceptar el alcance  
**Revisión:** 2026-10-20  
**Complemento:** MVP-PRD.md

## Estrategia

Construir una porción vertical del Empleado Digital de Cobranzas. Cada incremento debe dejar el repositorio ejecutable y aportar evidencia. No convertir cada caja de arquitectura en un microservicio: conservar límites claros y consolidar despliegues cuando sea razonable. Docker Compose basta para el MVP dedicado.

## M0 — Cerrar alcance

- Aceptar Cobranzas y la consola web como primera superficie.
- Confirmar esquema de facturas sintéticas, roles y matriz de riesgo.
- Definir contratos de ejecución, estado, propuesta, aprobación y resultado.
- Crear escenarios ALLOW, DENY, REQUIRE_APPROVAL y efecto externo incierto.
- Asignar responsable y evidencia a cada decisión pendiente.

**Salida:** DP-3 cerrada para el canal o implementación del canal bloqueada explícitamente; cada requisito del PRD tiene prueba o actividad de validación.

## M1 — Base ejecutable y workflow durable

1. Configuración, dependencias fijadas, Compose y datos sintéticos.
2. Tipos de dominio e interfaces para solicitud, estado, versiones e idempotencia.
3. Esquemas PostgreSQL de dominio/runtime con roles separados y prueba negativa de permisos.
4. Workflow Temporal con activities tipadas y clasificación de errores.
5. LangGraph dentro de la activity cognitiva; Temporal conserva ciclo de vida y esperas largas.
6. Gateway LLM con modo mock determinista para CI.
7. IDs de correlación, logs estructurados y eventos de auditoría.

**Salida:** solicitud durable con ID; misma clave idempotente no duplica ejecución; reinicio/reanudación probados o falla registrada como bloqueante. DP-1 no se declara validada sin evidencia.

## M2 — Acciones gobernadas y aprobación

1. Propuesta de acción tipada y hash/clave idempotente inmutable.
2. Política determinista ALLOW, DENY y REQUIRE_APPROVAL.
3. Ejecución por MCP Gateway/adaptador aprobado; llamadas directas no autorizadas fallan.
4. Aprobación en el sistema de dominio y señales/timers Temporal, no polling.
5. Vistas web de ejecución, propuesta, decisión y resultado.
6. Avisos/escalamiento a 24 h, 72 h y revisión a 7 días; nunca decisión automática solo por antigüedad.
7. Revalidar autorización antes de ejecutar; aprobación vinculada a la acción exacta.

**Salida:** ALLOW funciona, DENY se bloquea y REQUIRE_APPROVAL espera durablemente; aprobación sobrevive reinicio y es idempotente; acción modificada no reutiliza aprobación; bypass falla cerrado.

## M3 — Cobranzas y evaluación

1. Cargar lote sintético mediante adaptador simulado tipado.
2. Clasificar/priorizar con atributos deterministas más explicación/borrador LLM; invariantes y autorización quedan fuera del modelo.
3. Generar recomendación y borrador. Los archivos descargables, si se incluyen, usan el catálogo restringido de ADR-013.
4. Registrar acciones en bandeja simulada; no contactar clientes.
5. Crear corpus etiquetado normal, de borde, denegado, aprobación y adversarial.
6. Medir éxito, política, herramientas, coste y duración; fijar versiones del modelo/proveedor.
7. Manejar datos faltantes/contradictorios y efectos inciertos con resultados tipados.

**Salida:** umbral de evaluación aprobado; pruebas deterministas de seguridad al 100 %; sin efectos simulados duplicados; trazabilidad de solicitud a resultado.

## M4 — Endurecimiento y piloto

Entregables: instalación limpia reproducible, versiones fijadas, runbook backup/restore con RPO/RTO observados, SBOM, comprobaciones de licencias, pruebas de compatibilidad ADR-011, secretos/egreso/prompt injection/bypass/redacción, alertas y runbooks de incidentes/reconciliación. Elegir conector real y límites de datos solo si el piloto lo requiere.

**Salida:** DP-1, DP-2, DP-4 y DP-20 con evidencia o no-go documentado; DP-5/DP-6 siguen sujetos a revisión; responsable del piloto aprueba conector, datos, riesgo y objetivos. SLO basados en evidencia.

## Camino crítico

**Alcance → contratos de ejecución/idempotencia → workflow durable → política/gateway → aprobación durable → efecto simulado/reconciliación → evaluación → endurecimiento.**

El conector real no bloquea el demostrador inicial.

## Trabajo paralelo seguro

Wireframes/API, dataset sintético, corpus de evaluación, CI, preparación de SBOM/compatibilidad y runbooks pueden avanzar en paralelo una vez acordadas interfaces. No crear autoridades competidoras para workflow, aprobación o autorización.

## Módulos lógicos

| Límite | Responsabilidad |
|---|---|
| Dominio | IDs, versiones, propuestas, aprobaciones, resultados y fallos tipados |
| Aplicación | Iniciar ejecución, evaluar acción, decidir, cancelar/reconciliar |
| API/Web | Crear solicitud, consultar estado, bandeja y decisión |
| Workflow | Temporal, timers, reintentos, señales y recuperación |
| Runtime | LangGraph dentro de activity acotada |
| Políticas | ALLOW/DENY/REQUIRE_APPROVAL deterministas |
| Integración | MCP Gateway y adaptador simulado de cobranzas |
| Persistencia | Esquemas de dominio/runtime, auditoría y metadatos |
| Evaluación | Casos de referencia y suite de seguridad |
| Operación | Compose, health checks, backup/restore, logs y métricas |

Es una guía lógica, no una orden de crear un servicio por fila.

## Evidencia y liberación

| Gate | Evidencia |
|---|---|
| M1 | Contratos, idempotencia, permisos de BD, reanudación Temporal y fallos de checkpoint |
| M2 | ALLOW/DENY/aprobación, bypass denegado, identidad/hash, espera durable |
| M3 | Casos de negocio, 95 % de éxito de bajo riesgo, cero acciones no autorizadas, timeout tras éxito, presupuesto y auditoría |
| M4 | Restauración, compatibilidad, SBOM/licencias, redacción, egreso denegado, límites y runbooks |

Demo lista significa M1–M3 aprobados con datos sintéticos y efectos simulados. Candidato a piloto requiere M4 y aprobación de conector/datos. Distribución comercial requiere además revisión legal/licencias completa. CI documental verde no valida runtime ni seguridad.

## Informe de cierre

Por gate registrar commit/entorno, requisitos, comandos/resultados reales, fallos, decisiones abiertas/responsable y GO/NO-GO con evidencia. Nunca declarar pruebas no ejecutadas ni cerrar gates por inferencia.