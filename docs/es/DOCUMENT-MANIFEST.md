# Manifiesto de Documentos

| # | Archivo | Rol |
|---:|---|---|
| 1 | `docs/architecture/00-ARCHITECTURE-INDEX.md` | Mapa de arquitectura y reglas de autoridad |
| 2 | `docs/architecture/01-PRODUCT-VISION.md` | Definición y alcance del producto |
| 3 | `docs/architecture/02-ENTERPRISE-ARCHITECTURE.md` | Arquitectura de sistema |
| 4 | `docs/architecture/03-DOMAIN-MODEL.md` | Modelo de dominio |
| 5 | `docs/architecture/04-RUNTIME-EXECUTION-ARCHITECTURE.md` | Runtime/ejecución |
| 6 | `docs/architecture/05-PERSISTENCE-API-CONTRACTS.md` | Persistencia y APIs |
| 7 | `docs/architecture/06-SECURITY-GOVERNANCE.md` | Seguridad/gobierno |
| 8 | `docs/architecture/07-MCP-INTEGRATION-ARCHITECTURE.md` | Integración MCP/herramientas |
| 9 | `docs/architecture/08-MEMORY-KNOWLEDGE-CONTEXT.md` | Memoria/RAG/contexto |
| 10 | `docs/architecture/09-OBSERVABILITY-EVALUATION.md` | Observabilidad/evaluación |
| 11 | `docs/architecture/10-DEPLOYMENT-OPERATIONS.md` | Despliegue/operaciones |
| 12 | `docs/adr/ADR-001-deployment-model.md` | Decisión de despliegue |
| 13 | `docs/adr/ADR-002-langgraph.md` | Decisión de LangGraph |
| 14 | `docs/adr/ADR-003-temporal.md` | Decisión de Temporal |
| 15 | `docs/adr/ADR-004-mcp.md` | Decisión de MCP |
| 16 | `docs/adr/ADR-005-opa-policy-engine.md` | Decisión de políticas |
| 17 | `docs/adr/ADR-006-postgresql.md` | Decisión de persistencia |
| 18 | `docs/adr/ADR-007-secrets-management.md` | Decisión de gestión de Secretos |
| 19 | `docs/adr/ADR-008-dlp-pii-protection.md` | Decisión de DLP |
| 20 | `docs/adr/ADR-009-evaluation-framework.md` | Decisión de evaluación |
| 21 | `docs/adr/ADR-010-llm-gateway.md` | Decisión de gateway de LLM |
| 22 | `docs/development/DEVELOPMENT-GUIDELINES.md` | Flujo de trabajo de ingeniería |
| 23 | `docs/development/CODING-STANDARDS.md` | Estándares de codificación |
| 24 | `docs/development/TESTING-STRATEGY.md` | Estrategia de pruebas |
| 25 | `docs/development/SECURITY-RULES.md` | Reglas de seguridad |
| 26 | `docs/development/CLAUDE-CODE-GUIDELINES.md` | Contrato del agente de codificación IA |

La tabla anterior es la versión en inglés del manejador documental. El paquete de habla hispana reside en `docs/es/`. Las fuentes normativas (para agentes de codificación) quedan en `docs/architecture`, `docs/adr` y `docs/development`.

Los "17 documentos" solicitados se entregan como los 11 documentos de arquitectura más los 10 ADR más los 5 documentos de desarrollo. El paquete contiene intencionalmente el conjunto completo de 26 archivos porque la jerarquía de arquitectura/diseño de desarrollo es más grande que 17.