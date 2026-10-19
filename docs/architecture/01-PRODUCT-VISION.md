# Digital Employee Platform — Product Vision

**Version:** 0.1.0  
**Status:** Normative product baseline  
**Created:** 2026-09-21  
**Updated:** 2026-10-19

## 1. Vision

The platform enables enterprises to deploy **Digital Employees**: software workers with a defined role, responsibilities, skills, tools, policies, memory and tasks that can perform operational work autonomously while remaining observable, governable and interruptible by humans.

The product is not simply a chatbot. A chatbot answers a conversation. A Digital Employee owns a business responsibility and can execute a workflow across systems.

## 2. Product definition

A Digital Employee is:

> **Identity + Role + Soul + Skills + Tools + Policies + Memory + Tasks + Governance**

- **Identity:** who the employee is within the platform and enterprise context.
- **Role:** business responsibility and scope.
- **Soul:** behavioral/personality guidance; never a security boundary.
- **Skills:** reusable capabilities and procedures.
- **Tools:** controlled capabilities exposed through MCP or other approved adapters.
- **Policies:** deterministic constraints and authorization rules.
- **Memory:** information retained for future work.
- **Tasks:** recurring or on-demand responsibilities.
- **Governance:** approvals, audit, versioning and operational controls.

## 3. Examples

- Collections employee: identifies overdue invoices, prioritizes accounts, drafts contact actions and requests approval for sensitive changes.
- IT operations employee: triages incidents, queries monitoring systems, proposes remediation and executes approved low-risk changes.
- Procurement employee: compares supplier information, checks policy and prepares purchase requests.
- Finance employee: reconciles transactions and opens exceptions for human review.

## 4. Activation model

A Digital Employee can be activated by:

- Channel message.
- Schedule.
- Business event.
- API request.
- Manual action.

The activation mechanism creates an **Execution Request**. It does not bypass the execution architecture.

## 5. Product pillars

### Autonomous execution

The employee should complete multi-step work without requiring a human for every intermediate action.

### Controlled autonomy

Autonomy is bounded by policies, tool permissions, risk controls, budgets, timeouts and approval requirements.

### Enterprise integration

The employee must work with existing enterprise systems rather than requiring replacement of CRM, ERP, ITSM, databases or messaging platforms.

### Durable work

A task may run for seconds, hours or days. Human approval, external outages and retries must not destroy execution state.

### Explainability

Every meaningful action must be attributable to an execution, version, policy decision and capability invocation.

## 6. Product boundaries

The platform is responsible for orchestration, governance, execution state, integration control, memory/context and observability.

It is not responsible for becoming the system of record for every business domain. CRM, ERP, HR, ITSM and other enterprise applications remain authoritative for their own business data.

## 7. Initial deployment model

The first production model is **dedicated/single-tenant per enterprise environment**. This means data, runtime configuration, credentials and operational resources are isolated by deployment boundary.

Dynamic multi-tenancy can be considered later, but it is not a prerequisite for validating the product.

### 7.1 Commercial modalities versus architectural limit

Two commercial modalities are planned, and **neither changes the architecture of the first release**:

| Modality | What it means commercially | Architectural state |
|---|---|---|
| **Private installation** | The product is installed in the customer's own environment (or in an environment dedicated to that customer) | This is the initial model (`ADR-001`, `10` §1, `10` §17). Isolation is by deployment boundary. |
| **SaaS** | The vendor operates the platform and serves multiple customer organizations | It is a **long-term commercial objective**, not a licence to introduce dynamic multi-tenancy in the MVP. Serving several organizations from one installation requires an isolation design (data, credentials, models, quotas, audit) and its own ADR; until that ADR exists, multi-tenancy is the non-goal stated in `ADR-001` and `02` §11. |

Both modalities share metering, entitlements and quotas (`09` §12), and the private modality adds the installation/upgrade cycle of `10` §17 and offline operation. Metering and entitlement design may be prepared for the SaaS modality without introducing dynamic multi-tenancy.

## 8. Success criteria

A useful Digital Employee should be measurable by:

- task completion rate;
- correct tool usage;
- policy compliance;
- human approval rate and exception rate;
- execution duration;
- cost and token consumption;
- recovery from failures;
- quality of final outcomes;
- audit completeness.

The product should optimize for **business outcomes under explicit controls**, not for maximum autonomy.

## 9. Non-goals

The MVP does not attempt to:

- replace every enterprise application;
- provide unrestricted computer control;
- let an LLM decide authorization;
- create a general-purpose autonomous super-agent without bounded responsibility;
- guarantee deterministic LLM output;
- remove humans from high-risk governance processes.

## 10. Product north star

The platform should make it possible for an enterprise to say:

> “This is the job. This is the employee responsible. These are the systems it may use. These are the policies it must follow. These are the situations where a human must decide. Show me exactly what happened.”
