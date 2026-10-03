# ADR 0042 Streamed answer drafts for queued widget turns

Status: Accepted on 2026-10-03 for the plugin overhaul (slice S11b). Extends
ADR 0037 (AgentRunner owns the turn) and the durable chat turn contract: the
canonical outcome is still committed once by the existing committers before
any JSON or SSE projection. Only the stream of a running queued turn changes.

## Context

Widget turns are admitted by the SSE request, queued, and run by a worker. The
SSE response ended right after `turn_accepted`; the widget then polled the
turn projection, so the visitor saw nothing until the whole answer was
committed. AgentRunner used the SDK's non-streaming `prompt()` and the
blocking output checks of `WorkflowSafetyBoundary` ran on the finished answer.

## Decision

1. **Drafts are presentation, never outcome.** For a queued widget turn the
   worker passes an `AnswerStream` with the `ChatTurnRequest`. AgentRunner
   then runs the same SDK loop through `stream()` and feeds the model's text
   into it. The draft is written to a short-lived cache entry
   (`TurnDraftBuffer`, keyed by the turn) and is never stored as a message,
   never committed, and never read by any domain decision. The committed
   message is the one AgentRunner returns, after `protectResult()`, through
   the existing committer, exactly once.
2. **Same loop, same transcript.** `stream()` runs the same tools, Gateway,
   usage admission and step limits as `prompt()`. The loop's messages are
   rebuilt from the completed model steps (with provider content blocks such
   as thought signatures) and the streamed tool results, in the order
   `prompt()` returns them, so the stored native transcript does not depend
   on the transport. JSON `/complete`, channels and admin tests keep
   `prompt()`.
3. **The SSE request relays, it does not decide.** After `turn_accepted` the
   admitting SSE request follows the turn (`ChatTurnDraftRelay`): it emits
   `delta`, `draft_reset` and `draft_status` from the draft and `activity`
   from persisted progress, until the turn is no longer active, the client
   disconnects, or `api.chat_stream.relay_seconds` (default 100, at most the
   PHP limit minus 10 s) is used up. A committed turn's stored outcome then
   follows on the same response, built exactly as for a repeated request
   (`CommittedChatTurnOutcome::fromTurn`), before `[DONE]`; otherwise the
   widget reads it from the turn projection as before. After 15 seconds
   without an event the relay sends an SSE comment, so proxies keep the
   response open and PHP notices a disconnected client. A disconnect,
   reconnect, repeated request or queue redelivery therefore cannot duplicate
   or lose the answer: the relay only reads, and the turn ledger still
   admits one execution.
4. **Blocking output checks keep their authority.** Before any draft text is
   written, the standard output profile and the deployment's blocking
   guardrails (without required terms, which a partial answer may still
   lack) check the whole text written so far. The newest characters (the word
   being written and at least 24 bytes) are held back, so a contact detail or
   banned term is usually checked before any part of it is visible. A
   rejected draft is cleared (`draft_reset`) and stays cleared until the next
   model step; the committed answer carries the policy's fallback text from
   `protectResult()`. Advisory guardrails do not affect drafts.
5. **What a draft shows.** Only the text of the current model step: a tool
   call discards the step's text and shows a short translated progress state
   (`knowledge`, `lookup`, `action`); a retry restarts the draft. After a
   Playbook tool no draft text is shown for the rest of the turn, because the
   Playbook's own output policy decides the committed answer.

Amended by ADR 0043: the draft check uses the Agent's Safety settings instead
of guardrail pins and returns the text to show, so masked personal data is
shown masked; advisory policies no longer exist.

## Consequences

- Web and queue processes must share the cache store used for drafts
  (`api.chat_stream.cache_store`, default store). With a per-process store the
  widget falls back to the committed answer without streaming.
- An SSE request now stays open while its turn runs and holds one PHP worker
  until then. On a single-process server (`php artisan serve`, `php -S`) other
  requests wait for the turn; `relay_seconds` 0 restores polling.
- Channels send the final text; progressive edits of a Telegram or Slack
  placeholder are a separate slice (S11c).
