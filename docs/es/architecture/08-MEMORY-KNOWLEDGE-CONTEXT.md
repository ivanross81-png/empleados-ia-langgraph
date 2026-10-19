# Digital Employee Platform — Memoria, Conocimiento y Contexto

**Versión:** 0.1.0  
**Estado:** Normativa

## 1. Propósito

La calidad de un agente depende de proporcionar información relevante sin convertir cada ejecución en una acumulación descontrolada de historial. Por lo tanto, la memoria y el contexto son preocupaciones arquitectónicas separadas.

## 2. Clases de memoria

### Memoria de trabajo

Estado de corta duración para la ejecución actual. Persistente mediante referencias de Temporal según se requiera.

### Memoria episódica

Resultados y experiencias de ejecuciones pasadas que pueden ayudar en trabajos futuros.

### Memoria semántica

Hechos estables, preferencias o conocimiento de negocio retenidos explícitamente para su reutilización.

### Conocimiento

Documentos externos gestionados, bases de datos y fuentes empresariales indexadas para su recuperación.

## 3. Metadatos

Los elementos de memoria/conocimiento deberían incluir:

- propietario/namespace;
- tenant;
- clasificación;
- ACL;
- fuente;
- timestamp;
- TTL cuando corresponda;
- confianza/procedencia (provenance);
- versión.

## 4. Administrador de contexto

El Administrador de contexto es responsable de construir la entrada del modelo a partir de fuentes de información aprobadas.

```text
Task Context
 + Execution State
 + Relevant Memory
 + Knowledge Retrieval
 + Tool Observations
 + Conversation/History
        ↓
Relevance
 → ACL
 → Deduplication
 → Compression
 → DLP
 → Token Budget
 → Model
```

## 5. Presupuesto de tokens

Cada llamada al modelo recibe un presupuesto acotado. El sistema debería reservar espacio para la salida y las instrucciones críticas en lugar de llenar la ventana de contexto de forma indiscriminada.

## 6. Compresión

Las estrategias de compresión incluyen:

- resumir;
- ventanas deslizantes;
- selección semántica;
- truncamiento de resultados;
- eliminación de duplicados;
- extracción estructurada.

Los resúmenes deben preservar la procedencia (provenance) y no deben tratarse como autoritativos cuando se requiere la fuente original.

## 7. Recuperación

La recuperación inicial usa búsqueda híbrida:

- búsqueda de texto completo de PostgreSQL para relevancia léxica;
- pgvector para relevancia semántica;
- Reciprocal Rank Fusion;
- reranking opcional.

## 8. Recuperación consciente de ACL

La autorización debe aplicarse antes de que el contenido se suministre al modelo. Una coincidencia vectorial no es prueba de que el empleado pueda acceder al documento.

## 9. Ingesta de conocimiento

Pipeline:

```text
Source
 → Parse
 → Classify
 → Chunk
 → Metadata
 → Embedding
 → PostgreSQL/pgvector + FTS
 → Index
```

Los cambios deberían re-indexarse incrementalmente cuando sea posible.

## 10. Procedencia (Provenance)

La información recuperada debería conservar referencias a la fuente para que la ejecución final pueda identificar de dónde se originó un hecho importante.

## 11. Política de escritura de memoria

No debería permitirse que el modelo escriba memoria de largo plazo arbitraria sin política. Las escrituras de memoria deberían tener esquemas, clasificación y reglas de retención.

## 12. Información sensible

La información sensible puede estar prohibida en la memoria persistente o en los proveedores de modelos externos. Las reglas de DLP y de política se aplican tanto a las lecturas como a las escrituras de memoria.

## 13. Expulsión de contexto

El contexto que ya no es útil debería expulsarse. Las respuestas grandes de herramientas deben resumirse o almacenarse por referencia en lugar de copiarse en cada turno del modelo.

Los artefactos (`05` §21) son fuentes de contexto como cualquier otra: cuando el empleado necesita el contenido de un documento producido antes, lo recupera por el camino gobernado de artefactos con su clasificación y ACL aplicadas — nunca leyendo una ruta del sistema de archivos, y nunca desde el almacén de estado del runtime (`04` §21).

## 14. Fronteras de prompts

Las instrucciones de sistema/política, las instrucciones de tarea, los datos recuperados y las salidas de herramientas deben permanecer estructuralmente distinguibles. El contenido recuperado no puede anular las instrucciones de control de mayor prioridad.

## 15. Consistencia de la memoria

Cuando los sistemas empresariales son autoritativos, la memoria es una ayuda de caché/conocimiento, no el sistema de registro oficial. El empleado debería consultar el sistema autoritativo cuando se requiere la verdad actual.

## 16. Retención

La retención está determinada por la necesidad de negocio, la clasificación y la regulación. La memoria vencida debe eliminarse o archivarse según la política.

## 17. Controles de calidad

La recuperación de memoria debería evaluarse en cuanto a:

- relevancia;
- precisión;
- exhaustividad (recall);
- correctitud de ACL;
- tasa de datos obsoletos;
- calidad de citas/procedencia (provenance).