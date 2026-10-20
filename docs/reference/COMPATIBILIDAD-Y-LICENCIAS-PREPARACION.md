---
type: reference
status: active
created: 2026-10-19
updated: 2026-10-19
tags: [digital-employee, licencias, compatibilidad, sbom, riesgos, dp-5, dp-6]
---

# Compatibilidad y licencias — preparación de las verificaciones (DP-5, DP-6)

> **No normativo.** Preparación del trabajo autorizado por el responsable del producto el **2026-10-19** (DP-5, DP-6 de `DECISIONES-PENDIENTES.md`). Reúne lo que hay que probar, con qué versión, y qué entregables producir.
> **Lo que este documento NO es:** no es una validación técnica, no es un SBOM, no es una revisión legal. **Hermes no emite aprobaciones legales.** La **distribución comercial queda bloqueada** hasta completar las verificaciones requeridas y obtener la revisión legal correspondiente.

## 1. Alcance autorizado

Autorizado: **pruebas de compatibilidad** de las sustituciones aceptadas por `ADR-011` y **preparación** de la revisión de licencias del artefacto distribuible. **No** autorizado: declarar validada una sustitución sin prueba reproducible, ni emitir un juicio legal.

## 2. Estado de cada sustitución

Versiones de referencia **verificadas el 2026-10-19** consultando la API de GitHub de cada proyecto (licencia declarada por el repositorio y última release publicada). Comando reproducible:

```bash
curl -s -H "Authorization: token $GITHUB_TOKEN" https://api.github.com/repos/<org>/<repo> \
  | python3 -c "import sys,json; d=json.load(sys.stdin); print((d.get('license') or {}).get('spdx_id'))"
curl -s -H "Authorization: token $GITHUB_TOKEN" https://api.github.com/repos/<org>/<repo>/releases/latest \
  | python3 -c "import sys,json; print(json.load(sys.stdin).get('tag_name'))"
```

| Sustituye a | Componente adoptado | Repositorio | Licencia verificada | Versión de referencia | Publicada |
|---|---|---|---|---|---|
| Redis 8 | **Valkey** | `valkey-io/valkey` | **BSD-3-Clause** | **9.1.2** | 2026-09-01 |
| HashiCorp Vault | **OpenBao** | `openbao/openbao` | **MPL-2.0** | **v2.7.1** | 2026-10-01 |
| Grafana | **Perses** | `perses/perses` | **Apache-2.0** | **v0.54.0** | 2026-07-29 |
| Loki | **VictoriaLogs** | `VictoriaMetrics/VictoriaLogs` | **Apache-2.0** | **v1.53.0** | 2026-10-01 |
| Loki (alternativa) | **OpenSearch** | `opensearch-project/OpenSearch` | **Apache-2.0** | **3.9.0** | 2026-09-29 |
| MinIO | **SeaweedFS** | `seaweedfs/seaweedfs` | **Apache-2.0** | **4.48** | 2026-09-28 |

**Esto es una *verificación de licencia*** (leída en la fuente del proyecto), **no una validación**: no dice nada sobre nuestro uso real de cada componente. La distinción está fijada en `STACK-LICENCIAS.md` y en `DECISIONES-PENDIENTES.md` (*Capas de estado*).

**Pendiente y bloqueante:** el **árbol transitivo** de cada componente y la **variante de licencia del artefacto distribuible** (por ejemplo, una imagen que empaquete una edición con licencia adicional). Ninguna de las dos está verificada.

## 3. Usos reales que hay que probar

La prueba debe ejercitar **nuestros usos**, no la compatibilidad genérica de la API. Por componente, según el rol que le dan los normativos:

| Componente | Rol en el paquete | Usos a probar | Uso declarado hoy |
|---|---|---|---|
| **Valkey** (`02` §4, `05` §1, `10` §1) | Caché y coordinación transitoria; límites de tasa | Claves con vencimiento, operaciones atómicas usadas para *rate limiting*, coordinación transitoria entre réplicas, y **solo si se usan**: pub/sub y scripts Lua | `05` §1 lo declara **nunca autoritativo** |
| **OpenBao** (`04` §4, `06` §7, `07`) | Resolución de credenciales en runtime | Autenticación de la aplicación, lectura de secretos por ruta y versión, **inyección sin exponer el valor al modelo**, rotación y revocación. Verificar que no se usa ninguna API exclusiva de la edición con licencia adicional | `ADR-007` sigue válido: OpenBao es la implementación del "Vault o KMS equivalente" |
| **Perses** (`09` §2) | Paneles y dashboards | Consultas al almacén de métricas, definiciones versionadas en repositorio, alertas si se usan | Sustituto declarado de Grafana |
| **VictoriaLogs** o **OpenSearch** (`09` §2) | Logs operativos | Ingesta, consulta por campo, retención declarada (30 días), redacción antes de la ingesta | Elección entre ambos **no decidida** |
| **SeaweedFS** (`05` §21, `10`) | Contenido de artefactos por referencia | Ciclo de vida: crear, versionar, retener, borrar **preservando el registro de auditoría**, y entrada en el backup/restore | Sustituto de MinIO; el medio de almacenamiento sigue abierto (DP-11) |
| **PostgreSQL en esquema separado** (`ADR-012`) | Checkpoints del runtime | Rol sin acceso al dominio, retención de 7 días, serialización restringida | **Decisión adoptada, prueba pendiente** (DP-1) |

## 4. Entregables a producir (ninguno está producido todavía)

| # | Entregable | Estado | Con qué se haría | Bloqueo actual |
|---|---|---|---|---|
| E-1 | Matriz de compatibilidad con pruebas reproducibles | **No producido** | Un caso por fila de §3, con versión fijada y resultado registrado | Requiere entorno de prueba con los componentes desplegados (CT aparte) |
| E-2 | Inventario de dependencias **directas y transitivas** | **No producido** | Generadores estándar por ecosistema (pip/uv, npm, Go) sobre el árbol real | **No hay código ni lockfile en este repositorio**: el inventario pertenece a la implementación, no al paquete documental |
| E-3 | **SBOM** del artefacto empaquetado | **No producido** | Syft/Trivy (o equivalente) sobre las imágenes y el artefacto final | **No existe artefacto empaquetado** del que extraerlo |
| E-4 | Verificación de licencias y **avisos incluidos** | **No producido** | `THIRD-PARTY-NOTICES` autogenerado + revisión de la variante de licencia de cada imagen | Depende de E-2/E-3 |
| E-5 | Inventario de **imágenes y versiones exactas** (digests) | **No producido** | Lista por digest, no por etiqueta | No hay imágenes publicadas |
| E-6 | Informe de riesgos y puntos que necesitan **revisión legal** | **Borrador en §5** | Este documento + E-1…E-5 | La revisión legal la hace una persona; **Hermes no la emite** |

**Por qué E-2…E-5 no se pueden producir todavía:** este repositorio es el **paquete documental** (70+ archivos `.md`), no la implementación. No contiene código, dependencias ni artefacto empaquetado. Producir esos entregables requiere que exista el software; **inventarlos sería exactamente lo que el encargo prohíbe**.

## 5. Riesgos y puntos que necesitan revisión legal

| # | Riesgo | Gravedad | Mitigación / dónde se sigue |
|---|---|---|---|
| R-1 | **Árbol transitivo sin verificar**: una dependencia indirecta puede traer una licencia no libre | Alta | `license gate` de `06` §18 + SBOM por release (I-11, DP-6) |
| R-2 | **Variante de licencia de la imagen empaquetada** distinta de la del repositorio (ediciones `ee/`, binarios con licencia adicional) | Alta | Inventario por digest + avisos incluidos (E-4, E-5); nunca activar `enterprise/`, `ee/` ni `wl/` |
| R-3 | **MPL-2.0 de OpenBao**: copyleft **por archivo**, no por enlace | Media | Revisión legal del modo de distribución (contenedor sin modificar vs. modificado) |
| R-4 | Sustitución que **funciona en la API pero no en nuestro uso** (p. ej. una operación atómica de Valkey distinta) | Media | E-1: probar los usos reales, no la compatibilidad genérica |
| R-5 | **Consecuencias contractuales** frente a clientes por componentes o avisos omitidos | Alta | Revisión legal antes de distribuir; la distribución comercial **sigue bloqueada** |
| R-6 | **Garage** (almacén de objetos) sin licencia verificada | Media | No proponerlo como sustituto hasta verificarla (`DECISIONES-PENDIENTES.md` DP-6) |
| R-7 | Confundir **verificación de licencia** con **validación** o con **aprobación legal** | Alta (proceso) | Vocabulario de capas en `DECISIONES-PENDIENTES.md`; este documento declara su propio límite |

## 6. Criterio de cierre

La distribución comercial se desbloquea cuando: E-1 tiene resultados registrados por uso real; E-2 y E-3 existen sobre el artefacto que se va a distribuir; E-4 y E-5 están revisados; y **una persona con responsabilidad legal** emitió su revisión. Hasta entonces, el estado correcto es: **licencias directas verificadas, compatibilidad sin validar, artefacto sin revisar, distribución bloqueada**.
