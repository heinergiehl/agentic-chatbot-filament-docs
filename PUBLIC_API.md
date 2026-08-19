# Public API

This file is the supported pre-1.0 host integration allowlist. Package classes,
methods, routes, commands, views, configuration keys, tags, or assets not listed
here are internal implementation details and may change without compatibility
aliases.

## Filament plugin

Register a new plugin instance on each Filament panel. `widgetEnabled()` affects
only that panel; it does not configure ingestion or other global runtime state.

```php
use Heiner\FilamentAgenticChatbot\FilamentAgenticChatbotPlugin;

$panel->plugin(
    FilamentAgenticChatbotPlugin::make()->widgetEnabled(),
);
```

Global ports are normal Laravel bindings in a host service provider:

```php
$this->app->singleton(
    \Heiner\FilamentAgenticChatbot\Contracts\ExtractsContent::class,
    \App\Chatbot\ContentExtractor::class,
);
```

## Capability and action providers

`CapabilityProvider` is the single host extension seam for visitor-safe
capability discovery and immutable workflow actions. Register the provider as a
singleton and tag it with the interface class. Action execution is still
materialized, authorized, confirmed, idempotent, and invoked through the
package capability gateway.

```php
<?php

namespace App\Chatbot;

use Heiner\FilamentAgenticChatbot\Services\Capabilities\CapabilityActionDefinition;
use Heiner\FilamentAgenticChatbot\Services\Capabilities\CapabilityDiscoveryContext;
use Heiner\FilamentAgenticChatbot\Services\Capabilities\CapabilityProvider;
use Heiner\FilamentAgenticChatbot\Services\Capabilities\CapabilitySemanticProfile;

final class CrmCapabilityProvider implements CapabilityProvider
{
    public function category(): string { return 'crm'; }
    public function label(): string { return 'CRM'; }
    public function summary(): string { return 'Approved CRM lookups.'; }

    public function items(CapabilityDiscoveryContext $context): array
    {
        return [[
            'key' => 'crm_lookup',
            'label' => 'CRM lookup',
            'summary' => 'Find an approved CRM record by ID.',
        ]];
    }

    public function actions(): array
    {
        return [new CapabilityActionDefinition(
            key: 'crm_lookup',
            version: '1',
            sideEffect: 'read',
            requestSchema: [
                'type' => 'object',
                'properties' => ['id' => ['type' => 'string']],
                'required' => ['id'],
                'additionalProperties' => false,
            ],
            resultSchema: [
                'type' => 'object',
                'properties' => ['id' => ['type' => 'string']],
                'required' => ['id'],
                'additionalProperties' => false,
            ],
            confirmationPolicy: 'none',
            idempotencyPolicy: ['mode' => 'none'],
            semanticProfile: new CapabilitySemanticProfile(
                label: 'CRM lookup',
                description: 'Find an approved CRM record by identifier.',
                intentExamples: ['Find CRM record 42.'],
                entityTypes: ['crm_record'],
            ),
            handler: static fn (array $payload): array => ['id' => $payload['id']],
        )];
    }
}
```

Register it in the host application's service provider:

```php
use App\Chatbot\CrmCapabilityProvider;
use Heiner\FilamentAgenticChatbot\Services\Capabilities\CapabilityProvider;

public function register(): void
{
    $this->app->singleton(CrmCapabilityProvider::class);
    $this->app->tag(CrmCapabilityProvider::class, CapabilityProvider::class);
}
```

Providers return `CapabilityActionDefinition` objects from `actions()`. Write
actions must declare `runtime_grant` confirmation and a gateway idempotency
policy. Every action must declare non-empty request and result schemas; both are
part of the immutable contract hash, and results are validated before entering
workflow state. Every action also declares a secret-free
`CapabilitySemanticProfile` with a human label, precise description, intent
examples, optional aliases, and optional entity-type identifiers. The profile is
hashed with the executable contract and lets deployment project only capabilities
reachable from a declared workflow route into its semantic classifier. It does
not grant execution authority. Duplicate or incomplete action contracts fail
package boot/resolution and are reported by the Doctor command before chat traffic.

Providers that need locale aliases, canonical external IDs, or tenant-specific
entity lookup may additionally register a `CapabilityEntityResolver` singleton
tagged with that interface. A resolver owns exactly one stable entity type and
returns a typed `CapabilityEntityResolution` (`resolved`, `ambiguous`,
`not_found`, or `unavailable`). Initial slot prefill accepts only high-confidence
`resolved` values; every other outcome remains unfilled so the declared workflow
can clarify. Resolvers normalize data only—they do not select routes or authorize
capability execution. They must be deterministic and side-effect-free; any
external lookup remains a deployed workflow capability executed through the
package gateway.

## Configuration

Only the keys in `config_keys` below are supported host configuration. Empty
map/list keys are deliberate extension collections at that exact path. A
published key outside this list is ignored and reported by Doctor with its
upgrade instruction; internal runtime defaults are not host configuration.

## Non-PHP contracts

- The public widget Blade component is
  `filament-agentic-chatbot::chat-widget`.
- The widget script route name is
  `filament-agentic-chatbot.widget.script`. Its URI follows the canonical
  `widget.script_route` host setting; the removed `/widget.js` alias is not
  supported.
- The chat and channel HTTP endpoints listed in the machine allowlist are the
  supported transport surface. Controller classes are internal.
- Filament resource/page/widget classes, render-hook implementation, generated
  workflow-editor chunks, package views other than the widget component, and
  migration filenames are internal.

## Executable allowlist

The test suite reads this JSON block directly. Keep it valid JSON.

<!-- PUBLIC_API_ALLOWLIST
{
  "php_types": [
    "Heiner\\FilamentAgenticChatbot\\FilamentAgenticChatbotPlugin",
    "Heiner\\FilamentAgenticChatbot\\Contracts\\ChunksText",
    "Heiner\\FilamentAgenticChatbot\\Contracts\\ExtractsContent",
    "Heiner\\FilamentAgenticChatbot\\Contracts\\ResolvesSourceUrls",
    "Heiner\\FilamentAgenticChatbot\\Contracts\\DataQueryCostGuard",
    "Heiner\\FilamentAgenticChatbot\\Contracts\\VectorStore",
    "Heiner\\FilamentAgenticChatbot\\Ingestion\\ContentExtractor",
    "Heiner\\FilamentAgenticChatbot\\Ingestion\\TextChunker",
    "Heiner\\FilamentAgenticChatbot\\Support\\DefaultSourceUrlResolver",
    "Heiner\\FilamentAgenticChatbot\\Services\\Capabilities\\CapabilityProvider",
    "Heiner\\FilamentAgenticChatbot\\Services\\Capabilities\\CapabilityActionDefinition",
    "Heiner\\FilamentAgenticChatbot\\Services\\Capabilities\\CapabilitySemanticProfile",
    "Heiner\\FilamentAgenticChatbot\\Services\\Capabilities\\CapabilityEntityResolver",
    "Heiner\\FilamentAgenticChatbot\\Services\\Capabilities\\CapabilityEntityResolution",
    "Heiner\\FilamentAgenticChatbot\\Services\\Capabilities\\CapabilityEntityResolutionContext",
    "Heiner\\FilamentAgenticChatbot\\Services\\Capabilities\\CapabilityEntityResolverRegistry",
    "Heiner\\FilamentAgenticChatbot\\Services\\Capabilities\\CapabilityDiscoveryContext",
    "Heiner\\FilamentAgenticChatbot\\Services\\Capabilities\\BotCapabilityView",
    "Heiner\\FilamentAgenticChatbot\\Channels\\Contracts\\ChannelActivityIndicator",
    "Heiner\\FilamentAgenticChatbot\\Channels\\Contracts\\ChannelDriver",
    "Heiner\\FilamentAgenticChatbot\\Channels\\Contracts\\ChannelMessageRenderer",
    "Heiner\\FilamentAgenticChatbot\\Channels\\Contracts\\ProvidesChannelWebhookResponse",
    "Heiner\\FilamentAgenticChatbot\\Channels\\Contracts\\ReportsChannelDeliveryStatuses",
    "Heiner\\FilamentAgenticChatbot\\Channels\\Contracts\\SendsChannelTypingIndicators",
    "Heiner\\FilamentAgenticChatbot\\Channels\\Activity\\ActivityContext",
    "Heiner\\FilamentAgenticChatbot\\Channels\\Activity\\ActivityIndicatorMode",
    "Heiner\\FilamentAgenticChatbot\\Channels\\Activity\\ChannelActivityHandle",
    "Heiner\\FilamentAgenticChatbot\\Channels\\DTO\\ChannelDeliveryStatus",
    "Heiner\\FilamentAgenticChatbot\\Channels\\DTO\\ChannelSendResult",
    "Heiner\\FilamentAgenticChatbot\\Channels\\DTO\\InboundChannelMessage",
    "Heiner\\FilamentAgenticChatbot\\Channels\\DTO\\OutboundChannelMessage",
    "Heiner\\FilamentAgenticChatbot\\Channels\\Rendering\\RenderedChannelMessage",
    "Heiner\\FilamentAgenticChatbot\\Channels\\RichMessages\\RichButton",
    "Heiner\\FilamentAgenticChatbot\\Channels\\RichMessages\\RichCard",
    "Heiner\\FilamentAgenticChatbot\\Channels\\RichMessages\\RichMessage",
    "Heiner\\FilamentAgenticChatbot\\Channels\\RichMessages\\RichSource",
    "Heiner\\FilamentAgenticChatbot\\Events\\AiUsageReconciliationRequired",
    "Heiner\\FilamentAgenticChatbot\\Events\\ChatMessageSent",
    "Heiner\\FilamentAgenticChatbot\\Events\\SourceIngested",
    "Heiner\\FilamentAgenticChatbot\\Events\\SourceIngestionFailed",
    "Heiner\\FilamentAgenticChatbot\\Support\\WidgetEmbedToken",
    "Heiner\\FilamentAgenticChatbot\\Services\\Quality\\Enums\\QualityCheckKey",
    "Heiner\\FilamentAgenticChatbot\\Services\\Quality\\Enums\\QualityCheckStatus",
    "Heiner\\FilamentAgenticChatbot\\Services\\Quality\\Enums\\QualityEditorIssueLevel",
    "Heiner\\FilamentAgenticChatbot\\Services\\Quality\\Enums\\QualityEditorIssueSource",
    "Heiner\\FilamentAgenticChatbot\\Services\\Quality\\Enums\\QualityFailureCategory",
    "Heiner\\FilamentAgenticChatbot\\Services\\Quality\\Enums\\QualityRouteMatchMode",
    "Heiner\\FilamentAgenticChatbot\\Services\\Quality\\Enums\\QualitySeverity"
  ],
  "plugin_methods": [
    "boot",
    "getId",
    "isWidgetEnabled",
    "make",
    "register",
    "widgetEnabled"
  ],
  "capability_provider_methods": [
    "actions",
    "category",
    "items",
    "label",
    "summary"
  ],
  "config_keys": [
    "action_review.actions",
    "action_review.authorization.enabled",
    "action_review.authorization.manage_ability",
    "action_review.authorization.require_gates",
    "action_review.authorization.view_ability",
    "action_review.default_mode",
    "action_review.enabled",
    "action_review.expires_after_minutes",
    "action_review.risky_write_mode",
    "agent_workflows.authorization.enabled",
    "agent_workflows.authorization.manage_ability",
    "agent_workflows.authorization.require_gates",
    "agent_workflows.authorization.view_ability",
    "api.include_session_auth_context",
    "api.max_execution_time",
    "api.max_requests_per_minute",
    "api.max_requests_per_minute_per_ip",
    "api.middleware",
    "api.prefix",
    "api.rate_limiter",
    "api.require_client_turn_id",
    "api.session_middleware",
    "api.turn_projection_max_requests_per_minute",
    "api.turn_projection_max_requests_per_minute_per_ip",
    "api.turn_projection_rate_limiter",
    "api.widget_bootstrap_max_requests_per_minute",
    "api.widget_bootstrap_max_requests_per_minute_per_ip",
    "api.widget_bootstrap_rate_limiter",
    "api_connectors.artifacts.disk",
    "api_connectors.artifacts.prefix",
    "api_connectors.authorization.enabled",
    "api_connectors.authorization.manage_ability",
    "api_connectors.authorization.require_gates",
    "api_connectors.authorization.view_ability",
    "api_connectors.default_allowed_methods",
    "api_connectors.default_allowed_path_patterns",
    "api_connectors.expose_public_endpoint",
    "api_connectors.owner_types",
    "api_connectors.require_explicit_allowlists",
    "api_connectors.require_ssl_verification",
    "api_connectors.strategies.classes",
    "bot_access_tokens.accept_authorization_bearer",
    "bot_access_tokens.authorization.enabled",
    "bot_access_tokens.authorization.manage_ability",
    "bot_access_tokens.authorization.require_gates",
    "bot_access_tokens.authorization.view_ability",
    "bot_access_tokens.bearer_prefix_required",
    "bot_access_tokens.default_channel",
    "bot_access_tokens.hash_key",
    "bot_access_tokens.invalid_attempts_per_minute",
    "bot_access_tokens.owner_types",
    "bot_conversations.authorization.enabled",
    "bot_conversations.authorization.manage_ability",
    "bot_conversations.authorization.require_gates",
    "bot_conversations.authorization.view_ability",
    "bot_conversations.diagnostics.authorization.enabled",
    "bot_conversations.diagnostics.authorization.manage_ability",
    "bot_conversations.diagnostics.authorization.require_gates",
    "bot_conversations.diagnostics.authorization.view_ability",
    "bot_handoff_requests.authorization.enabled",
    "bot_handoff_requests.authorization.manage_ability",
    "bot_handoff_requests.authorization.require_gates",
    "bot_handoff_requests.authorization.view_ability",
    "bot_submissions.authorization.enabled",
    "bot_submissions.authorization.manage_ability",
    "bot_submissions.authorization.require_gates",
    "bot_submissions.authorization.view_ability",
    "bot_usage_events.authorization.enabled",
    "bot_usage_events.authorization.manage_ability",
    "bot_usage_events.authorization.require_gates",
    "bot_usage_events.authorization.view_ability",
    "bots.authorization.enabled",
    "bots.authorization.manage_ability",
    "bots.authorization.require_gates",
    "bots.authorization.view_ability",
    "capabilities.default_mode",
    "capabilities.discovery.categories",
    "capabilities.discovery.enabled",
    "channels.activity.indicators",
    "channels.authorization.enabled",
    "channels.authorization.manage_ability",
    "channels.authorization.require_gates",
    "channels.authorization.view_ability",
    "channels.drivers",
    "channels.max_webhook_requests_per_minute",
    "channels.max_webhook_requests_per_minute_per_ip",
    "channels.queue.connection",
    "channels.queue.queue",
    "channels.rate_limiter",
    "channels.renderers",
    "channels.require_webhook_verification",
    "channels.store_raw_webhook_payloads",
    "channels.webhook_base_url",
    "chunking.overlap_tokens",
    "chunking.size_tokens",
    "chunking.tokenizer_encoding",
    "chunking.use_estimated_tokens",
    "commerce.anystack_id",
    "commerce.docs_url",
    "commerce.enabled",
    "commerce.support_email",
    "context.allowed_areas",
    "context.authorization.enabled",
    "context.authorization.guards",
    "context.authorization.public_areas",
    "context.authorization.require_auth_for_non_public",
    "context.default_area",
    "data_resources.authorization.enabled",
    "data_resources.authorization.manage_ability",
    "data_resources.authorization.require_gates",
    "data_resources.authorization.view_ability",
    "database.charset",
    "database.connection",
    "database.database",
    "database.driver",
    "database.host",
    "database.password",
    "database.port",
    "database.schema",
    "database.sslmode",
    "database.url",
    "database.username",
    "google_calendar.calendar_id",
    "google_calendar.connector_name",
    "google_calendar.oauth.access_token",
    "google_calendar.oauth.client_id",
    "google_calendar.oauth.client_secret",
    "google_calendar.oauth.refresh_token",
    "google_calendar.oauth.scope",
    "google_calendar.oauth.token_url",
    "google_calendar.send_updates",
    "grounding.abstain_when_unavailable",
    "grounding.default_mode",
    "grounding.minimum_answerability",
    "grounding.minimum_evidence_count",
    "grounding.source_backed_topics",
    "guardrails.authorization.enabled",
    "guardrails.authorization.manage_ability",
    "guardrails.authorization.require_gates",
    "guardrails.authorization.view_ability",
    "ingestion.allow_private_network_urls",
    "ingestion.allow_sync_actions",
    "ingestion.connection",
    "ingestion.max_fetch_bytes",
    "ingestion.max_file_bytes",
    "ingestion.queue",
    "knowledge_sources.authorization.enabled",
    "knowledge_sources.authorization.manage_ability",
    "knowledge_sources.authorization.require_gates",
    "knowledge_sources.authorization.view_ability",
    "models.capabilities",
    "models.chat",
    "models.embedding",
    "network.allow_private_request_urls",
    "openai_compatible.api_key",
    "openai_compatible.base_url",
    "openai_compatible.driver",
    "product_profile",
    "providers.chat",
    "providers.embedding",
    "retrieval.context_budget_tokens",
    "retrieval.lexical.engine",
    "retrieval.lexical.simple_like.allow_unindexed_small_dataset",
    "retrieval.lexical.simple_like.match_mode",
    "retrieval.lexical.simple_like.maximum_dataset_chunks",
    "retrieval.reranker.enabled",
    "retrieval.reranker.model",
    "retrieval.reranker.provider",
    "retrieval.strategy",
    "side_effect_reconciliation.authorization.enabled",
    "side_effect_reconciliation.authorization.manage_ability",
    "side_effect_reconciliation.authorization.require_gates",
    "submissions.schemas",
    "usage.currency_code",
    "usage.currency_symbol",
    "usage.default_max_input_tokens",
    "usage.default_max_output_tokens",
    "usage.default_monthly_cost_budget_micro_minor_units",
    "usage.default_monthly_token_budget",
    "usage.pricing",
    "usage.store_events",
    "vector.backend",
    "vector.chroma.collection",
    "vector.chroma.database",
    "vector.chroma.tenant",
    "vector.chroma.timeout",
    "vector.chroma.token",
    "vector.chroma.url",
    "vector_dimensions",
    "widget.allow_all_domains",
    "widget.bot_public_id",
    "widget.conversation_credentials.required",
    "widget.default_accent_color",
    "widget.default_area",
    "widget.default_compact_mode",
    "widget.default_font_preset",
    "widget.default_input_placeholder",
    "widget.default_language",
    "widget.default_position",
    "widget.default_show_sources",
    "widget.default_size_preset",
    "widget.default_subtitle",
    "widget.default_template",
    "widget.default_title",
    "widget.default_welcome_message",
    "widget.enabled_in_panel",
    "widget.public_selector.enabled",
    "widget.public_selector.url",
    "widget.render_hook",
    "widget.script_route",
    "widget.signing.allow_body_tokens",
    "widget.signing.allow_query_tokens",
    "widget.signing.enabled",
    "widget.signing.key",
    "widget.signing.refresh_before_seconds",
    "widget.signing.ttl_minutes",
    "workflow.concurrency.delayed_timeout_seconds",
    "workflow.concurrency.running_timeout_seconds",
    "workflow.generation.connection",
    "workflow.generation.job_timeout",
    "workflow.generation.max_attempts",
    "workflow.generation.max_prompt_length",
    "workflow.generation.model",
    "workflow.generation.poll_interval_ms",
    "workflow.generation.provider",
    "workflow.generation.queue",
    "workflow.max_steps",
    "workflow.resume_delivery.automatic_attempt_limit",
    "workflow.resume_delivery.lease_seconds",
    "workflow.resume_delivery.reconciliation_schedule_enabled",
    "workflow.traces.redacted_keys",
    "workflow.traces.redacted_value",
    "workflow.traces.redacted_value_patterns",
    "workflow_runs.authorization.enabled",
    "workflow_runs.authorization.manage_ability",
    "workflow_runs.authorization.require_gates",
    "workflow_runs.authorization.view_ability"
  ],
  "blade_components": [
    "filament-agentic-chatbot::chat-widget"
  ],
  "named_routes": [
    "filament-agentic-chatbot.widget.script"
  ],
  "http_routes": [
    "OPTIONS api/filament-agentic-chatbot/chat/{botPublicId}/{any?}",
    "GET api/filament-agentic-chatbot/chat/{botPublicId}/config",
    "POST api/filament-agentic-chatbot/chat/{botPublicId}",
    "POST api/filament-agentic-chatbot/chat/{botPublicId}/bootstrap",
    "POST api/filament-agentic-chatbot/chat/{botPublicId}/complete",
    "POST api/filament-agentic-chatbot/chat/{botPublicId}/form-draft",
    "GET api/filament-agentic-chatbot/chat/{botPublicId}/history",
    "GET api/filament-agentic-chatbot/chat/{botPublicId}/history/export",
    "POST api/filament-agentic-chatbot/chat/{botPublicId}/session",
    "GET api/filament-agentic-chatbot/chat/{botPublicId}/turn",
    "DELETE api/filament-agentic-chatbot/chat/{botPublicId}/history",
    "POST api/filament-agentic-chatbot/chat/{botPublicId}/feedback",
    "GET api/filament-agentic-chatbot/connectors",
    "GET,POST api/filament-agentic-chatbot/channels/{connection}/webhook"
  ],
  "commands": [
    "filament-agentic-chatbot:doctor",
    "filament-agentic-chatbot:prune-pending-interaction-drafts",
    "filament-agentic-chatbot:qa-enterprise-smoke",
    "filament-agentic-chatbot:reconcile-ai-usage",
    "filament-agentic-chatbot:reconcile-chat-turn",
    "filament-agentic-chatbot:reconcile-side-effect",
    "filament-agentic-chatbot:reconcile-workflow-resume-deliveries",
    "filament-agentic-chatbot:repair-conversation-memory",
    "filament-agentic-chatbot:setup-google-calendar-connector",
    "filament-agentic-chatbot:sync-knowledge-sources"
  ]
}
PUBLIC_API_ALLOWLIST -->
