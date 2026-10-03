# ADR 0018: Answers from bounded Connector selections

- Status: Accepted; implementation and live acceptance tracked in the runtime audit
- Date: 2026-09-13
- Scope: Answer coverage for a successful pagination prefix stopped at published bounds
- Extends ADR 0017; preserves ADR 0009 execution and unknown-outcome semantics

## Context

A configured search may deliberately retain three results even when the source
contains more. The Connector correctly records this as a partial result. The
answer guard previously treated that condition identically to a failed later
page, so even a supported answer to a positive book search could never complete.
Increasing fixture limits or marking every partial result complete would hide
the distinction and weaken the source contract.

## Decision

The existing server paginator may attest a bounded selection only for a
successfully validated prefix stopped solely at the published item or page
limit. The marker travels with canonical execution and evidence, bound to the
same capability, admitted input and retained result. Synthesis must verify that
binding before using it. Older records without the marker remain partial;
reading them does not manufacture or backfill proof.

The receipt remains `connector_partial` with `complete=false`. Selection scope
does not authorize execution, input resolution, a read dependency, a unique
identity, a write or a retry. It is not a complete provider page when the item
limit cuts within one page.

The existing single semantic answer review may certify positive or explicitly
bounded search coverage using these retained facts. Rendering must disclose the
limited selection. Derived totals, absence, uniqueness and exhaustive coverage
still require the corresponding complete evidence. A provider-reported total
is a separately supported fact, never a total computed from the retained prefix.

Whole-request coverage is evaluated on the surviving validated displayed
claims. Discarded proposals, including an invalid reference to presentation
metadata, never become facts and do not independently veto an otherwise
supported bounded answer. The existing review must still reject missing
requested facts; suppressing a bad proposal cannot supply those facts or
complete a request without reviewed displayed support.

No selection proof is issued for a provider-declared partial response, failed
later page, changed mapped context, transport error, timeout or uncertain
outcome. Prompt truncation cannot preserve sufficient evidence by borrowing a
marker from the larger result. Existing public-field, context, unit and claim
checks remain applicable to every selected fact.

Canonical turn evidence derives `selection_answered` from the same encrypted
presentation receipt, current turn and deployment, exact input and source scope,
and reviewed displayed request coverage. Caller-proposed flags are discarded.
Routing and release coverage may count that answered selection while preserving
`connector_partial`; historical or unreviewed records acquire no new attestation.
The operation workbench still requires an ordinary complete representative
test for publication. A partial test is retained and cannot satisfy that gate.

The native tool presents a verified selection as usable evidence with an
explicit selection notice. It does not simultaneously instruct the model to
treat that selection as a failed or unanswerable lookup. Canonical execution
remains partial. Other partial and truncated outcomes keep their limitations.

This extends the existing answer boundary. It adds no conversation owner,
planner, provider review call, continuation scheduler or resource-specific
exception. API and MCP tools retain their configurable published contracts.

## Verification

Characterize the blocked positive prefix before changing it. Verify accepted
bounded answers and rejection of missing or changed bindings, hidden fields,
provider partial responses, later-page failures, context changes, time limits,
prompt truncation, and unsupported exhaustive or absence claims. The normal
candidate test and activation gates remain necessary before public use.
