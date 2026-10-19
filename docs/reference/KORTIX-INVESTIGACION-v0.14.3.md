---
type: reference
status: active
created: 2026-10-19
updated: 2026-10-19
tags: [digital-employee, kortix, suna, investigacion, competencia, evidencias]
---

# Kortix/Suna v0.14.3 — investigación de capacidades (con evidencias)

> **Documento no normativo.** Es el **informe de investigación** (entregable B del encargo). **No es la arquitectura de nuestra plataforma ni una propuesta de diseño.** Su único rol es servir de fuente trazable para la [[KORTIX-CROSS-MATRIX|matriz de cruce]] y para [[STACK-LICENCIAS]].
>
> **Complementa** a [[KORTIX-analisis-y-licencias]] (que responde *"¿sirve como BASE?"* → veredicto: **REFERENCIA, no BASE**). Este documento responde *"¿qué hace exactamente, con qué mecanismo, y con qué evidencia?"*.

## 0. Trazabilidad de la consulta

| Dato | Valor |
|---|---|
| Repositorio | `github.com/kortix-ai/suna` (producto comercial: **Kortix**) |
| Fecha de consulta | **2026-10-19** (UTC) |
| Rama por defecto | **`dev`** |
| Commit analizado | **`e0eb2243ca8a78c4ae2badd8d9ae65fe82c80f80`** (2026-10-19T22:22:24Z) |
| Versión declarada | `VERSION` = **0.14.3** |
| Tamaño del árbol | 15.087 entradas / 13.679 blobs (API de Git, sin truncar) |
| Actividad | commits del mismo día del análisis; ~20.3k estrellas, ~3.4k forks, 63 issues abiertos |
| Fuentes | (a) documentación de producto **publicada dentro del repo**: `apps/web/content/docs/**.mdx` (33 archivos) leída **en el commit fijado**; (b) archivos raíz `README.md`, `MANIFESTO.md`, `LICENSE`, `WHITE-LABEL-LICENSE.md`, `VERSION`, `package.json`; (c) **código/configuración** del mismo commit (`apps/api/src/**`, `apps/sandbox/**`, `apps/kortix-sandbox-agent-server/**`, `packages/**`) para verificar mecánica; (d) árbol Git completo para hechos estructurales |
| Método de verificación | Lectura directa de los archivos en el commit fijado (`raw.githubusercontent.com`) + inventario programático del árbol. Las afirmaciones de código fueron **re-verificadas** (grep sobre el archivo descargado) |

**Reglas aplicadas:** una capacidad se marca `documented` solo si está en la documentación de producto; se marca `implemented` solo cuando se citó código/configuración; si algo aparece en marketing pero el mecanismo no existe o está explícitamente desactivado, se marca `marketing-only`. Cuando algo **no está definido** queda en la lista de *no especificado* (no se infiere).

**Nomenclatura de estado:** `IMP` = verificado en código/configuración del commit · `DOC` = documentado oficialmente en el producto · `MKT` = solo declarativo/afirmación sin mecanismo · `?` = desconocido.

---

## 1. Resumen ejecutivo de la arquitectura observada

- **Cosmovisión:** *"una empresa va a ser un repositorio git"*. Proyecto = repo con `kortix.yaml` + `agents/` + `skills/`; los cambios llegan a la rama default por **change request** revisado por un humano, nunca por merge automático del agente.
- **Unidad de trabajo:** **sesión** (no ejecución). Cada sesión = rama git + **sandbox** ("cloud computer" aislado) donde corre un **harness** de agente (**OpenCode** por defecto, `pi` como alternativa en desarrollo).
- **Durabilidad:** **no hay workflow durable**: la continuidad se apoya en el sandbox (disco + rama) y en una **cola de trabajos en PostgreSQL** (claim con `SKIP LOCKED`, worker in-process). No hay Temporal, Kafka, Redis, BullMQ ni Celery en el árbol. No hay *timers*, *signals*, *replay* ni *compensación* de workflow.
- **Gobierno:** permisos **por agente** (`allow`/`ask`/`deny` hasta el argumento), grants deny-by-default, IAM con roles/grupos/roles a medida, **SAML SSO + SCIM**, MFA obligatoria, política de sesión, **auditoría de una fila por request** con taxonomía `dominio.recurso.verbo`.
- **Secretos:** cifrados por proyecto, concedidos por agente, y con **tres modos de exposición** (valor real en el sandbox / **intermediación egress** con el valor fuera del sandbox / ninguno).
- **Control plane propio y completo:** cuentas, proyectos, IAM, billing por créditos, apps hospedadas, captura de pantalla de puestos de trabajo, clientes web/desktop/mobile/TUI/CLI.

## 2. Inventario de capacidades

### 2.1 Agentes, skills y definiciones versionadas

| ID | Capacidad | Descripción | Estado | Evidencia | Límites / incertidumbre |
|---|---|---|---|---|---|
| K-01 | Empleado definido como **código versionado** | Agente = prompt de sistema + modelo + reglas de herramientas, declarado en `agents/<nombre>.md` y/o en `kortix.yaml`; skills y memoria viven como archivos del repo. `kortix.yaml` está versionado por schema (`kortix.v1/v2/v3`). | DOC | `docs_mdx/project__agents.mdx`; `docs_mdx/project__manifest.mdx` ("schema `kortix.v2.schema.json`", "Versions") | El manifest tiene **varias versiones vivas**; el dashboard/CLI operan solo sobre v2 |
| K-02 | Campos de agente | `description, model, mode, variant, temperature, top_p, steps, hidden, disable, options, color, permission`. Todos opcionales (un archivo OpenCode stock es válido). | DOC | `project__agents.mdx` ("Every field is optional…") | No hay normalización: una clave mal escrita no es error evidente |
| K-03 | **Subagentes / delegación** | `mode: primary` (lo corre una sesión), `subagent` (lo arranca otro agente con la tool `task`), `all`. Existe `subagent_depth` en OpenCode. | DOC | `project__agents.mdx` ("another agent starts it with the `task` tool") | El **límite numérico** de profundidad no está documentado |
| K-04 | **Permisos de herramienta por regla**: allow / ask / deny | Cada regla resuelve a una acción. `allow` ejecuta; **`ask` deja el turno esperando aprobación humana**; `deny` rechaza (y si niega todas las llamadas, la herramienta sale de la lista del agente). Una herramienta sin regla queda permitida. | DOC | `project__agents.mdx` ("The turn waits until a person approves or rejects the call.") | El timeout documentado es del **turno que espera** (2 h; 30 min en sesiones de trigger/schedule/system), no de la regla |
| K-05 | **Resolución de reglas: gana la más específica** | Patrón más largo gana (`*` es fallback); a igual longitud, último en orden; el permiso del agente prevalece sobre el project-wide. | DOC | `project__agents.mdx` ("The most specific rule wins…") | Empates dependen del orden de code-unit (no documentado) |
| K-06 | **Grants deny-by-default** | Sin claves `connectors`/`secrets`/`apps`/`kortix_permissions`, el agente no recibe nada. Excepciones: `tools` omitido otorga todas; `skills` omitido delega en el archivo del agente. | DOC | `project__agents.mdx` ("Grants are deny-by-default…") | No es un deny-by-default global: la política de conectores usa `allow_all` por defecto |
| K-07 | **Identidad del agente = service account propio** | "Un agente actúa como sí mismo, no como la persona que lo arrancó"; Kortix crea una service account por agente por proyecto. Permisos efectivos = permisos del agente ∩ rol techo (IAM) − permisos *human-only*. | DOC | `project__agents.mdx` ("An agent acts as itself, not as the person who started it.") | Hay acciones que ningún agente puede tener (p. ej. emitir credenciales de proyecto) |
| K-08 | **Empleado que otorga permisos acotado por lo que ya tiene** | Un agente que escribe grants solo puede otorgar lo que él mismo posee. | DOC | `project__index.mdx` (harness-reflector / grants) | — |
| K-09 | Skills como carpetas de instrucciones cargadas a demanda | `skills/<n>/SKILL.md`; el cuerpo **no** se inyecta en cada prompt; el agente lee `description` y decide cargar. 12 skills `kortix-*` gestionadas se copian en cada sesión y **no** pueden ser sobrescritas por el proyecto. | DOC | `project__agents.mdx` ("A skill is a folder of instructions…") | El contenido de las 12 skills no está en la doc |
| K-10 | **Auto-mejora gobernada de la propia definición** | Un proyecto nuevo trae el agente `harness-reflector`: revisa sesiones recientes y **propone** mejoras de prompts/skills/tools/memoria abriendo un change request (nunca mergea), con trigger cron diario **desactivado** por defecto. | DOC | `project__index.mdx` | Apagado por defecto; no valida que la mejora sea correcta |
| K-11 | Marketplace / instalación de skills | Instalación desde marketplace que **abre un change request**; el usuario revisa y mergea. | DOC | `project__index.mdx` ("The install never merges…") | Esquema de un ítem no especificado |

### 2.2 Ciclo de vida de la sesión, control en vivo y durabilidad

| ID | Capacidad | Descripción | Estado | Evidencia | Límites |
|---|---|---|---|---|---|
| K-12 | **Sesión = rama git + sandbox descartable** | Al crear la sesión se corta rama desde `base_ref`, se bootea un sandbox, se clona el repo en `/workspace` y arranca el harness. | DOC | `work__sessions.mdx`; `work__runtime.mdx` ("A sandbox is the isolated cloud computer a session runs on.") | Aislamiento del sandbox: **la tecnología (VM/microVM/gVisor) no está documentada** |
| K-13 | Estados de sesión | `provisioning`, `running`, `stopped` (despierta on demand), `failed` (con campo error). Origen: `user`, `trigger`, `schedule`, `backend`, `system`. | DOC | `work__sessions.mdx` | El SDK menciona `completed`, que **no** figura en la tabla de ciclo de vida |
| K-14 | Operaciones de sesión | `start` (resume/boot), `stop` (conserva disco, rama y conversación), `restart`, `rm` (borra sandbox; conserva rama; 30 días de conversación/archivos), `restore`, `recover` (sesión perdida sobre sandbox nuevo). | DOC | `work__sessions.mdx` | `recover` con conversación > 24 MB no la recarga |
| K-15 | **Control en vivo del turno: steer / queue / interrupt** | `steer` el turno en curso lo lee en su próximo paso sin cortarlo; `queue` espera al final del turno; `interrupt` termina el turno tras la herramienta en curso y luego corre. Sin turno activo, los tres arrancan uno. | DOC | `work__sessions.mdx` ("The running turn reads the message at its next step.") | `steer` requiere capability del harness y ser el *prompter* del turno |
| K-16 | **Detener un turno sin matar el sandbox** | El botón Stop termina el turno y retiene la cola; el sandbox sigue vivo. Autorización: quien arrancó el run, el dueño o un manager (si no → 403). | DOC | `work__sessions.mdx` | — |
| K-17 | **Buzón durable de prompts** | Un mensaje se guarda primero en el *prompt inbox del servidor*: sobrevive pestaña cerrada, cambio de dispositivo y sandbox dormido; el cliente puede listar/editar/cancelar/reintentar la cola no entregada. | DOC | `work__sessions.mdx` ("It survives a closed tab, a device switch, and a sleeping sandbox.") | Una vez que un paso del modelo leyó el mensaje, editarlo da 409 |
| K-18 | **Resultado del turno y motivo de fin** | El SDK expone turnos en curso, cómo terminó el último (`last_ended`), fallas recientes y si el llamador puede frenarlo. Si el sandbox muere, el turno termina con motivo y Kortix **devuelve el trabajo una vez** (auto-recuperación). | DOC | `work__sessions.mdx`; `sdk__sessions.mdx` | Vocabulario de `last_ended` no enumerado |
| K-19 | **Preguntas / permisos / aprobaciones + reanudación** | El agente espera en dos casos: llamada a la tool `question`, o herramienta con `permission: ask`. Se responde aprobando (`once`/`always`/`reject`) o contestando. Una pregunta abierta se guarda **fuera del sandbox** y se cierra al responderse/descartarse, al arrancar un nuevo turno, al terminar el turno o al tomarla un hilo de Slack/Teams. | DOC | `sdk__sessions.mdx`; `work__sessions.mdx` ("An agent waits on a person in 2 cases") | Si el sandbox se durmió y el wait expiró, **no hay reanudación automática**: hace falta un mensaje que responda |
| K-20 | **Durabilidad real: no hay motor de workflows** | El árbol **no contiene Temporal, Kafka, Redis, BullMQ ni Celery**. La continuidad se apoya en el sandbox + una cola de trabajos en PostgreSQL con claim `SKIP LOCKED` ejecutada por workers in-process. | **IMP** | `apps/api/src/workers/job-queue-worker.ts` ("runs due jobs; SKIP LOCKED spreads the work"); `apps/api/package.json` (sin deps de Temporal/Kafka/Redis) | No hay timers/signals/replay/compensación de workflow; una espera humana larga depende de que el sandbox y el turno sigan vivos |

### 2.3 Ejecución de código, archivos y artefactos

| ID | Capacidad | Descripción | Estado | Evidencia | Límites |
|---|---|---|---|---|---|
| K-21 | **Sandbox por sesión con imagen en dos capas** | Imagen = Dockerfile/imagen del proyecto + capa runtime de Kortix encima. Sin template: `ubuntu:24.04` + capa runtime. El agente corre como usuario `kortix` con sudo sin contraseña. Docker-in-sandbox disponible. | DOC | `work__runtime.mdx` ("A sandbox image has two layers…") | Reglas de Dockerfile (FROM Debian/Ubuntu, sin ENTRYPOINT/CMD, sin puerto 8000, sin COPY del repo, sin credenciales); contexto de build vacío |
| K-22 | **Cuatro almacenes de archivos** | (1) workspace vivo `/workspace`; (2) repositorio commiteado (git); (3) adjuntos de sesión (subidos + lo que el agente mostró, persistidos al fin de cada turno); (4) carpetas compartidas montadas en `/drives`. | DOC | `work__runtime.mdx` ("A session's files live in four places…") | Carpetas compartidas detrás de feature/flag |
| K-23 | Límites de adjuntos | 50 MiB por archivo, 100 MiB por mensaje, 20 archivos por mensaje; los no usados expiran a las 24 h. | DOC | `sdk__sessions.mdx` | — |
| K-24 | Previews y puertos | Cualquier puerto del sandbox se publica con URL propia; un request a un sandbox dormido lo despierta; algunos puertos se rechazan. | DOC | `work__runtime.mdx` | Requiere DNS wildcard y origen de previews |
| K-25 | **Harness de agente = OpenCode** (con `pi` en desarrollo) | El daemon del sandbox supervisa `opencode serve` como proceso hijo; `pi` "reemplaza a OpenCode; el soporte de OpenCode es temporal". | **IMP** | `apps/kortix-sandbox-agent-server/README.md` ("`opencode`, the default today) as a supervised `opencode serve` child process, or pi… pi replaces OpenCode") | El runtime de agente es una **dependencia externa de terceros** (OpenCode), no propio |

### 2.4 Herramientas, MCP y conectores

| ID | Capacidad | Descripción | Estado | Evidencia | Límites |
|---|---|---|---|---|---|
| K-26 | Conectores como **capa de integración gestionada** | El conector guarda la credencial, elige la cuenta, aplica las políticas del proyecto, llama al proveedor y escribe un evento de auditoría por llamada. **La credencial nunca entra al sandbox.** Direcciones: entrante (Kortix como servidor MCP) y saliente (proveedores MCP/Composio/OpenAPI/GraphQL/HTTP). | DOC | `connect__connectors.mdx` ("The credential never enters a sandbox.") | Catálogo MCP de apps **experimental** detrás de flag |
| K-27 | **Aprobaciones a nivel de conector** | Políticas *Allow/Ask/Block* del proyecto sobre llamadas de conector, con cola de aprobaciones (`connector.approval.list/resolve`) y aprobación **durable** distinta de la de herramienta. | DOC | `connect__connectors.mdx`; `audit-actions.mdx` (namespace `connector.approval.`) | El **motor de políticas es propio de la aplicación**: no se declara OPA/Rego ni decisiones de política versionadas |
| K-28 | Kortix **como servidor MCP** (dirección entrante) | Un cliente MCP externo (Claude, ChatGPT, Cursor, Codex…) puede operar sesiones, sandbox, conectores, API y CLI de Kortix. | DOC | `connect__mcp.mdx` | Con límites de uso; no es el modelo de seguridad |
| K-29 | **Cuentas OAuth por usuario** | "Conectores, conexiones y cuentas" son cosas distintas; se autoriza una cuenta (OAuth) y el agente la usa; hay *connect links* dentro de una sesión. | DOC | `connect__connectors.mdx` | No se explicita caducidad/rotación de tokens delegados |

### 2.5 Automatizaciones, triggers y canales

| ID | Capacidad | Descripción | Estado | Evidencia | Límites |
|---|---|---|---|---|---|
| K-30 | **Triggers de 4 tipos** | `cron`, `webhook`, `event` (algo pasa en una app conectada) y `monitor` (una línea de stdout de un comando del repo). Un trigger es una entrada de `kortix.yaml`; su estado de runtime vive en la base. | DOC | `connect__triggers.mdx` | `monitor` y `event` detrás de flags |
| K-31 | **Cron de 6 campos + timezone IANA** | Segundos primero; como máximo un fire por minuto; `timezone` IANA con default **UTC**; `run_at` (ISO-8601) para una única vez. | DOC | `connect__triggers.mdx` ("A trigger fires at most once a minute.") | **Comportamiento en cambios de horario (DST) no especificado** |
| K-32 | **Jitter de calendarización** | Cada corrida se desplaza una cantidad fija: hasta ¼ del período, **máximo 30 minutos**, para dispersar triggers simultáneos. El próximo horario real se expone (`next_fire_at`). | **IMP** | `apps/api/src/projects/trigger-schedule.jitter.test.ts` ("the window is capped at a quarter period…") | Sin clave de jitter, el slot cae en el instante exacto |
| K-33 | **Clave por slot + misfire/catch-up** | Cada fire se keyea sobre su slot de agenda: un reintento **no** corre el slot dos veces. Un slot perdido **mientras las automatizaciones estaban pausadas** dispara una vez al reanudar. | DOC | `connect__triggers.mdx` ("Each fire is keyed on its schedule slot…") | **No se define** qué pasa con slots perdidos por caída del proceso o misfire del planificador |
| K-34 | Límites de corridas | Máximo `max_runs_per_hour` (60 por defecto) y `max_runs_per_day`; un fire por encima del límite es un *run skipped* con motivo y responde `200 skipped` (para no gatillar reintentos del emisor). | DOC | `connect__triggers.mdx` | Los fires manuales y replays **no** se frenan pero cuentan |
| K-35 | Pausa por proyecto / cuenta | `kortix triggers pause` detiene todos los fires automáticos del proyecto (respuesta `200 skipped`); existe además un *pause all automations* a nivel cuenta. | DOC | `connect__triggers.mdx` | Un fire manual sigue corriendo |
| K-36 | **Webhooks firmados con HMAC-SHA256** | "No existe webhook sin firmar": secreto obligatorio, HMAC-SHA256 del cuerpo crudo, comparación en tiempo constante, cabecera `X-Kortix-Signature: sha256=<hex>` (también acepta `X-Hub-Signature-256` de GitHub); ventana de replay con `X-Kortix-Timestamp` (±300 s); fallback a token estático. | **IMP** | `apps/api/src/projects/lib/trigger-webhook-auth.ts` (`createHmac('sha256', secret).update(rawBody)`); `trigger-webhooks.ts` (`WEBHOOK_TIMESTAMP_TOLERANCE_SECONDS = 300`); `packages/shared/src/webhook-signing.ts` | El **tamaño máximo del cuerpo** no está documentado |
| K-37 | **Una corrida por evento (dedupe)** | Kortix corre una entrega una sola vez por evento: lee el id del primero de `X-Kortix-Delivery-Id`, `X-GitHub-Delivery`, `X-Gitlab-Event-UUID`, `Linear-Delivery`, `webhook-id`, `svix-id`; un reintento con el mismo id responde `202 deduped`; sin id, cuerpo+firma idénticos dentro de 10 minutos cuentan como un evento. | **IMP** | `apps/api/src/projects/lib/webhook-delivery.ts` ("One webhook delivery runs once, and only once per event (KRTX-1735)") | El TTL de la clave por event-id no se explicita; `X-Request-Id` nombra un **intento**, no un evento |
| K-38 | Semántica de respuestas de webhook | `202` (fired/queued/deduped con `session_id`), `200 skipped` (pausado, filtro, o límite alcanzado), `400`, `401` genérico, `402` (sin modelo/créditos/suscripción), `429` (>120 req/min), `500`. | **IMP** | `apps/api/src/projects/routes/trigger-webhooks.ts` | Kortix **no** reintenta entregas **salientes** hacia terceros (no hay webhook de salida documentado) |
| K-39 | **Concurrencia de provisión** | Máximo **3** sesiones creadas por triggers se aprovisionan a la vez por proyecto; las demás quedan `queued`. Máximo 10 monitores por proyecto, 20 recordatorios por sesión. | DOC | `connect__triggers.mdx` ("At most 3 trigger-created sessions provision at once…") | — |
| K-40 | **Canales**: Slack, Teams, email, Telegram | Hilos como sesiones (un hilo de Slack = una sesión); vinculación de identidad de un solo uso (10 min); *join policy* por binding (`project_open`/`owner_approval`/`owner_only`); aprobar/denegar y **detener** una corrida desde el canal; el agente actúa con **su** grant, no con el rol del emisor. | DOC | `connect__channels.mdx` | Email y Telegram detrás de flags; sin rate limiting de canales documentado |

### 2.6 Modelos, costos y cuotas

| ID | Capacidad | Descripción | Estado | Evidencia | Límites |
|---|---|---|---|---|---|
| K-41 | **Gateway de LLM propio con routing y fallback** | Toda request de modelo pasa por el gateway; modelos gestionados o **claves propias** del cliente; *offer vs allow* (ofrecer ≠ permitir); esfuerzo de razonamiento; fallback documentado como "429 antes de emitir salida → siguiente clave, nunca replay de una respuesta parcial". | DOC | `project__models.mdx` ("Every model request goes through the LLM gateway.") | Política exacta de reintentos por clave y espera total de la cadena **no** especificadas |
| K-42 | **Cupos por créditos y corte por saldo** | Consumo por sesión/buckets/plan; "cuando el saldo llega a cero, los agentes se pausan y los triggers dejan de arrancar sesiones". Medición de uso y top-up automático. | DOC | `credits.mdx` ("When the balance reaches zero, agents pause and triggers stop starting sessions.") | Es un modelo **de producto comercial**; el enforcement no se verificó en código |
| K-43 | Presupuesto por proyecto/agente | Hay *budgets* en el gateway (claves de gateway con presupuesto) además del modelo de créditos. | DOC | `project__models.mdx` | No se detalla el comportamiento exacto al exceder |

### 2.7 Identidad, IAM, secretos y auditoría

| ID | Capacidad | Descripción | Estado | Evidencia | Límites |
|---|---|---|---|---|---|
| K-44 | **Roles de cuenta y de proyecto** | Cuenta: `owner`/`admin`/`member`. Proyecto: `manager`/`member`. Reglas duras: no se puede degradar al último owner (409); promover a owner/admin borra grants directos. | DOC | `accounts__index.mdx` ("Each person holds exactly one account role…") | Enforcement no verificado en código |
| K-45 | **Un único registro de grant ("assignment")** | Principal (user/group/service_account/pending/project) + rol + scope (account/project) + objeto opcional (agente, conexión, valor de secreto, carpeta) + expiración. API de **permisos efectivos** (individual y por lote hasta 64 acciones) que devuelve `allowed` + `reason`. | DOC | `accounts__index.mdx` | Un assignment de objeto no agrega permiso: solo acota |
| K-46 | **Grupos** y **roles a medida** | Grupos que solo **suman** acceso; roles a medida con catálogo de permisos, key inmutable, sin reglas de denegación, no escalables. IAM-as-code (export/import). | DOC | `accounts__index.mdx` | Requiere *entitlement* Enterprise (`rbac`) |
| K-47 | **SSO SAML 2.0 con wizard multi-IdP** | Entra ID, Okta, Google Workspace, Cloudflare Access, OneLogin, JumpCloud, PingOne, Auth0 o custom; verificación de dominio por **DNS TXT** (`_kortix-verification.<dominio>`); **Enforce SSO** rechaza password/magic-link/OTP y también API keys de ese dominio, y **termina las sesiones existentes**; los owners/super-admins nunca se mergean a la identidad SSO. | DOC | `accounts__identity.mdx` ("every identity in that domain that did not come from your IdP is refused with `403`") | Requiere *entitlement* `sso` y cuenta de organización |
| K-48 | **SCIM 2.0** | El IdP crea/actualiza/elimina miembros y grupos sin sign-in; token `kortix_scim_…` mostrado una vez; endpoints Users/Groups; filtros de una sola cláusula. | DOC | `accounts__identity.mdx` ("SCIM lets your IdP create, update, and remove members and groups without a sign-in.") | Requiere `scim` y SAML conectado antes; entitlement chequeado en cada request |
| K-49 | **MFA obligatoria y política de sesión** | TOTP por persona; obligatoriedad a nivel cuenta con preview de cumplimiento y `403 account_mfa_required`; máximo de sesión e idle timeout (1–10.080 min); revocación de las 200 sesiones de navegador más recientes; lista de dispositivos del propio usuario. | DOC | `accounts__identity.mdx` | Super-admins, PATs y service accounts **exentos** de la MFA obligatoria |
| K-50 | **Secretos con tres modos de exposición** | `Environment` (el sandbox recibe el **valor real** como variable), **`Egress-enforced`** (el sandbox recibe un *handle* inútil por sí solo; Kortix sustituye el valor **fuera** del sandbox solo hacia hosts listados; permite header/query/body, crudo/URL-encoded/base64; el eco del valor vuelve `[REDACTED]`; un host no listado sale con el handle literal) y `None`. | DOC | `project__secrets.mdx` ("The exposure answers one question: can agent code read the real value?") | El relay solo intercepta clientes que respetan `https_proxy`; volver a `environment` sin rotar da 409 |
| K-51 | Secretos concedidos por agente | Un secreto sin grant no llega a ningún agente; se concede a agentes concretos (`kortix secrets grant … --agent …`); una sesión de agente **no puede** concederse secretos (403). | DOC | `project__secrets.mdx` | — |
| K-52 | **Auditoría: una fila por request, con taxonomía** | "una fila por cada request que llega a la API": HTTP, upgrades WebSocket, previews, clones/pushes git y llamadas SCIM. Cada fila lleva `action` con forma **`dominio.recurso.verbo`** (p. ej. `gateway.key.revoke`), un `metadata.http` con el **route template** (nunca el path crudo), y puede llevar dos o más acciones. Total declarado: **775 acciones de request + 80 eventos fuera de request + 54 acciones de operador**. | DOC | `audit-actions.mdx` ("Every audit row carries an `action` of the form `domain.resource.verb`"; "775 request actions, 80 events…"); `accounts__index.mdx` | El conteo no se reconcilió contra código; la página se **autogenera** desde `packages/shared/src/audit-labels.ts` |
| K-53 | Filtrado/exportación de auditoría | Filtro por prefijo de acción (`?action=gateway.`), streaming por prefijo y export; acciones de familia terminan en `.*` (p. ej. `connector.github.create_issue`). | DOC | `audit-actions.mdx` | — |
| K-54 | Namespaces de acciones (muestra) | `account.`, `agent.`, `app.`, `approval.`, `audit.`, `auth.`, `billing.`, `capture.`, `change_request.`, `channel.`, `client.`, `connector.`, `drive.`, `file.`, `gateway.`, `git.`, `iam.`, `invite.`, `marketplace.`, `mcp.`, `member.`, `model.`, `notification.`, `oauth.`, `platform.`, `project.`, `review.`, `scim.`, `secret.`, … | DOC | `audit-actions.mdx` | Lista completa no transcripta aquí (sección larga del doc original) |

### 2.8 Despliegue, operación y superficies

| ID | Capacidad | Descripción | Estado | Evidencia | Límites |
|---|---|---|---|---|---|
| K-55 | **Self-host en un único Compose** | Un proyecto Compose con API, frontend, gateway de LLM, job de migraciones, *updater*, la distribución Supabase completa y Caddy/cloudflared según modo. **Las sesiones no corren en el server**: corren en sandboxes del proveedor cloud y llaman de vuelta a la instancia. | DOC | `host__index.mdx` ("Sessions run on Platinum sandboxes, not on the server.") | El self-host **depende de un proveedor externo de compute** (clave obligatoria) |
| K-56 | Modos de alcance (reachability) | `domain` (Caddy+TLS, 2 réplicas), `tunnel cloudflare` (evaluación), `local` (127.0.0.1; el sandbox no puede llamar a la API). | DOC | `host__index.mdx` | Un solo instance por server en modo domain |
| K-57 | Instalación y provisionamiento | Bootstrap de un server pelado (solo Linux, idempotente), instalación manual, y Terraform para EC2 con volumen cifrado + **backups automáticos por snapshots EBS** y cloud-init que corre el mismo init/start. | DOC | `host__index.mdx`; `self-host_README.md` | Terraform solo AWS y provisiona **una vez** |
| K-58 | **Consola de plataforma admin** | `/admin`: Overview, Accounts, Projects, Analytics, Sandboxes, Git, Maintenance (con *full lockdown*). | DOC | `host__index.mdx` | — |
| K-59 | **Upgrade con rollback** | Un contenedor *updater* verifica a diario: pull de tags, migraciones, swap con health-check y **rollback automático** si falla; canales stable/latest; rollback manual por versión. | DOC | `host__index.mdx` ("A swap that fails keeps the previous version.") | Cambios de forma del Compose requieren actualización manual |
| K-60 | Auto-diagnóstico y cierre de registro | `doctor` con checks explícitos (docker, compose, rutas, email, previews, **sign-up abierto**) y advertencia de riesgo: hasta configurar email, **cualquiera puede crear una cuenta confirmada** para cualquier dirección, incluida la de admin. | DOC | `host__index.mdx` | Riesgo real de instancia recién instalada |
| K-61 | Backup/restore y borrado | Todo el estado vive en un directorio de instancia (`.env` con secretos + volúmenes Postgres/storage); backup = stop + tar + start; `uninstall` borra todo (irreversible). | DOC | `host__index.mdx` | Perder la clave de cifrado vuelve indescifrables los secretos guardados |
| K-62 | **Apps hospedadas** | Un App es un *deployment* de un proyecto: releases inmutables, procesos/máquinas/escala (1–32 vCPU, hasta 20 máquinas), volúmenes persistentes (100 GB fijos, snapshots), modos de acceso (privado/proyecto/restringido/público/password) con identidad firmada (JWT ES256 de 15 min). | DOC | `apps.mdx` | Volúmenes y size por grupo dependen del proveedor; un grupo con volumen corre una sola máquina |
| K-63 | **Kortix Capture** | Graba 24/7 la computadora de un miembro (pantalla, acciones, audio con transcript), indexado en una línea de tiempo buscable por persona; "v1 es captura cruda: graba, sube e indexa, sin procesamiento posterior". Instalación por persona o por *enrollment token* de IT. | DOC | `capture__index.mdx` | Apagado por defecto; pertenece a la cuenta, no al proyecto; ventana de 31 días |
| K-64 | Superficies cliente | Web, desktop (Electron), mobile (iOS/Android), TUI (experimental), CLI (instalado y logueado **dentro** de cada sandbox) y SDK (sesiones, streaming de eventos, React hooks, UI de chat). | DOC | `clients.mdx`, `tui.mdx`, `cli.mdx`, `sdk__*.mdx` | El TUI y varios SDK se declaran experimentales |
| K-65 | **API pública con contrato explícito** | Base `/v1`; autenticación por API key/PAT/sesión; errores con `code` estable ("Branch on this, never on the text"); `Idempotency-Key`; paginación; rate limits con cabeceras `X-RateLimit-*` y `429` + `Retry-After`; **OpenAPI 3.1 servido por la propia instancia** (`/v1/openapi.json`) y `/v1/health` sin token. | DOC | `api.mdx` | En self-host se puede apagar la doc pública |
| K-66 | Stack y persistencia (hechos de código) | TypeScript/Bun + pnpm; API Hono/Bun; frontend Next.js; PostgreSQL 17 (imagen Supabase) + Drizzle + `node-pg-migrate`; **RLS** en las tablas de tenant (una migración documenta "136 de 169 tablas tenían RLS apagado" antes de arreglarlo); auth Supabase (GoTrue) + SAML + SCIM; **sin pgvector ni búsqueda vectorial**. | **IMP** | `packages/db/MIGRATIONS.md`; `packages/db/migrations/20261013135231502_kortix_tables_enable_rls.sql`; `tree.json` | No se verificó el contenido de cada política RLS |

## 3. Capacidades que Kortix **no** tiene (o no resuelve)

Relevante para el cruce: son precisamente los puntos donde nuestra arquitectura **no** debe imitar su enfoque.

1. **No hay motor de workflows durables**: sin temporizadores, señales, replay determinista, compensación ni esperas de días que sobrevivan a la muerte del sandbox. Una aprobación humana larga vive dentro del turno/sandbox (K-19, K-20).
2. **No hay policy-as-code determinístico versionado**: las reglas de herramientas y las políticas de conector son **configuración de aplicación**; no hay decisiones de política versionadas y auditables como artefacto propio (K-27).
3. **No hay cadena de explicabilidad** del tipo "por qué el empleado hizo esto, con qué versión de política y qué autorización": hay auditoría de requests (excelente, K-52) pero no el encadenamiento ejecución→acción→decisión→aprobación→resultado.
4. **No hay aislamiento multi-tenant por despliegue**: es una plataforma multi-tenant compartida (RLS + IAM), no un despliegue dedicado por empresa.
5. **No hay política de recuperación ante fallos de negocio** (DLQ, reconciliación, compensación de saga) más allá del "devuelve el trabajo una vez" del turno (K-18).
6. **El egress de red declarativo no se aplica**: `network_egress` en el manifest "es solo declarativo… avisa que el egress no se aplica" → **MKT** (declarado y explícitamente no implementado).
7. **No hay memoria con política de escritura**: hay "memoria" como archivos del repo, pero no un ciclo de vida de memoria con clasificación, TTL y ACL como objeto de dominio.
8. **La tecnología de aislamiento del sandbox no está documentada** (ni VM, ni microVM, ni gVisor) → riesgo declarado, no verificable.

## 4. Riesgos y vacíos que afectan cualquier evaluación

- **Licencia:** ELv2 (no OSI) + `WHITE-LABEL-LICENSE.md` que habilita SaaS propio **a cambio de exclusividad de compute en Platinum** y con terminación unilateral (ver [[STACK-LICENCIAS]] §5 y [[KORTIX-analisis-y-licencias]] §1–2).
- **Cadena de dependencia externa:** el self-host **exige** un proveedor cloud de sandboxes (clave obligatoria) y el runtime de agente es **OpenCode**, con `pi` anunciado como reemplazo → dos dependencias fuera de su control para el camino crítico.
- **Seguridad del runtime:** el agente tiene **sudo sin contraseña** dentro del sandbox (K-21) y Docker-in-sandbox; el aislamiento no está documentado.
- **Estado de las fuentes:** proyecto de altísima actividad (commits del mismo día, >10k PRs); **toda cita debe re-verificarse por commit** antes de usarse en un pliego, y varios hechos citados aquí corresponden a **docs de producto autogeneradas**, no a código.
- **Marketing vs mecanismo:** el README se autodenomina "open source" (no lo es en sentido OSI) y `network_egress` se declara sin implementarse.

## 5. Fuentes del commit analizado

Rutas citadas (todas en `kortix-ai/suna@e0eb2243ca8a78c4ae2badd8d9ae65fe82c80f80`):

- Docs de producto: `apps/web/content/docs/{quickstart,index,host/index,cli,tui,clients,apps,api,credits,git}.mdx`, `…/accounts/{index,identity}.mdx`, `…/project/{index,agents,manifest,models,secrets,tools}.mdx`, `…/connect/{channels,computers,connectors,mcp,triggers}.mdx`, `…/work/{runtime,sessions}.mdx`, `…/sdk/{index,auth,sessions,react,ui,genui,reference}.mdx`, `…/capture/{index,rollout}.mdx`, `…/audit-actions.mdx`.
- Raíz: `README.md`, `MANIFESTO.md`, `LICENSE` (ELv2), `WHITE-LABEL-LICENSE.md`, `VERSION` (0.14.3), `package.json`, `AGENTS.md`.
- Código/configuración verificados: `apps/api/src/workers/job-queue-worker.ts`, `apps/api/src/projects/lib/webhook-delivery.ts`, `apps/api/src/projects/lib/trigger-webhook-auth.ts`, `apps/api/src/projects/routes/trigger-webhooks.ts`, `apps/api/src/projects/trigger-schedule.jitter.test.ts`, `packages/shared/src/webhook-signing.ts`, `packages/db/MIGRATIONS.md`, `packages/db/migrations/20261013135231502_kortix_tables_enable_rls.sql`, `apps/sandbox/README.md`, `apps/kortix-sandbox-agent-server/README.md`, `self-host/README.md`.
- Estructura: árbol Git completo (`git/trees/…?recursive=1`, 15.087 entradas, sin truncar).
