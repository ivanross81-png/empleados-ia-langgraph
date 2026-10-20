# ADR-012 — Almacén de checkpoints del runtime

**Estado:** Aceptado (decisión del responsable del producto, 2026-10-19)  
**Fecha:** 2026-10-19

## Contexto
`04` §21.2 fijó la *frontera* del almacén de estado del runtime del agente (acotado, no es sistema de registro, con retención limitada, sin secretos ni payloads grandes) pero dejó deliberadamente sin decidir el **modo de durabilidad y el backend**, registrado como DP-1. Sin backend, la frontera no se podía probar y cada implementación habría elegido un comportamiento implícito. El responsable del producto decidió la opción de partida y exigió que se **pruebe** antes de considerarla validada.

## Decisión
1. **La persistencia por paso de LangGraph corre sobre PostgreSQL**, en un **esquema de runtime separado** con **roles y permisos propios**, distinto del esquema de dominio. El rol del runtime no debe poder leer ni escribir tablas de dominio.
2. El checkpoint **no** es fuente de verdad del estado de negocio. **Temporal sigue siendo la única autoridad de durabilidad** del workflow (`ADR-003`); el checkpoint solo permite reanudar una corrida cognitiva dentro de la misma activity (`04` §21.2).
3. **Las esperas humanas prolongadas son de Temporal** (timers de workflow + signals). El checkpoint nunca contiene una espera humana.
4. **Los efectos externos deben ser idempotentes**, o ejecutarse como acciones gobernadas fuera de nodos que puedan reejecutarse (`04` §21.3).
5. **Serialización restringida:** quedan excluidos secretos, credenciales y cargas sensibles innecesarias; las cargas grandes se persisten **por referencia** (`04` §4, `05` §3, `06` §7).
6. **Retención:** el historial de checkpoints se elimina **7 días después de que la ejecución alcance un estado terminal** — línea base de ingeniería del MVP (`DECISIONES-PENDIENTES.md` DP-18), configurable por entorno y sujeta a contrato.
7. El almacén **no está validado** hasta ejecutar estas pruebas de fallo: costo por paso; caída a mitad de nodo; reanudación tras la caída; retención/borrado que efectivamente elimine el historial; y ausencia de efectos externos duplicados tras una reanudación.

## Consecuencias
- La frontera pasa a ser **comprobable**: una prueba negativa (el rol del runtime consultando tablas de dominio) debe fallar, y es la base del invariante I-15.
- El despliegue suma un activo que aprovisionar (esquema + roles + su propia política de respaldo y retención), anotado en `10`.
- Elegir PostgreSQL evita introducir un producto nuevo en el stack; por eso la puerta de licencias de `ADR-011` no aplica a esta decisión.
- **Estado de esta decisión:** decisión de diseño **adoptada por el responsable**; **no** validada técnicamente — no se ejecutó ninguna prueba, así que DP-1 sigue abierta en su capa de *prueba*.

## Alternativas consideradas
- **Solo memoria:** rechazada — no permite reanudar dentro de una corrida y esconde la pregunta de costo y privacidad en lugar de responderla.
- **Checkpoints en el esquema de dominio:** rechazada — mezcla dos autoridades en un mismo lugar y vuelve inauditable la separación.
- **Almacén de objetos externo:** rechazada para el MVP — suma una dependencia, un perímetro y una carga de clasificación sin necesidad demostrada.
