# La Plataforma de Empleados Digitales — Explicación para no técnicos

**Versión:** 0.1 — para compartir con personas sin perfil técnico
**Autor:** Proyecto Empleados IA — Hermes

---

## 1. En una frase

> Una plataforma para crear "empleados virtuales" que **trabajan de verdad** dentro de una empresa: ejecutan tareas, usan los sistemas de la empresa (CRM, ERP, cobranzas), **piden permiso cuando hace falta**, y dejan un registro completo de **qué hicieron y por qué**.

Piénsalo así: no es un "chatbot que conversa". Es un **colaborador digital** que **produce trabajo terminado**, con las mismas reglas y controles que un empleado humano.

---

## 2. El problema que resuelve

La Inteligencia Artificial ya sabe conversar y proponer. Pero **conversar no es trabajar**.

Hoy, muchas empresas le preguntan a una IA "¿qué harías?" y la IA responde con ideas. Eso no sirve para operaciones críticas:
- ¿Quién garantiza que cumpla las reglas (quién puede ver qué datos, qué requiere aprobación)?
- ¿Qué pasa si se apaga el servidor a mitad de la tarea? ¿Qué pasa si una acción a medias deja daños?
- ¿Y si necesita esperar 2 días a que un humano apruebe una acción arriesgada?
- ¿Cómo reproducir luego exactamente qué hizo y con qué versión de las reglas?

Esta plataforma fue pensada para responder **todas esas preguntas**, desde el diseño. Ese es su valor: **IA que trabaja, controlada como un empleado**.

---

## 3. La idea central: "la ejecución"

La plataforma no piensa en "mensajes". Piensa en una **tirada de trabajo** (ejecución):

```text
Se dispara (un horario, un evento, un pedido)
   → se genera una solicitud de trabajo
   → un proceso organiza el trabajo (y no se pierde aunque falle)
   → el "cerebro" IA razona y propone qué hacer
   → unas reglas deciden si está permitido
   → si es arriesgado, un humano aprueba
   → se ejecuta la acción sobre el sistema
   → se registra todo y se termina
```

Un correo, un evento del ERP o un cron **solo provocan** una tirada de trabajo. Lo importante es la **ejecución gobernada** de inicio a fin.

---

## 4. La arquitectura, explicada como un equipo de trabajo

Imagina una **oficina** donde cada componente es un colaborador con un rol claro. Ninguno hace el trabajo de otro.

| "Colaborador" | Rol en la oficina | Qué hace |
|---|---|---|
| **El Cerebro (LangGraph)** | El analista que razona | Piensa, arma un plan, decide qué pasos seguir, interpreta resultados |
| **El Jefe de Operaciones (Temporal)** | El coordinador que no olvida | Se encarga de que un trabajo **no se pierda**: aguanta horas/días esperando una aprobación, reintenta si algo falla, y si se cae el servidor, **retoma donde iba** |
| **El Telefonista (LiteLLM)** | El que habla con los proveedores de IA | Un único punto para pedirle a cualquier Inteligencia Artificial (la que convenga según costo/velocidad) y llevar el consumo |
| **El Inspector de Reglas (OPA)** | El que conoce el reglamento | Decide **sí/no** según reglas escritas y versionadas: ¿está permitido esto? |
| **El Guardia de la puerta (MCP Gateway)** | El que controla el acceso a los sistemas | Valida que solo se usen las herramientas permitidas, con límites y supervisión |
| **El Libro de Cuentas (PostgreSQL)** | La memoria oficial | Guarda todo el estado del negocio y quién hizo qué |
| **La Memoria de Trabajo (Redis)** | La pizarra rápida | Coordinación rápida y temporales del momento |
| **La Caja Fuerte (Vault)** | El que custodia las claves | Guarda contraseñas y credenciales; nadie las ve en claro |
| **El Guardián de datos (DLP)** | El que cuida la información sensible | Clasifica los datos (públicos, confidenciales, PCI) y prohíbe fugas |
| **Los Paneles de Control (Observabilidad + Evaluación)** | Los que revisan el trabajo | Miden costos, errores, calidad; y "examinan" a cada empleado digital antes de dejarlo trabajar |

Regla de oro de la plataforma:

> La IA **propone**, pero **no se autoriza a sí misma**. Las reglas, los permisos y las aprobaciones los deciden sistemas deterministas y, cuando corresponde, un humano.

---

## 5. Por qué elegimos cada pieza (y qué aporta)

- **El Cerebro (LangGraph)** — lo elegimos para que la IA guarde un plan paso a paso y pueda retomar un trabajo donde se quedó dentro de una misma tarea. Es el estándar más sólido de su tipo y es de código abierto.
- **El Jefe de Operaciones (Temporal)** — es EL motivo por el que esto no es un juguete: permite **trabajos largos, esperas de aprobación de días y recuperación total ante fallos**. Es lo que muchos equipos de IA usan hoy como base. **Sin él, la plataforma no podría prometer "no se pierde ningún trabajo".**
- **El Telefonista (LiteLLM)** — evita quedar atados a un solo proveedor de IA: podemos cambiar de modelo, poner respaldos si uno falla y controlar el gasto. Es el estándar abierto del mercado.
- **El Inspector (OPA)** — reglas "escritas", versiones claras, decisiones siempre repetibles. Un humano entiende por qué el sistema dijo "no" o "necesita aprobación".
- **El Guardia (MCP Gateway)** — une la IA con los sistemas reales de la empresa con **un solo punto de control**: todo pasa por ahí, nada entra en la puerta de atrás.
- **El Libro de Cuentas (PostgreSQL)** — una sola base soporta datos, búsquedas y auditoría; no sumamos tecnologías de más hasta que de verdad haga falta.
- **La Caja Fuerte (Vault)** — las credenciales nunca se mezclan con las conversaciones de la IA; solo se usan en el momento exacto y por corto tiempo.

> **Filosofía:** usamos soluciones maduras y estándar donde no somos el diferencial (razonar, aguantar trabajo largo, hablar con proveedores de IA), y construimos a medida solo donde sí somos diferentes (gobierno, seguridad y control de los empleados digitales). Esto evita inventar ruedas y mantener sistemas complicados sin razón.

---

## 6. Por qué es mejor que "dejarlo simple" (chatbot) o rehacerlo

- **vs. un chatbot:** un chatbot responde; un empleado digital ejecuta con **reglas, aprobación humana y registro**. Para una empresa seria eso es la diferencia entre "una herramienta de consulta" y "un colaborador".
- **vs. rehacer desde cero el sistema interno anterior:** ya tenemos un proyecto base con seguridad y control multi-cliente muy valioso. No lo tiramos: **reutilizamos lo que ya funciona** y cambiamos de rumbo solo en la parte de ejecución, aprovechando soluciones maduras.

---

## 7. Ejemplo concreto: el "Empleado de Cobranzas"

Cada mañana a las 9:

1. **Se dispara** la tarea (horario programado).
2. Un **proceso organiza** el trabajo y se asegura de que no se pierda.
3. El **cerebro** revisa las facturas vencidas y arma un plan.
4. El **inspector de reglas** decide según riesgo:
   - riesgo bajo → se actúa solo;
   - riesgo alto o acción irreversible (p. ej. enviar aviso legal) → **pide permiso a un humano**.
5. Mientras tanto el trabajo **espera en pausa** (el proceso no consume recursos; puede esperar días).
6. El responsable **aprueba**, y la acción pasa por el **guardia** hacia el sistema de cobranzas.
7. Todo queda **registrado**: qué hizo, con qué reglas, quién aprobó, cuál fue el resultado.

Si ese mismo trabajo es parte de un flujo mayor (crear cliente, crear cuenta, y el segundo paso falla), el **Jefe de Operaciones** se encarga de **deshacer el primer paso** (compensación) o dejar constancia para **revisión manual**.

---

## 8. Glosario simple

- **Empleado digital:** un agente de IA que ejecuta trabajo real y gobernado.
- **Ejecución:** una "tirada de trabajo" con inicio, pasos, controles y fin.
- **Aprobación humana:** un permiso que un humano da cuando una acción es arriesgada.
- **Reglas / política:** el "reglamento" que decide qué se puede y qué no.
- **Herramienta / MCP:** la forma en que la IA se conecta a los sistemas de la empresa.
- **Caja fuerte / Vault:** donde se guardan las claves de acceso, protegidas.
- **Auditoría:** el registro permanente de quién hizo qué y por qué.
- **Compensación:** el "deshacer" cuando un paso salió mal.
- **Reconciliación manual:** cuando una acción no se puede deshacer, queda para revisión de un humano.

---

## 9. Lo importante para el negocio (sin tecnicismos)

- **Control:** nada se ejecuta sin reglas; lo riesgoso requiere persona.
- **Confiabilidad:** un trabajo no se pierde, aunque falle algo.
- **Transparencia:** siempre se puede responder *"¿por qué esto se hizo? con qué reglas, quién lo aprobó, y cuál fue el resultado".*
- **Ahorro:** automatiza operaciones rutinarias sin sacrificar supervisión humana.
- **Madurez:** usa estándares probados de la industria, no inventos frágiles.

> **Regla norte:** si la plataforma no puede explicar por qué hizo algo, esa ejecución **no cuenta como gobernada**. Eso es lo que hace a esta plataforma apta para empresas serias y sectores regulados (finanzas, cobranzas, pagos).