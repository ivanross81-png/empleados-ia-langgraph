# ADR-001 — Despliegue dedicado de un solo tenant

**Estado:** Aceptado  
**Fecha:** 2026-09-21

## Contexto
Los datos empresariales, las credenciales y las integraciones requieren un aislamiento sólido mientras la arquitectura del producto aún está evolucionando. La multi-tenancy dinámica agregaría complejidad de aislamiento antes de que sea necesaria.

## Decisión
El despliegue inicial en producción es dedicado/de un solo tenant por entorno empresarial. El modelo de dominio conserva `tenant_id` para evolución futura, pero el aislamiento en runtime es principalmente un límite de despliegue.

## Consecuencias
- Límite de seguridad más simple.
- Aislamiento de credenciales más fácil.
- Mayor costo de infraestructura por cliente.
- La multi-tenancy futura sigue siendo posible pero no se asume.

## Revisar cuando
La economía unitaria o la escala de clientes hagan que la infraestructura compartida sea materialmente necesaria y se puedan demostrar los requisitos de aislamiento.