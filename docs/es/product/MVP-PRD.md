# Requisitos del producto MVP

Estado: propuesta para aceptación; no normativa hasta su aceptación expresa.

Esta propuesta define un primer demostrador del Empleado Digital de Cobranzas. Utiliza facturas sintéticas y un adaptador simulado; no contacta clientes reales ni modifica producción.

## Alcance

- Un empleado digital: Cobranzas.
- Una consola web propia mínima, un workflow y una instalación dedicada.
- Datos sintéticos y una integración simulada.
- Temporal para el ciclo de vida durable; LangGraph para la cognición.
- PostgreSQL con esquema de runtime separado para checkpoints.
- Políticas deterministas ALLOW, DENY y REQUIRE_APPROVAL.
- Aprobación humana durable, idempotencia, auditoría y límites de coste.

## Flujo

1. El usuario inicia una ejecución con un lote sintético de facturas vencidas.
2. Temporal crea y coordina la ejecución; LangGraph genera una clasificación, explicación y borrador.
3. La política determinista evalúa la acción propuesta. El modelo nunca autoriza sus propias acciones.
4. ALLOW permite la acción de bajo riesgo configurada; DENY bloquea; REQUIRE_APPROVAL espera una decisión humana durable.
5. Tras aprobar, se revalidan permisos y política antes de invocar la herramienta simulada por el límite de integración gobernado.
6. El simulador registra la operación en una bandeja de salida de prueba; no se envían mensajes reales.
7. Se persisten resultado, versiones, decisión, aprobador y auditoría.

## Requisitos y aceptación

| ID | Requisito | Evidencia |
|---|---|---|
| MVP-FR-01 | Iniciar e inspeccionar ejecución | ID y estado visibles |
| MVP-FR-02 | Fijar versiones de empleado/tarea/política | Versiones en ejecución y auditoría |
| MVP-FR-03 | Recomendar y redactar seguimiento | Casos de referencia etiquetados |
| MVP-FR-04 | Aplicar ALLOW/DENY/REQUIRE_APPROVAL | Pruebas positivas y negativas |
| MVP-FR-05 | Impedir bypass de herramientas | Llamada directa no autorizada denegada |
| MVP-FR-06 | Aprobación durable | Sobrevive reinicio; decisión atribuible e idempotente |
| MVP-FR-07 | Evitar efectos duplicados | Timeout tras éxito y reintento producen un solo efecto simulado |
| MVP-FR-08 | Mostrar progreso, acciones y resultado | Revisión completa por operador |
| MVP-FR-09 | Auditoría correlacionada | Actor, versiones, política, aprobación y resultado reconstruibles |
| MVP-FR-10 | Aplicar presupuesto | No comienzan nuevas llamadas tras agotarlo |
| MVP-FR-11 | Generar archivos mediante servicio restringido, si se incluye | Catálogo aprobado, límites, sin secretos ni egreso por defecto |
| MVP-FR-12 | Instalación reproducible | Otro operador ejecuta la demo desde un entorno limpio |

## Seguridad

- El modelo propone; controles deterministas y permisos autorizan.
- La aprobación se vincula a la acción exacta; si cambia, debe aprobarse de nuevo.
- Secretos fuera de prompts, estado, artefactos y logs ordinarios.
- Datos sintéticos en demo/CI. Los datos reales requieren una decisión explícita.
- Sin ejecución arbitraria de código y sin contacto real con clientes.
- Los efectos externos inciertos se reconcilian; no se reintentan a ciegas.

## Línea base de aceptación

Aplicar DP-18 como línea base de ingeniería, no SLA: al menos 95 % de éxito en casos representativos de bajo riesgo; 100 % de pruebas deterministas de autorización aprobadas; cero acciones no autorizadas en el conjunto; pruebas de reinicio, aprobación durable, idempotencia, timeout tras éxito, presupuesto y auditoría. Los límites iniciales documentados son 15 minutos activos, 20 llamadas al modelo, 40 llamadas a herramientas, 50.000 tokens y USD 2 estimados por ejecución de bajo coste.

No inventar SLO de producción. Medir primero. La distribución comercial sigue bloqueada hasta completar compatibilidad, SBOM y revisión legal aplicables.

## Fuera del MVP

Multitenencia compartida, múltiples empleados/canales, conector productivo aún no elegido, marketplace, editor visual, ejecución arbitraria de Python/shell/navegador, Kubernetes sin necesidad medida y promesas de ahorro o disponibilidad sin evidencia.

## Decisiones por confirmar

- Aceptar Cobranzas como primer caso de negocio.
- Cerrar DP-3 para la consola web como primera superficie.
- Aprobar la matriz de riesgo de acciones antes de conectar sistemas reales.
- Identificar cliente de diseño y conector real antes del piloto.

Este PRD reduce alcance, no cambia la arquitectura ni los ADR aceptados.