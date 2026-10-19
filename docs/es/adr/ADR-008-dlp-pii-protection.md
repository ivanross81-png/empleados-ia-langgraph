# ADR-008 — Puerta de enlace DLP/PII previa a la transferencia a LLM externo

**Estado:** Aceptado  
**Fecha:** línea base v0.1.0 — fecha exacta no registrada (ver auditoría 2026-10-19)

## Contexto
Los proveedores de modelos externos pueden recibir información empresarial que contiene datos personales, financieros o restringidos.

## Decisión
Introducir un punto de control de DLP/PII (Prevención de fuga de datos/Datos personales) antes de la transferencia a un LLM externo. Puede clasificar, enmascarar (redactar), tokenizar o bloquear contenido según la Política.

## Consecuencias
El enmascaramiento puede afectar la calidad del modelo, por lo que la Evaluación debe medir tanto la protección como la calidad de la tarea.
