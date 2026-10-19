# Digital Employee Platform — Memory, Knowledge & Context

**Version:** 0.1.0  
**Status:** Normative  
**Created:** 2026-09-21  
**Updated:** 2026-10-19

## 1. Purpose

Agent quality depends on providing relevant information without turning every execution into an uncontrolled accumulation of history. Memory and context are therefore separate architectural concerns.

## 2. Memory classes

### Working memory

Short-lived state for the current execution. Durable through Temporal references as required.

### Episodic memory

Past execution outcomes and experiences that may help future work.

### Semantic memory

Stable facts, preferences or business knowledge explicitly retained for reuse.

### Knowledge

Managed external documents, databases and enterprise sources indexed for retrieval.

## 3. Metadata

Memory/knowledge items should include:

- owner/namespace;
- tenant;
- classification;
- ACL;
- source;
- timestamp;
- TTL where applicable;
- confidence/provenance;
- version.

## 4. Context Manager

The Context Manager is responsible for building the model input from approved information sources.

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

## 5. Token budgeting

Every model call receives a bounded budget. The system should reserve space for output and critical instructions instead of filling the context window indiscriminately.

## 6. Compression

Compression strategies include:

- summarization;
- sliding windows;
- semantic selection;
- result truncation;
- duplicate removal;
- structured extraction.

Summaries must preserve provenance and must not be treated as authoritative when the original source is required.

## 7. Retrieval

Initial retrieval uses hybrid search:

- PostgreSQL full-text search for lexical relevance;
- pgvector for semantic relevance;
- Reciprocal Rank Fusion;
- optional reranking.

## 8. ACL-aware retrieval

Authorization must be applied before content is supplied to the model. A vector match is not proof that the employee may access the document.

## 9. Knowledge ingestion

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

Changes should be re-indexed incrementally where possible.

## 10. Provenance

Retrieved information should retain source references so the final execution can identify where an important fact originated.

## 11. Memory write policy

The model should not be allowed to write arbitrary long-term memory without policy. Memory writes should have schemas, classification and retention rules.

## 12. Sensitive information

Sensitive information may be prohibited from persistent memory or external model providers. DLP and policy rules apply both to memory reads and writes.

## 13. Context eviction

Context that is no longer useful should be evicted. Large tool responses must be summarized or stored by reference rather than copied through every model turn.

Artifacts (`05` §21) are context sources like any other: when the employee needs the content of a previously produced document, it retrieves it through the governed artifact path with its classification and ACL applied — never by reading a filesystem path, and never from the agent-runtime state store (`04` §21).

## 14. Prompt boundaries

System/policy instructions, task instructions, retrieved data and tool outputs must remain structurally distinguishable. Retrieved content cannot override higher-priority control instructions.

## 15. Memory consistency

When enterprise systems are authoritative, memory is a cache/knowledge aid, not the system of record. The employee should query the authoritative system when current truth is required.

## 16. Retention

Retention is determined by business need, classification and regulation. Expired memory must be deleted or archived according to policy.

## 17. Quality controls

Memory retrieval should be evaluated for:

- relevance;
- precision;
- recall;
- ACL correctness;
- stale-data rate;
- citation/provenance quality.
