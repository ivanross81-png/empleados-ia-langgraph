# Plataforma de Empleado Digital — Persistencia y Contratos de API

**Versión:** 0.1.0  
**Estado:** Línea base normativa  
**Creado:** 2026-09-21  
**Actualizado:** 2026-10-19

## 1. Estrategia de persistencia

PostgreSQL es el sistema de registro oficial principal del estado de dominio. Temporal persiste el estado del flujo de trabajo a través de su propia capa de persistencia. Valkey es infraestructura transitoria y no debe convertirse en el almacén autoritativo del estado de negocio.

Existe un tercer almacén **acotado**: el almacén de estado del runtime del agente (su propio checkpointing), confinado a una corrida dentro de una activity. No es un sistema de registro y se rige por `04` §21. Las autoridades de estado son:

| Asunto | Autoridad |
|---|---|
| Estado de dominio/negocio (empleados, tareas, ejecuciones, acciones, aprobaciones, artefactos) | PostgreSQL |
| Ciclo de vida durable del workflow (temporizadores, señales, reintentos, esperas, recuperación) | Persistencia de Temporal |
| Estado de la corrida del agente dentro de una corrida | Almacén del runtime del agente — PostgreSQL en un **esquema de runtime separado** con roles propios (`ADR-012`); acotado, clasificado, con retención limitada |
| Caché/coordinación transitoria | Valkey *(BSD-3-Clause; reemplaza a Redis 8 según `ADR-011` Aceptado)* (nunca autoritativo) |

El progreso y el estado se leen de la capa durable con **queries** que no mutan, mientras que los comandos se entregan como **signals/updates** (`04` §22).

pgvector y la búsqueda de texto completo de PostgreSQL proporcionan la capa inicial de recuperación.

## 2. Esquema lógico

Tablas/entidades principales:

```text
tenants
identities
roles
employees
employee_versions
skills
skill_versions
tasks
task_versions
triggers
executions
actions
approvals
policies
policy_versions
tools
mcp_servers
mcp_server_versions
integrations
memory_items
knowledge_sources
knowledge_chunks
audit_events
outbox_events
```

Toda fila de propiedad de un tenant debe llevar `tenant_id`, salvo que sea estrictamente metadatos de infraestructura a nivel de despliegue.

## 3. Persistencia de ejecuciones

Las `executions` deben incluir:

- clave primaria UUID;
- ID de tenant;
- referencias a versiones de empleado/tarea;
- referencia al disparador;
- ID de flujo de trabajo / ID de ejecución de Temporal;
- estado;
- marcas de tiempo;
- IDs de correlación/causación;
- clave de idempotencia;
- referencia de entrada;
- resumen/referencia de salida;
- información de falla;
- resumen de costo/tokens.

Los payloads grandes deben almacenarse por referencia o en un almacén de objetos/documentos apropiado, en lugar de expandir indefinidamente las filas relacionales.

## 4. Persistencia de acciones

Las acciones deben conservar la capacidad solicitada, el hash/referencia de argumentos normalizados, la decisión de política, la evaluación de riesgo, la referencia de aprobación, el estado de invocación, la referencia de resultado, el conteo de reintentos y el estado de compensación.

Los argumentos crudos sensibles deben clasificarse y protegerse.

## 5. Auditoría

La auditoría está orientada a la anexión (append). Un evento de auditoría debe capturar actor, acción, recurso, ejecución, política, resultado, marca de tiempo e información de correlación, sin secretos.

### 5.1 Taxonomía de nombres de acciones

*Agregado 2026-10-19 — cierra el hallazgo K-52/K-53 de `docs/reference/KORTIX-CROSS-MATRIX.md`.*

Las acciones auditadas usan un nombre estable y legible por máquina con la forma:

```text
<dominio>.<recurso>.<verbo>
```

- `dominio`: el área acotada (`execution`, `action`, `approval`, `policy`, `tool`, `employee`, `task`, `trigger`, `knowledge`, `memory`, `artifact`, `identity`, `secret`, `integration`, `platform`);
- `recurso`: el tipo de entidad que toca la operación;
- `verbo`: `create`, `update`, `delete`, `read`, `list`, `invoke`, `approve`, `reject`, `cancel`, `grant`, `revoke`, `export`, `publish`, …

Reglas:

1. Una operación tiene un único nombre canónico; los nombres son parte del contrato y se versionan como cualquier otro esquema (`§14`).
2. Una familia puede direccionarse por prefijo (por ejemplo `execution.` o `approval.`) para filtrar y exportar.
3. El evento registra la **superficie/ruta** y la operación, no texto libre.
4. Renombrar una acción es un cambio incompatible; el nombre anterior sigue siendo resoluble durante la ventana de retención.

### 5.2 Regla de cobertura

Toda operación que lea datos clasificados, mute estado, ejecute una acción, cambie configuración o cambie accesos debe producir un evento de auditoría — incluida la administración del plano de control y las acciones de operador sobre una ejecución en curso. La cobertura se verifica con pruebas de contrato (`§19`), no por convención.

## 6. Concurrencia optimista

Los recursos mutables del plano de control deben tener un número de versión o revisión. Las actualizaciones deben fallar ante una revisión obsoleta (stale) para evitar sobrescrituras silenciosas.

## 7. Outbox

Los cambios que deban publicar eventos de integración deben usar el patrón de outbox transaccional:

```text
DB Transaction
 ├─ update domain state
 └─ insert outbox event
          ↓
     Outbox Publisher
          ↓
     Event Bus / Queue
```

Esto evita que el commit de la base de datos y la publicación del evento diverjan.

## 8. Convenciones de API

Ruta base: `/api/v1`.

Recursos:

- `/tenants`
- `/employees`
- `/tasks`
- `/triggers`
- `/executions`
- `/approvals`
- `/tools`
- `/mcp-servers`
- `/policies`
- `/knowledge`
- `/audit`

Usar UUIDs, marcas de tiempo ISO-8601, enums explícitos y esquemas Pydantic.

## 9. API de ejecuciones

`POST /api/v1/executions`

Crea una Solicitud de Ejecución.

Comportamiento esperado:

```json
{
  "task_id": "...",
  "input": {},
  "trigger_type": "API",
  "idempotency_key": "..."
}
```

Respuesta:

```json
{
  "execution_id": "...",
  "status": "QUEUED"
}
```

El endpoint no ejecuta el agente LangGraph de forma síncrona.

## 10. API de aprobaciones

Endpoints conceptuales:

- `GET /api/v1/approvals/{approval_id}`
- `POST /api/v1/approvals/{approval_id}/approve`
- `POST /api/v1/approvals/{approval_id}/reject`

El servidor verifica la autorización y señala el flujo de trabajo duradero.

### 10.1 Cola de aprobaciones (read model)

*Agregado 2026-10-19 — cierra el hallazgo K-19/K-27 (cola de aprobaciones) de `docs/reference/KORTIX-CROSS-MATRIX.md`.*

Una ejecución esperando no sirve de nada si nadie la ve. La cola de aprobaciones es un read model de primera clase:

- `GET /api/v1/approvals?status=PENDING&assignee=me|role|team` — filtros: estado, rol requerido, empleado, tarea, clase de riesgo, antigüedad, tenant;
- cada ítem expone: acción pedida, argumentos exactos (o representación redactada + referencia), evaluación de riesgo, referencia de la decisión de política, contexto de versiones, solicitante, vencimiento y la ejecución a la que pertenece;
- el orden y la **antigüedad** son explícitos: por defecto la más vieja primero, con indicadores de SLA para que una aprobación perdida se vea como métrica (`09` §13);
- **envejecimiento y escalamiento** (2026-10-19, `ADR-014`): una aprobación que envejece **no** produce cancelación ni rechazo automático — el silencio nunca es una decisión. Línea base de ingeniería del MVP: **aviso a las 24 horas**, **escalamiento a las 72 horas** y **revisión operativa a los 7 días**, con la ejecución todavía esperando de forma durable (`ADR-003`). Una política del inquilino puede definir una ventana de rechazo explícita, pero queda registrada en la aprobación y en la auditoría, nunca aplicada como valor por defecto oculto;
- la **delegación** y la **separación de funciones** se evalúan al momento de decidir, no al momento de pedir;
- una aprobación ya otorgada pero no consumida puede **revocarse** si cambia la política o cambia la acción; la revocación es auditable;
- las decisiones son idempotentes: reenviar la misma decisión devuelve el mismo resultado.

La cola se deriva de PostgreSQL; el workflow se señala desde la capa de API (`06` §6). Las aprobaciones nunca se entregan solo por un canal de notificación: el canal es comodidad, el registro duradero es la autoridad.

## 11. API de ingesta de eventos

Los endpoints de eventos deben validar:

- firma/autenticación;
- marca de tiempo/frescura;
- protección contra repetición (replay);
- versión de esquema;
- idempotencia;
- mapeo de tenant.

Después de una validación rápida, el procesamiento es asíncrono.

La deduplicación se keyea sobre la **identidad del evento emitida por el proveedor** (su id de entrega/evento), no sobre el request entrante: un proveedor que reintenta el mismo evento con otro id de request no debe producir una segunda ejecución. Cuando el proveedor no emite id de evento, una ventana acotada de contenido+firma sirve de respaldo (`§15`). Las entregas duplicadas devuelven un estado exitoso con un indicador explícito de `deduplicated`, para que un emisor que reintenta no escale.

## 12. Contrato de errores

Usar códigos estables legibles por máquina, por ejemplo:

```json
{
  "error": {
    "code": "POLICY_DENIED",
    "message": "The requested action is not permitted.",
    "request_id": "..."
  }
}
```

Los mensajes no deben exponer credenciales, stack traces internos ni detalles sensibles de política de forma innecesaria.

## 13. Paginación/filtrado

Las APIs de colecciones deben admitir paginación por cursor estable para conjuntos de datos grandes. Los filtros y la ordenación deben ser explícitos y acotados.

## 14. Contratos con control de versiones

Los esquemas de API, eventos y herramientas públicas tienen control de versiones. Los cambios que rompen compatibilidad requieren una nueva versión o una capa de compatibilidad.

## 15. Idempotencia

Las solicitudes de API mutantes deben admitir claves de idempotencia. El servidor devuelve el resultado original cuando se repite la misma clave válida dentro de la ventana de retención configurada.

## 16. Retención de datos

La retención se rige por política, según la clasificación de datos y el requisito de negocio. La retención de auditoría es independiente de la retención del historial conversacional.

## 17. Restricciones de base de datos

La base de datos debe imponer lo que pueda imponerse de forma segura:

- claves foráneas;
- unicidad;
- requisitos de no nulo;
- restricciones de comprobación (check constraints);
- restricciones de transición de estados cuando sea práctico.

La lógica de aplicación sigue siendo responsable de las reglas complejas de autorización y de flujo de trabajo.

## 18. Recuperación híbrida

La búsqueda de conocimiento combina la similitud vectorial con la búsqueda de texto completo de PostgreSQL. Los resultados se fusionan con una estrategia determinista, como Reciprocal Rank Fusion, antes de un reordenamiento (reranking) opcional.

## 19. Pruebas de contratos

Los contratos de MCP, API y eventos requieren pruebas de contratos. Las pruebas de integración deben verificar tanto las rutas de política exitosas como las rechazadas.

## 20. Stream de eventos de ejecución

*Agregado 2026-10-19 — cierra el hallazgo K-64/K-65 (progreso en vivo) de `docs/reference/KORTIX-CROSS-MATRIX.md`.*

Una ejecución puede durar días. Los clientes (consola, bandeja de aprobaciones, herramientas de operación, SDK futuros) necesitan un único contrato para observar el progreso sin consultar la base a cada rato.

- **Transporte:** server-sent events (o un stream ordenado equivalente) para el progreso; los comandos siguen siendo operaciones REST síncronas, nunca mensajes del stream.
- **Contrato:** cada evento lleva `execution_id`, número de secuencia monótono, tipo de evento, marca de tiempo, ids de correlación/causación y un payload acotado con referencias en lugar de documentos completos.
- **Tipos de evento (mínimos):** cambio de estado de la ejecución, inicio/fin de paso, decisión de política, aprobación pedida/decidida, acción propuesta/invocada/exitosa/fallida, observación, artefacto producido, umbral de presupuesto, operación de control, resultado terminal.
- **Autorización:** el stream está sujeto a la misma autorización que leer la ejecución; los eventos con payload restringido se redactan a una referencia y una etiqueta de clasificación.
- **Reconexión:** un cliente que se reconecta informa su último número de secuencia y recibe el hueco (o una señal explícita de "recargar estado"). Los eventos nunca se pierden ni se reordenan en silencio.
- **Retención:** el stream es una proyección del estado duradero; un cliente desconectado más allá de la ventana de retención debe recargar el estado por la API REST.
- **Agnóstico del consumidor:** la consola es el primer consumidor, no el contrato. El stream no debe exponer objetos internos del runtime (estado del agente, secretos, prompts crudos del modelo).

## 21. Artefactos y manejo de archivos

*Agregado 2026-10-19 — cierra el hallazgo K-22/K-23/K-24 de `docs/reference/KORTIX-CROSS-MATRIX.md`.*

Una ejecución que "produce trabajo terminado" produce **artefactos**: documentos generados, planillas, exportaciones, imágenes, resultados estructurados o archivos recibidos como entrada. Son objetos gobernados, no efectos colaterales.

- **Registro de artefacto:** id, tenant, ejecución/acción dueña, versión de empleado, tipo, tamaño, checksum, clasificación, referencia de almacenamiento, fecha de creación, política de retención, ACL de acceso.
- **Almacenamiento:** metadatos en PostgreSQL; contenido por referencia en un almacén de objetos/documentos (o un almacén de bytes acotado) — nunca en línea dentro de filas relacionales ni en el estado del runtime del agente (`§3`, `04` §21).
- **Clasificación y DLP:** un artefacto hereda la clasificación de los datos que contiene; las reglas de DLP aplican al crear, al leer y al transferir fuera del entorno de confianza (`06` §8).
- **Acceso:** los artefactos son legibles solo por los principales autorizados sobre la ejecución dueña más concesiones explícitas; un enlace compartible, si existe, es una decisión explícita, con vencimiento y auditable — no un comportamiento por defecto.
- **Límites:** tamaño máximo por artefacto y por ejecución, cantidad máxima de artefactos por ejecución y cuota por tenant; exceder un límite falla la acción productora con un error tipado en lugar de truncar en silencio.
- **Retención:** los artefactos siguen la política de retención de su clasificación; borrar un artefacto referenciado por un registro de auditoría exige que el registro de auditoría sobreviva (referencia preservada, contenido borrado).
- **Contenido no confiable:** un artefacto subido es dato no confiable; puede contener instrucciones y nunca debe tratarse como comandos (`04` §17).
- **Procedencia:** todo artefacto se vincula con la ejecución, la acción y las versiones que lo produjeron, de modo que un revisor pueda reconstruir cómo se creó.

## 22. Descubrimiento de API y ergonomía de clientes

*Agregado 2026-10-19 — cierra el hallazgo K-65 de `docs/reference/KORTIX-CROSS-MATRIX.md`.*

- Cada despliegue sirve su propio contrato legible por máquina (`/api/v1/openapi.json` o equivalente) y un endpoint de salud que no requiere autenticación.
- La documentación pública puede deshabilitarse por entorno en instalaciones privadas endurecidas (`10`).
- Las respuestas limitadas por tasa devuelven cabeceras explícitas de límite (`X-RateLimit-Limit`, `-Remaining`, `-Reset`) y, al rechazar, `429` con `Retry-After` y un código de error estable (`§12`).
- Los clientes ramifican solo por valores estables de `code`, nunca por el texto legible (`§12`).
- Las API keys, los tokens personales y las credenciales de sesión son distinguibles y revocables individualmente.
