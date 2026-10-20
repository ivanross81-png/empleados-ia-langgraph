# ADR-014 — Semántica de envejecimiento y vencimiento de aprobaciones

**Estado:** Aceptado (decisión del responsable del producto, 2026-10-19)  
**Fecha:** 2026-10-19

## Contexto
`05` §10.1 (agregado en la revisión aditiva del 2026-10-19, cierre de K-19/K-27) definió el modelo de lectura de la cola de aprobaciones y afirmó que **"una aprobación que expira debe producir un resultado determinista (rechazo por defecto)"**, sin definir las ventanas. El responsable del producto decidió lo contrario en un punto concreto — **sin cancelación ni rechazo automáticos** — y fijó las ventanas iniciales de envejecimiento para el MVP. Como el cambio afecta la **semántica de un contrato normativo** (qué pasa con una aprobación pendiente), se hace por este ADR y no por edición silenciosa.

## Decisión
1. **Sin cancelación automática y sin rechazo automático.** Una aprobación que envejece **no** produce un resultado negativo automático. El silencio nunca es una decisión.
2. El comportamiento de respaldo humano es **escalamiento progresivo**, con líneas base de ingeniería del MVP (configurables por entorno, `DECISIONES-PENDIENTES.md` DP-18):
   | Etapa | Ventana | Qué ocurre |
   |---|---|---|
   | Aviso | 24 horas | Se notifica al aprobador y al responsable de la cola (`09` §13) |
   | Escalamiento | 72 horas | La aprobación escala al nivel siguiente (`AssignedGroup` / rol) |
   | Revisión | 7 días | El caso se lista para revisión operativa; la ejecución sigue esperando de forma durable |
3. La ejecución **permanece suspendida durablemente** mientras espera (`ADR-003`): la espera es un timer de Temporal más el registro durable de la aprobación, no un sondeo.
4. La semántica de vencimiento puede configurarse **explícitamente por política** (por ejemplo, una política del inquilino que rechaza a los N días), pero es una **decisión de política explícita registrada en la propia aprobación y en la auditoría**, nunca un valor por defecto escondido en el código.
5. La localización operativa de aprobaciones pendientes se hace con los **atributos operativos (Search Attributes)** de `04` §22.1, que son un índice para filtrar, **no** la fuente de verdad del estado de aprobación (`05` §1).

## Consecuencias
- La cola puede crecer: una aprobación ignorada queda visible como **métrica de envejecimiento**, en lugar de que el sistema la resuelva en silencio. Es el comportamiento buscado: una decisión humana relevante no debe desaparecer por vencimiento.
- La frase de `05` §10.1 sobre el "rechazo por defecto" queda reemplazada por esta semántica; la **idempotencia** determinista de una decisión ya enviada no cambia.
- **Estado de esta decisión:** decisión de diseño **adoptada por el responsable**; las ventanas son línea base de ingeniería del MVP, **no** un SLA contractual, y quedan pendientes de validación en producción (DP-18 sigue abierta en su capa de validación).

## Alternativas consideradas
- **Rechazo por defecto al vencer:** rechazada — convierte la inacción en una decisión de negocio negativa sin un humano responsable y puede matar en silencio una ejecución que una persona habría aprobado.
- **Aprobar por defecto:** rechazada — peor: autoriza una acción externa que nadie autorizó.
- **Sin envejecimiento (silencio infinito):** rechazada — la cola se vuelve invisible, que es exactamente el hallazgo K-19.
