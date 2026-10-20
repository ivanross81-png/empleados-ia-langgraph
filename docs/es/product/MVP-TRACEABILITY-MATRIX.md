# Matriz de trazabilidad del MVP

**Estado:** Complemento propuesto de MVP-PRD.md; no normativo hasta aceptar el alcance  
**Revisión:** 2026-10-20

## Requisito, autoridad y evidencia

| Requisito | Autoridad | Evidencia | Gate |
|---|---|---|---|
| MVP-FR-01: iniciar/inspeccionar ejecución | Arquitectura 02/04; contratos API 05 | Prueba API y E2E desde consola | M1/M3 |
| MVP-FR-02: fijar versiones | Dominio 03; runtime 04; persistencia 05 | Registro contiene versiones; mutación de versión publicada rechazada | M1 |
| MVP-FR-03: procesar facturas/recomendar | Visión 01; dominio 03; contexto 08 | Casos etiquetados, esquema válido y revisión | M3 |
| MVP-FR-04: resultados deterministas | Seguridad 06; ADR-005 | Pruebas OPA ALLOW, DENY, REQUIRE_APPROVAL | M2 |
| MVP-FR-05: acción gobernada | MCP 07; seguridad 06 | Llamada directa no autorizada denegada; ruta autorizada auditada | M2 |
| MVP-FR-06: aprobación durable | Dominio 03; runtime 04; contrato 05; ADR-014 | Espera sobrevive reinicio; decisión atribuible/idempotente; sin rechazo por antigüedad | M2 |
| MVP-FR-07: no duplicar efectos | Fiabilidad 04; persistencia 05; ADR-003 | Misma clave crea una ejecución; timeout tras éxito simulado no duplica | M1/M3 |
| MVP-FR-08: inspeccionar progreso/resultado | Control 02; API 05; observabilidad 09 | Operador consulta estado, acciones, aprobaciones y resultado | M2/M3 |
| MVP-FR-09: reconstruir auditoría | Seguridad 06; observabilidad 09; matriz de invariantes | Aserciones de actor, versiones, política, aprobación, clave y resultado | M1–M4 |
| MVP-FR-10: presupuesto seguro | Runtime 04; observabilidad 09; DP-18/DP-4 | Presupuesto antes de llamadas; agotamiento bloquea nuevas llamadas con seguridad | M3 |
| MVP-FR-11: artefactos restringidos | ADR-013; contrato 05; seguridad 06 | Catálogo aprobado, límites, sin secretos ni egreso | M3/M4 |
| MVP-FR-12: instalación reproducible | Operación 10; ADR-001 | Instalación limpia, health checks y escenario sintético | M1/M4 |

## Casos de aceptación

| ID | Escenario | Resultado esperado |
|---|---|---|
| MVP-T-01 | Solicitud válida con clave nueva | Una ejecución e ID estable |
| MVP-T-02 | Misma solicitud/clave dos veces | Una ejecución lógica, sin efecto duplicado |
| MVP-T-03 | Política DENY | Sin efecto; motivo y versión auditados |
| MVP-T-04 | REQUIRE_APPROVAL | Espera durable; sin efecto previo a aprobación |
| MVP-T-05 | Aprobación por usuario no autorizado | Rechazo auditado; sigue pendiente |
| MVP-T-06 | Propuesta cambia tras aprobar | Aprobación anterior invalidada |
| MVP-T-07 | Worker termina durante aprobación | Workflow reanuda con estado intacto |
| MVP-T-08 | Simulador registra efecto pero respuesta vence | Reintento no duplica; resultado incierto reconciliable |
| MVP-T-09 | Bypass directo de herramienta | Límite de integración deniega |
| MVP-T-10 | Prompt injection pide secretos/permisos | Autorización no cambia; sin secretos en estado/salida/logs |
| MVP-T-11 | Presupuesto agotado | No empiezan llamadas nuevas; estado tipado y auditado |
| MVP-T-12 | Artefacto excede catálogo/recursos | Rechazo tipado; sin código arbitrario ni egreso |
| MVP-T-13 | Rol runtime consulta tabla de dominio | Permiso denegado |
| MVP-T-14 | Aprobación alcanza 24 h, 72 h y 7 días | Aviso/escalamiento/revisión; sin decisión implícita |
| MVP-T-15 | Restauración desde backup | Recuperación observada frente a RPO/RTO |
| MVP-T-16 | Suite sintética de bajo riesgo | ≥95 % de éxito, cero acciones no autorizadas y límites del corpus informados |

## Registro de evidencia

Registrar IDs, SHA y versiones, entorno/perfil, dataset/semilla, comandos y resultado real, esperado/observado, controles omitidos, defecto/responsable/retest y qué categoría prueba la evidencia: estructura documental, comportamiento implementado, licencia o aprobación legal. No confundir categorías.

## Gates abiertos

DP-1: fallos/recuperación checkpoint PostgreSQL, retención y efectos duplicados. DP-2: implementación y pruebas del servicio de artefactos. DP-3: aceptación de canal; se recomienda consola web. DP-4: corte de cuotas con efectos externos en curso. DP-5/DP-6: compatibilidad y revisión legal/licencias. DP-20: Search Attributes y contrato. RPO/RTO y rendimiento: medir, no asumir. Conector piloto/datos reales: aprobación explícita de cliente, riesgo, identidad y clasificación.

Una fila solo se completa con evidencia reproducible. Documento de prueba, CI documental verde o ADR aceptado no demuestra que el comportamiento de aplicación haya pasado.