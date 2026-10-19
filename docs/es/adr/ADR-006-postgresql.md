# ADR-006 — PostgreSQL como Sistema de registro oficial (system of record) primario

**Estado:** Aceptado

## Contexto
La plataforma necesita estado relacional de dominio, transacciones, metadatos de auditoría y recuperación (retrieval) híbrida inicial.

## Decisión
PostgreSQL es el Sistema de registro oficial primario. pgvector y la búsqueda de texto completo de PostgreSQL brindan las capacidades de recuperación iniciales.

## Consecuencias
El stack inicial se mantiene compacto. Más adelante se puede incorporar una base de datos vectorial especializada si la escala o los requisitos de recuperación lo justifican.