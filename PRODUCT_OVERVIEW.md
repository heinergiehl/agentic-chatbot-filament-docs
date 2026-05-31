# Product Overview

Filament Agentic Chatbot adds a Commercial Early Access grounded assistant layer to a Laravel + Filament app. It is designed for teams that want the control surface, workflow tooling, and embed experience of an AI product without building the entire operational layer from scratch.

> Commercial Early Access means the `0.x` line is already sold and usable in real host apps, but still pre-`1.0`. Core install, widget embeds, workflows, analytics, privacy endpoints, server API access, and operator tooling ship today. Expect a few rough edges while the package hardens, validate in staging, and treat buyer feedback as part of rollout. Early-access pricing reflects that stage.

## What This Plugin Adds

- A Filament-native control plane for managing bots, sources, workflows, ingestion, retrieval, and conversations
- An embeddable chat widget you can place on your website or product frontend
- Queue-driven source ingestion for text, files, and public URLs
- Retrieval tuning per bot, including top-k, similarity thresholds, and context limits
- Provider and model configuration per bot
- Agentic workflows with branching, actions, connectors, releases, and execution traces
- Bot analytics, widget feedback capture, and knowledge-gap reporting
- Operational tooling such as setup checks, source health, testing actions, privacy endpoints, and analytics

## Why Someone Would Use It

- To add a support, onboarding, product-help, or internal-assistant chatbot to an existing Filament app
- To ship a sellable AI feature faster without building the full assistant admin and workflow layer from scratch
- To manage multiple assistants from one admin panel
- To let non-developers manage bot behavior, sources, workflows, and widget branding inside Filament

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

### Agentic Workflows

- Visual workflow builder for guided assistant behavior
- Natural-language workflow generation for first drafts
- Runs, traces, and release history for safe iteration
- Connector and action steps for backend or external system handoffs

### Widget and Embeds

- One-script embed for websites
- NPM loader for SPA frameworks
- Style templates, accent colors, titles, subtitles, quick prompts, welcome text, and live preview inside the bot editor

### Analytics and Operator Confidence

- Bot analytics with traffic, citation coverage, user feedback, and potential knowledge gaps
- Runtime status, setup checks, and provider test actions before public rollout
- Privacy/history controls for export and deletion workflows

### Operations and Security

- Setup diagnostics through `php artisan filament-agentic-chatbot:doctor`
- Queue and ingestion visibility in the panel
- Domain restrictions, signing, rate limiting, and workflow request hardening
- Privacy endpoints for export and deletion workflows, plus workflow trace redaction controls

## Best Starting Points

- Read [Core Concepts](CORE_CONCEPTS.md) for the product model and terminology
- Read [Bots](BOTS.md) for assistant configuration
- Read [Knowledge Sources](KNOWLEDGE_SOURCES.md) for source types and creation flow
- Read [Ingestion and Retrieval](INGESTION_AND_RETRIEVAL.md) for how grounding works
- Read [Chat Widget](CHAT_WIDGET.md) for embedding and UX
- Read [Quickstart](QUICKSTART.md) for installation and first setup
