# ADR-013 — Agent compute boundary in the MVP

**Status:** Accepted (product owner decision, 2026-10-19)  
**Date:** 2026-10-19

## Context
The architecture gives the Digital Employee capabilities exclusively through **governed tools**; it never defined an environment where the employee can *compute* (generate a file, build a spreadsheet, run a script) to produce a deliverable. `04` §25 recorded that gap as an open question (findings K-12/K-21; DP-2), with the warning that it must not be resolved implicitly by an implementation. The owner decided the MVP boundary.

## Decision
1. **The MVP does not allow arbitrary agent code execution inside the main process.** No `exec`, no shell, no evaluator of model-authored code in the API, worker or agent-runtime process.
2. Deliverables are produced by a **restricted artifact-generation service** with:
   - **approved libraries and templates** from a closed catalogue (adding one is a governed change, subject to the licence gate of `06` §18);
   - **resource limits** (CPU, memory, wall-clock, output size);
   - **no secrets**: the service receives no credentials and cannot resolve them (`06` §7/§7.1);
   - **network restrictions**: no egress by default.
3. Artifacts the service produces are **governed artifacts**: classification, retention and access rules of `05` §21 apply to them like any other artifact.
4. **Arbitrary code execution in an ephemeral sandbox** (network-restricted, ephemeral, no credential exposure) is an **evolution after the MVP**: it requires its own decision and its own isolation tests, and it is not authorized by this ADR.

## Consequences
- The employee can produce deliverables **without** turning the platform into a code-execution service: it is the boundary that keeps the security model (no credential exposure, governed actions) intact.
- Capability is limited to what the catalogue of templates and libraries covers; each new capability is an explicit, auditable addition rather than an emergent property of arbitrary code.
- The service needs its own limits, audit of each generated artifact, and a refusal path with a typed outcome when a request exceeds them.
- **Status of this decision:** design decision **adopted by the owner**; **not** technically validated — the service does not exist and no isolation test has been executed, so DP-2 stays open in its *implementation and test* layers.

## Alternatives considered
- **Arbitrary code execution in the MVP:** rejected — it would require isolation that does not exist yet and would break the promise that the model never reaches a credential.
- **No compute at all:** rejected — it caps the product at "proposes actions" and leaves the "finished work" promise unmet.
- **Delegating generation to an external SaaS:** rejected for the MVP — moves customer data to a third party without a decision that covers it.
