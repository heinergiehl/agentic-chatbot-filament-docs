# Product Overview

Filament Agentic Chatbot adds AI Agents to a Laravel + Filament app. An Agent
answers from your content, reads and writes approved business data with
visible visitor confirmation, hands over to people, and stays observable,
without building the assistant admin and runtime layer yourself.

> Commercial Early Access: the `0.x` line is sold and usable in real host apps,
> but still pre-`1.0`. Expect a few rough edges, validate every rollout in
> staging, and treat buyer feedback as part of the rollout.

For a first rollout, follow the [Quick Start golden path](QUICKSTART.md#7-golden-path-agent-to-live-deployment):
create one Agent, connect only the knowledge and tools it needs, test it in the
editor's chat, and publish. Add a Playbook only for a multi-step process.

## Navigation

The plugin adds one navigation group, **Agentic Chatbot**:

| Section | Contents |
| --- | --- |
| **Build** | Agents (with Safety settings, tests and versions in the editor), Playbooks, Knowledge |
| **Connect** | Channels, APIs & MCP, Data, Webhooks; the overview holds access tokens |
| **Inbox** | Handoffs and action reviews that wait for a person, with a count badge |
| **Insights** | Conversations, Submissions, Usage |

The plugin class configures the group, order, labels, icons and shown sections.

## Feature Areas

### Agents

- Separate instructions, provider, model, knowledge, tools and widget per Agent
- **Test**: a chat beside the editor that runs the saved draft, shows tool calls
  and simulates writes
- **Publish** makes the draft live as an immutable version; **Versions >
  Restore** brings back an earlier one
- **Tests**: saved conversations with tool, text and rubric checks, run against
  the draft; failing tests warn when publishing
- **Safety**: topic limits, blocked words, masking or blocking of personal data
- A token budget for the conversation history, so long conversations keep
  answering
- Solution Kits create a complete inactive Agent for a use case, starting with
  Customer Support & Human Handoff

### Knowledge

- Text, files (Markdown, HTML, JSON, text-based PDF, DOCX, CSV, XLSX), web
  pages and JSON APIs
- A shared library: one source can serve several Agents
- Daily or weekly re-sync for URL and API sources; unchanged content is not
  re-indexed
- Answers with citations; a live Agent uses the content version it was
  published with

### Data, APIs and MCP

- Data Resources: one-screen setup for an Eloquent model; list, count, search,
  totals and counts per group, linked record names
- API Connectors with immutable published operations and an Integration Studio
  for OpenAPI, Postman and cURL import
- MCP servers: import all tools of a remote server in one step; one connection
  for several Agents
- Writes as direct tools with a confirmation card; the write runs once after
  the visitor confirms, and unknown outcomes are reported as unknown

### Playbooks

- Optional processes such as a callback, appointment, return or quote request
- The Agent calls a Playbook like a tool and collects its inputs in
  conversation; the visitor can cancel at any time
- Editor with a step list and an optional canvas, seven templates, an AI draft
  from a description, autosave, a test chat and one-click publishing
- Runs listed on each Playbook and conversation

### Widget and Channels

- One-script embed with tokenless signed bootstrap and per-Agent domain
  allowlists
- Streamed answers, confirmation cards, private attachments, twelve style
  templates and a typed NPM SDK
- Telegram, and opt-in Slack, WhatsApp Cloud API, Mailtrap and Mailgun email
  through the same Agent runtime

### People and Automation

- Built-in human handoff and lead capture, one switch each
- Handoff Desk with assignment, internal notes, replies in the existing chat
  and an explicit return to the Agent
- Outbound webhooks for conversations, submissions, feedback, handoffs,
  Playbook results, action reviews and budget thresholds, with optional
  redacted content
- A read API for submissions, conversations and handoffs

### Insights and Operations

- Conversation review, feedback, citation coverage and knowledge gaps
- Usage: cost and tokens per Agent and day, budgets, default model prices and
  price overrides in the panel
- English and German UI; French and Spanish by machine translation
- `php artisan filament-agentic-chatbot:doctor`, privacy export and deletion
  endpoints, trace redaction

## What It Does Not Do On Its Own

The host application still owns billing, tenancy, users and permissions beyond
the plugin's access controls, business data and source content, and the final
production policy.

## Best Starting Points

- [Core Concepts](CORE_CONCEPTS.md)
- [Quickstart](QUICKSTART.md)
- [Agents](BOTS.md)
- [Knowledge Sources](KNOWLEDGE_SOURCES.md)
- [Data Resources](DATA_RESOURCES.md)
- [Agents and Playbooks](AGENTIC_WORKFLOWS.md)
- [Chat Widget](CHAT_WIDGET.md)
- [Known Limitations](KNOWN_LIMITATIONS.md)
