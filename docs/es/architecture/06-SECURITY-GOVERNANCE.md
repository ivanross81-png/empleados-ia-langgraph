# Digital Employee Platform — Seguridad y Gobernanza

**Versión:** 0.1.0  
**Estado:** Normativa  
**Creado:** 2026-09-21  
**Actualizado:** 2026-10-19

## 1. Modelo de seguridad

La seguridad se basa en controles por capas. Ningún prompt, modelo, esquema de herramienta ni gateway se considera confiable por sí solo.

```text
Identity → Scope → Policy → Risk → Approval → Capability → Secret → External System → Audit
```

## 2. Identidad

Los usuarios, los servicios y los Empleados Digitales tienen identidades distintas. La identidad humana debe usar OIDC/OAuth2 o un proveedor de identidad empresarial. Las identidades de servicio utilizan credenciales de carga de trabajo/servicio.

### 2.1 Requisitos de identidad empresarial

*Agregado 2026-10-19 — cierra el hallazgo K-47/K-48/K-49 de `docs/reference/KORTIX-CROSS-MATRIX.md`. Los compradores empresariales (banca, seguros, sectores regulados) exigen estos controles antes de habilitar el servicio: son parte del producto, no del entorno del cliente.*

| Requisito | Contrato |
|---|---|
| Inicio de sesión federado | OIDC y/o SAML 2.0 contra el IdP del cliente, con paso explícito de **verificación de dominio** (DNS) antes de confiar en el dominio de correo |
| Enforcement | Un dominio puede **exigir** inicio federado: se rechazan las rutas de contraseña/magic-link/OTP de ese dominio y se terminan las sesiones existentes de esas identidades al activarlo |
| Aprovisionamiento/baja | SCIM 2.0 para el ciclo de vida de usuarios y grupos, manejado por el IdP; la desactivación revoca roles, permisos, tokens y sesiones vivas |
| Mapeo grupos → roles | Los grupos del IdP se mapean a roles de la plataforma; los grupos de aprovisionamiento son autoritativos y no se editan localmente |
| MFA | MFA por usuario y política de cuenta que **exige MFA** con vista previa de cumplimiento; las API keys/service accounts quedan exentas solo si se documenta y se compensa con otros controles |
| Política de sesión | Duración máxima de sesión y timeout por inactividad por cuenta; revocación por sesión y lista de dispositivos para el usuario |
| Baja de personal | Quitar o desactivar a una persona termina sesiones, tokens, permisos y acceso delegado a conectores en una sola operación, con un único evento auditable |

Las excepciones deben ser explícitas: si una identidad administradora queda exenta de algún control, la exención se documenta y se audita.

### 2.2 Permisos a nivel de recurso

La autorización puede acotarse a objetos concretos (un empleado, una conexión de integración, un namespace de conocimiento) y a principales concretos (usuario, grupo, service account). Un permiso puede ser **personal** (usable solo por su titular) o **compartido**; los recursos compartidos requieren un dueño explícito y no pueden ser modificados por un consumidor.

## 3. Autorización

La autorización se evalúa en múltiples niveles:

- tenant/servicio;
- rol de usuario;
- Empleado Digital;
- tarea;
- herramienta;
- servidor MCP;
- recurso donde se soporte;
- riesgo de la acción.

El principio del menor privilegio es el valor por defecto.

## 4. Motor de política OPA

OPA/Rego es el motor de política determinista de referencia. Proporciona una decisión explícita:

- ALLOW;
- DENY;
- REQUIRE_APPROVAL.

Las políticas deben estar versionadas y ser comprobables.

### 4.1 Semántica de la decisión

*Agregado 2026-10-19 — cierra el hallazgo K-04/K-05/K-16 de `docs/reference/KORTIX-CROSS-MATRIX.md`.*

1. **`REQUIRE_APPROVAL` suspende, no falla.** La ejecución espera de forma duradera una decisión humana y se reanuda con esa decisión como entrada (`04` §11). Una implementación que convierte `REQUIRE_APPROVAL` en falla o en reintento es incorrecta.
2. **Granularidad.** La política puede evaluarse sobre la capacidad sola o sobre los **argumentos normalizados** de la invocación concreta, de modo que "transferencia menor a 1.000 se permite, mayor requiere aprobación" sea expresable. La evaluación es determinista y sin efectos.
3. **Precedencia explícita.** Cuando varias reglas matchean, el orden de resolución está definido y documentado (gana la regla más específica; una regla estrecha nunca amplía el acceso en silencio) y está cubierto por pruebas.
4. **Deny by default.** Sin concesión explícita, una capacidad no está disponible para un empleado o una tarea.
5. **No reemplazable por salida del modelo.** Ninguna decisión de política puede inferirse de, o delegarse a, salida del modelo, descripción de herramienta o contenido de terceros (`§10`, `04` §17).

## 5. Motor de riesgo

El riesgo es un insumo para la gobernanza, no un reemplazo de la autorización. El riesgo puede considerar:

- tipo de acción;
- sistema de destino;
- clasificación de datos;
- valor monetario;
- cantidad de registros afectados;
- contexto del empleado/tarea;
- señales de anomalías.

## 6. Gobernanza humana

Las operaciones de alto riesgo pueden requerir aprobación. El registro de aprobación debe identificar la acción exacta y el contexto de versión correspondiente.

La separación de funciones debe impedir que un solicitante apruebe su propia acción restringida cuando la política lo prohíba.

## 7. Secretos

Use Vault o un administrador de secretos equivalente con respaldo KMS. Los secretos deben inyectarse lo más tarde posible y existir únicamente durante el tiempo de vida mínimo requerido.

Nunca almacene secretos en:

- prompts;
- memoria del agente;
- Git;
- logs normales;
- cargas de auditoría;
- definiciones de tarea;
- trazas del modelo.

### 7.1 Exposición de credenciales al ejecutor

*Agregado 2026-10-19 — cierra el hallazgo K-50/K-51 de `docs/reference/KORTIX-CROSS-MATRIX.md`.*

"Nunca en el prompt" es necesario pero no suficiente: el ejecutor puede ser un proceso aislado, un contenedor o un sandbox que corre código generado o HTTP arbitrario. El modo de exposición de una credencial es por lo tanto una decisión explícita, por integración:

| Modo | Significado | Cuándo es aceptable |
|---|---|---|
| **Intermediado (preferido)** | La credencial nunca llega al ejecutor. La llamada la hace el componente de enforcement (MCP Gateway / adaptador de integración), que inyecta el secreto en el borde de red hacia un destino allowlisteado. El ejecutor envía un marcador que solo tiene sentido a través del mediador. | Por defecto para todas las credenciales empresariales |
| **Inyectado** | La credencial se entrega al entorno del ejecutor por un tiempo acotado. | Solo cuando la intermediación es imposible, con excepción registrada, vida corta, alcance estrecho y destino monitoreado |
| **Deshabilitado** | La credencial no está disponible para ningún camino de ejecución. | Credenciales que el empleado no necesita, o retenidas durante un incidente |

Requisitos adicionales:

- las respuestas que devuelven el eco de una credencial intermediada se redactan antes de llegar al modelo o a los logs;
- un pedido intermediado a un destino **no** allowlisteado debe fallar cerrado (no debe mutar en otro lado en silencio);
- cada uso intermediado se audita (quién, qué credencial, qué destino, qué ejecución);
- verificación por sondas: (1) el entorno del ejecutor contiene solo un marcador, nunca el valor; (2) una llamada de punta a punta a través del mediador funciona y el valor crudo nunca aparece en logs, trazas ni estado del agente;
- la intermediación no sustituye la restricción de egreso (`§12`): ambas son necesarias para integraciones restringidas.

## 8. DLP y datos personales (PII)

Un gateway DLP/PII se ubica antes de la transferencia a un LLM externo cuando los datos salen del entorno de confianza.

Las capacidades pueden incluir:

- detección;
- clasificación;
- redacción (redaction);
- tokenización/seudonimización;
- decisión de permitir/bloquear;
- políticas específicas del proveedor.

Microsoft Presidio o un servicio DLP empresarial pueden usarse como componente de implementación; el contrato arquitectónico es el punto de control, no el proveedor.

## 9. Clasificación de datos

Clases mínimas:

- PUBLIC
- INTERNAL
- CONFIDENTIAL
- RESTRICTED
- PII
- FINANCIAL
- PCI
- SECRET

Una clasificación puede imponer restricciones de modelo, almacenamiento, logging y aprobación.

## 10. Defensa contra inyección de instrucciones

El texto recuperado y el contenido externo no son de confianza. Los controles incluyen:

- separación clara entre datos e instrucciones;
- allowlists de herramientas;
- validación de esquemas;
- política determinista;
- validación de salida;
- sin autoridad derivada solo del texto;
- presupuestos de ejecución acotados.

## 11. Seguridad de las herramientas

Las definiciones de herramienta deben declarar:

- capacidad;
- esquema de entrada;
- clase de riesgo;
- nivel de efecto secundario;
- soporte de idempotencia;
- scopes requeridos;
- impacto en la clasificación de datos.

## 12. Seguridad de red

Las integraciones externas deben usar redes privadas cuando estén disponibles, TLS, restricciones de salida (egress) y destinos en allowlist. El MCP Gateway debe ser la ruta de salida controlada para las acciones empresariales.

## 13. Auditoría

Los registros de auditoría deben responder qué/quién/cuándo/dónde/por qué e incluir referencias a políticas y aprobaciones. No registre secretos ni datos personales innecesarios.

## 14. Modelo de amenazas

Amenazas principales:

- inyección de instrucciones;
- robo de credenciales;
- permisos excesivos de herramientas;
- servidor MCP malicioso o comprometido;
- exfiltración de datos;
- reproducción (replay) de eventos/acciones;
- escalada de privilegios;
- aprobación no autorizada;
- denegación de servicio;
- automatización destructiva accidental.

## 15. Pruebas de seguridad

Categorías requeridas:

- escaneo de dependencias;
- SAST;
- escaneo de secretos;
- pruebas de autorización de API;
- pruebas de contrato/seguridad de MCP;
- suite de regresión de inyección de instrucciones;
- pruebas de regresión de DLP;
- escaneo de contenedores/imágenes;
- pruebas de penetración antes de una exposición importante en producción.

## 16. Principio de gobernanza

La autonomía se otorga mediante capacidad y política explícitas, no por la aparente competencia del modelo.

## 17. Protección del estado del runtime y de los checkpoints

*Agregado 2026-10-19 — cierra la brecha C-1 (hallazgo K-L1) de `docs/reference/KORTIX-CROSS-MATRIX.md`.*

El almacén de estado propio del runtime del agente (`04` §21) es un almacén de datos dentro del límite de confianza y recibe el mismo tratamiento que cualquier otro:

- está clasificado y pasa por DLP; no debe convertirse en un bypass de los controles del contexto del modelo;
- no debe contener credenciales, tokens crudos, documentos externos completos ni salidas de herramientas sin restricción (guardar referencias, `05` §3/§21);
- tiene política explícita de retención y borrado, y el borrado se verifica (una ejecución reanudada debe seguir funcionando; una vencida debe estar borrada);
- el acceso está restringido al runtime y a operadores con propósito legítimo, y todo acceso administrativo se audita;
- está incluido en el modelo de amenazas: un atacante que pueda escribir ahí podría inyectar instrucciones en un agente que se reanuda, exactamente como con una salida de herramienta envenenada.

## 18. Integridad de dependencias y licencias

*Agregado 2026-10-19 — cierra la brecha C-6 de `docs/reference/KORTIX-CROSS-MATRIX.md`; detalle en `docs/reference/STACK-LICENCIAS.md`.*

- Toda dependencia nueva (de runtime o de build) requiere licencia declarada y clasificación (permisiva / condicional / restringida) antes de entrar al proyecto.
- Se produce un SBOM por release y se escanea tanto por vulnerabilidades como por obligaciones de licencia.
- Las licencias de copyleft fuerte y las source-available son una decisión explícita, nunca un accidente: se revisan antes de adoptarlas y otra vez antes de entregar un bundle de instalación privada.
- Las dependencias cuya licencia prohíbe ofrecer el software como servicio hospedado son incompatibles con el modelo SaaS (ver `STACK-LICENCIAS` §4).
