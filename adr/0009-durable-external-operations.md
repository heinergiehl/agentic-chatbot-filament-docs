# ADR 0009: Durable external operations within AgentGraph Playbooks

- Status: Accepted
- Date: 2026-08-30
- Decision scope: Long-running Connector operations, completion notifications,
  and independent direct reads alongside one Playbook
- Extends ADR 0008 without changing graph, capability, or release authority

## Context

An HTTP request that returns a final result and an API that accepts a background
job have different completion contracts. The existing Connector continuation
journal protects bounded inline polling and recovery, but does not schedule
work. Exhausting that polling budget cannot safely represent a long-running
external job as either a completed result or a definitely failed write.

The runtime already has the required ownership boundaries: AgentGraph owns
durable graph waits and resumption; the capability gateway owns external
execution; the side-effect ledger owns write integrity; the delayed-delivery
ledger binds resume and public message delivery. A new job scheduler or a second
conversation loop would duplicate these authorities.

## Decision

1. **Publish the completion protocol.** Durable completion is an explicit,
   validated mode of an immutable Connector operation. Existing inline
   contracts retain their exact meaning and hashes. Durable operations declare
   how to identify an accepted job, obtain a safe status target, recognize
   terminal states, and bound polling and total elapsed wall-clock time.
   Unsupported or incomplete protocols fail publication, not during an
   improvised model-driven recovery. Pending is not successful publication-test
   evidence and is not a usable business result.

   Durable completion defaults to an explicit successful job-status value.
   HTTP success alone is completion proof only under an explicitly published
   `completion_signal: http_status` protocol. The workbench retains its
   server-attested, bounded draft diagnostic; it must observe a real final
   success before publication and cannot manufacture background test authority.

2. **Persist acceptance before yielding.** Initial execution crosses the same
   gateway, confirmation, payload, scope, and idempotency checks as any other
   operation. A confirmed acceptance is durably bound to the original
   invocation, immutable revision and environment, workflow run, execution path,
   input identity, and safe status target. A write's acceptance and its pending
   ledger outcome are committed together. External HTTP calls never run while
   holding a database row lock.

3. **AgentGraph remains the waiting authority.** A pending Connector returns a
   typed reference. The Playbook stores it in its authoritative checkpoint and
   uses the existing delay interrupt and resume-delivery path. A later resume
   may only retrieve the accepted operation's status through the gateway. It
   cannot invoke the initial request again, substitute new visitor inputs, or
   adopt a newer deployment. Repeated waits do not produce repeated public
   messages announcing the same job.

4. **Notifications provide a wake-up signal.** A completion webhook must be
   authenticated before admission, bounded, durably deduplicated, and correlated
   to the declared operation, environment, and external job. It cannot grant
   capability permission, change graph state, supply an arbitrary HTTP target,
   or become visitor-facing facts. A worker requests the existing bound resume;
   the gateway retrieves the authoritative result. An early notification must
   survive until the matching checkpoint and projection exist. Polling remains
   available when a notification is lost. Providers without an authoritative
   status-read protocol require a separately reviewed integration contract.

5. **Uncertainty remains explicit.** A crash after external dispatch but before
   durable acceptance remains an unknown write outcome. No timeout, lost
   notification, or expired local worker lease proves that an accepted external
   write failed. Terminal uncertainty requires reconciliation; it never grants
   automatic write replay. Cancellation stops local continuation and does not
   imply remote cancellation unless a separately authorized provider operation
   confirms it.

6. **One Playbook may coexist with independent reads.** Removing the blanket
   direct-read/Playbook exclusion must preserve the single-open-Playbook rule,
   historical authority, exact write confirmation, budgets, and idempotency.
   Completed direct-read evidence and the canonical Playbook outcome are
   composed without changing cancel, waitpoint, failure, or unknown semantics.
   Recovery and replay must preserve both parts; unproven evidence is never
   reconstructed from a generated answer.

## Acceptance evidence

- Multiple polls and duplicated notifications dispatch the initial request once.
- Checkpoint recovery, stale workers, reordered/early callbacks, and an
  interrupted projection cannot substitute an operation or lose its wake-up.
- A changed deployment, conversation, scope, execution path, or payload cannot
  acquire an existing operation's continuation authority.
- Poll errors remain bounded; deadline exhaustion preserves write uncertainty.
- Completion and replay preserve source identity, redaction, result selection,
  canonical chat messages, and JSON/SSE parity.
- Migrations are additive and classify existing inline journals without
  reinterpreting or discarding them. Active durable work blocks destructive
  rollback; restoration uses a verified database backup and matching package.
- Local fault tests, runtime integration, and the actual external host are
  reported separately from third-party provider certification.

## Operational consequences

Durable completion requires persistent storage, an asynchronous queue worker,
and the package scheduler. The public callback endpoint additionally requires
HTTPS and provider-specific configuration. A disconnected browser does not
cancel accepted work. The model is not kept running while a job waits.

Exactly-once execution across an arbitrary external network is not assumed.
The supported guarantees rely on local fencing, provider idempotency where
available, immutable correlation, and explicit reconciliation of unknown
outcomes.
