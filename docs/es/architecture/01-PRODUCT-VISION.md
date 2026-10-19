# Digital Employee Platform — Visión de Producto

**Versión:** 0.1.0  
**Estado:** Línea base normativa de producto

## 1. Visión

La plataforma permite a las empresas desplegar **Empleados Digitales**: trabajadores de software con un rol, responsabilidades, habilidades, herramientas, políticas, memoria y tareas definidos, que pueden realizar trabajo operativo de forma autónoma y que al mismo tiempo permanecen observables, gobernables e interrumpibles por humanos.

El producto no es simplemente un chatbot. Un chatbot responde a una conversación. Un Empleado Digital posee una responsabilidad de negocio y puede ejecutar un flujo de trabajo a través de sistemas.

## 2. Definición de producto

Un Empleado Digital es:

> **Identidad + Rol + Alma + Habilidades + Herramientas + Políticas + Memoria + Tareas + Gobernanza**

- **Identidad:** quién es el empleado dentro de la plataforma y del contexto empresarial.
- **Rol:** responsabilidad de negocio y alcance.
- **Alma:** guía de comportamiento/personalidad; nunca un límite de seguridad.
- **Habilidades:** capacidades y procedimientos reutilizables.
- **Herramientas:** capacidades controladas expuestas mediante MCP u otros adaptadores aprobados.
- **Políticas:** restricciones deterministas y reglas de autorización.
- **Memoria:** información retenida para trabajo futuro.
- **Tareas:** responsabilidades recurrentes o bajo demanda.
- **Gobernanza:** aprobaciones, auditoría, versionado y controles operativos.

## 3. Ejemplos

- Empleado de cobranzas: identifica facturas vencidas, prioriza cuentas, redacta acciones de contacto y solicita aprobación para cambios sensibles.
- Empleado de operaciones de TI: clasifica incidentes, consulta sistemas de monitoreo, propone remediación y ejecuta cambios aprobados de bajo riesgo.
- Empleado de compras: compara información de proveedores, verifica la política y prepara solicitudes de compra.
- Empleado de finanzas: concilia transacciones y abre excepciones para revisión humana.

## 4. Modelo de activación

Un Empleado Digital puede ser activado por:

- Mensaje de canal.
- Horario.
- Evento de negocio.
- Solicitud de API.
- Acción manual.

El mecanismo de activación crea una **Solicitud de ejecución**. No elude la arquitectura de ejecución.

## 5. Pilares del producto

### Ejecución autónoma

El empleado debe completar trabajo de varios pasos sin requerir un humano para cada acción intermedia.

### Autonomía controlada

La autonomía está acotada por políticas, permisos de herramientas, controles de riesgo, presupuestos, timeouts y requisitos de aprobación.

### Integración empresarial

El empleado debe trabajar con los sistemas empresariales existentes en lugar de exigir reemplazar CRM, ERP, ITSM, bases de datos o plataformas de mensajería.

### Trabajo duradero

Una tarea puede durar segundos, horas o días. La aprobación humana, las caídas externas y los reintentos no deben destruir el estado de ejecución.

### Explicabilidad

Toda acción significativa debe ser atribuible a una ejecución, una versión, una decisión de política y una invocación de capacidad.

## 6. Límites del producto

La plataforma es responsable de la orquestación, la gobernanza, el estado de ejecución, el control de integraciones, la memoria/contexto y la observabilidad.

No es responsable de convertirse en el sistema de registro oficial de cada dominio de negocio. CRM, ERP, HR, ITSM y otras aplicaciones empresariales siguen siendo los autoritativos de sus propios datos de negocio.

## 7. Modelo de despliegue inicial

El primer modelo de producción es **dedicado/tenant único por entorno empresarial**. Esto significa que los datos, la configuración del runtime, las credenciales y los recursos operativos se aíslan por límite de despliegue.

La multi-tenencia dinámica puede considerarse más adelante, pero no es un requisito previo para validar el producto.

## 8. Criterios de éxito

Un Empleado Digital útil debería poder medirse por:

- tasa de finalización de tareas;
- uso correcto de herramientas;
- cumplimiento de políticas;
- tasa de aprobación humana y tasa de excepciones;
- duración de la ejecución;
- costo y consumo de tokens;
- recuperación ante fallas;
- calidad de los resultados finales;
- completitud de la auditoría.

El producto debe optimizar para **resultados de negocio bajo controles explícitos**, no para máxima autonomía.

## 9. No objetivos

El MVP no intenta:

- reemplazar cada aplicación empresarial;
- proporcionar control de computadora sin restricciones;
- permitir que un LLM decida la autorización;
- crear un super-agente autónomo de propósito general sin responsabilidad acotada;
- garantizar salida determinista del LLM;
- eliminar a los humanos de los procesos de gobernanza de alto riesgo.

## 10. Norte del producto (north star)

La plataforma debería hacer posible que una empresa diga:

> “Este es el trabajo. Este es el empleado responsable. Estos son los sistemas que puede usar. Estas son las políticas que debe seguir. Estas son las situaciones donde un humano debe decidir. Muéstrame exactamente qué ocurrió.”