# ADR 0020: Native read interactions and invocation outcomes

RC-02's candidate [ADR 0032](0032-source-bound-read-drafts.md) supersedes the
immediately preceding successful Data Resource query requirement below. It adds
shared durable drafts and canonical question delivery; the source, Gateway and
scope boundaries here continue to apply.
RC-03's candidate [ADR 0033](0033-native-read-selection-and-attested-read-policy.md)
supersedes the conservative regex read opt-out paragraph and automatic
phrase-gated Connector carryover below. Authenticated structured no-read policy
is enforced at the adapter and Gateway; linguistic interpretation belongs to
the native Agent.

- Status: Implemented and deterministically verified in Task B; host cutover and release acceptance remain separate.
- Date: 2026-09-19
- Mandate: Runtime redesign 2.4, C01–C07 and D1–D3.
- Supersedes the generic conversation-request lifecycle and forced direct-read
  decision protocols in ADRs 0014–0017. Preserves the execution, source, rendering
  and bounded-selection invariants of ADRs 0008/0009/0018/0019.

## Ownership

Native domain tools accept partial proposals. The strict published execution
schema, field provenance and gateway authority remain mandatory. A malformed
proposal produces local feedback; it does not create a durable request. Genuine
missing inputs use the existing encrypted Connector context checkpoint, its
current-turn claim, source verification, 16-pending bound and existing lifetime.
There is one owner of open direct inputs. Completed reads have evidence and
execution receipts, not another mutable conversation-request lifecycle.

Tool admission, NeedsInput and gateway outcomes are captured by an invocation-local
typed channel before SDK serialization. Native call and invocation identities stay
separate from pending and graph identities. No tool-text parsing or shared last
result determines state. Canonical checkpoints remain before public delivery;
uncertain effects retain the existing gateway/Graph recovery fences.

Invocation admission reserves space before dispatch: at most 24 observations and
64 KB, including bounded outcome references and the final answer commit. A full
projection rejects new calls locally while exact native retries still reuse their
recorded result and pending cancellation remains available.

A local Connector result replay with a new native call identity retains its
tool/activity and execution trace, but creates no second answer obligation for
the same already delivered evidence. This requires an untouched observation,
the same current visitor source and capability, and an earlier successful
observation owning the exact evidence ID. It cannot merge distinct results,
consume pending input or replace a real execution outcome.

## Native interaction and source policy

The model chooses a tool, an explicit pending continuation or a correction.
Omitted tools mean no transition, so side questions require no forced defer call.
Pending revision and field sources are verified by the server. New waits in a
batch cannot absorb independent calls. Existing values survive a rejected
replacement; only published dependencies are invalidated by an accepted correction.
Cancellation only closes local input interaction, never a remote effect.

The model owns linguistic interpretation. Deterministic source checks establish
literal/normalized/published-result provenance, not semantic intent from a quoted
sentence. The broad SourceCommitment/intent matching veto is replaced. The bounded
explicit capability read prohibition is retained as a separately named conservative
opt-out policy at tool and gateway boundaries; it is not a general language judge.
No additional negation exceptions or domain names are introduced.

A successful read does not consume a linguistic purpose or veto a different
native read. Tests of the removed language classifier are replaced by checks of
published tool authority, literal sources, explicit opt-out and physical dispatch
counts. Scripted tool proposals do not demonstrate that a model chose the right
tool; that remains a separate model-quality claim.

Database follow-ups may reuse an original visitor field source only when the
immediately preceding successful canonical query still carries that exact field,
message and literal provenance. The original source remains bounded by scope,
deployment and the 30-minute lifetime. A completed correction replaces the field
source for subsequent follow-ups, while untouched date sources keep their original
clock. Current-message literal provenance does not itself interpret negation or
correction wording.

After a trusted native rejection without execution, a pending question is rendered
from the canonical Connector context and its published field. Exactly one matching
pending task and rejected tool are required. No historical request observation can
recreate a cancelled or consumed pending task, or disambiguate several tasks.

## Answers and cutover

[ADR 0021](0021-natural-dialogue-and-context-accounting.md) extends this answer
contract with reviewed pending-question wording, manifest descriptions and read
failure summaries. Canonical pending state remains authoritative; its fallback
field wording is no longer the only available presentation.

Answer format is separate from execution outcome. The existing single source-review
policy and exact-fact fallback remain; their inputs are current invocation evidence
and the whole visitor message, not a persistent request plan. Displayed selections
remain bound to committed content and order for later references. Failed rendering
cannot replay tools, recreate waits, or clear Unknown. Plain conversation requires
no source-review call. Graph interrupts and their exact controls remain Graph-owned.
An open Playbook retains its existing SDK first-step decision; only direct reads
lose that forced choice. Later SDK steps release the Graph tool choice as before.

The old request inventory no longer segments a mixed free-text reply into an
input and an independent question. Graph admission sees the whole current message.
Its existing typed-value rules remain; a partial free-text answer with a side
question stays paused until an unambiguous follow-up. This intentionally removes
the inventory-based exception rather than letting a model-selected substring
discard a condition or refusal. Independent reads during a Graph wait remain
available, without consuming or rewriting that waitpoint.

New Agent runtime/compiler and interaction versions reject incompatible active
artifacts without rewriting history. There are no legacy decoders or converters
for the removed request protocol. A host cutover must separately reconcile running
and unknown effects; Task B does not activate or reset a host.

## Baseline and required evidence

The pre-B baseline reproduces 119 tests / 1,011 assertions with twelve failures.
Eight compare diagnostics without the added `origin: protected_continue_replacement`;
the retained-value and no-dispatch assertions remain required. Four expect a new
clarification after an implicit replacement, while the implementation returns
local `correct_arguments`. The target keeps that no-mutation feedback and requires
explicit correction or a genuine ambiguity proposal. Tests must cover both paths,
not merely remove the old expectations.

Completion requires invocation isolation, local rejection, true missing input,
side question, correction, revision conflict, cancellation, expiry/capacity,
independent same-capability reads, durable recovery, evidence-only synthesis and
provider projection. Scripted state evidence and paid model quality are reported
separately. The final Task-B evidence and remaining integration gaps are recorded
in [the execution handoff](../archive/plans/refactor-v2-3-review/EXECUTION_HANDOFF.md).
