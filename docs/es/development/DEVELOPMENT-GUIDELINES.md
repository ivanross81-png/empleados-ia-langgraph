# Guía de Desarrollo

**Versión:** 0.1.0

## 1. Primera regla

Leer `docs/architecture/00-ARCHITECTURE-INDEX.md` antes de realizar cambios arquitectónicos.

## 2. Antes de codificar

Identificar:

1. el contexto delimitado (bounded context);
2. el componente propietario;
3. el objeto de dominio;
4. el contrato público afectado;
5. la clasificación de seguridad;
6. los requisitos de persistencia;
7. la semántica de fallo/reintento;
8. los requisitos de observabilidad;
9. las pruebas requeridas.

## 3. Cambios arquitectónicos

No resolver un problema local de implementación cambiando la arquitectura en silencio. Crear o actualizar un ADR cuando cambian las responsabilidades, los límites o los invariantes de los componentes.

## 4. Capas (Layering)

Preferir:

```text
API → Application → Domain → Infrastructure
```

El runtime del agente y los adaptadores de integración pueden tener límites especializados, pero no deben eludir la política ni los contratos de ejecución.

## 5. Efectos secundarios

Los efectos secundarios externos deben quedar detrás de interfaces explícitas y del contexto de ejecución. Hacerlos idempotentes siempre que sea posible.

## 6. Errores

Usar categorías de error tipadas/de dominio. No usar manejo genérico de excepciones para convertir cada fallo en un reintento.

## 7. Documentación

Todo contrato público, comportamiento arquitectónico y decisión de seguridad no obvia debe documentarse.

## 8. Pull requests

Un PR debe declarar los documentos/ADRs de arquitectura afectados, el impacto de migración, el impacto de seguridad, las pruebas y la estrategia de rollback.