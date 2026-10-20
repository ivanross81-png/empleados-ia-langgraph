# Plataforma de Empleado Digital — Arquitectura de Runtime y Ejecución

**Versión:** 0.1.0  
**Estado:** Normativo  
**Creado:** 2026-09-21  
**Actualizado:** 2026-10-19

## 1. Modelo fundamental de ejecución

```text
Trigger
  ↓
Execution Request
  ↓
Temporal Workflow
  ↓
LangGraph Agent Runtime
  ↓
Plan → Policy → Action → Tool → External System
  ↓                         ↑
Observation ←───────────────┘
  ↓
Decision / Approval / Retry / Compensation
  ↓
Outcome
```

## 2. Temporal versus LangGraph

**Temporal** posee el ciclo de vida duradero del flujo de trabajo:

- reintentos;
- temporizadores;
- cancelación;
- señales;
- heartbeats;
- recuperación;
- ejecución de larga duración;
- esperas humanas;
- orquestación de compensación.

**LangGraph** posee la cognición del agente:

- razonamiento con estado;
- planificación;
- ejecución de grafo orientada a herramientas;
- bucles de observación/decisión;
- estado de agente acotado.

Ninguno de los componentes reemplaza al otro. La frontera de durabilidad es explícita: la persistencia propia de LangGraph (checkpointer) queda confinada al ciclo corto de una corrida de agente dentro de una activity; Temporal sigue siendo la **única autoridad** de la durabilidad de la ejecución (ver §21).

## 3. Flujo de trabajo Temporal

Un Flujo de trabajo (workflow) coordina actividades y estado duradero. Las llamadas externas corresponden a Actividades o a llamadas de servicio dedicadas, no al código del flujo de trabajo, que debe permanecer determinista.

Actividades típicas:

- cargar contexto de ejecución;
- construir contexto del modelo;
- llamar a la puerta de enlace de LLM;
- evaluar política;
- solicitar aprobación;
- invocar la puerta de enlace MCP;
- persistir resultado;
- emitir evento de auditoría;
- realizar compensación.

## 4. Estado del agente

El AgentState de LangGraph debe ser explícito y serializable. Debe contener referencias a objetos duraderos en lugar de copias no controladas de secretos o documentos enormes.

Si el runtime del agente persiste ese estado entre pasos (checkpointer), esa persistencia es un **almacén de runtime**, no el sistema de registro de la ejecución, y se rige por §21.

Ejemplo de estado conceptual:

```yaml
execution_id: UUID
employee_version_id: UUID
task_version_id: UUID
goal: string
plan: object
observations: list
pending_action: object|null
risk_context: object
approval_state: object|null
context_refs: list
budgets: object
iteration: integer
```

## 5. Plan versus Acción

El LLM puede proponer un plan como:

1. inspeccionar facturas vencidas;
2. clasificar cuentas;
3. redactar comunicaciones;
4. enviar las comunicaciones aprobadas.

El plan no es una autorización. Cada acción con efectos secundarios debe superar la validación, la política, el riesgo y el cumplimiento de capacidades (enforcement).

## 6. Pipeline de ejecución de herramientas

```text
Model Tool Request
 → Schema Validation
 → Normalization
 → Identity / Scope Check
 → OPA Policy
 → Risk Evaluation
 → Approval if required
 → Credential Resolution
 → Rate Limit
 → Circuit Breaker
 → MCP Invocation
 → Result Validation
 → Audit
 → Observation
```

## 7. Puerta de enlace MCP

La puerta de enlace debe ser sin estado (stateless) y escalable horizontalmente. Sus responsabilidades incluyen autorización, validación de esquema, cumplimiento de políticas, resolución de credenciales, límite de peticiones/concurrencia, cortacircuitos, reintentos, tiempos de espera, idempotencia, auditoría y observabilidad.

## 8. Flujo de secretos

```text
Tool Request
 → MCP Gateway
 → OpenBao/KMS
 → Short-lived Credential
 → External API
```

Las credenciales no deben copiarse en prompts, en el estado de LangGraph, en la memoria persistente ni en los registros (logs) normales.

## 9. Ciclo de vida del contexto

```text
Raw State
 → Task Context
 → Memory
 → RAG
 → Tool Results
 → History
 → Relevance Filtering
 → Deduplication
 → Compression
 → DLP/PII Controls
 → Token Budget
 → LLM
```

## 10. Prevención de fuga de datos (DLP)

Los datos enviados a modelos externos se clasifican antes de la transmisión. Las reglas pueden bloquear la transferencia externa, redactar datos, prohibir la persistencia o requerir aprobación humana.

## 11. Aprobación humana

Temporal espera una señal duradera. El proceso sobrevive a los reinicios de los workers. La aprobación debe referenciar la acción/versión/contexto exactos necesarios para la decisión.

Una decisión `REQUIRE_APPROVAL` **suspende** la ejecución; no falla la acción ni la revierte. El runtime reanuda la misma ejecución con la decisión humana como entrada.

La aprobación humana tiene una segunda forma, interna: el runtime del agente puede pausar su propio grafo para pedir un dato o una decisión. En ese caso, al reanudar el runtime puede **re-ejecutar el nodo** que la pidió; por eso todo efecto lateral realizado antes de una pausa interna debe ser idempotente o postergarse hasta después de la decisión (ver §21 y §12).

## 12. Idempotencia

Una clave recomendada es:

`tenant_id + execution_id + action_id + attempt`

Las APIs externas deben usar claves de idempotencia del proveedor cuando se admitan.

## 13. Manejo de fallas

Categorías de fallas:

- falla de validación;
- falla de autenticación/autorización;
- falla de red transitoria;
- límite de peticiones;
- corte del servicio externo;
- rechazo de negocio;
- denegación por política;
- falla del modelo;
- salida malformada de herramienta;
- corrupción de estado irrecuperable.

Los reintentos solo se aplican a errores clasificados como reintentables.

## 14. Saga y compensación

Una operación multisistema no se trata como una transacción ACID. Si el paso A tiene éxito y el paso B falla, el flujo de trabajo usa compensación cuando el sistema externo proporciona una operación inversa válida. De lo contrario, pasa a conciliación/recuperación manual.

## 15. Cola de mensajes no entregados (DLQ)

Las ejecuciones irrecuperables entran en una DLQ duradera con:

- motivo de la falla;
- intentos;
- última actividad;
- referencias relevantes;
- recuperación sugerida;
- acciones del operador.

Los operadores pueden inspeccionar, reintentar, cancelar, compensar o conciliar.

## 16. Presupuestos del runtime

Toda ejecución debe tener límites para:

- duración total;
- iteraciones;
- llamadas a herramientas;
- llamadas a LLM;
- tokens;
- costo estimado;
- acciones concurrentes.

**Línea base de ingeniería del MVP (DP-18, 2026-10-19).** El perfil inicial de bajo costo por ejecución es: **15 minutos** de cómputo activo, **20** llamadas al modelo, **40** llamadas a herramientas, **50.000** tokens y **USD 2** de presupuesto estimado. Los valores son configurables por entorno y por perfil de tarea; son una línea base para ingeniería y pruebas, **no** un SLA comercial.

Dos reglas rigen la aplicación de los límites:

1. Los límites se aplican **antes** de iniciar una nueva llamada al modelo, una llamada a herramienta o una acción externa: la ejecución se detiene en la frontera, con un resultado tipado, en lugar de descubrir el exceso después.
2. Un **efecto externo en curso no se interrumpe** sin gestión del resultado y reconciliación (`§18`): el corte impide trabajo nuevo y deja registrada la reconciliación pendiente.

## 17. Inyección de prompts

El contenido externo, los documentos recuperados y las salidas de herramientas no son confiables. Pueden contener instrucciones que intenten alterar el comportamiento del agente. El runtime debe mantener los datos y las instrucciones de control estructuralmente separados, y nunca otorgar autoridad solo porque el texto diga que debería otorgarse.

## 18. Cancelación

La cancelación es una operación de ejecución de primera clase. Las Actividades deben respetar la cancelación cuando sea posible, y los efectos secundarios externos deben usar idempotencia/conciliación, porque la cancelación no puede garantizar el deshacer de acciones externas ya completadas.

## 19. Observabilidad

Cada ejecución lleva:

- ID de ejecución;
- ID de correlación;
- ID de causación;
- ID de tenant;
- versiones de empleado/tarea;
- contexto de trace.

Las métricas, los registros (logs) y los eventos de auditoría son preocupaciones separadas.

## 20. Invariantes del runtime

- Toda acción externa está adjunta a una Ejecución.
- Toda acción externa tiene una decisión de política.
- Toda acción mutable es idempotente cuando es posible.
- Toda ejecución es recuperable después de un reinicio del worker.
- Ningún secreto forma parte del contexto del modelo.
- Las salidas de herramientas no son confiables.
- Las referencias de versión son inmutables.

## 21. Integración de LangGraph, checkpoints y frontera de estado

*Agregado 2026-10-19 — cierra la brecha C-1 de `docs/reference/KORTIX-CROSS-MATRIX.md` (hallazgos K-L1/K-L2/K-L3).*

### 21.1 Responsabilidades

El runtime del agente se invoca **dentro de una activity durable**. Recibe una entrada acotada (objetivo, referencias de contexto, presupuestos, permisos de herramientas) y devuelve un resultado estructurado (plan, observaciones, acciones propuestas, resultado). No decide autorización, no resuelve credenciales y no gestiona temporizadores, cancelaciones ni esperas humanas.

### 21.2 Almacén del checkpointer

El estado de una corrida de agente puede persistirse entre pasos para permitir la reanudación dentro de la misma corrida y para inspección. Ese almacén es un **almacén de runtime**:

1. **No** es el sistema de registro de la Ejecución (`05` §1): el estado, los resultados y los artefactos viven en el almacén de dominio.
2. Está confinado al **ciclo corto** de una corrida. Si una corrida debe sobrevivir una espera larga (aprobación, caída externa, días), la durabilidad es responsabilidad de Temporal, no del checkpointer.
3. Queda sujeto a la misma clasificación de datos, DLP y retención que cualquier otro almacén: ningún secreto, credencial, token crudo o documento externo completo puede persistirse ahí; los payloads grandes van por referencia (`04` §4, `05` §3, `06` §7).
4. Debe tener una **política de retención y borrado** por clasificación: el historial de checkpoints se borra al llegar a estado terminal más la ventana de retención configurada, salvo que el entorno exija retención mayor por auditoría (en cuyo caso el artefacto es el registro de auditoría, no el checkpoint).
5. La durabilidad del runtime es una **decisión acotada y declarada**, no implícita. Las cinco nociones que no deben confundirse:

| Noción | Dueño | Qué cubre |
|---|---|---|
| Recuperación de una **corrida cognitiva** | Almacén del runtime del agente (esta sección) | Volver a entrar en una corrida del agente dentro de la misma activity tras la caída del proceso que la ejecutaba, dentro del ciclo corto |
| **Espera humana duradera** | Temporal (timers y señales del workflow) | Una ejecución que espera horas o días a una persona: el workflow queda suspendido de forma durable y la aprobación es un registro de `05` §10 |
| Recuperación del **workflow completo** | Temporal | Reejecutar la historia del workflow tras reinicios de workers o procesos, con timers, reintentos y señales intactos |
| Recuperación de una **activity fallida** | Política de reintentos de Temporal (`§13`) | Reagendar la activity que falló, con la clasificación de errores reintentables y no reintentables |
| Persistencia de **resultados de negocio** | Almacén de dominio (PostgreSQL, `05` §1) | Estado de la ejecución, resultados, artefactos y registros de auditoría |

Por lo tanto el almacén de checkpoints **nunca** sostiene una espera humana ni estado de negocio: si una pausa debe sobrevivir más que la corrida misma, el runtime devuelve el control a la activity, que espera una señal duradera (`§11`). El modo de durabilidad y el backend del runtime del agente están fijados por `ADR-012` (decisión del responsable del producto, 2026-10-19): persistencia por paso en **PostgreSQL**, en un **esquema de runtime separado** con roles y permisos propios, con el historial eliminado **7 días después de que la ejecución alcance un estado terminal** (línea base de ingeniería del MVP, DP-18). La decisión de diseño está adoptada, pero el almacén **no está validado**: `ADR-012` enumera las pruebas de fallo que deben ejecutarse (costo por paso, caída a mitad de nodo, reanudación, retención y ausencia de efectos externos duplicados). Por eso DP-1 sigue abierta en su capa de **prueba**, no en la de diseño.

### 21.3 Re-ejecución al reanudar

Cuando una corrida se reanuda tras una pausa interna, el runtime puede re-ejecutar el nodo **desde el comienzo**, no desde el punto exacto de la pausa. Por lo tanto:

- los efectos laterales deben postergarse hasta después de la decisión, o ser idempotentes (con clave, como en §12);
- una pausa interna no debe ser capturada por manejo genérico de errores ni convertida en reintento;
- la pausa y la reanudación deben registrarse como eventos de la ejecución (auditoría y telemetría), con la identidad solicitante y la decisión.

### 21.4 Versionado del grafo y ejecuciones en vuelo

Una definición publicada es inmutable (`03` §12), pero el **grafo que está ejecutando** debe seguir siendo resoluble mientras la ejecución está pausada:

- la versión de comportamiento en uso se registra en el estado de la ejecución al comenzar la corrida;
- el ruteo condicional puede ramificar según esa versión registrada, de modo que las ejecuciones iniciadas con una definición anterior terminen con esa definición;
- renombrar o eliminar un nodo mientras hay ejecuciones pausadas en él exige migración compatible o completar/cancelar esas ejecuciones antes de desplegar el cambio.

## 22. Operaciones de control del runtime

*Agregado 2026-10-19 — cierra el hallazgo K-15/K-16 de la matriz de cruce.*

Una ejecución no es "solo escritura". Estas operaciones forman parte del contrato del runtime, cada una con autorización, auditoría e idempotencia:

| Operación | Semántica | Quién puede pedirla | Notas |
|---|---|---|---|
| Pausar | La ejecución deja de avanzar pasos; el estado se preserva; los temporizadores siguen corriendo | operador, dueño de la tarea o aprobador con alcance | Una ejecución pausada sigue abierta y cuenta para la concurrencia |
| Reanudar | Continúa desde el estado preservado | igual que pausar | Debe ser idempotente ante pedidos repetidos |
| Inyectar directiva | Agrega una instrucción/observación humana al agente en su próximo paso, sin terminar la corrida | dueño de la ejecución u operador con alcance | La directiva es entrada no confiable: no otorga permisos ni evita la política |
| Interrumpir turno | Termina el turno actual del agente después de la acción en curso y vuelve a planificar | dueño de la ejecución | Se usa para cortar un plan equivocado sin cancelar la ejecución |
| Cancelar | Cancelación de primera clase (`§18`) | operador, dueño de la ejecución, política | Los efectos externos ya realizados no se revierten; aplica reconciliación |
| Terminar | Parada inmediata; la ejecución pasa a estado terminal fallido/cancelado con motivo | solo operador, y solo para contención | Debe auditarse como acción de operador |

Toda operación de control produce un evento auditable con actor, ejecución, estado previo, cambio pedido y resultado. Ninguna operación de control otorga capacidad nueva al agente.

**Lectura frente a comando (contrato de la capa durable).** El runtime del agente y la capa de API interactúan con el workflow durable de dos maneras distintas y no deben mezclarlas:

- **Leer estado y progreso** usa **queries**: no mutan el workflow y pueden repetirse (así se alimentan el stream de eventos de `05` §20 y la cola de aprobaciones de `05` §10.1).
- **Ordenar un cambio** usa **signals** (asíncronas, sin valor de retorno) o **updates** (sincrónicas, validadas): una operación de control de la tabla anterior lleva payload validado, es idempotente ante entrega repetida y queda registrada como evento de ejecución.
- Una operación que muta la ejecución nunca debe implementarse como query, y una lectura nunca debe implementarse como signal.

### 22.1 Atributos operativos (Search Attributes)

*Agregado 2026-10-19 — decisión del responsable del producto (DP-20); cierra el hallazgo K-T5 de `docs/reference/KORTIX-CROSS-MATRIX.md`.*

Los *Search Attributes* de Temporal se usan para **localizar y filtrar** ejecuciones — por ejemplo, las aprobaciones que esperan una persona (`05` §10.1). El conjunto mínimo del MVP es:

| Atributo | Tipo (Temporal) | Para qué |
|---|---|---|
| `TenantId` | Keyword | Aislamiento por tenant/despliegue en las consultas |
| `EmployeeId` | Keyword | A qué Empleado Digital pertenece la ejecución |
| `ApprovalStatus` | Keyword | Si la ejecución espera una aprobación y en qué estado |
| `ApprovalType` | Keyword | Clase de la aprobación pendiente |
| `ApprovalPriority` | Keyword o entero | Orden de la cola |
| `AssignedGroup` | Keyword | Grupo o rol que debe decidir |
| `ApprovalDueAt` | Datetime | Envejecimiento y escalamiento (`ADR-014`) |
| `ApproverSubjectId` | Keyword — **solo identificador opaco** | Opcional: bandeja personal, cuando haga falta |

Reglas:

1. Son un **índice operativo**. La fuente de verdad del estado de aprobación, de los permisos y del estado de negocio es el almacén de dominio (`05` §1); encontrar un workflow por un atributo no demuestra nada sobre la autorización.
2. **La API verifica los permisos y lee los detalles de la aprobación desde el almacén de dominio.** Una decisión de autorización nunca se deriva del valor de un atributo.
3. Los valores se escriben con la misma disciplina que los datos de dominio: con alcance de tenant, sin datos personales más allá de un identificador opaco y sin secretos (`06` §7).
4. Agregar o cambiar un atributo es un **cambio gobernado**: debe registrarse en el namespace de Temporal, documentarse acá con su tipo y sus tipos y su registro deben ser compatibles con la versión de Temporal en uso — una prueba de contrato (DP-20).
5. El filtrado por atributos **nunca** es el mecanismo de aislamiento (`02` §11, `06` §3): el aislamiento no descansa en una protección revocable.

## 23. Delegación (sub-agentes, sub-grafos)

*Agregado 2026-10-19 — cierra el hallazgo K-03 de la matriz de cruce.*

Si el runtime soporta delegar trabajo a un sub-grafo o sub-agente, la delegación se permite solo bajo estas reglas:

- el trabajo delegado corre **dentro** de la misma ejecución y del mismo camino de enforcement; no puede crear una nueva ejecución ni una nueva identidad;
- el contexto delegado hereda la **intersección** de permisos de herramientas, presupuestos y alcance de política del padre — nunca un superconjunto;
- la profundidad máxima de delegación y la cantidad máxima de delegados concurrentes se configuran por tarea y los aplica el runtime. Línea base de ingeniería del MVP (DP-18, 2026-10-19): profundidad máxima **3**, **5** agentes delegados concurrentes y **3** acciones externas concurrentes por ejecución;
- el padre sigue siendo responsable del resultado; el razonamiento delegado es salida de modelo no confiable como cualquier otra;
- la delegación queda trazada por completo (qué delegado, qué contexto, qué llamadas a herramientas) para poder reconstruir la ejecución.

## 24. Versionado de workflows y workers

*Agregado 2026-10-19 — cierra el hallazgo K-T2 de la matriz de cruce.*

- Las definiciones de workflows durables son código y evolucionan; un cambio que altere la secuencia de comandos de una ejecución abierta debe resolverse con una estrategia explícita: cambio compatible, ramificación por versión, o una nueva versión del workflow para las ejecuciones nuevas mientras las viejas terminan con la anterior.
- Los mecanismos concretos del motor durable son la implementación de referencia de esa regla: *patching* dentro del workflow (una compuerta de versión que ramifica el comportamiento para historias viejas y nuevas) para cambios compatibles menores, y un **nuevo tipo o versión de workflow** para cambios que no pueden parchearse; los despliegues de workers se versionan para que una Task Queue sirva código compatible, con cutover por versión en lugar de reemplazo en el lugar.
- Los cambios de activities y workflows que puedan romper el replay deben cubrirse con una prueba de replay/regresión antes de publicar (`09` §8, `docs/development/TESTING-STRATEGY.md`).
- Los despliegues de workers se versionan para que una ejecución no sea servida en silencio por código incompatible.
- El crecimiento del historial de un workflow está acotado (`10` §6); las ejecuciones de larga vida deben renovar su historial en lugar de crecer indefinidamente.

## 25. Preguntas abiertas (documentadas, no decididas)

*Registradas 2026-10-19. Son brechas sin diseño cerrado: no deben resolverse implícitamente desde una implementación.*

1. **Entorno de ejecución del empleado — decidido 2026-10-19 (`ADR-013`).** El MVP **no** permite ejecución arbitraria de código del agente dentro del proceso principal. Los entregables los produce un **servicio restringido de generación de artefactos** (bibliotecas y plantillas aprobadas, límites de recursos, sin secretos y sin salida de red por defecto), y los artefactos que produce quedan gobernados por `05` §21. La variante de **sandbox efímero** sigue abierta: requiere su propia decisión y sus propias pruebas de aislamiento. Hallazgo K-12/K-21; DP-2 sigue abierta en sus capas de implementación y prueba.
2. **Superficies de canal.** Cuando se implemente el primer canal conversacional, los requisitos mínimos son: vinculación de identidad del remitente humano, política de acceso a la sesión/hilo, autorización por acción, capacidad de detener una corrida desde el canal, y auditoría de cada mensaje que llegó al agente (hallazgo K-40).
3. **Enforcement de costos y cuotas.** Qué cuotas (tenant, empleado, tarea) detienen una ejecución y qué hace la ejecución cuando la cuota se agota (hallazgo K-42).
