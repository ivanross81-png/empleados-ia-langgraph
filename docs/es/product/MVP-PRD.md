# Requisitos de producto del MVP — Plataforma de Empleados Digitales

**Estado:** Propuesta para aceptación del responsable del producto; no normativa hasta su aceptación expresa  
**Revisión:** 2026-10-20  
**Autoridad lingüística:** una vez aceptada esta propuesta, el inglés será la fuente normativa y este documento su espejo de lectura en español  
**Autoridad arquitectónica:** los documentos de arquitectura y los ADR aceptados siguen siendo la fuente de autoridad

## 1. Resumen ejecutivo

Esta propuesta define la porción de producto más pequeña que puede demostrar el diferencial de la plataforma: un Empleado Digital completa trabajo empresarial acotado mediante un workflow durable, propone acciones, las somete a controles deterministas de política, obtiene aprobación humana cuando corresponde, ejecuta únicamente a través de un límite de herramientas gobernado y deja un resultado auditable.

El primer caso de uso recomendado es un **Empleado Digital de Cobranzas**. El primer demostrador utiliza datos sintéticos de facturas vencidas y un adaptador simulado de cobranzas/CRM. No contacta clientes reales ni modifica sistemas de producción. Un piloto conectado a un sistema real de un cliente constituye una etapa posterior, no una funcionalidad implícita del demostrador.

El MVP se limita deliberadamente a un empleado, un workflow, una consola web mínima, una instalación dedicada y una integración empresarial simulada. Su objetivo es validar la ejecución, la gobernanza, la recuperación y la operación antes de ampliar el producto.

## 2. Decisiones y autoridad

Este documento es una propuesta de producto, no un reemplazo de la arquitectura. Hasta que el responsable del producto lo acepte, no debe tratarse como una línea base de alcance aprobada.

Las siguientes restricciones ya están definidas por la arquitectura o por ADR aceptados y no se reabren aquí:

- Construir la plataforma desde cero; la arquitectura y los documentos de este repositorio son la base de diseño, no código de aplicación reutilizable.
- Temporal es responsable del ciclo de vida durable del workflow; LangGraph es responsable de la cognición del agente dentro de los límites definidos.
- PostgreSQL es el sistema de registro oficial del estado de negocio; los checkpoints del runtime utilizan un esquema separado y no son la fuente de verdad del negocio.
- Las acciones externas se evalúan mediante políticas deterministas y se ejecutan a través del límite de integración gobernado.
- En el MVP no se ejecuta código arbitrario generado por el agente dentro del proceso principal de API, worker o runtime del agente.
- El envejecimiento de una aprobación nunca debe aprobar, rechazar ni cancelar silenciosamente una acción.
- El primer despliegue de producción es dedicado por cliente. La multitenencia dinámica con recursos compartidos queda fuera del alcance.
- La política de licencias aceptada y los gates técnicos/legales todavía pendientes continúan vigentes.

## 3. Resultado de producto

El MVP debe demostrar que una persona de negocio puede asignar una tarea acotada a un Empleado Digital y recibir un resultado terminado y trazable, sin que la salida del modelo pueda eludir políticas, controles de permisos o aprobaciones humanas.

### Usuarios objetivo

| Usuario | Necesidad |
|---|---|
| Usuario de operaciones | Iniciar una ejecución, ver su progreso e inspeccionar el resultado |
| Aprobador | Revisar la acción propuesta y aprobarla o rechazarla mediante una decisión atribuible |
| Administrador de despliegue | Configurar la instalación dedicada, las integraciones, los presupuestos y los accesos |
| Operador o ingeniero del producto | Diagnosticar fallos usando el historial de ejecución, los eventos de auditoría y las métricas |

### Hipótesis de negocio

Un Empleado Digital gobernado puede reducir el trabajo manual de preparación y seguimiento en un proceso repetitivo de cobranzas, sin perder el control humano sobre las comunicaciones externas. El MVP debe medir la calidad del resultado, el esfuerzo del operador, las excepciones, el costo y la duración de punta a punta. No debe afirmar que produce ahorros hasta que un piloto aporte evidencia.

## 4. Primera porción vertical recomendada: Cobranzas

### Entrada

Un usuario inicia una ejecución de cobranzas desde la consola web. La ejecución recibe un lote acotado de facturas sintéticas vencidas con referencia de cliente, importe, fecha de vencimiento, días de mora, estado y elegibilidad de contacto. El esquema debe usar identificadores sintéticos y no debe contener datos personales o financieros reales.

### Procesamiento

1. Validar la solicitud, la identidad, la versión del empleado y la clave de idempotencia.
2. Crear una solicitud de ejecución e iniciar un workflow de Temporal.
3. Leer las facturas mediante un adaptador tipado y construir un contexto acotado.
4. Usar LangGraph y el gateway de LLM configurado para clasificar el caso, explicar la recomendación y redactar un mensaje de seguimiento.
5. Evaluar la operación propuesta con una política determinista y versionada. La afirmación del propio LLM de que una acción es segura nunca constituye una autorización.
6. Encauzar los resultados ALLOW, DENY y REQUIRE_APPROVAL por caminos distintos y comprobables.
7. Para una acción que exige aprobación, persistir el registro de aprobación y esperar de forma durable en Temporal. Mostrar la aprobación en la consola web. Aplicar las reglas aceptadas de antigüedad y escalamiento; nunca rechazar ni cancelar una acción solo porque haya transcurrido cierto tiempo.
8. Después de aprobar, volver a validar la autorización y las restricciones de política inmediatamente antes de ejecutar la acción.
9. Invocar únicamente la herramienta simulada de cobranzas a través de MCP Gateway o del límite de integración aprobado. El simulador registra la comunicación prevista en una bandeja de salida de prueba; no envía mensajes a clientes reales.
10. Persistir el resultado, las versiones relevantes, la decisión de política, la identidad del aprobador y los eventos de auditoría; luego mostrar el estado final.

### Clases de acción comprobables

- **ALLOW:** actualización reversible y de bajo riesgo en el sistema simulado, por ejemplo marcar un caso como revisado.
- **DENY:** acción prohibida, por ejemplo operar sobre un caso cerrado o no elegible.
- **REQUIRE_APPROVAL:** preparación o despacho simulado de un seguimiento al cliente que requiera aprobación explícita según la política del MVP.
- **Fallo y reconciliación:** simular un timeout después de que el sistema de prueba haya registrado una operación. El reintento no debe duplicarla y el resultado incierto debe quedar visible para su reconciliación.

Las clases de acción anteriores son valores ilustrativos para datos sintéticos. Antes de habilitar un conector real o cualquier comunicación con clientes, el responsable del piloto debe aprobar la política de negocio y la clasificación de riesgo.

## 5. Requisitos funcionales del MVP

| ID | Requisito | Evidencia de aceptación |
|---|---|---|
| MVP-FR-01 | Iniciar una ejecución manual desde una consola web mínima o mediante la API documentada | Solicitud aceptada, identificador de ejecución devuelto y estado visible |
| MVP-FR-02 | Fijar las versiones del empleado, la tarea y la política en cada ejecución | Versiones visibles en el detalle de la ejecución y en la auditoría |
| MVP-FR-03 | Procesar un lote sintético de facturas vencidas y generar una recomendación estructurada con un borrador | Los escenarios de referencia producen una salida válida según el esquema y las etiquetas de negocio esperadas |
| MVP-FR-04 | Hacer cumplir resultados deterministas ALLOW, DENY y REQUIRE_APPROVAL | Pasan las pruebas positivas y negativas de política |
| MVP-FR-05 | Ejecutar acciones aprobadas únicamente por el límite gobernado de MCP/integración | Falla la prueba de bypass directo; funciona la ruta autorizada por el gateway |
| MVP-FR-06 | Soportar aprobación humana durable, rechazo, envejecimiento y escalamiento | La aprobación sobrevive al reinicio del worker; la decisión es atribuible e idempotente |
| MVP-FR-07 | Evitar efectos externos duplicados ante reintentos de solicitudes y respuestas inciertas | Repetir la clave de solicitud/acción produce un solo efecto empresarial simulado |
| MVP-FR-08 | Mostrar el estado de ejecución, el historial de acciones, las aprobaciones y el resultado final | El operador puede inspeccionar una ejecución completa |
| MVP-FR-09 | Registrar auditoría y telemetría operativa correlacionadas con la ejecución | Se pueden reconstruir actor, versiones, política, aprobación y resultado sin depender del texto del prompt |
| MVP-FR-10 | Aplicar el presupuesto de ejecución antes de iniciar nuevas llamadas al modelo o a herramientas | Al agotarse el presupuesto se detiene de forma segura el trabajo nuevo y queda un estado tipado que pueda reconciliarse |
| MVP-FR-11 | Ofrecer generación restringida de artefactos solo si se incluyen reportes o archivos | Plantillas aprobadas, recursos acotados, ausencia de secretos y ausencia de egreso de red por defecto |
| MVP-FR-12 | Arrancar desde un entorno de desarrollo dedicado y limpio siguiendo comandos documentados | Otro operador puede instalar el sistema, cargar datos sintéticos y ejecutar la demostración |

## 6. Experiencia de usuario

La primera superficie recomendada es una consola web propia y mínima. Esta es una propuesta de alcance para el MVP; no cierra silenciosamente DP-3 hasta que el responsable del producto acepte la decisión de canal.

La consola necesita únicamente:

- Una lista de ejecuciones y sus estados.
- Un formulario para iniciar el proceso de Cobranzas con un lote sintético seleccionado.
- Una vista de detalle de ejecución con recomendaciones, resultados de política y cronología de auditoría.
- Una bandeja de aprobaciones con acciones para aprobar o rechazar y un campo para indicar el motivo.
- Una indicación clara de cuáles integraciones son simuladas y cuáles son reales.
- Una solicitud controlada de detención/cancelación cuando el contrato del workflow lo permita.

La primera porción no incluye Slack, Teams, WhatsApp, Telegram, recepción de correos electrónicos ni otros canales conversacionales externos. Antes de agregar una superficie de ese tipo se deben especificar por separado la vinculación de identidad y la autorización del canal.

## 7. Alcance incluido

- Una instalación dedicada de tenant único.
- Una definición de Empleado Digital: Cobranzas.
- Un disparador manual y un workflow acotado.
- Una consola web mínima y las operaciones API documentadas que necesita.
- Datos sintéticos de facturas y un adaptador simulado de CRM/cobranzas.
- Durabilidad de workflows mediante Temporal y cognición mediante LangGraph, respetando el límite aceptado de checkpoints en PostgreSQL.
- Decisiones de política versionadas con caminos ALLOW, DENY y REQUIRE_APPROVAL.
- Aprobación humana y semántica aceptada de envejecimiento sin rechazo automático.
- Idempotencia, errores tipados, reglas de cancelación y reconciliación de resultados externos inciertos.
- Presupuestos por ejecución, contabilización de tokens/costos, eventos de auditoría y métricas operativas básicas.
- Definición de despliegue local/dedicado reproducible y suite de pruebas.

## 8. Exclusiones explícitas

- Contacto con clientes reales o escrituras en producción desde el demostrador.
- Un conector productivo para un sistema empresarial que todavía no se haya elegido. El piloto deberá seleccionar uno junto con el cliente de diseño.
- Múltiples Empleados Digitales, enjambres multiagente autónomos o creación dinámica de agentes.
- Multitenencia dinámica con recursos compartidos o un plano de control SaaS para múltiples clientes.
- Ejecución arbitraria de Python, shell, automatización de navegador o código escrito por el modelo.
- Editor visual de workflows o diseñador general de flujos.
- Marketplace de conectores o catálogo universal de integraciones.
- Múltiples canales, identidad omnicanal empresarial, SCIM o incorporación autoservicio compleja.
- Memoria/RAG genérica para cualquier caso de uso; se utilizará únicamente el contexto acotado necesario para esta tarea.
- Kubernetes, service mesh u otra infraestructura adicional sin una necesidad demostrada mediante mediciones.
- Afirmaciones de disponibilidad productiva, ahorro o cumplimiento legal sin evidencia.

## 9. Requisitos de seguridad y gobernanza

1. El modelo propone; la política determinista y los controles de autorización deciden.
2. Cada acción externa incluye una identidad de ejecución, versiones fijadas, clave de idempotencia de acción y actor atribuible.
3. MCP Gateway o el límite de integración rechaza llamadas que no incluyan la decisión de política y el contexto de autorización requeridos.
4. El registro de aprobación queda vinculado a la acción propuesta exacta o a su huella inmutable. Los cambios materiales invalidan la aprobación y requieren una nueva decisión.
5. Se comprueban la identidad y los permisos del aprobador al enviar la decisión; los permisos de la acción se vuelven a validar justo antes de ejecutarla.
6. Los secretos se referencian en el momento de ejecución y nunca se colocan en prompts, estado de LangGraph, artefactos ni logs ordinarios.
7. El contenido externo se trata como dato no confiable; no puede cambiar permisos de herramientas ni políticas.
8. En la demostración y CI se utilizan solo datos sintéticos. El uso de datos reales requiere una decisión explícita de clasificación de datos y despliegue.
9. El rol de checkpoints del runtime no puede leer ni escribir tablas de dominio.
10. El egreso de red del servicio de generación de artefactos se deniega por defecto. No se introduce ejecución arbitraria de código.
11. Logs y trazas redactan valores sensibles. La captura de prompts permanece desactivada por defecto, de acuerdo con la decisión existente.
12. Todo efecto externo incierto se convierte en un estado tipado de reconciliación, en lugar de reintentarse a ciegas.

## 10. Línea base de aceptación medible

Los valores existentes de DP-18 se aplican como línea base inicial de ingeniería, no como SLA comercial:

- Al menos un 95 % de éxito en un conjunto representativo y reproducible de casos de bajo riesgo, sin regresiones superiores a 2 puntos porcentuales que no tengan una justificación aprobada.
- Un 100 % de cumplimiento en las pruebas deterministas de autorización/política y cero acciones externas no autorizadas en el conjunto probado.
- Se propone un corpus de evaluación inicial de 100 casos etiquetados, que incluya casos normales, de borde, denegación, aprobación e inputs adversariales. Si el dominio no permite reunir 100 casos independientes, se debe documentar el corpus reducido y sus limitaciones antes de afirmar que se alcanza el umbral.
- Pruebas exitosas de caída y reanudación del worker, aprobación durable, reintento idempotente, timeout posterior a un éxito externo, cancelación, agotamiento de presupuesto e integridad de auditoría.
- El perfil inicial de ejecución de bajo costo debe respetar los límites documentados: 15 minutos de cómputo activo, 20 llamadas al modelo, 40 llamadas a herramientas, 50.000 tokens y un presupuesto estimado de USD 2 para modelos por ejecución. Todo cambio de perfil requiere aprobación registrada.
- Ningún secreto en prompts/estado/logs y ninguna llamada a destinos de clientes reales desde el demostrador.
- Instalación, instrucciones de backup/restore y controles de CI reproducibles por una segunda persona operadora.

No se inventan objetivos de latencia o concurrencia para clientes en producción. Primero se debe registrar una línea base mediante una prueba de carga repetible; después se establecen SLO según la carga y las necesidades del piloto.

## 11. Definición de terminado

El demostrador MVP solo se considera terminado cuando:

- Todos los requisitos MVP-FR tienen evidencia de prueba vinculada.
- Los caminos normales, de denegación, de aprobación y de efecto incierto funcionan de punta a punta.
- El reinicio del worker no pierde una aprobación durable ni crea efectos simulados duplicados.
- Los controles de seguridad y presupuesto se ejecutan antes de iniciar nuevo trabajo externo.
- Las versiones de ejecución, decisiones de política, aprobaciones y resultados finales son auditables.
- El corpus de evaluación alcanza el umbral de calidad aprobado.
- Una instalación limpia puede arrancarse y probarse siguiendo la guía escrita.
- Los gates de compatibilidad, licencias y revisión legal pendientes permanecen visibles; el demostrador no se presenta como habilitado para distribución comercial.

## 12. Decisiones de producto que requieren confirmación explícita

| Decisión | Recomendación actual | Condición de cierre |
|---|---|---|
| Primer caso de negocio | Cobranzas, porque ya es el escenario canónico del spike Foundation | El responsable valida la prioridad y el cliente de diseño |
| Primer canal | Consola web propia mínima, sin canales externos | Cerrar DP-3 antes de implementar el canal |
| Integración empresarial inicial | Adaptador simulado para la demo; seleccionar una integración real con el cliente piloto | Un conector real requiere alcance, credenciales y revisión de seguridad propios |
| Política de riesgo/acción | ALLOW/DENY/REQUIRE_APPROVAL con reglas sintéticas ilustrativas | El responsable de producto y el dueño del riesgo aprueban antes de habilitar efectos reales |
| SLO y capacidad de producción | Medir primero y establecer objetivos con la carga del piloto | No definir SLA externo hasta tener evidencia |
| Distribución comercial | Bloqueada hasta terminar las comprobaciones técnicas de compatibilidad, SBOM y revisión legal de DP-5/DP-6 | Gate de liberación |

## 13. Relación con la arquitectura

Este PRD acota el alcance inicial del producto; no cambia los límites ni los contratos arquitectónicos. La implementación debe seguir el índice de arquitectura, los ADR aceptados, las reglas de seguridad y la estrategia de pruebas existentes. Cualquier cambio de límites de seguridad, semántica de workflows, autoridad de persistencia, aislamiento de despliegue o contratos públicos requiere el proceso ADR vigente.

## 14. Lista de revisión

- [ ] El responsable del producto acepta Cobranzas como primer caso de negocio.
- [ ] El responsable del producto acepta la consola web propia como primera superficie (DP-3).
- [ ] El responsable de negocio/riesgo aprueba los ejemplos sintéticos ALLOW/DENY/REQUIRE_APPROVAL.
- [ ] Se identifica un cliente de diseño y el primer conector real antes de un piloto productivo.
- [ ] Se asignan el corpus de aceptación y la persona responsable de las evidencias.
- [ ] Los gates DP-5/DP-6 continúan abiertos y no se declaran cerrados por este PRD.