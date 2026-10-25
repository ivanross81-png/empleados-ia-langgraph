# Digital Employee Platform — frontend de demostración

Consola React/TypeScript navegable para explorar empleados digitales, ejecuciones, decisiones de política y aprobaciones. **Todo el comportamiento es local y demostrativo; no existe conexión con el backend ni con Temporal, LangGraph, OPA, MCP o sistemas empresariales.** Los datos son sintéticos.

## Requisitos

- Node.js 20.19+ o 22.12+.
- npm 10+.

## Instalación y ejecución

Desde este directorio (`frontend/`):

```bash
npm install
npm run dev
```

Vite mostrará la URL local, normalmente `http://localhost:5173`.

## Comprobaciones

```bash
npm run lint
npm run typecheck
npm test
npm run build
npm run preview
```

## Escenarios de demostración

En **Nueva ejecución**, elige un perfil y uno de estos recorridos:

- **Requiere aprobación:** la ejecución se suspende hasta que una persona con el rol demostrativo de aprobación decida. La acción se revalida antes de continuar; aprobar/rechazar solicita motivo y confirmación.
- **Permitida por política:** registra un efecto local simulado.
- **Denegada por política:** cierra sin invocar la herramienta.
- **Fallo simulado:** muestra un error tipado y ningún efecto.
- **Respuesta incierta:** simula un efecto registrado cuyo acuse se perdió. Reconciliar o reintentar con la misma clave recupera el resultado sin duplicar el efecto.

La consola parte de ejecuciones sintéticas para que el dashboard y la bandeja se puedan explorar desde el primer inicio. La información se conserva en un snapshot `schemaVersion: 2` del `localStorage` bajo `digital-employee-prototype-v2`; el esquema anterior `digital-employee-prototype-v1` se valida y migra de forma controlada.

### Qué ocurre si recargas durante una simulación

- Una ejecución `PENDING` o `RUNNING` sin efecto en el ledger se cierra con el error tipado `MOCK_EXECUTION_INTERRUPTED_ON_RELOAD`; no queda procesando para siempre.
- Si el ledger ya registró el efecto, se restaura el resultado a partir de su clave de idempotencia sin repetirlo.
- Una aprobación `PENDING` permanece pendiente y nunca se resuelve por tiempo. Si ya estaba aprobada, se reanuda solo tras volver a validar acción, huella, rol y versión de política.
- Un resultado `OUTCOME_UNCERTAIN` permanece incierto si su efecto consta en el ledger; se reconcilia explícitamente. Si falta ese registro, el reintento se bloquea y se muestra un fallo controlado.
- JSON corrupto, estructura inválida o versión incompatible restaura los datos sintéticos iniciales y muestra un aviso.

El ledger de efectos simulados es independiente de los registros de ejecución. Es almacenamiento local del navegador, no una base de datos ni durabilidad de Temporal. Para iniciar de cero, usa la consola de desarrollo del navegador y borra las claves `digital-employee-prototype-v2` y `digital-employee-prototype-v1`.

## Dependencias

- React, React DOM, TypeScript y Vite: aplicación SPA tipada y servidor/build local.
- Tailwind CSS: pipeline de estilos y utilidades; tokens, componentes y sistema visual se definen en `src/styles.css`.
- shadcn/ui: enfoque de componentes componibles y patrones de interfaz accesibles, implementados como primitivas propias en `src/components/`. No se incorpora como dependencia runtime ni se añade Radix sin necesidad para este prototipo.
- Lucide React: iconografía coherente.
- React Router: rutas de las vistas.
- ESLint, Vitest, Testing Library y jsdom: lint, pruebas del servicio simulado y pruebas de interacción accesibles.

Las dependencias seleccionadas usan licencias libres permisivas. Este inventario funcional no sustituye el escaneo del árbol transitivo/SBOM requerido antes de distribuir un artefacto.
