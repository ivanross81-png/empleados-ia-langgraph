# Plan de entrega del MVP — Porción vertical

**Estado:** Plan de implementación propuesto; no normativo hasta que el responsable acepte el alcance del MVP  
**Revisión:** 2026-10-20  
**Documento complementario:** MVP-PRD.md  
**Principio de planificación:** demostrar un workflow completo y gobernado antes de ampliar el alcance de la plataforma

## 1. Estrategia de entrega

Construir una porción vertical alrededor del Empleado Digital de Cobranzas propuesto en MVP-PRD.md. Cada incremento debe dejar el repositorio ejecutable y aportar evidencia de que los riesgos arquitectónicos más importantes están controlados.

No se debe implementar cada componente del diagrama como un microservicio independiente. Hay que conservar límites limpios entre dominio y aplicación, pero consolidar los procesos desplegables cuando sea práctico para el MVP dedicado. Docker Compose es suficiente; Kubernetes, service mesh y SaaS multiempresa con recursos compartidos no son requisitos previos.

## 2. Secuencia de implementación y gates

### M0 — Cierre de alcance y contrato de implementación

**Objetivo:** evitar que la implementación resuelva vacíos de producto mediante supuestos implícitos.

**Entregables:**
- Decisión del responsable del producto sobre Cobranzas y la consola web propia.
- Esquema confirmado de facturas sintéticas, roles de usuario y matriz de riesgo/acción.
- Contratos de API y dominio para creación de ejecución, estado, propuesta de acción, decisión de aprobación y resultado.
- Un escenario de aceptación para ALLOW, uno para DENY, uno para REQUIRE_APPROVAL y uno para resultado externo incierto.
- Registro de las decisiones restantes con responsables y evidencia necesaria para cerrarlas.

**Criterios de salida:**
- DP-3 está cerrada para el canal del MVP o la implementación específica del canal permanece expresamente bloqueada.
- No hay ambigüedad sobre si se permiten efectos externos simulados o reales.
- Cada requisito del PRD tiene al menos una prueba o una actividad de validación asignada.

### M1 — Base ejecutable y ejecución durable

**Objetivo:** demostrar los límites mínimos de runtime y persistencia.

**Orden de implementación:**
1. Establecer configuración, dependencias fijadas, topología local de Compose y datos sintéticos iniciales.
2. Implementar tipos de dominio e interfaces de API/aplicación para Execution Request, estado de ejecución, referencias de versiones e idempotencia.
3. Aprovisionar el esquema de dominio de PostgreSQL y un esquema/roles de checkpoint de runtime separados. Agregar una prueba negativa que demuestre que el rol de runtime no puede acceder a las tablas de dominio.
4. Implementar un workflow Temporal con activities tipadas y clasificación de errores.
5. Invocar LangGraph únicamente dentro de la activity cognitiva definida; Temporal conserva la responsabilidad de las esperas prolongadas y del ciclo de vida del workflow.
6. Agregar un adaptador del gateway LLM con modo simulado y determinista para CI y modo de proveedor configurable para pruebas de integración local.
7. Agregar IDs de correlación, logs estructurados y eventos de ejecución/auditoría.

**Criterios de salida:**
- Una solicitud crea una ejecución durable y devuelve un identificador de ejecución.
- Una solicitud duplicada con la misma clave de idempotencia no crea una segunda ejecución lógica.
- Pasan las pruebas de reinicio del worker y recuperación para el workflow implementado.
- El enfoque de checkpoints pasa las pruebas de fallos de DP-1 o el fallo no resuelto queda registrado como bloqueo. Nunca se describe como validado antes de tener evidencia.

### M2 — Acciones gobernadas y aprobación humana

**Objetivo:** establecer el diferencial de la plataforma: ninguna acción propuesta por el modelo puede eludir los controles deterministas.

**Orden de implementación:**
1. Definir una propuesta de acción tipada y una huella inmutable de acción/clave de idempotencia.
2. Evaluar la política y el riesgo de forma determinista, incluidos ALLOW, DENY y REQUIRE_APPROVAL.
3. Hacer cumplir la ejecución de acciones por MCP Gateway o el adaptador aprobado. Las invocaciones directas sin el contexto de autorización esperado deben fallar.
4. Persistir el estado de aprobación en el sistema de registro oficial del dominio. Usar señales y temporizadores de Temporal para las esperas durables, no polling.
5. Agregar vistas de consola para estado de ejecución, propuesta, decisión del aprobador y resultado.
6. Implementar avisos y escalamiento a las 24 horas, 72 horas y revisión a los 7 días. Nunca aprobar, rechazar o cancelar automáticamente solo por antigüedad.
7. Volver a autorizar inmediatamente antes de ejecutar y vincular la aprobación a la versión/huella exacta de la acción.

**Criterios de salida:**
- ALLOW funciona, DENY se bloquea y REQUIRE_APPROVAL espera de forma durable hasta que exista una decisión autorizada.
- La aprobación sobrevive al reinicio del worker y los envíos duplicados son idempotentes.
- Una acción modificada no puede reutilizar una aprobación anterior.
- Una prueba de bypass de política/gateway falla de forma segura.

### M3 — Workflow de Cobranzas y evaluación medida

**Objetivo:** demostrar la utilidad empresarial de punta a punta con evidencia repetible.

**Orden de implementación:**
1. Cargar un lote acotado de facturas sintéticas mediante un adaptador simulado y tipado.
2. Clasificar y priorizar casos usando atributos deterministas del negocio más explicación/borrador generado por LLM. Las invariantes del negocio y la autorización permanecen fuera del modelo.
3. Producir una recomendación estructurada y un borrador de seguimiento. Si se incluyen reportes descargables, generarlos únicamente mediante el catálogo restringido de plantillas/bibliotecas definido por ADR-013.
4. Encauzar acciones por los tres resultados de política y registrar el resultado en una bandeja de salida simulada; no se contactan clientes reales.
5. Construir un conjunto de referencia etiquetado con casos normales, de borde, denegados, de aprobación y de entrada adversarial.
6. Medir éxito, cumplimiento de políticas, corrección de uso de herramientas, costo y duración. Registrar proveedor/modelo y versiones del empleado, tarea y política para poder repetir la evaluación.
7. Agregar tratamiento controlado de datos faltantes/contradictorios y resultados tipados para herramientas no disponibles o efectos externos inciertos.

**Criterios de salida:**
- Se alcanza el umbral de evaluación de bajo riesgo aprobado.
- Las pruebas deterministas de seguridad pasan al 100 %; no ocurre ninguna acción externa no autorizada en el conjunto probado.
- Los reintentos, el timeout posterior al éxito y el reinicio del worker no duplican efectos empresariales simulados.
- El operador puede seguir el recorrido desde la solicitud inicial hasta la política, la aprobación y el resultado final.

### M4 — Endurecimiento y preparación para el piloto

**Objetivo:** convertir el demostrador en un candidato controlado para un piloto con un cliente de diseño.

**Entregables:**
- Instalación y configuración limpia reproducibles; versiones fijadas de dependencias e imágenes.
- Runbook de backup/restore con RPO/RTO observados, no solo objetivos.
- Generación de SBOM y comprobaciones de licencias para el artefacto distribuible real.
- Resultados de pruebas de compatibilidad para las sustituciones de componentes de ADR-011.
- Pruebas de gestión de secretos, restricción de egreso, prompt injection, bypass de autorización, límites de recursos para artefactos y redacción de logs.
- Paneles/alertas operativas para errores, latencia, ejecuciones atascadas, consumo de presupuesto, envejecimiento de aprobaciones y profundidad de colas.
- Runbooks para pausar/deshabilitar, cancelar, responder a incidentes y reconciliar acciones inciertas.
- Límites de tratamiento de datos del piloto y selección de un conector real si el cliente de diseño lo requiere.

**Criterios de salida:**
- DP-1, DP-2, DP-4 y DP-20 tienen evidencia de pruebas o un no-go documentado para la capacidad correspondiente.
- Los gates de compatibilidad y licencia/legal de DP-5/DP-6 están explícitamente controlados; no se declara aprobada la distribución comercial sin la revisión requerida.
- El responsable del piloto aprueba conector real, clasificación de datos, matriz de riesgos de acción y objetivos operativos.
- Los RPO/RTO y SLO de latencia/concurrencia de producción se basan en evidencia de la carga objetivo.

## 3. Camino crítico

El camino crítico es:

**cierre de alcance → contratos de ejecución/idempotencia → workflow durable → enforcement de política/gateway → aprobación durable → efecto simulado/reconciliación → evidencia de evaluación → endurecimiento del piloto.**

Un conector real de CRM/correo no es necesario para el primer demostrador. Se incorpora solo después de que el flujo gobernado y la semántica de fallos funcionen frente al simulador.

## 4. Trabajo paralelo seguro

Las siguientes actividades pueden avanzar en paralelo cuando las interfaces estén acordadas:

- Wireframes de la consola web y ejemplos del contrato API.
- Dataset sintético y casos de evaluación etiquetados.
- Harness de CI, formato, chequeos de tipos/seguridad y validación documental.
- Preparación de pruebas de compatibilidad y pipeline de SBOM.
- Runbooks de despliegue y recuperación.

No deben desarrollarse en paralelo implementaciones competidoras del estado del workflow, la verdad de las aprobaciones o la autorización de acciones. Cada aspecto debe tener una única autoridad definida.

## 5. Módulos lógicos sugeridos para el repositorio

La siguiente tabla es una guía lógica, no una instrucción para crear un servicio por fila.

| Límite | Responsabilidad |
|---|---|
| Dominio | IDs de ejecución, versiones inmutables, propuestas de acción, aprobaciones, resultados y fallos tipados |
| Aplicación | Iniciar ejecución, evaluar acción, enviar decisión, cancelar y reconciliar |
| API/Web | Crear solicitud, consultar estado/detalle, bandeja de aprobación y envío de decisión |
| Workflow | Orquestación Temporal, temporizadores, reintentos, señales y recuperación |
| Runtime del agente | Cognición LangGraph dentro de la activity acotada |
| Políticas | ALLOW/DENY/REQUIRE_APPROVAL deterministas y versionadas |
| Integración | MCP Gateway y adaptador tipado simulado de cobranzas |
| Persistencia | Esquema de dominio, esquema de checkpoints de runtime, auditoría y metadatos de artefactos |
| Evaluación | Casos de referencia, suite de seguridad determinista y puntuación de resultados |
| Operación | Compose, health checks, backup/restore, logs, métricas y runbooks |

Se deben usar los contratos arquitectónicos y ADR aceptados para determinar nombres de paquetes e interfaces públicas antes de implementar. La tabla no autoriza nuevas fronteras de servicios.

## 6. Plan de pruebas requerido por incremento

| Gate | Evidencia requerida |
|---|---|
| M1 | Pruebas de contrato API/dominio; idempotencia; permisos de BD del runtime; reanudación Temporal; pruebas de fallos del checkpoint LangGraph |
| M2 | Contratos ALLOW/DENY/aprobación; rechazo de llamadas directas no autorizadas; identidad/hash de acción; espera durable y reinicio |
| M3 | Escenarios empresariales de referencia; línea base del 95 % para casos de bajo riesgo; cero acciones no autorizadas; timeout posterior al éxito; agotamiento de presupuesto; reconstrucción de auditoría |
| M4 | Prueba de restauración; suite de compatibilidad; SBOM/revisión de licencias; redacción de secretos/logs; egreso denegado; límites de recursos; runbooks |

Un diseño o una CI documental en verde no demuestra que el runtime, los límites de seguridad o los productos sustituidos hayan sido validados técnicamente.

## 7. Incrementos de liberación

- **Demostración lista:** M1–M3 aprobados con datos sintéticos y acciones externas simuladas.
- **Candidato a piloto con cliente de diseño:** gates M4 aprobados, conector y tratamiento de datos autorizados y objetivos operativos medidos.
- **Versión distribuible comercialmente:** además requiere revisión completa de licencias/legal y todos los controles de liberación del producto.

No se debe llamar al demostrador “listo para producción” ni al piloto “autorizado comercialmente” solo porque funcione la interfaz o pase la CI.

## 8. Riesgos que deben gestionarse activamente

| Riesgo | Mitigación |
|---|---|
| Inflación de alcance | Un empleado, una tarea acotada, un simulador y un canal |
| Efectos externos duplicados | Clave de idempotencia, huella de acción, pruebas de timeout posterior al éxito y reconciliación |
| Escalada de permisos dirigida por el modelo | Política determinista, enforcement del gateway y pruebas negativas de bypass |
| Conflicto de durabilidad | Temporal como autoridad del ciclo de vida; checkpoint LangGraph limitado a la corrida cognitiva |
| Sustituciones de software sin demostrar | Evidencia de compatibilidad y gates de SBOM/legal |
| Sobreestimar calidad por un corpus pequeño | Corpus etiquetado, limitaciones declaradas, suite de regresión y evaluación repetida |
| Crecimiento del costo | Presupuestos por ejecución comprobados antes de nuevas llamadas y perfil versionado |
| Supuestos de producción ocultos | Conector del piloto, identidad, clasificación de datos, SLO y prueba de restauración explícitos |

## 9. Formato del informe de cierre

Para cada gate, informar:

- Commit y entorno probados.
- Requisitos cubiertos.
- Comandos/pruebas y resultados reales.
- Fallos y limitaciones conocidas.
- Decisiones abiertas y responsable asignado.
- Recomendación GO/NO-GO sustentada en evidencia.

Nunca se debe afirmar que una prueba pasó si no se ejecutó. Tampoco se debe cerrar un gate de producto, seguridad o legal por inferencia.