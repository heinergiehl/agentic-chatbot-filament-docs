# Product Overview

Filament Agentic Chatbot adds a production-ready AI assistant layer to a Laravel + Filament app.

The default runtime is now assistant-graph first:

- **Direct assistant answers** when no tool call is needed
- **Source-grounded answers** when a user needs grounded context from docs, files, URLs, or API-fed records
- **Workflow execution** when a user needs multi-step routing, data collection, tool calls, or guided task flows

## What This Plugin Adds

- A Filament-native control plane for bots, sources, workflows, conversations, and operations
- An embeddable chat widget you can place on your marketing site, product frontend, or internal tools
- Queue-driven ingestion for text, files, public URLs, and JSON API records
- Assistant graph orchestration with optional knowledge search and workflow execution exposed as tools
- Visual workflow orchestration with triggers, conditions, AI agents, retrieval nodes, actions, and external API calls
- Smart Data Queries for safe natural-language lookups against allowed internal data resources
- Package-owned Telegram and Slack channel integrations that reuse the same bot, workflow, conversation, usage, and budget runtime
- Per-bot provider, model, retrieval, access, branding, and behavior controls
- Operational tooling such as setup diagnostics, ingestion visibility, testing actions, and privacy endpoints

## Why This Plugin Exists

The earlier Filament RAG plugin solves one important problem well: grounded question answering over your knowledge base.

This newer plugin keeps that capability and adds a second layer:

- workflows that guide the conversation instead of only answering one message at a time
- branching logic for qualification, routing, escalation, and onboarding
- action and HTTP nodes for task execution and integrations
- AI-assisted workflow generation and import/export support

If you only need a classic documentation bot, this plugin can do that.
If you want a bot that can also collect information, choose a path, call tools, and complete business flows, this is the plugin for that.

## Typical Use Cases

- Customer support bots that answer from docs and escalate when confidence is low
- Sales assistants that qualify leads and route enterprise prospects differently
- Onboarding assistants that ask follow-up questions and personalize next steps
- Internal helpdesk bots that search runbooks and trigger actions or API calls
- Product copilots that combine retrieval with structured workflows

## What It Does Not Do On Its Own

This plugin does not automatically become your full AI product.

You still need to provide the rest of the product stack that depends on your business:

- Billing
- Tenancy
- Business-specific actions and integrations
- App-level permissions beyond the plugin's assistant controls
- Your own domain knowledge, policies, and source content
- Provider-specific OAuth2 flows or direct database-source ingestion unless you implement those integrations or expose curated APIs

## Core Feature Areas

### Bot Management

- Multiple bots with separate prompts, models, providers, branding, and access rules
- Public, member, and admin context areas
- Domain allowlists and signed widget embeds

### Source-Grounded Knowledge

- Text, file, URL, and API sources
- Queue-based ingestion and retry handling
- Chunking, embedding, and vector persistence
- Source-backed answers with citations and configurable retrieval controls

### Agentic Workflows

- Visual builder for triggers, messages, inputs, conditions, routers, and loops
- AI agent nodes for classification, generation, extraction, and decision support
- Knowledge-base nodes for grounded context inside workflows
- Action and HTTP request nodes for backend automation and integrations
- Data Retrieval and Smart Data Query starters for safe internal record lookups
- Reusable API connectors for workflow calls and API-fed knowledge sources

### Widget and Delivery

- One-script embed for websites
- Optional NPM loader for SPA frameworks
- Native Telegram and Slack channel connections for realtime external chat entry points
- Style templates, titles, subtitles, welcome text, quick prompts, and response formatting

### Operations and Security

- Setup diagnostics through `php artisan filament-agentic-chatbot:doctor`
- Queue and ingestion visibility in the panel
- Domain restrictions, signing, throttling, and SSRF protections
- Privacy endpoints for export and deletion workflows

## How It Differs From The RAG-Only Plugin

- The RAG plugin is optimized for knowledge-grounded Q&A
- The agentic plugin includes that foundation and adds workflow execution
- The RAG plugin answers questions; this plugin can also collect state, branch, and take actions

For a direct comparison, read `HOW_IT_DIFFERS_FROM_FILAMENT_RAG.md`.

## Best Starting Points

- Read `CORE_CONCEPTS.md` for the product model and terminology
- Read `AGENT_RUNTIME_ARCHITECTURE.md` for the assistant graph runtime model
- Read `AGENTGRAPH_SDK_USAGE.md` for the AgentGraph SDK integration surface
- Read `DATABASE_AND_BREAKING_CHANGES.md` before upgrading an existing production app
- Read `HOW_IT_DIFFERS_FROM_FILAMENT_RAG.md` for positioning against the earlier plugin
- Read `QUICKSTART.md` for installation and first setup
- Read `RAG_SOURCES.md` and `API_CONNECTORS.md` for API-fed knowledge setup
- Read `API_SOURCE_ROADMAP.md` for current API source scope and planned improvements
- Read `AGENTIC_WORKFLOWS.md` for the workflow layer
- Read `CHANNELS.md` for Telegram and Slack channel setup
- Read `WORKFLOW_PROMPT_TEMPLATES.md` for practical examples
