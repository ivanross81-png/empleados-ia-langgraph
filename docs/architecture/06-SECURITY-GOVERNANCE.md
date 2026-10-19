# Digital Employee Platform — Security & Governance

**Version:** 0.1.0  
**Status:** Normative

## 1. Security model

Security is based on layered controls. No single prompt, model, tool schema or gateway is trusted by itself.

```text
Identity → Scope → Policy → Risk → Approval → Capability → Secret → External System → Audit
```

## 2. Identity

Users, services and Digital Employees have distinct identities. Human identity should use OIDC/OAuth2 or an enterprise identity provider. Service identities use workload/service credentials.

### 2.1 Enterprise identity requirements

*Added 2026-10-19 — closes finding K-47/K-48/K-49 of `docs/reference/KORTIX-CROSS-MATRIX.md`. Enterprise buyers (banking, insurance, regulated sectors) require these controls before onboarding; they are part of the product, not of the customer's environment.*

| Requirement | Contract |
|---|---|
| Federated sign-in | OIDC and/or SAML 2.0 against the customer's IdP, with an explicit **domain verification** step (DNS) before the email domain is trusted |
| Enforcement | A domain may **enforce** federated sign-in: password/magic-link/OTP paths for that domain are refused, and existing sessions of those identities are terminated when enforcement is activated |
| Provisioning/deprovisioning | SCIM 2.0 for user and group lifecycle, driven by the IdP; deactivation revokes roles, grants, tokens and live sessions |
| Group → role mapping | IdP groups map to platform roles; provisioning groups are authoritative and cannot be edited locally |
| Multi-factor authentication | Per-user MFA, and an account-level **require MFA** policy with a compliance preview; API keys/service accounts are exempt only if explicitly documented and compensated by other controls |
| Session policy | Maximum session lifetime and idle timeout per account; per-session revocation and a device list for the user |
| Offboarding | Removing or deactivating a person terminates sessions, tokens, grants and delegated connector access in one operation, with a single auditable event |

Ownership escapes must be explicit: if an administrator identity is exempt from any of these controls, the exemption is documented and audited.

### 2.2 Resource-level grants

Authorization can be narrowed to specific objects (an employee, an integration connection, a knowledge namespace) and to specific principals (user, group, service account). A grant may be **personal** (usable only by its holder) or **shared**; shared resources require an explicit owner and cannot be modified by a consumer.

## 3. Authorization

Authorization is evaluated at multiple levels:

- tenant/deployment;
- user role;
- Digital Employee;
- task;
- tool;
- MCP server;
- resource where supported;
- action risk.

Least privilege is the default.

## 4. OPA policy engine

OPA/Rego is the reference deterministic policy engine. It produces an explicit decision:

- ALLOW;
- DENY;
- REQUIRE_APPROVAL.

Policies must be versioned and testable.

### 4.1 Decision semantics

*Added 2026-10-19 — closes finding K-04/K-05/K-16 of `docs/reference/KORTIX-CROSS-MATRIX.md`.*

1. **`REQUIRE_APPROVAL` suspends, it does not fail.** The execution waits durably for a human decision and resumes with that decision as input (`04` §11). An implementation that turns `REQUIRE_APPROVAL` into a failure or into a retry is incorrect.
2. **Granularity.** Policy may be evaluated on the capability alone or on the **normalized arguments** of the specific invocation, so that "transfer under 1.000 is allowed, above it requires approval" is expressible. Evaluation is deterministic and side-effect free.
3. **Precedence is explicit.** When several rules match, the resolution order is defined and documented (most specific rule wins; a narrow rule never silently broadens access) and is covered by tests.
4. **Deny by default.** Absent an explicit grant, a capability is not available to an employee or task.
5. **Not replaceable by model output.** No policy decision may be inferred from, or delegated to, model output, a tool description, or third-party content (`§10`, `04` §17).

## 5. Risk engine

Risk is an input to governance, not an authorization replacement. Risk can consider:

- action type;
- target system;
- data classification;
- monetary value;
- number of affected records;
- employee/task context;
- anomaly signals.

## 6. Human governance

High-risk operations may require approval. The approval record must identify the exact action and relevant version context.

Separation of duties should prevent a requester from approving their own restricted action where the policy forbids it.

## 7. Secrets

Use Vault or an equivalent KMS-backed secret manager. Secrets should be injected as late as possible and exist only for the minimum required lifetime.

Never store secrets in:

- prompts;
- agent memory;
- Git;
- normal logs;
- audit payloads;
- task definitions;
- model traces.

### 7.1 Credential exposure to the executor

*Added 2026-10-19 — closes finding K-50/K-51 of `docs/reference/KORTIX-CROSS-MATRIX.md`.*

"Never in the prompt" is necessary but not sufficient: the executor may be an isolated process, a container or a sandbox that runs generated code or arbitrary HTTP. The exposure mode of a credential is therefore an explicit, per-integration decision:

| Mode | Meaning | When acceptable |
|---|---|---|
| **Mediated (preferred)** | The credential never reaches the executor. The call is made by the enforcing component (MCP Gateway / integration adapter) which injects the secret at the network boundary towards an allowlisted destination. The executor sends a placeholder that is only meaningful through that mediator. | Default for all enterprise credentials |
| **Injected** | The credential is delivered to the executor's environment for a bounded lifetime. | Only when mediation is impossible, with an explicit exception recorded, a short lifetime, a narrow scope and a monitored destination |
| **Disabled** | The credential is not available to any execution path. | Credentials not needed by the employee, or held out during an incident |

Additional requirements:

- responses that echo a mediated credential are redacted before they reach the model or the logs;
- a mediated request to a destination that is **not** allowlisted must fail closed (it must not silently mutate elsewhere);
- each mediated use is audited (who, which credential, which destination, which execution);
- verification by probes: (1) the executor's environment contains only a placeholder, never the value; (2) an end-to-end call through the mediator succeeds while the raw value never appears in logs, traces or agent state;
- mediation is not a substitute for egress restriction (`§12`): both are required for restricted integrations.

## 8. DLP and PII

A DLP/PII gateway sits before external LLM transfer when data leaves the trusted environment.

Capabilities may include:

- detection;
- classification;
- redaction;
- tokenization/pseudonymization;
- allow/block decision;
- provider-specific policies.

Microsoft Presidio or an enterprise DLP service can be used as an implementation component; the architectural contract is the control point, not the vendor.

## 9. Data classification

Minimum classes:

- PUBLIC
- INTERNAL
- CONFIDENTIAL
- RESTRICTED
- PII
- FINANCIAL
- PCI
- SECRET

A classification can impose model, storage, logging and approval restrictions.

## 10. Prompt injection defense

Retrieved text and external content are untrusted. Controls include:

- clear data/control separation;
- tool allowlists;
- schema validation;
- deterministic policy;
- output validation;
- no authority from text alone;
- bounded execution budgets.

## 11. Tool security

Tool definitions must declare:

- capability;
- input schema;
- risk class;
- side-effect level;
- idempotency support;
- required scopes;
- data classification impact.

## 12. Network security

External integrations should use private networking where available, TLS, egress restrictions and allowlisted destinations. MCP Gateway should be the controlled egress path for enterprise actions.

## 13. Audit

Audit records must answer who/what/when/where/why and include policy and approval references. Do not log secrets or unnecessary personal data.

## 14. Threat model

Primary threats:

- prompt injection;
- credential theft;
- excessive tool permissions;
- malicious or compromised MCP server;
- data exfiltration;
- replay of events/actions;
- privilege escalation;
- unauthorized approval;
- denial of service;
- accidental destructive automation.

## 15. Security testing

Required categories:

- dependency scanning;
- SAST;
- secrets scanning;
- API authorization tests;
- MCP contract/security tests;
- prompt-injection regression suite;
- DLP regression tests;
- container/image scanning;
- penetration testing before major production exposure.

## 16. Governance principle

Autonomy is granted by explicit capability and policy, not by the model's apparent competence.

## 17. Runtime state and checkpoint protection

*Added 2026-10-19 — closes gap C-1 (finding K-L1) of `docs/reference/KORTIX-CROSS-MATRIX.md`.*

The agent runtime's own state store (`04` §21) is a data store inside the trust boundary and receives the same treatment as any other:

- it is classified and DLP-checked; it must not become a bypass around model-context controls;
- it must not contain credentials, raw tokens, full external documents or unrestricted tool output (store references, `05` §3/§21);
- it has an explicit retention/deletion policy, and deletion is verified (a resumed execution must still work, an expired one must be gone);
- access to it is restricted to the runtime and to operators with a legitimate purpose, and every administrative access is audited;
- it is included in the threat model: an attacker who can write there could inject instructions into a resuming agent, exactly like a poisoned tool output.

## 18. Dependency and licence integrity

*Added 2026-10-19 — closes gap C-6 of `docs/reference/KORTIX-CROSS-MATRIX.md`; details in `docs/reference/STACK-LICENCIAS.md`.*

- New dependencies (runtime or build) require a declared licence and a classification (permissive / conditional / restricted) before they enter the project.
- A software bill of materials is produced per release and scanned for both vulnerabilities and licence obligations.
- Copyleft-strong and source-available licences are an explicit decision, never an accident: they are reviewed before adoption and reviewed again before a private-installation bundle is delivered.
- Dependencies whose licence forbids offering the software as a hosted service are incompatible with the SaaS model (see `STACK-LICENCIAS` §4).
