# Matriz de trazabilidad del MVP

**Estado:** Complemento propuesto de MVP-PRD.md; no normativo hasta que se acepte el alcance del MVP  
**Revisión:** 2026-10-20

Esta matriz vincula los requisitos del MVP con la autoridad arquitectónica existente y con la evidencia requerida para su aceptación. Es una ayuda para la implementación, no un reemplazo de los documentos de arquitectura ni de los ADR.

## 1. Mapeo de requisitos y contratos

| Requisito | Autoridad arquitectónica | Evidencia de verificación | Gate |
|---|---|---|---|
| MVP-FR-01: iniciar e inspeccionar una ejecución | 02 §§2–6; 04; contratos API de 05 | Prueba de contrato API y ejecución E2E desde la consola | M1/M3 |
| MVP-FR-02: fijar versiones inmutables | Modelo de dominio 03; runtime 04; persistencia 05 | Ejecución/auditoría contienen versiones de empleado, tarea y política; se rechaza modificar una versión publicada | M1 |
| MVP-FR-03: procesar facturas y generar recomendación | Visión de producto 01 §§3, 6, 8; dominio 03; contexto 08 | Casos de referencia etiquetados, validación del esquema de salida y revisión del operador | M3 |
| MVP-FR-04: resultados deterministas de acción | Seguridad/gobernanza 06; ADR-005 | Pruebas OPA positivas y negativas para ALLOW, DENY y REQUIRE_APPROVAL | M2 |
| MVP-FR-05: límite de acción gobernado | Integración MCP 07; seguridad 06 | Se deniega la llamada directa sin autorización del gateway; la llamada permitida atraviesa el gateway y queda auditada | M2 |
| MVP-FR-06: aprobación humana durable | Dominio 03; runtime 04 §§21–22; 05 §10.1; ADR-014 | La espera sobrevive al reinicio del worker; la decisión autorizada es atribuible e idempotente; el envejecimiento no rechaza ni cancela automáticamente | M2 |
| MVP-FR-07: evitar efectos duplicados | Fiabilidad/idempotencia 04; persistencia 05; ADR-003 | La misma clave de solicitud crea una sola ejecución; timeout después del éxito simulado y reintento producen un solo efecto | M1/M3 |
| MVP-FR-08: inspeccionar progreso y resultado | Plano de control 02; contratos API 05; observabilidad 09 | El operador puede consultar estado, acciones, aprobaciones, decisiones de política y resultado por ID | M2/M3 |
| MVP-FR-09: reconstruir auditoría | Seguridad/gobernanza 06; observabilidad 09; INVARIANTES-Y-PRUEBAS.md | Aserciones automatizadas de actor, ejecución, versiones, política, aprobación, clave de acción y resultado; revisión de redacción | M1–M4 |
| MVP-FR-10: aplicar presupuesto de forma segura | Runtime 04; 09 §12.1; DP-18 y DP-4 | El presupuesto se comprueba antes de cada llamada nueva; al agotarse bloquea llamadas nuevas sin interrumpir a ciegas un efecto externo en curso | M3 |
| MVP-FR-11: artefactos restringidos, si se incluyen | ADR-013; contrato de artefactos 05; seguridad 06 | Solo se ejecutan entradas del catálogo aprobado; límites de salida/recursos; sin secretos ni egreso de red | M3/M4 |
| MVP-FR-12: instalación reproducible | Despliegue/operación 10; ADR-001 | Instalación limpia, health checks y escenario sintético correctos al seguir el runbook | M1/M4 |

## 2. Casos de aceptación de seguridad y fiabilidad

| ID de prueba | Escenario | Resultado esperado |
|---|---|---|
| MVP-T-01 | Solicitud válida con una clave de idempotencia nueva | Se crea una ejecución y se devuelve un ID estable |
| MVP-T-02 | Se envía dos veces la misma solicitud con la misma clave | Una ejecución lógica y ningún efecto simulado duplicado |
| MVP-T-03 | La política devuelve DENY | No ocurre ningún efecto de herramienta; motivo y versión de decisión quedan auditados |
| MVP-T-04 | La política devuelve REQUIRE_APPROVAL | El workflow espera de manera durable; no hay efecto antes de la aprobación |
| MVP-T-05 | Una persona no autorizada envía una aprobación | La solicitud se rechaza y audita; la aprobación continúa pendiente |
| MVP-T-06 | La propuesta cambia después de aprobarse | La aprobación anterior se invalida; hace falta una nueva |
| MVP-T-07 | Se termina el worker mientras hay una aprobación pendiente | El workflow se reanuda con el estado de aprobación intacto |
| MVP-T-08 | La integración simulada confirma un efecto pero la respuesta vence por timeout | El reintento no duplica el efecto; el resultado incierto queda disponible para reconciliación |
| MVP-T-09 | El modelo intenta invocar una herramienta directamente o saltarse el gateway | El límite de integración deniega el acceso |
| MVP-T-10 | Una prompt injection intenta revelar secretos o ampliar permisos | La autorización no cambia; no aparecen secretos en estado, salida ni logs |
| MVP-T-11 | Se agota el presupuesto de la ejecución | No empiezan nuevas llamadas a modelos/herramientas; el estado es tipado y auditable |
| MVP-T-12 | Una solicitud de artefacto supera los límites de catálogo o recursos | El servicio rechaza con un resultado tipado; no hay shell, código arbitrario ni egreso |
| MVP-T-13 | El rol de base de datos del runtime intenta consultar una tabla de dominio | La base de datos deniega el permiso |
| MVP-T-14 | Una aprobación alcanza los umbrales de 24 h, 72 h y 7 días | Se producen avisos/escalamiento/revisión; no hay aprobación, rechazo ni cancelación implícitos |
| MVP-T-15 | Se restaura una copia de seguridad siguiendo el runbook | La recuperación observada se registra y compara con los objetivos RPO/RTO de DP-18 |
| MVP-T-16 | Se ejecuta la suite sintética de bajo riesgo con configuración fijada | Al menos 95 % de éxito; cero acciones no autorizadas; se informan las limitaciones del corpus |

## 3. Plantilla de registro de evidencia

Cada resultado debe registrar:

- IDs de las pruebas y requisitos.
- SHA del commit y versiones de build/imágenes.
- Entorno y perfil de configuración.
- Versión del dataset y semilla aleatoria, cuando corresponda.
- Comandos ejecutados y resultado/código de salida real.
- Resultado esperado y resultado observado.
- Controles omitidos y motivo.
- Defecto/referencia, responsable y fecha de nueva prueba para fallos.
- Si la evidencia demuestra estructura documental, comportamiento implementado, estado de licencia o aprobación legal. Estas categorías de evidencia no se deben confundir.

## 4. Gates abiertos al momento de redactar

Los documentos definen decisiones y objetivos, no evidencia de ejecución. Los siguientes gates permanecen abiertos hasta que se registren las pruebas o revisiones correspondientes:

- **DP-1:** pruebas de fallo y recuperación del checkpointer PostgreSQL, retención y ausencia de efectos duplicados.
- **DP-2:** implementación y pruebas de seguridad, recursos y egreso del servicio restringido de generación de artefactos.
- **DP-3:** aceptación por parte del responsable del producto del primer canal; esta propuesta recomienda la consola web propia.
- **DP-4:** comportamiento exacto del corte de cuotas cuando hay efectos externos en curso.
- **DP-5/DP-6:** compatibilidad de componentes y revisión legal/de licencias del artefacto distribuible.
- **DP-20:** registro de Search Attributes de Temporal y pruebas de contrato.
- **RPO/RTO y rendimiento:** medir mediante corridas repetibles; no presentar objetivos como si ya se hubieran alcanzado.
- **Conector del piloto y datos reales:** aprobación explícita de cliente, riesgo, identidad y clasificación de datos.

## 5. Regla de cierre

Una fila solo se completa cuando existe evidencia reproducible. Un documento que describe una prueba, una CI documental en verde o un ADR aceptado no demuestra que el comportamiento de la aplicación haya superado la prueba.