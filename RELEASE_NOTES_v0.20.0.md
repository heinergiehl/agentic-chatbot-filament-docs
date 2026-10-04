# Filament Agentic Chatbot 0.20.0

**Release status:** Approved<br>
**Release date:** 2026-10-04<br>
**Upgrade baseline:** 0.19.0<br>
**Previous-line security/critical EOL:** 2027-01-02

Version 0.20.0 overhauls the plugin. An Agent answers from your content, reads and writes approved business data with visible visitor confirmation, hands over to people, and stays observable. Setup takes fewer screens, every UI text is translated, and the release candidate ceremony is gone. This is a breaking minor release: plan a maintenance window and publish every Playbook and Agent again.

## Agent runtime

One transcript-based Agent loop (ADR 0037) answers every chat turn over the persisted conversation, including earlier tool calls and results. Long conversations fit a token budget derived from the model's context window. Unknown tool calls return an error naming the available tools instead of failing the turn.

## Agents, publishing and tests

**Publish** compiles an immutable, hash-verified version with pinned dependencies and makes it live in one step; **Restore** brings back an earlier version (ADR 0041). **Test** opens a chat on the saved draft beside the editor. The **Tests** tab holds saved Agent tests with tool, text and rubric checks. The **Safety** section holds topic rules, blocked words and personal-data handling (allow, mask or block) (ADR 0043); **Stay strictly on topic** adds a scope check before each answer (ADR 0044). Human handoff and lead capture are built-in tools (ADR 0039).

## Writes with confirmation

Published write operations of API Connectors and MCP servers, and inserts and updates of assigned Data Resources, are Agent tools (ADR 0038). A call shows the visitor a card with the exact values; nothing is written before Confirm. Telegram, Slack and WhatsApp confirm with native buttons. Direct Data Resource updates reach only the current visitor's records unless an Agent-wide update is explicitly allowed, which always confirms.

## Data, Playbooks and knowledge

Data Resources are set up on one screen and support totals, groups, search and linked record names. Playbooks are flat Agent tools with one input schema and a step-list editor (ADR 0040); approvals are decided on the confirmation card. Knowledge is a library of sources shared by Agents, with daily or weekly re-sync and DOCX, CSV and XLSX files.

## Connections, webhooks and usage

API Connectors and MCP servers can serve selected Agents; MCP tools are imported in one reviewed step. New webhook events report conversations, submissions, feedback, Playbook outcomes, action reviews and budget thresholds; a read API returns submissions, conversations and handoffs for scoped access tokens. Usage opens on a monthly overview with default model prices that admins can override.

## Widget, channels and languages

The widget streams answers while the queue worker runs the turn (ADR 0042), supports up to eight grouped conversation starters, and accepts pasted and dropped attachments. Navigation is **Build**, **Connect**, **Inbox** and **Insights**. Admin, runtime, widget and editor texts are complete in English and German; French and Spanish are machine translated and not reviewed by native speakers.

## Required upgrade

1. Back up the application database and the plugin's PostgreSQL connection, and keep the 0.19.0 package and configuration.
2. Pause public chat, let open Playbook runs and confirmation cards finish, and stop queue workers.
3. Install 0.20.0, run `php artisan migrate`, refresh Filament assets, clear caches and run Doctor.
4. Run the Laravel scheduler every minute, a queue worker for the `agentic-chat` queue, and a cache store shared by web and queue processes.
5. Publish every Playbook, then every Agent, after checking Safety, Built-in tools and the confirmation switch of each assigned write. Recreate important former quality scenarios as Agent tests.

Quality Tests, Guardrail Policies, the release candidate flow, the Launch Dashboard and the old usage widgets are removed. Several migrations drop tables and columns and are irreversible: `migrate:rollback` is not a way back. To roll back, restore the backup from step 1 with the 0.19.0 package.

See [Upgrading](UPGRADING.md#upgrading-to-v0200), the [Changelog](CHANGELOG.md), [Compatibility](COMPATIBILITY.md) and [Support Policy](SUPPORT_POLICY.md). The `0.19` line receives security and critical fixes until 2027-01-02; the previously announced `0.18` EOL remains 2026-12-04.
