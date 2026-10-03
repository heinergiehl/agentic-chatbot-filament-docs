# ADR 0041 Publish is activation; tests warn, never gate

Status: Accepted on 2026-10-02 for the plugin overhaul (slice S10). Supersedes
the evidence-gated Agent activation of the release-candidate design (the
`candidate_agent_deployment_id` pointer, `AgentDeploymentTestEvidence`, the
release capability coverage and waiver, and the "require candidate pass before
activation" quality gate) and the admin-test rules of ADR 0038 and ADR 0040
that admin live and quality tests cannot propose writes and decide Playbook
approvals with a structured `resolution`. ADR 0037 (immutable, hash-verified
deployments, closed manifest) and ADR 0008/0009 (AgentGraph and Gateway
authority) are unchanged.

## Context

An Agent went live in four steps: save the draft, publish a candidate, pass a
live test against the candidate (with exact routing coverage for every
published tool or an audited waiver, and every enabled candidate quality
scenario), then activate. Any draft change set "Live test: Required"; an
Agent whose live version no longer verified showed "Active release: Invalid"
without a way out. The evidence chain (HMAC-attested turns, signed quality
runs, coverage manifests) protected the gate, not the deployment: the
deployment itself was already immutable, hash-verified and pinned.

## Decision

1. **Publish makes the version live.** `AgentReleaseService::publish` compiles
   the saved draft into an immutable deployment (same hash, same row), verifies
   its hash and runtime contract, locks the dependency heads, re-checks under
   those locks that the deployment is still the saved draft, verifies every
   pinned external dependency (API operation revisions, Connector environment,
   Playbook deployments) and points the Agent to it, all in one database
   transaction. A failure at any step leaves no new deployment, no version and
   the old live pointer.
2. **Versions are an append-only list.** Each first publication of a
   deployment adds an `AgentRelease` (number per Agent, time, author, optional
   note). Publishing an unchanged or earlier contract makes that version live
   again instead of adding one. Rows cannot be updated.
3. **Restore is one action.** `AgentReleaseService::restore` makes an earlier
   version live after the same verification as publish (hash, runtime
   contract, dependency locks, pinned dependencies), refuses a version with
   pins the runtime now refuses (see 5), and compares-and-sets the live
   pointer the operator saw when the list was shown. The draft is not changed.
4. **Tests warn, never block.** Agent tests run against the saved draft in the
   playground sandbox (amended by S12c; they first ran against the live
   version) and appear as warnings (with a link) before publishing when they
   failed or have no result for the current draft, as do missing credentials.
   Problems that prevent compiling (missing model, unpublished Playbook,
   inactive operation) are listed with links to fix them. Playbooks have no
   publish gate of their own either.
5. **One state, one action.** The editor, the Agent list and the launch
   dashboard show the same release state: not published, live, unpublished
   changes, or republish needed. "Republish needed" covers a live version that
   fails verification and one whose pins the runtime now refuses (a Playbook
   input contract before version 2, a data update pin without `record_scope`);
   its only action is Republish, which is Publish.
6. **The playground is a sandbox.** The editor's test chat compiles the saved
   draft into a verified, never activated deployment (`source = playground`)
   and talks to it through the normal durable chat turn in an admin test
   conversation of the operator. In admin test conversations write tools
   propose cards (the Gateway admits the proposal, which writes nothing); a
   confirmed write card and an unconfirmed write are simulated
   (`status: simulated`, "would write" values) and never reach the Gateway's
   write execution, which still refuses every admin test conversation.
   Playbook approvals use the confirmation card like every other surface;
   a Playbook's own write steps stay blocked by the Gateway. The handoff tool is
   not offered in tests.

## Consequences

- The `agent_deployment_test_evidence` table, the candidate pointer, candidate
  quality runs, their signatures and the comparison view are removed. Existing
  live deployments become version 1.
- Integrity guarantees are unchanged: deployments stay immutable and
  hash-verified, dependencies stay pinned, the manifest stays closed, and the
  Gateway still authorizes every capability call.
- An admin can make a version live without a passing test. Quality tests and
  the playground remain the tools to check it, now without ceremony.
