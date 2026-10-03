# ADR 0033: Native read selection and attested direct-read policy

Status: Candidate in RC-03 on 2026-09-26. User and release acceptance remain separate.

## Decision

The native Agent interprets continuation, correction, refresh, quoted text and
side questions. A completed Connector read with an eligible, uniquely verified
previous source offers a short `__prior_read` handle with `action=continue`.
Selecting it rebinds only its recorded inputs after the same deployment, turn,
conversation, authority scope, expiry and input hash checks at admission and
Gateway execution. A new read omits the handle and never inherits those values.
The existing `__prior_read` offer also selects a displayed historical result
for `replace` or a retained sibling for `refresh`. The server checks the exact
offered evidence, scope and current selection state. Historical result text
never supplies tool inputs. A selected replacement does not mark an old result
fresh; only a successful current execution can do that.

The server no longer decides these actions through cue words, quote patterns,
hypothetical phrases or refresh vocabulary. Date calculation, schema and source
binding, operation revision, confirmation and unknown effect fences remain
deterministic. The model must interpret naturally worded read opt-outs. A hard
no-read mode is `direct_read_policy=deny`, attested by the host through
`RuntimeAuthorityContextFactory::DIRECT_READ_POLICY_REQUEST_ATTRIBUTE` or its
trusted `forContext` argument. Request body values and tool results cannot set
this policy. The native tool adapters hide and reject direct reads, and the
Capability Gateway independently blocks them. The mode covers Connector,
Data Resource and knowledge reads; it does not grant or revoke Playbook writes.

This supersedes ADR 0020's conservative regex read opt-out paragraph and its
language-based Playbook start filter. It also replaces automatic Connector
carryover on a recognized adjacent phrase. The existing `__pending` operation
and revision, `__rebind` source movement, `__input_confirmation` offer acceptance,
and `__read_inputs` published dependency proof remain distinct verified
operations that the short completed-read handle cannot express. They share the
same source and Gateway authority rules and do not create an alternate runtime.

New Agent publications use runtime ABI v19. Existing v18 deployments remain
immutable and are not executed through a compatibility fallback. Scripted
proposals verify reference, payload and dispatch boundaries; actual model
interpretation of natural language remains for user acceptance.
