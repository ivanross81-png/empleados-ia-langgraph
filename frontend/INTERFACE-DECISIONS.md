# Decisiones de interfaz — prototipo frontend

**Estado:** decisiones de implementación para un prototipo local; no reemplazan la propuesta de MVP ni modifican arquitectura o ADR.

## Principios de experiencia

- La consola organiza el trabajo en torno a empleados, ejecuciones, acciones gobernadas y decisiones humanas; no al chat.
- La navegación lateral agrupa operación y configuración. Las páginas mantienen encabezado contextual, jerarquía tipográfica y acciones principales consistentes.
- Dashboard y listados priorizan información operativa derivada del mismo servicio local. Se evita añadir visualizaciones decorativas sin una decisión de trabajo asociada.
- Las ejecuciones muestran una cronología de eventos, decisiones, referencias y resultados. Los textos de cognición son resúmenes operativos simulados; nunca se presentan cadenas privadas de razonamiento.
- Las decisiones `ALLOW`, `DENY` y `REQUIRE_APPROVAL` tienen tratamientos visuales distintos. La aprobación se vincula a una huella demostrativa de la acción exacta, exige actor autorizado, motivo y confirmación, y vuelve a comprobar la acción antes de continuar.
- Antigüedad de una aprobación no dispara decisiones. Un rechazo termina sin invocar herramientas. Un resultado incierto necesita reconciliación; el reintento reutiliza una clave idempotente simulada.

## Lenguaje visual

- Identidad propia: consola azul pizarra, lienzo gris cálido, superficies claras, acento coral y colores semánticos sobrios.
- Espaciado compacto y tablas para lectura de alta frecuencia; tarjetas solo cuando facilitan jerarquía o resumen.
- Iconos Lucide con una semántica estable, estados con etiquetas además del color, foco visible y controles con nombres accesibles.
- Diseño responsive: navegación lateral colapsada en móvil, tablas desplazables, filtros reorganizados y formularios de aprobación apilados.
- Modo claro/oscuro gestionado por la preferencia local del navegador.

## Límites de la demostración

- Los perfiles de Finanzas, Recursos Humanos, Compras y Operaciones son ejemplos ficticios para mostrar la amplitud prevista de la plataforma. No constituyen una aceptación del alcance de MVP propuesto en `docs/product/`.
- Las integraciones son catálogos estáticos o simuladores locales. No hay credenciales, llamadas de red ni acciones sobre clientes.
- `localStorage` sirve únicamente para conservar el estado sintético en el navegador. No equivale a persistencia de dominio, auditoría backend o durabilidad de Temporal.
- Las decisiones simuladas no demuestran que OPA, MCP Gateway, LangGraph, Temporal u otros componentes de arquitectura estén implementados o técnicamente validados.
- Los apartados de configuración de usuarios, roles y proveedores son futuros/no disponibles; el editor de empleados y la conexión de integraciones no están implementados.

## Referencias de inspiración

Se tomaron como referencia patrones generales de jerarquía de navegación contextual y escaneabilidad (Linear), composición de dashboard con sidebar y tablas (shadcn/ui blocks), y cronologías de ejecución observables (Temporal UI). No se copiaron marca, recursos gráficos ni código de esas interfaces.
