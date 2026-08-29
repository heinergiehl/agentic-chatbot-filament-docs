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

Connector access to a private network is a separate, high-risk host authority.
It is denied by default and cannot be enabled by connector, workflow, or model
payload. A host that deliberately needs it binds a resolver backed by an
explicit server-owned allowlist of connector IDs and exact target origins:

```php
use Heiner\FilamentAgenticChatbot\Contracts\ConnectorEgressPolicyResolver;
use Heiner\FilamentAgenticChatbot\Models\ApiConnector;

$this->app->singleton(
    ConnectorEgressPolicyResolver::class,
    fn () => new class((array) config('services.chatbot.private_connector_targets', [])) implements ConnectorEgressPolicyResolver {
        public function __construct(private readonly array $connectorTargets) {}

        public function allowsPrivateNetwork(ApiConnector $connector, string $url): bool
        {
            $scheme = strtolower((string) parse_url($url, PHP_URL_SCHEME));
            $host = rtrim(strtolower((string) parse_url($url, PHP_URL_HOST)), '.');
            $port = parse_url($url, PHP_URL_PORT) ?? match ($scheme) {
                'http' => 80,
                'https' => 443,
                default => null,
            };

            foreach ((array) ($this->connectorTargets[(string) $connector->getKey()] ?? []) as $target) {
                if (is_array($target)
                    && strtolower((string) ($target['scheme'] ?? '')) === $scheme
                    && rtrim(strtolower((string) ($target['host'] ?? '')), '.') === $host
                    && (int) ($target['port'] ?? 0) === $port) {
                    return true;
                }
            }

            return false;
        }
    },
);
```

Configure every required base-URL and OAuth token origin separately. The
resolver can permit special-use and cloud-metadata destinations, so never add a
metadata origin and keep both the connector and origin allowlists narrow.

## Capability and action providers

`CapabilityProvider` is the single host extension seam for visitor-safe
operator inventory metadata and immutable workflow actions. Register the provider as a
singleton and tag it with the interface class. Action execution is still
materialized, authorized, confirmed, idempotent, and invoked through the
package capability gateway.

```php
<?php

namespace App\Chatbot;

use Heiner\FilamentAgenticChatbot\Services\Capabilities\CapabilityActionDefinition;
use Heiner\FilamentAgenticChatbot\Services\Capabilities\CapabilityInventoryContext;
use Heiner\FilamentAgenticChatbot\Services\Capabilities\CapabilityProvider;
use Heiner\FilamentAgenticChatbot\Services\Capabilities\CapabilitySemanticProfile;

final class CrmCapabilityProvider implements CapabilityProvider
{
    public function category(): string { return 'crm'; }
    public function label(): string { return 'CRM'; }
    public function summary(): string { return 'Approved CRM lookups.'; }

    public function items(CapabilityInventoryContext $context): array
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
            cardinality: ['mode' => 'single_only', 'max_items' => 1],
            resultIdentity: [],
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

The Filament **Capability Bridge** page is a read-only diagnostic view over
this same extension seam. It materializes declarations through the canonical
contract validator so an operator can review effect, confirmation,
idempotency, schema shape, and hash before routing an action. It does not scan
or expose arbitrary Filament Resources, model methods, controllers, or UI
Actions, and it does not create execution authority.

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
The directly reflected handler implementation source is also hashed into the
contract. A deployed action therefore fails closed after its handler code
changes until the owning Playbook and Agent are reviewed and republished.

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

## Solution Kit providers

`SolutionKitProvider` is the host extension seam for versioned, app-aware Agent
starting points. Register a singleton and tag it with the interface class:

```php
use App\Chatbot\SalesQualificationKitProvider;
use Heiner\FilamentAgenticChatbot\SolutionKits\Contracts\SolutionKitProvider;

public function register(): void
{
    $this->app->singleton(SalesQualificationKitProvider::class);
    $this->app->tag(SalesQualificationKitProvider::class, SolutionKitProvider::class);
}
```

The provider's `solutionKits()` method returns `SolutionKitDefinition`
instances. Definitions are closed and credential-free. They require semantic
versioning, at least one complete schema-v2 Playbook, active blocking
current-draft quality coverage for every Playbook, and at least one measurable
outcome. Write-capable definitions must require explicit installation approval.
Duplicate Kit keys fail catalog resolution.

The extension seam is authoring-only. Installation creates an inactive Agent,
unpublished drafts, saved tests, and immutable installation evidence in one
transaction. It never publishes, activates, or executes a capability. Host
actions referenced by a Kit remain separate `CapabilityProvider` contracts and
execute only through the package capability gateway. See [Solution
Kits](SOLUTION_KITS.md) for the complete schema and lifecycle.

## Evidence-backed business outcomes

Trusted host code may record a verified business result against a conversation
through `RecordsConversationOutcomes`. Use this boundary from server-side
domain events, verified provider webhooks, or other authoritative application
code. Never create an outcome directly from visitor input, model output, or an
unverified tool response.

```php
use Heiner\FilamentAgenticChatbot\Contracts\RecordsConversationOutcomes;
use Heiner\FilamentAgenticChatbot\Outcomes\ConversationOutcomeClassification;
use Heiner\FilamentAgenticChatbot\Outcomes\ConversationOutcomeKey;
use Heiner\FilamentAgenticChatbot\Outcomes\ConversationOutcomeSignal;

$outcome = app(RecordsConversationOutcomes::class)->record(
    $conversation->getKey(),
    new ConversationOutcomeSignal(
        key: ConversationOutcomeKey::APPOINTMENT_BOOKED,
        classification: ConversationOutcomeClassification::Success,
        source: 'host.calendar_webhook',
        idempotencyKey: 'calendar-event:evt_123',
        evidenceType: 'calendar_event',
        evidenceReference: 'evt_123',
        valueMinorUnits: 2500,
        currency: 'EUR',
    ),
);
```

`key`, `source`, and `evidenceType` are stable machine identifiers. The package
ships common keys through `ConversationOutcomeKey`; host-specific keys are also
accepted. `idempotencyKey` must identify the same source event on every retry.
An exact retry returns the existing result with `wasCreated === false`; reusing
the same identity for different content fails closed.

Optional chat-turn, Playbook-run, and handoff IDs are accepted only when they
belong to the target conversation. Deployment attribution is derived and
verified by the recorder rather than supplied by the caller. Evidence references
are encrypted at rest and are intentionally omitted from
`RecordedConversationOutcome`. Trusted callers may supply both `actorType` and
`actorId` for an auditable operator or service identity; supplying only one
fails closed. A newly committed outcome dispatches
`ConversationOutcomeRecorded`; idempotent replays do not dispatch it again.

## Handoff activity event

After a Handoff Desk activity commits, the package dispatches
`HandoffActivityRecorded`. The event carries only the handoff public ID,
activity public ID, activity type, and resulting handoff version. It contains no
note text, contact data, operator identity, or credential. Hosts may listen for
this event to refresh a private support dashboard or enqueue a separately
authorized notification; read any additional case data through the host's
normal record authorization boundary.

## Durable outbound webhooks

Hosts that need a configurable external callback should use **Connect >
Webhooks**, not attach network work directly to the public Laravel events. The
package transactionally records a versioned, PII-minimized outbox event,
dispatches only after commit, signs the exact body, retries transient failures,
and exposes an authorized delivery/dead-letter ledger. Delivery is at least once
with a stable event ID for receiver idempotency. See [Outbound
Webhooks](OUTBOUND_WEBHOOKS.md) for the payload, signature, retry, and operations
contract.

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
- The framework-free browser SDK in `widget-sdk` is a supported non-PHP
  contract. Its handle methods are `open`, `close`, `toggle`, `getState`,
  `refreshConfig`, `refreshContext`, `startNewConversation`,
  `sendSuggestedMessage`, `updateDisplayContext`, `on`, and `destroy`.
  Supported events are `ready`, `open`, `close`, `destroy`, `error`,
  `conversation`, `outcome`, `capability`, and `handoff`; their exact public
  payload types are declared in `widget-sdk/index.d.ts`.
- Browser-supplied display context is untrusted visitor-visible context, not
  signed customer context or runtime authority. The server-side validation,
  minimization, encrypted persistence, and idempotency binding are part of its
  public behavior.
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
    "Heiner\\FilamentAgenticChatbot\\Contracts\\AdminAuthorizationQueryScope",
    "Heiner\\FilamentAgenticChatbot\\Contracts\\ChunksText",
    "Heiner\\FilamentAgenticChatbot\\Contracts\\ConnectorEgressPolicyResolver",
    "Heiner\\FilamentAgenticChatbot\\Contracts\\ExtractsContent",
    "Heiner\\FilamentAgenticChatbot\\Contracts\\RecordsConversationOutcomes",
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
    "Heiner\\FilamentAgenticChatbot\\Services\\Capabilities\\CapabilityInventoryContext",
    "Heiner\\FilamentAgenticChatbot\\Services\\Capabilities\\BotCapabilityView",
    "Heiner\\FilamentAgenticChatbot\\SolutionKits\\Contracts\\SolutionKitProvider",
    "Heiner\\FilamentAgenticChatbot\\SolutionKits\\SolutionKitDefinition",
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
    "Heiner\\FilamentAgenticChatbot\\Events\\ConversationOutcomeRecorded",
    "Heiner\\FilamentAgenticChatbot\\Events\\HandoffActivityRecorded",
    "Heiner\\FilamentAgenticChatbot\\Events\\SourceIngested",
    "Heiner\\FilamentAgenticChatbot\\Events\\SourceIngestionFailed",
    "Heiner\\FilamentAgenticChatbot\\Outcomes\\ConversationOutcomeClassification",
    "Heiner\\FilamentAgenticChatbot\\Outcomes\\ConversationOutcomeKey",
    "Heiner\\FilamentAgenticChatbot\\Outcomes\\ConversationOutcomeSignal",
    "Heiner\\FilamentAgenticChatbot\\Outcomes\\RecordedConversationOutcome",
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
  "solution_kit_provider_methods": [
    "solutionKits"
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
    "action_review.retention_days",
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
    "attachments.allowed_mime_types",
    "attachments.channel_ingress_retention_hours",
    "attachments.disk",
    "attachments.download_timeout_seconds",
    "attachments.enabled",
    "attachments.max_file_bytes",
    "attachments.max_files",
    "attachments.max_image_height",
    "attachments.max_image_pixels",
    "attachments.max_image_width",
    "attachments.max_total_bytes",
    "attachments.path",
    "attachments.retention_days",
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
    "bot_handoff_requests.desk.business_hours.friday",
    "bot_handoff_requests.desk.business_hours.monday",
    "bot_handoff_requests.desk.business_hours.saturday",
    "bot_handoff_requests.desk.business_hours.sunday",
    "bot_handoff_requests.desk.business_hours.thursday",
    "bot_handoff_requests.desk.business_hours.tuesday",
    "bot_handoff_requests.desk.business_hours.wednesday",
    "bot_handoff_requests.desk.default_assignee.id",
    "bot_handoff_requests.desk.default_assignee.label",
    "bot_handoff_requests.desk.default_assignee.type",
    "bot_handoff_requests.desk.default_team",
    "bot_handoff_requests.desk.poll_after_ms",
    "bot_handoff_requests.desk.sla.high.first_response_minutes",
    "bot_handoff_requests.desk.sla.high.resolution_minutes",
    "bot_handoff_requests.desk.sla.low.first_response_minutes",
    "bot_handoff_requests.desk.sla.low.resolution_minutes",
    "bot_handoff_requests.desk.sla.normal.first_response_minutes",
    "bot_handoff_requests.desk.sla.normal.resolution_minutes",
    "bot_handoff_requests.desk.sla.urgent.first_response_minutes",
    "bot_handoff_requests.desk.sla.urgent.resolution_minutes",
    "bot_handoff_requests.desk.teams",
    "bot_handoff_requests.desk.timezone",
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
    "channels.activity.indicators",
    "channels.authorization.enabled",
    "channels.authorization.manage_ability",
    "channels.authorization.require_gates",
    "channels.authorization.view_ability",
    "channels.drivers",
    "channels.email.enabled",
    "channels.email.signature_tolerance_seconds",
    "channels.max_webhook_requests_per_minute",
    "channels.max_webhook_requests_per_minute_per_ip",
    "channels.queue.connection",
    "channels.queue.queue",
    "channels.rate_limiter",
    "channels.renderers",
    "channels.require_webhook_verification",
    "channels.slack.enabled",
    "channels.store_raw_webhook_payloads",
    "channels.webhook_base_url",
    "channels.whatsapp.enabled",
    "channels.whatsapp.graph_api_version",
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
    "data_resources.resources",
    "data_resources.scope_sources",
    "data_resources.scope_values",
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
    "google_docs.connector_name",
    "google_docs.oauth.access_token",
    "google_docs.oauth.client_id",
    "google_docs.oauth.client_secret",
    "google_docs.oauth.refresh_token",
    "google_docs.oauth.scope",
    "google_docs.oauth.token_url",
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
    "knowledge_sources.uploads.directory",
    "knowledge_sources.uploads.disk",
    "knowledge_sources.uploads.visibility",
    "models.capabilities",
    "models.chat",
    "models.embedding",
    "network.allow_private_request_urls",
    "openai_compatible.api_key",
    "openai_compatible.base_url",
    "openai_compatible.driver",
    "outbound_webhooks.authorization.enabled",
    "outbound_webhooks.authorization.manage_ability",
    "outbound_webhooks.authorization.require_gates",
    "outbound_webhooks.authorization.view_ability",
    "outbound_webhooks.connect_timeout_seconds",
    "outbound_webhooks.enabled",
    "outbound_webhooks.lease_seconds",
    "outbound_webhooks.max_attempts",
    "outbound_webhooks.queue.connection",
    "outbound_webhooks.queue.queue",
    "outbound_webhooks.retention_days",
    "outbound_webhooks.retry_delays_seconds",
    "outbound_webhooks.timeout_seconds",
    "product_profile",
    "providers.chat",
    "providers.embedding",
    "quality_operations.claim_stale_after_minutes",
    "quality_operations.dispatch_limit",
    "quality_operations.enabled",
    "quality_operations.knowledge_gap_detection_enabled",
    "quality_operations.knowledge_gap_lookback_days",
    "quality_operations.knowledge_gap_scan_limit",
    "quality_operations.queue",
    "quality_operations.queue_connection",
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
    "widget.context.authorizes_non_public_areas",
    "widget.context.enabled",
    "widget.context.max_payload_bytes",
    "widget.context.refresh_before_seconds",
    "widget.context.required_areas",
    "widget.context.signing_key",
    "widget.context.ttl_minutes",
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
    "filament-agentic-chatbot:collect-knowledge-gaps",
    "filament-agentic-chatbot:doctor",
    "filament-agentic-chatbot:maintain-outbound-webhooks",
    "filament-agentic-chatbot:prune-channel-inbound-attachments",
    "filament-agentic-chatbot:prune-chat-attachments",
    "filament-agentic-chatbot:prune-pending-interaction-drafts",
    "filament-agentic-chatbot:qa-enterprise-smoke",
    "filament-agentic-chatbot:reconcile-ai-usage",
    "filament-agentic-chatbot:reconcile-chat-turn",
    "filament-agentic-chatbot:reconcile-side-effect",
    "filament-agentic-chatbot:reconcile-workflow-resume-deliveries",
    "filament-agentic-chatbot:run-due-quality-scenarios",
    "filament-agentic-chatbot:setup-google-calendar-connector",
    "filament-agentic-chatbot:setup-google-docs-connector",
    "filament-agentic-chatbot:sync-knowledge-sources"
  ]
}
PUBLIC_API_ALLOWLIST -->
