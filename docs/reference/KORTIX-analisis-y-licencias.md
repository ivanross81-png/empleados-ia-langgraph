---
type: reference
status: active
created: 2026-10-18
updated: 2026-10-18
tags: [digital-employee, kortix, licencias, base-tecnologica, competencia]
---

# Kortix (ex Suna) — análisis de producto y licencias

> **No normativo.** Investigación de base: qué es Kortix, qué provee y qué licencia tiene, para decidir si sirve como BASE, como REFERENCIA o si conviene ignorarlo. Complementa [[SPIKE-FASE1-FOUNDATION-investigacion|el SPIKE de Fase 1]] y [[00-ARCHITECTURE-INDEX|la arquitectura canónica]].
>
> **Verificado en vivo el 2026-10-18** clonando el repo (`kortix-ai/suna`, commit `0c781d9b`, del día) y leyendo su `LICENSE`. Re-verificar antes de citarlo en un pliego o due diligence.

## 1. Identidad y licencia

| Dato | Valor |
|---|---|
| Repo | `github.com/kortix-ai/suna` (el producto ahora se llama **Kortix**) |
| Posicionamiento | "The open-source AI Operating System" — alternativa a Claude Cowork / ChatGPT Work |
| Licencia | **Elastic License 2.0 (ELv2)** — *source-available*, **NO aprobada por OSI** |
| Actividad | Muy alta (commit del mismo día del análisis, >10.000 PRs) |
| Agent runtime | **OpenCode** (`apps/sandbox/opencode-warmup.sh`); agentes = "OpenCode agents" |

**Ojo con el marketing:** el README se autodenomina "open source". ELv2 **no es open source** en sentido estricto. No citarlo como tal ante clientes que auditan.

### Restricción que define todo (textual del LICENSE del repo)

> *You may not provide the software to third parties as a hosted or managed service, where the service provides users with access to any substantial set of the features or functionality of the software.*

Eso es exactamente el modelo de negocio de la plataforma (hostear y dar acceso a empresas, aunque sea single-tenant dedicado). ELv2 permite usar, copiar, distribuir, modificar y **preparar obras derivadas** — pero la limitación **viaja con la obra derivada**.

## 2. Lectura legal: "leerlo y reimplementar con mis herramientas"

- Leer el código y reimplementar **NO es clean-room**: hay acceso + similitud → es **obra derivada**. ELv2 concede el derecho a la derivada, así que no es violación de copyright, pero **seguís bajo ELv2** (sin poder ofrecerlo como servicio).
- Cambiar de stack (Temporal/LangGraph/Postgres en vez del suyo) **no libera de nada**: el copyright mira código, estructura, secuencia y organización, no el lenguaje ni el framework.
- Para quedar fuera de ELv2: (a) **clean-room real** — quien lee escribe spec funcional + tests, quien implementa no ve el código, con registro documentado; o (b) diseñar desde comportamiento observado y docs públicas, sin leer el código. Aun así quedan flancos: estructura/secuencia/organización, **trade dress de la UI** y marcas (tienen brandkit y `whitelabel-demo`).
- Lo permitido y útil: **leerlo para aprender y decidir producto**, y copiar *ideas* (no código).
- Riesgo comercial: dependencia derivada de licencia no-OSI = pasivo en la due diligence de un cliente bancario.

*(No es asesoramiento legal; si la decisión se vuelve seria, abogado de PI.)*

## 3. Qué hace (del código, no del README)

**Tesis:** "una empresa va a ser un repositorio git" — agentes, skills, memoria, conectores y triggers como archivos versionados y diffeables.

**Modelo de ejecución — session-céntrico:**

```text
proyecto (repo + kortix.yaml)
  └─ session ──> "cloud computer": sandbox aislado en su propia rama git
                   └─ el agente OpenCode trabaja ahí
                        └─ change request ──> humano revisa y mergea ──> main
```

- Cada sesión = computadora descartable (contenedor; microVM en su provider "Platinum"), en su propia rama. Solo sobrevive lo commiteado.
- Todo llega a `main` por **change request aprobado**; merge **deny-by-default** para agentes.
- Miles de sandboxes en paralelo sobre la misma config.

**Config declarativa `kortix.yaml`** (schema versionado v1/v2/v3 en `packages/manifest-schema`): `agents` (prompt/`prompt_file`, `mode`, `model`, `variant`, `temperature`, `permission` por agente, `secrets`, `extensions`, `connectors_required`, `sandbox.templates`), `commands`, `skills`, `default_agent`, `triggers` (**cron** + **webhook firmado**), `format`. En v3 la clave `harnesses` se retiró → modelo de `extensions` + `codemode` por agente.

**Gobierno y seguridad:**
- Permisos por recurso para personas **y** agentes (tablas `agent_grant`, `account_secret_grants`).
- Roles, grupos, **SAML 2.0 SSO + SCIM 2.0**.
- **Tool rules Allow / Ask / Block hasta los argumentos de cada llamada**; un "Ask" **sostiene** la llamada hasta que una persona aprueba y el agente reanuda. Approval gates apagados por defecto.
- **Audit trail**; SOC 2 Type I obtenido, Type II en progreso.
- Secrets cifrados en reposo (clave por proyecto), concedidos por agente, inyectados en runtime.
- **Credenciales de conectores intermediadas server-side**: la clave cruda nunca entra al sandbox (Pipedream para 3.000+ apps, más MCP, OpenAPI, GraphQL y HTTP crudo).

**Superficies / monorepo** (TypeScript, Bun + pnpm, Next.js, Supabase, Postgres + Drizzle con RLS): `web`, `api`, `cli` (`init`/`ship`/`sessions new`/`cr ls`/`chat`/`self-host`), `desktop-electron`, `mobile` (android/ios), `tui`, `sandbox` + `kortix-sandbox-agent-server`, **`llm-gateway` propio** (+ paquete `llm-catalog`), `kortix-app-runtime` (Caddy), `capture`, `whitelabel-demo`. Packages: `agent-tunnel`, `api-contract`, `db`, `manifest-schema`, `registry`, `sdk`, `shared`, `starter`.

**Canales:** Slack y Teams en vivo; email experimental. **Deploy:** `kortix self-host start` (stack Docker Compose, **baja imágenes de Docker Hub** → self-hosted, no disconnected), VPC propia, on-prem, o Kortix Cloud (~US$20/mes).

## 4. Gap contra nuestra arquitectura (por qué no es BASE)

| Nuestra regla normativa | Kortix |
|---|---|
| Temporal dueña de la durabilidad; "execution" es la unidad de trabajo | No hay Temporal ni workflows durables: la unidad es **sesión + rama + CR** (sin timers/signals/replay/compensación) |
| Policy-as-code determinístico (OPA) con decisión versionada | Tool rules son **config de aplicación**, no decisiones auditables con versión de política |
| Reconstruir "por qué el empleado hizo esto, con qué versión y autorización" | Tiene *audit trail*, no la **cadena de explicabilidad** |
| Control plane / tenancy / SSO propios (Hermes-OS) — **no duplicar** | Trae control plane, UI, tenancy y SSO propios → **duplicaría Hermes-OS** |
| Cosmovisión execution/workflow | Cosmovisión **session/sandbox** (el agente "tiene una computadora") |

## 5. Qué sirve copiar como IDEA (no como código)

1. **Empleado = configuración en git**, con skills y memoria como archivos versionados y revisables.
2. **Tool rules por argumento** Allow/Ask/Block, y el patrón de que un "Ask" **sostenga** la ejecución en lugar de fallar.
3. **Credenciales intermediadas server-side**: la clave nunca llega al entorno donde razona el agente (misma forma que nuestro invariante "secrets fuera del prompt/state/memoria/logs").
4. **Change request con merge deny-by-default** como mecanismo de auto-mejora controlada (aplicable a que el empleado proponga cambios a su propia definición).

## 6. Veredicto

**REFERENCIA, no BASE.** No forkar ni derivar (ELv2 + duplicación de Hermes-OS + cosmovisión incompatible). Consumirlo como (a) fuente de ideas de producto y UX de governance, y (b) **benchmark competitivo** para saber qué ofrece hoy el mercado en "AI employee gobernado" — permisos, approvals, audit, SSO/SCIM, sandboxes.

Si alguna vez se quiere el *set de features* con código propio: spec funcional escrito por quien leyó el repo + implementación separada (clean-room documentado), y aun así revisar UI/marca antes de acercarse al look-and-feel.

## 7. Fuentes

- `github.com/kortix-ai/suna` — `LICENSE` (ELv2), `README.md`, `MANIFESTO.md`, `packages/manifest-schema/src/index.v3.ts`, `apps/sandbox/`, `packages/db/`, `self-host/README.md`. Commit verificado: `0c781d9bb9f1d384aa4258ac42c0d78a1992a009` (2026-10-18).
- Lectura en vivo del árbol del repo (clone shallow local, 2026-10-18).
