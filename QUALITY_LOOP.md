# Chatbot Quality Loop

The quality loop turns real conversations and draft workflow tests into repeatable improvement work. It is intentionally deterministic: operators define expected behavior, run scenarios, review failures, and convert negative feedback into new checks.

## Quality Lab

Use **Agentic Chatbot > Quality Lab** to create saved scenarios for a bot.

Each scenario stores:

- the user message to replay
- optional workflow draft target
- required or forbidden response text
- expected workflow path or variables
- optional citation, latency, and cost gates
- whether the scenario blocks release work when it fails

Scenarios can target the direct bot answer path or a workflow draft. Runs store score, status, failed checks, response excerpts, latency, cost, and the latest failure summary.

## Workflow Editor Panel

Workflow-linked scenarios appear in the workflow editor's **Quality** panel. Save the draft, run scenarios from the panel, and review pass/fail state before publishing.

Failed runs include compact **Fix Suggestions**. These suggestions are rule-based and point the operator to the likely work area: knowledge content, instructions, citations, routing, variable mapping, latency, or cost.

## Assistant Profile Studio

The bot Behavior form includes assistant profile controls for tone, persona, boundaries, answer style, and fallback behavior. These values are folded into the bot prompt so operators can improve conversation quality without editing workflow JSON.

## Human Handoff Inbox

Workflows and runtime services can create handoff requests for low-confidence, blocked, or human-required moments. The **Handoff Requests** resource gives operators a queue with status, priority, source, contact details, transcript context, workflow/run links, and assignment fields.

## Feedback To Improvement

The bot Analytics feedback inbox includes **Create Scenario** for negative assistant-message feedback. The action creates a non-blocking Quality Lab scenario from the previous user question, links it to the feedback message, and attaches the matching workflow run when turn metadata is available.

If the feedback comment contains clear terms, the scenario is active and uses those terms as required text. If the comment is empty or too vague, the scenario is created inactive for manual review so it cannot produce a false green quality run.

## Operating Rhythm

1. Review failed quality runs and feedback daily.
2. Convert important negative feedback into scenarios.
3. Add missing expectations or fix suggestions before activating vague scenarios.
4. Update knowledge sources, assistant profile, workflow routing, or variables.
5. Re-run scenarios in the workflow editor before publishing.
6. Keep blocking scenarios focused on release-critical behavior.
