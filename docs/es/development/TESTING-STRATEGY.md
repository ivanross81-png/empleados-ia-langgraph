# Estrategia de Pruebas

**Versión:** 0.1.0  
**Creado:** 2026-09-21  
**Actualizado:** 2026-10-19

## 1. Pirámide de pruebas

```text
                 E2E / Business Scenarios
              Agent Evaluation / Security
           Integration / MCP / Persistence
        Contract / API / Workflow Tests
              Unit / Domain Tests
```

## 2. Pruebas unitarias

Cubrir invariantes de dominio, transiciones de estado, helpers de política, esquemas, clasificación de reintentos y transformaciones deterministas.

## 3. Pruebas de contrato

Validar los esquemas de API, eventos y MCP. Incluir casos de compatibilidad hacia atrás y de rechazo.

## 4. Pruebas de integración

Usar infraestructura real de pruebas de PostgreSQL/Temporal/MCP cuando sea práctico. Verificar el comportamiento de transacciones y fallos.

## 5. Pruebas de seguridad

Cubrir bypass de autorización, fuga de secretos, inyección de instrucciones (prompt injection), replay, restricciones de SSRF/egress y abuso de herramientas.

## 6. Pruebas del agente

Probar:

- la selección de herramientas;
- las transiciones de estado;
- el comportamiento de la política;
- el comportamiento de aprobación;
- la recuperación;
- la construcción de contexto.

## 7. Pruebas de evaluación

Mantener escenarios de negocio dorados. Medir resultado, trayectoria, calidad de recuperación y cumplimiento de la política.

## 8. Pruebas de fallos

Probar explícitamente timeouts, requests duplicadas, reinicios de workers, cortes externos, éxito parcial, circuit breakers y recuperación de DLQ.

## 9. Gates de CI

Gates mínimos:

- formateo/linting;
- verificación de tipos;
- pruebas unitarias;
- análisis de seguridad/estático;
- pruebas de contrato;
- suite de evaluación relevante.

## 10. Datos de prueba

Usar solo datos sintéticos o sanitizados tipo enterprise. Nunca usar secretos de producción en CI.
