# Chatbot Quality Loop

The quality loop turns real conversations and draft workflow tests into repeatable improvement work. It is intentionally deterministic: operators define expected behavior, run scenarios, review failures, and convert negative feedback into new checks.

## Quality Lab

Use **Agentic Chatbot > Quality Lab** to create saved scenarios for an Agent or
Playbook.

Each scenario stores:

- one or more ordered user turns
- either the live immutable Agent deployment or one Playbook draft as its target
- required or forbidden response text per turn
- for Agent turns, the complete exact set of expected choices: no tool,
  knowledge, Data Resources, API Connectors, a Playbook, or clarification
- exact distinct-item coverage for direct API reads when relevant
- expected Playbook path or variables when the target is a draft
- optional citation, latency, and cost gates
- whether a Playbook-draft scenario blocks publishing when it fails

Agent scenarios replay every ordered turn in one fresh test conversation through
the durable chat application service. This makes a compound first request plus
a short follow-up such as “and Dortmund?” a real history test. Every expected
choice must occur; missing or incomplete evidence, wrong item coverage, and
unexpected tool attempts fail closed. Runs store score, status, failed checks,
response excerpts, latency, cost, and the latest failure summary.

Published Agent scenarios can optionally run hourly, every 6 or 12 hours,
daily, or weekly. The scheduler atomically claims due scenarios and sends them
to the normal asynchronous queue; each job reuses the exact Quality Lab runner
and the Agent's existing provider/model credential resolution. There is no
separate automation API key. Claims recover after a bounded stale lease, and
the scenario records only bounded failure codes and counters.

## Verified Knowledge Operations

The Agent Analytics **Knowledge** tab is an operator inbox, not an LLM guess at
missing content. A gap appears only when a committed completed production turn
records a Knowledge search, the deterministic safe-capability fallback, and no
source evidence. Questions are deduplicated by a normalized hash while the
bounded displayed excerpt remains encrypted.

Operators can review the sampled conversation, start work, create an idempotent
Published Agent regression, improve a completed Knowledge Source, and verify
resolution only after the current live deployment passes that linked test with
Knowledge routing, a citation, and zero writes. Ignore and resolution actions
require operator evidence and remain auditable. See
[Quality Operations](QUALITY_OPERATIONS.md) for scheduler, privacy, and
incident procedures.

## Workflow Editor Panel

Workflow-linked scenarios appear in the workflow editor's **Quality** panel. Save the draft, run scenarios from the panel, and review pass/fail state before publishing.

Failed runs include compact **Fix Suggestions**. These suggestions are rule-based and point the operator to the likely work area: knowledge content, instructions, citations, routing, variable mapping, latency, or cost.

## Assistant Profile Studio

The bot Behavior form includes assistant profile controls for tone, persona, boundaries, answer style, and fallback behavior. These values are folded into the bot prompt so operators can improve conversation quality without editing workflow JSON.

## Human Handoff Inbox

Workflows and runtime services can create handoff requests for low-confidence,
blocked, or human-required moments. The **Handoff Requests** resource is a
transactional support desk rather than a free-form status editor:

1. An escalation opens one active case per conversation and calculates first
   response and resolution targets in configured business hours.
2. An authorized operator claims the case, reviews the transcript and linked
   run, adds encrypted internal notes, or sends a customer-visible reply.
3. Human replies are stored in the original conversation and delivered through
   its web, Telegram, Slack, WhatsApp, or Email thread. External-channel writes fail atomically
   when no verified thread binding exists.
4. Customer messages move the case back to **Waiting for operator**. While the
   case is active, the deterministic handoff owner intercepts the turn before
   any Agent or model execution.
5. **Resolve** records a solved support case; **Return to Agent** records an
   explicit handback. Both end the takeover, and later customer messages may be
   handled by the Agent again.

Every state-changing action carries an optimistic state version and an
idempotency key. A stale browser tab conflicts instead of overwriting newer
work, and an exact retry returns the already committed result. The activity
timeline is append-only and records actor, transition, visibility, linked
message/delivery evidence, and handoff version. Operators cannot bypass this
contract with direct model edits.

Configure the default team, timezone, business hours, priority SLAs, optional
team overrides, polling interval, and optional default assignee under
`bot_handoff_requests.desk`. Production access uses the existing view/manage
Gates and the record-aware SQL authorization scope described in
[Security and Privacy](SECURITY_AND_PRIVACY.md#handoff-desk-authorization-and-privacy).

The local host browser regression is `npm --prefix tests/e2e run
test:handoff-desk`. It verifies the desktop inbox, the 390-pixel keyboard flow,
non-empty action dialogs, durable operator activity, encrypted notes, and
explicit return to the Agent.

## Feedback To Improvement

The Agent Analytics feedback inbox includes **Create Scenario** for negative assistant-message feedback. The action creates a non-blocking Quality Lab scenario from the previous user question, links it to the feedback message, and attaches the matching Playbook run when turn metadata is available.

If the feedback comment contains clear terms, the scenario is active and uses those terms as required text. If the comment is empty or too vague, the scenario is created inactive for manual review so it cannot produce a false green quality run.

## Operating Rhythm

1. Review failed automated/manual quality runs, feedback, and verified gaps daily.
2. Convert important negative feedback or verified gaps into scenarios.
3. Add missing expectations or fix suggestions before activating vague scenarios.
4. Update knowledge sources, Agent behavior, Playbook structure, or variables.
5. Re-run scenarios against the current target before publishing or resolving a gap.
6. Keep blocking scenarios focused on release-critical behavior.
