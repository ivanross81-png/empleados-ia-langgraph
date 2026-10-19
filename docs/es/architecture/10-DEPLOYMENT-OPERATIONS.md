# Digital Employee Platform — Despliegue y Operaciones

**Versión:** 0.1.0  
**Estado:** Línea base normativa

## 1. Modelo de despliegue

El objetivo inicial de producción es un despliegue dedicado por empresa. La plataforma debe poder desplegarse sin Kubernetes.

Una topología de referencia con Docker Compose:

```text
reverse-proxy
frontend
api
worker
mcp-gateway
temporal
temporal-ui
postgres
redis
litellm
otel-collector
langfuse
```

Vault/KMS puede ser externo al despliegue.

## 2. Separación del runtime

Como mínimo, la API, el worker y el MCP Gateway deben poder reiniciarse de manera independiente. Temporal y PostgreSQL son dependencias de infraestructura.

## 3. Configuración

La configuración es específica de cada entorno y no debe contener Secretos en el control de fuentes. Usar variables de entorno para la configuración no sensible y Vault/KMS para los Secretos.

## 4. Secretos

La rotación de Secretos no debe exigir reconstruir las imágenes de la aplicación. Las Credenciales deben ser de corta duración donde el proveedor lo soporte.

## 5. Operaciones de base de datos

PostgreSQL requiere:

- backups automáticos;
- pruebas de restauración;
- versionado de migraciones;
- límites de conexiones;
- monitoreo;
- alertas de capacidad de disco.

## 6. Operaciones de Temporal

Temporal requiere persistencia durable, monitoreo de workers, monitoreo de colas de tareas y controles del historial de workflows. Los historiales de larga duración deben usar estrategias adecuadas de Continue-As-New donde sea necesario.

## 7. Escalado

Escalar de manera independiente:

- réplicas de API;
- réplicas de workers de agente;
- réplicas del MCP Gateway;
- workers específicos de integración donde sea necesario.

Las colas de tareas de Temporal brindan un límite útil de aislamiento/escalado.

## 8. Protección de sistemas externos

Usar límites de peticiones, límites de concurrencia y cortacircuitos (circuit breakers) por integración. Un Empleado Digital no debe saturar un ERP legado solo porque el modelo generó muchas Acciones en paralelo.

## 9. Recuperación ante desastres

Definir RPO/RTO por despliegue. Los procedimientos de backup y restauración deben probarse, no solo documentarse.

Los activos durables críticos incluyen:

- PostgreSQL;
- persistencia de Temporal;
- definiciones de configuración/versiones;
- índices de conocimiento/datos fuente cuando no son reproducibles;
- registros de auditoría.

## 10. Estrategia de actualización

Usar actualizaciones progresivas (rolling) o controladas donde sea posible. Las migraciones de esquema deben seguir patrones expandir/contraer para la compatibilidad.

## 11. Chequeos de salud

Los servicios requieren chequeos de vivacidad/disponibilidad. La salud de las dependencias debe distinguirse de la salud del proceso.

## 12. Respuesta a incidentes

Los operadores deben poder:

- pausar nuevas Ejecuciones;
- deshabilitar un Empleado Digital;
- deshabilitar un servidor de herramienta/MCP;
- abrir un cortacircuitos (circuit breaker);
- cancelar Ejecuciones;
- inspeccionar la cola de mensajes no entregados (DLQ);
- revocar Credenciales;
- restaurar desde backup.

## 13. Operaciones de seguridad

Mantener escaneo de vulnerabilidades, actualizaciones de imágenes, actualizaciones de dependencias, revisiones de accesos, rotación de Secretos y revisión de Auditoría.

## 14. Planificación de capacidad

Realizar seguimiento de:

- Ejecuciones por minuto;
- Ejecuciones concurrentes;
- llamadas de herramienta promedio por ejecución;
- tokens por ejecución;
- latencia de MCP;
- carga de base de datos;
- tamaño del historial de workflows.

Los límites de capacidad deben ser explícitos en lugar de descubrirse por cortes.

## 15. Estrategia de entornos

Entornos mínimos:

- desarrollo;
- prueba/CI;
- staging;
- producción.

Las Credenciales y los datos de producción nunca deben reutilizarse en desarrollo.

## 16. Principio de despliegue

La arquitectura debe permanecer válida ya sea que el despliegue sea una única VM, un pequeño clúster Docker o un entorno Kubernetes posterior. La sofisticación operativa puede aumentar sin cambiar los contratos de dominio.

## 17. Ciclo de instalación y actualización en instalaciones privadas

*Agregado 2026-10-19 — cierra el hallazgo K-57/K-59/K-60/K-61 (P-17) de `docs/reference/KORTIX-CROSS-MATRIX.md`.*

Una instalación privada tiene su propio ciclo de vida; debe ser repetible, diagnosticable y reversible por alguien que no es el equipo de la plataforma.

| Etapa | Contrato mínimo |
|---|---|
| Bootstrap | Camino de instalación documentado e **idempotente** para un host limpio (paquetes, Compose, configuración inicial) que se pueda re-ejecutar sin riesgo tras una falla |
| Primer ingreso | Identidad de arranque definida (administrador de plataforma) y decisión explícita sobre si el autorregistro está abierto; una instalación que deja el registro abierto con correo no verificado es una vulnerabilidad, no un default |
| Configuración del entorno | Modo de alcance (dominio público con TLS, red privada, túnel), egreso permitido, wildcards de DNS para previews/artefactos y la lista de dependencias externas que la instalación requiere |
| Autodiagnóstico | Un único comando/endpoint que verifica prerrequisitos, configuración, disponibilidad de secretos, conectividad a dependencias declaradas y estado de backups, devolviendo fallas accionables |
| Backup y restore | El backup cubre configuración, material de secretos, base de datos, persistencia del workflow, datos de conocimiento y auditoría; **el restore se prueba**, no se asume (`§9`) |
| Actualización | Se prefiere un camino desatendido con: chequeos previos, migraciones, despliegue con health checks y **rollback automático** cuando la salud falla. La versión de cada componente queda fijada (imágenes por digest) y volver a la release anterior es una operación documentada |
| Compatibilidad | Las migraciones de base y configuración siguen expand/contract (`§10`); el camino de actualización soportado entre versiones menores está documentado para que un cliente no quede en un estado no soportado |
| Endurecimiento | Baseline documentado: solo los puertos necesarios expuestos, archivos de secretos con permisos restringidos, documentación pública de API deshabilitada cuando no se requiere, egreso restringido y auditoría activada |
| Baja del servicio | Procedimiento documentado e irreversible por intención para retirar la instalación, incluida la destrucción del material de secretos y, cuando corresponda, de los datos de auditoría |

## 18. Metering comercial y entitlements

*Agregado 2026-10-19 — cierra el hallazgo K-42 (P-12) de `docs/reference/KORTIX-CROSS-MATRIX.md`.*

El producto se vende como SaaS y como instalación privada; ambos necesitan los mismos hechos medidos, aunque el enforcement difiera:

- **Metering:** consumo de tokens/costo de modelo, ejecuciones, Empleados Digitales activos y almacenamiento (conocimiento + artefactos), registrado por tenant/período y exportable;
- **Entitlements:** qué capacidades están habilitadas para un tenant/despliegue (por ejemplo identidad federada, SCIM, aislamiento adicional, ventanas de retención) y su estado, para que el runtime rechace limpiamente por entitlement y no por omisión;
- **Punto de enforcement:** los chequeos de entitlement ocurren en el plano de control al crear ejecuciones y al cambiar configuración; nunca debilitan controles de seguridad (un entitlement puede deshabilitar una funcionalidad, nunca una protección);
- **Instalaciones privadas:** el metering puede deshabilitarse o reportarse offline; los entitlements forman parte del archivo de licencia del despliegue y se verifican al arrancar con estado auditable;
- **Separación:** los datos de metering son metadatos comerciales; no deben duplicar ni reemplazar los registros de auditoría (`09` §6).