# Product Overview

Filament Agentic Chatbot adds a Commercial Early Access Agent layer to a Laravel + Filament app. It is designed for teams that want governed conversational Agents, optional visual Playbooks, and an embed experience without building the entire operational layer from scratch.

> Commercial Early Access means the `0.x` line is already sold and usable in real host apps, but still pre-`1.0`. Core install, widget embeds, workflows, analytics, privacy endpoints, server API access, and operator tooling ship today. Expect a few rough edges while the package hardens, validate in staging, and treat buyer feedback as part of rollout. Early-access pricing reflects that stage.

For a first rollout, follow the [Quick Start golden path](QUICKSTART.md#7-golden-path-agent-to-live-deployment): create one Agent, connect only approved knowledge and capabilities, test it, and publish exactly one Agent deployment. Add a Playbook only for a bounded process.

## What This Plugin Adds

- A Filament-native control plane for managing Agents, sources, optional Playbooks, ingestion, retrieval, and conversations
- Versioned Solution Kits that atomically create an inactive Agent, tested Playbook drafts, and outcome goals for a concrete use case
- An Integration Studio that locally imports OpenAPI, Postman, or cURL into reviewed inactive API Connector drafts, with an optional centrally configured AI metadata assistant
- An embeddable chat widget you can place on your website or product frontend
- Queue-driven source ingestion for text, files, and public URLs
- Retrieval tuning per bot, including top-k, similarity thresholds, and context limits
- Provider and model configuration per bot
- Optional agentic Playbooks with branching, approvals, actions, connectors, immutable releases, and execution traces
- Bot analytics, widget feedback capture, durable high-confidence knowledge operations, and evidence-backed business outcomes
- Operational tooling such as setup checks, source health, testing actions, privacy endpoints, and analytics
- Transactional, signed outbound business-event webhooks with retries, dead letters, and an operator delivery ledger

## Why Someone Would Use It

- To add a support, onboarding, product-help, or internal-assistant chatbot to an existing Filament app
- To ship a sellable AI feature faster without building the full assistant admin and workflow layer from scratch
- To manage multiple assistants from one admin panel
- To let non-developers manage Agent behavior, sources, Playbooks, and widget branding inside Filament

## Best Fit

This plugin is a strong fit when you already have a Laravel application, already use Filament for operations, and want AI assistants to feel like a real product surface instead of a side experiment. It is especially well suited to support portals, SaaS dashboards, onboarding flows, product-help assistants, and internal operator tooling.

## What It Does Not Do On Its Own

This plugin does not automatically turn a Filament panel into a complete AI product by itself.

You still need to provide the rest of the product stack that depends on your business:

- Billing
- Tenancy
- Product-specific workflows
- User permissions beyond the plugin's assistant access controls
- Your own domain data and source content

## Core Feature Areas

### Bot Management

- Multiple bots with separate prompts, models, providers, and widget branding
- Public, member, and admin context areas
- Domain allowlists and signed widget embeds

### Knowledge Ingestion

- Text, file, and URL sources
- Queue-based ingestion and retry handling
- Chunking, embedding, and vector persistence
- Re-ingest and rebuild tooling when settings change

### Retrieval and Answers

- Configurable retrieval depth and similarity
- Source-backed chat responses with citations
- Streaming responses for the widget experience
- Markdown or plain-text answer formats

### Agents and Playbooks

- Agent-owned conversation and intent understanding without a required canvas
- App-aware Solution Kits for reviewed use cases, beginning with Customer Support & Human Handoff
- Visual Playbook Builder for bounded multi-step processes
- Natural-language Playbook generation for first drafts
- Runs, traces, and immutable deployment history for safe iteration
- Governed capability steps for backend or external system handoffs

### API Integration Studio

- Five-step full-page import and review flow for OpenAPI 3.x, Postman Collection v2, and pasted cURL
- Deterministic, non-executing parsing with secret-bearing samples, scripts, files, and remote references discarded
- Optional AI presentation suggestions that reuse centrally configured provider keys and cannot alter HTTP or safety semantics
- Atomic, idempotent creation of inactive connector/operation drafts with immutable actor-attributed evidence
- A Filament Capability Bridge that validates and displays explicitly registered host actions without reflecting arbitrary UI or model methods
- Encrypted, exact-draft offline response fixtures that rehearse canonical decoding, outcome, schema, and mapping behavior without network access or publication authority
- Normal governed testing, immutable publication, and Agent candidate activation remain mandatory

### Widget and Embeds

- One-script embed for websites
- Typed, framework-free NPM lifecycle SDK for SPA frameworks (`ready`, open/close/toggle, safe state, events, refresh, teardown)
- Short-lived signed customer/tenant context bound to Agent, area, and exact browser origin, with memory-only renewal and deterministic authority scopes
- Style templates, accent colors, titles, subtitles, quick prompts, welcome text, and live preview inside the bot editor

### Analytics and Operator Confidence

- Bot analytics with traffic, citation coverage, user feedback, verified knowledge-search gaps, and business outcomes with optional attributed value
- Manual or scheduled Published Agent regressions that exercise the persistent production chat path with current deployment, route, citation, write, latency, and cost evidence
- A guided gap-to-fix loop that links one encrypted runtime signal to a Knowledge Source and requires a current passing regression before resolution
- Runtime status, setup checks, and provider test actions before public rollout
- Privacy/history controls for export and deletion workflows

### Human Handoff Desk

- One active, versioned support case per conversation with team routing and business-hours SLAs
- Claim/assignment, encrypted internal notes, and customer replies inside the original web or enabled external-provider thread; Telegram is available by default, Slack is a real-provider-tested opt-in, and WhatsApp plus both email providers remain fail-closed pending their own acceptance
- Deterministic Agent pause during takeover, explicit resolve/handback actions, and immutable actor-attributed activity
- Safe widget polling that exposes no operator identity, internal note, assignment, or SLA data

### Business Event Automation

- Agent-bound subscriptions for verified outcomes and handoff lifecycle events
- Transactional outbox recording, public-ID payloads, HMAC signatures, receiver idempotency, bounded retry, and dead-letter recovery
- HTTPS-only DNS-pinned delivery with no redirects, private-network access, conversation content, customer contact data, credentials, or internal notes
- In-panel signed test, activation gate, health evidence, and authorized reasoned manual retry

### Operations and Security

- Setup diagnostics through `php artisan filament-agentic-chatbot:doctor`
- Queue and ingestion visibility in the panel
- Domain restrictions, signing, rate limiting, and workflow request hardening
- Privacy endpoints for export and deletion workflows, plus workflow trace redaction controls

## Best Starting Points

- Read [Core Concepts](CORE_CONCEPTS.md) for the product model and terminology
- Read [Bots](BOTS.md) for assistant configuration
- Read [Solution Kits](SOLUTION_KITS.md) for app-aware Agent templates and their gated release path
- Read [Knowledge Sources](KNOWLEDGE_SOURCES.md) for source types and creation flow
- Read [Data Resources](DATA_RESOURCES.md) for live database reads, narrowly governed Playbook mutations, approved columns, and per-Agent narrowing
- Read [Integration Studio](INTEGRATION_STUDIO.md) for importing and reviewing external API operations without creating a second runtime path
- Read [Outbound Webhooks](OUTBOUND_WEBHOOKS.md) for external business-event automation and receiver verification
- Read [Ingestion and Retrieval](INGESTION_AND_RETRIEVAL.md) for how grounding works
- Read [Chat Widget](CHAT_WIDGET.md) for embedding and UX
- Read [Quickstart](QUICKSTART.md) for installation and first setup
