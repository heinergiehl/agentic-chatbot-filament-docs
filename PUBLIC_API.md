# Public API

This file is the supported pre-1.0 host integration allowlist. Package classes,
methods, routes, commands, views, configuration keys, tags, or assets not listed
here are internal implementation details and may change without compatibility
aliases.

Agent deployments and Playbook deployments are immutable and hash-verified.
When an upgrade changes what the runtime accepts, affected Agents show
**Publish needed**; publish them again. No artifact is rewritten. `import_basis` is MCP authoring data only, never an
execution contract. Capability Bridge's `definition_valid` means definition
validation, not assignment, publication, execution testing or dialogue
acceptance.

Ollama Agent authoring may set the strictly boolean
`runtime_config.agent.ollama_think`. Publication pins it as `model.ollama_think`;
omission preserves the provider default. Other drivers and non-boolean values
are rejected.

Claude 5.5 Agents may set `runtime_config.agent.anthropic_effort` to `low`,
`medium`, `high`, `xhigh` or `max`. Publication validates the exact Anthropic
model and pins `model.anthropic_effort`; the conversational loop maps it to
`output_config.effort`. Missing effort preserves the provider default (medium).
The bounded topic-scope classifier uses low effort independently.
Invalid or foreign effort fails publication and runtime validation.

Gemini 3 Agent authoring may set `runtime_config.agent.gemini_thinking_level`
to `low`, `medium` or `high`. Publication pins it as
`model.gemini_thinking_level` and every Agent request sends it as the Gemini
thinking level; omission preserves the provider default. Other drivers, Gemini
models before version 3 and other values are rejected.

## Filament plugin

Register a new plugin instance on each Filament panel. `widgetEnabled()` affects
only that panel; it does not configure ingestion or other global runtime state.

```php
use Heiner\FilamentAgenticChatbot\FilamentAgenticChatbotPlugin;

$panel->plugin(
    FilamentAgenticChatbotPlugin::make()->widgetEnabled(),
);
```

The admin navigation has five top-level items, `Heiner\FilamentAgenticChatbot\Support\NavigationSection`:
**Build** (Agents, Workflows, Sources), **Connect** (Channels, Tools & data with
API connections, MCP servers and App data tools as tabs, and Developers with
Access tokens and Webhooks as tabs), **Inbox** (handoffs, approvals and unverified actions that wait for a person,
with a count badge), **Conversations** (Conversations, Submissions and Usage as
tabs) and **Settings** (General, Health and, for administrators, Developer tool
providers as tabs). Each panel's plugin instance configures them:

```php
use Heiner\FilamentAgenticChatbot\Support\NavigationSection;

FilamentAgenticChatbotPlugin::make()
    ->navigationGroup('Assistant')        // default "Agentic Chatbot"; a label or a navigation group enum case; null shows the sections without a group
    ->navigationSort(20)                  // sort of the first section; the next follow in steps of one
    ->navigationSections([                // shown sections, in this order
        NavigationSection::Inbox,
        NavigationSection::Build,
        NavigationSection::Conversations,
    ])
    ->navigationLabel(NavigationSection::Inbox, 'Support queue')
    ->navigationIcon(NavigationSection::Inbox, 'heroicon-o-bell');
```

A section left out hides only its menu entries, including the tab bar entries it
owns (a host that lists the sections explicitly must add `NavigationSection::Settings`
to keep the Settings item). Its pages keep their URLs and
their authorization; hide a page from a role with the administration grants
below, not with the navigation. The order of the plugin group among the host's
own groups follows the panel's `navigationGroups()`.

Administration needs a deliberate host grant (ADR 0053). In the `abilities`
mode, `authorizeUsing()` is the panel's grant; each panel's plugin instance has
its own:

```php
use Heiner\FilamentAgenticChatbot\Support\Authorization\AdminAbility;

FilamentAgenticChatbotPlugin::make()
    ->authorizeUsing(fn (User $user, string $ability): bool => match ($ability) {
        AdminAbility::OPERATE => $user->isSupportAgent(),
        AdminAbility::ADMIN => $user->isOwner(),
        default => false,
    });
```

The callback receives the panel user, one of `AdminAbility::OPERATE`,
`CONFIGURE`, `PUBLISH` or `ADMIN` (`filament-agentic-chatbot.operate`,
`.configure`, `.publish`, `.admin`) and the record acted on, or `null` for
class-level checks. Only `true` grants; admin implies the other three for the
same record. It runs after the panel access check and never widens the panel,
the host SQL scope (`AdminAuthorizationQueryScope`) or the Capability
Execution Gateway. Declaring the `$record` parameter makes the grant
record-aware, which requires the query scope binding for lists. Global
settings (the Settings page and its signing-key rotation) are checked with a
`null` record and stay denied under a record-aware grant; in the `strict` mode
the Settings page needs the class-wide Gate
`filament-agentic-chatbot.manage-settings`.
`getAuthorizationCallback()` returns the callback. Without a callback, Gates
with the ability names grant. `authorization.mode` selects `abilities` or the
per-surface `strict` Gates; `filament-agentic-chatbot:authorization-preview`
previews a switch read-only. See `docs/SECURITY_AND_PRIVACY.md`
(Administration Abilities).

Global ports are normal Laravel bindings in a host service provider:

```php
$this->app->singleton(
    \Heiner\FilamentAgenticChatbot\Contracts\ExtractsContent::class,
    \App\Chatbot\ContentExtractor::class,
);
```

The built-in image action uses only the host-configured
`workflow.image_generation.http.endpoint` and `workflow.image_generation.http.headers`
for its destination and credentials. Its `allowed_hosts` list requires exact
hosts without wildcards. `max_response_bytes` bounds encoded and decoded image
responses (default 10 MiB, maximum 20 MiB); `workflow.image_generation.timeout`
is capped at 300 seconds for HTTP, with a connection timeout of at most 10 seconds.
Private or reserved destinations and redirects are refused, and validated DNS
addresses are pinned. No private-network grant applies to this action. See
[the action configuration](AGENTIC_WORKFLOWS.md#image-generation-action) and
[the version 2 upgrade](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/UPGRADING.md#image-action-destination-c6-adr-0058).

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

The Filament **Developer tool providers** page (class `CapabilityBridge`, a tab of
Settings that only administrators see) is a read-only diagnostic view over
this same extension seam. It materializes declarations through the canonical
contract validator so an operator can review effect, confirmation,
idempotency, schema shape, and hash before routing an action. It does not scan
or expose arbitrary Filament Resources, model methods, controllers, or UI
Actions, and it does not create execution authority.

The authoring-only **Import from Filament Resource** action separately reads
static Resource metadata and the model field proposal into the existing App data
tool Draft form. Discovery grants no access. The operator must review fields and
visitor/tenant scope and explicitly Save. Runtime never scans or calls Resources,
including `getEloquentQuery()`, `table()` and `form()`. The stored `source_resource`
class name is for display only; it supplies neither a runtime scope nor authority.

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

## Data Resource model opt-in

`filament-agentic-chatbot.data_resources.package_model_allowlist` is a supported
host configuration key. It defaults to
`[Heiner\FilamentAgenticChatbot\Models\BotSubmission::class]`. Classes in
`Heiner\FilamentAgenticChatbot\` or `Heiner\AgentGraph\`, and subclasses in any
namespace, require an exact class entry, including those supplied through
`data_resources.resources`. An entry does not allow subclasses or bypass
field/scope policy. The current setting governs discovery, saves and runtime
execution of historical pins. See [allowed models](DATA_RESOURCES.md#allowed-models).

## Isolated Data Resource write tests

The supported host staging interface consists of
`DataResourceWriteTestRunner::exportCandidate()`, `review()` and
`executeConfirmed()`, `DataResourceWriteTestReview::summary()` and `reviewHash()`,
and `DataResourceWriteEvidence::import()`. Resolve the services through Laravel
and pass the saved Playbook from an authorized administration context. Inspect
the complete summary before confirming its exact hash. The permit object and
other service methods remain internal; they are not a transport or queue API.

Configure `data_resources.write_testing.environment_id`, `signing_key` and
`production_targets` in the host. Evidence signing uses a dedicated secret shared
only by the trusted production and isolated staging applications. Production
target overrides are accepted only in staging/testing applications and never
change an Eloquent connection. The normal Agent test path cannot use these
permits. See [Data Resource staging evidence](DATA_RESOURCES.md) for the export,
confirmed test, evidence import and publication sequence.

## Agent template providers

`AgentTemplateProvider` is the host extension seam for starting points of the
Create Agent page and the empty Agents list (see [Agent
templates](AGENT_TEMPLATES.md)). Register a singleton and tag it with the
interface class:

```php
use App\Chatbot\ShopTemplateProvider;
use Heiner\FilamentAgenticChatbot\Templates\Contracts\AgentTemplateProvider;

public function register(): void
{
    $this->app->singleton(ShopTemplateProvider::class);
    $this->app->tag(ShopTemplateProvider::class, AgentTemplateProvider::class);
}
```

The provider's `templates()` method returns `AgentTemplate` objects. An
`AgentTemplate` is a final readonly value object with a unique lowercase slug
`key`, `title`, `description`, a Heroicon `icon`, prefilled `instructions`,
`builtInTools`, `requiredToolKinds` (a list of `AgentTemplateRequirement`),
optional `workflows` and an optional `afterCreate` step. It validates on
construction. A template that is invalid or whose key is already taken is left
out and a warning in the log names the provider, so a faulty provider never
breaks the Agents pages.

A template cannot grant itself authority. Creating from a template needs the
same ability as creating any Agent, the Agent is always a Draft, and Tools are
assigned through the usual rules. Host actions stay separate `CapabilityProvider`
contracts and execute only through the package capability gateway.

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

Events cover conversations (started, ended), submissions, feedback, outcomes,
handoffs, Playbook runs (completed, failed), approvals, external writes
(succeeded, failed, unknown, reconciled) and monthly budget
thresholds. Payloads carry public ids only; per-endpoint opt-in content
(submission fields, last messages) is redacted and size-capped.

## Read API

`GET` endpoints under `{api.prefix}/read/v1` return submissions (single and
cursor-paginated list), conversations with messages, and handoffs by public id.
They accept Agent access tokens with the explicit scopes `submissions:read`,
`conversations:read` and `handoffs:read`; `*` does not grant them. The JSON
shape is version 1. See [Read API](READ_API.md).

## Connector completion notifications

The allowlisted Connector completion endpoint admits signed provider events,
not visitor messages. A callback only requests a status check for its exact
immutable pending job; it cannot authorize an operation, select a target URL,
or provide final answer data. HTTP 202 acknowledges durable admission, not job
completion. See [Durable Connectors](DURABLE_CONNECTORS.md) for the signature,
correlation, queue and provider protocol.

Hosts can implement `ConnectorCompletionWebhookVerifier` and register a unique
stable ID through the singleton `ConnectorCompletionWebhookVerifierRegistry`
in their composition root. The operation contract selects that ID. Neither
provider payloads nor visitor inputs can select or replace a verifier.

## Mixed read and Playbook answers

A terminal chat error may include the optional `read_answer` object:
`{content, content_html, content_format, sources}`. It contains the separately
verified independent-read answer after the normal safety and presentation
boundary. JSON and SSE expose the same persisted object, including replay.
Clients should render it as a distinct answer while preserving the canonical
error, confirmation/wait state and retry restriction. Its presence never means
that an uncertain Playbook write succeeded. Apply the normal HTML sanitization
and source-link rules; never reinterpret error text as an instruction to retry.

## Write confirmation cards

An assistant message that proposes a direct Agent write (ADR 0038) carries
`confirmations`: a list of `{id, title, fields: [{label, value}], notice?, status,
expires_at}`. `notice` is text the visitor agrees to by confirming, such as the
consent of a lead card (ADR 0039); a client shows it with the card. Status is `pending`, `confirmed`, `succeeded`, `failed`,
`unknown`, `cancelled`, `expired` or `superseded`; only `pending` may be
decided, and `unknown` never means success. A client decides with the chat
request field `confirmation: {id, decision}` where `decision` is `confirm` or
`cancel` (with a short `message` such as the button label; it cannot be combined
with `resolution`). The answer to that request carries `confirmation_result:
{id, status}`; history returns each card with its current status in every
message that shows it. Free text never confirms a write.

A Playbook waiting for an approval shows the same card (ADR 0040) with no
`fields` and the Playbook's question as `notice`. Confirm resumes its approved
path and Cancel its declined path; the decided status reflects the run's
outcome. A `resolution` of type `approve` or `reject` no longer decides an
approval in a visitor conversation; `resolution` remains for bound widget form
and choice input.

A channel driver that implements `Channels\Contracts\ConfirmsAgentWrites`
renders the pending cards of `OutboundChannelMessage` meta `message.confirmations`
as `RenderedChannelMessage::$followUps` with buttons whose value is
`atc:c:<id>` (confirm) or `atc:x:<id>` (cancel). Only from a button callback
that passed `verifyWebhook` may it set the inbound meta
`confirmation: {id, decision}`, and only when `verifiesConfirmationCallbacks`
is true for the connection (its webhook secret is configured); typed text must
never set it. Writes that need confirmation are offered only to such
connections. After the reply
to a decision is delivered, `showConfirmationDecision` may update the pressed
card message. Conversations of other drivers, including email, are not offered
writes that need confirmation.

## Operator conversation diagnostics

An authenticated host operator obtains a five-minute conversation grant with
`POST /filament-agentic-chatbot/diagnostics/conversations/{conversation}/access`.
The route uses the configured session guard and requires explicit conversation
and diagnostic Gate abilities, including record scopes, even when the panel's
development defaults would otherwise allow a view. Its JSON response contains
`token` and `expires_at`; the token belongs in an `Authorization: Bearer`
header, never a URL. The configured guard must be a Laravel session guard with
a user provider. Visitor chat credentials cannot issue or use this grant.

The grant permits read-only `GET
/api/filament-agentic-chatbot/chat/{botPublicId}/diagnostics/conversations/{conversation}/messages/{message}`
and the same path with `/export?format=json` or `format=markdown`. The latter
returns the same allowlisted diagnosis. `DELETE
/api/filament-agentic-chatbot/chat/{botPublicId}/diagnostics/conversations/{conversation}/access`
revokes it. Every use reloads the operator and checks current policies and
conversation scope. The bot's configured widget origin policy gates cross-origin
transport; it does not grant diagnosis. Responses use `no-store`. Neither GET
nor export dispatches a model or tool.

The optional extra trace is off by default. Set
`bot_conversations.diagnostics.recording.enabled=true` to record bounded
events, with `retention_days=7` by default. Expired details are inaccessible
and the daily `filament-agentic-chatbot:prune-conversation-diagnostics` command
removes traces and expired grants. Conversation deletion cascades both. Core
progress, usage and execution receipts remain independent of this switch.
`bot_conversations.diagnostics.access.enabled` disables token issue and use;
`operator_guard` and `ttl_minutes` set its guard and bounded lifetime.

`conversation_turn_diagnosis.v2` exposes scope IDs, verified execution state,
bounded event IDs and operation summaries, safe field source message IDs, usage
status and `complete`, `truncated`, `unavailable` or `disabled` observation
status. It contains no prompt, SQL, credential, argument, result or hidden
reasoning text. A missing event never proves non-dispatch. Admission failures
on the chat routes expose a separate request ID header without inventing a
turn ID.

## Signed widget context

`Support\WidgetContextToken::issueForBot($bot, $origin, $area, $actor, $tenant,
$attributes)` is the supported server-side issuer of the signed customer context
(ADR 0057). It returns a `Support\WidgetContextTokenIssuance` (`token`,
`issuedAt`, `refreshAfter`, `expiresAt`, `toArray()`) or `null` when signed
context is disabled, the area is not allowed, or no key exists. A user model
actor is signed as its class and key only; a `label` is signed only when passed
explicitly. The token format and the header `X-Filament-Agentic-Chatbot-Context`
are unchanged. A context endpoint answers `204 No Content` for a guest. See
[Chat Widget](CHAT_WIDGET.md#signed-customer-and-tenant-context).

## Host actor resolution

`Contracts\HostActorResolver` resolves the customer a personal App data tool
or a host model policy acts for (ADR 0057). Bind your own implementation in a
service provider, or use the default `Support\HostActors\ConfiguredHostActorResolver`:

- `resolve(HostActorReference $reference): ?Authenticatable` returns the
  attested account, or `null` when it no longer exists, is disabled, is not a
  member of the attested tenant, or the host refuses it. It must never return
  another identity; the package rejects an actor whose class or key differs
  from the reference. Throw `Support\HostActors\UnsupportedHostActorSetup` when
  the host setup cannot answer. A thrown exception does not establish
  revocation: delayed continuations and completion wakeups defer with bounded
  retries and expose exhaustion operationally. A new personal tool execution
  still refuses while the resolver cannot answer.
- `within(HostActorReference $reference, Authenticatable $actor, Closure $callback): mixed`
  runs one policy evaluation. Establish tenant or global scope state only from
  the reference and restore it before returning, also when the callback throws.

`Support\HostActors\HostActorReference` carries the attested `type`, `id`, the
allowed `modelClass`, the attested `tenant` snapshot (`tenantId()`,
`tenantType()`), `agentPublicId` and `area`. The package calls a resolver only
for a type allowed in `context.host_actors.types` (attested type => Eloquent
`Authenticatable` class; a list entry allows the class name itself). Alias maps
require exact `[a-z][a-z0-9_-]{0,63}` keys; class-name lists must not mix alias
entries. Every class must be distinct, concrete and outside package models and
their subclasses. An invalid entry refuses the entire map before resolution.
The host may explicitly list its shared `User` model when it is the intended
customer identity and the host ability restricts it; panel membership provides
no implicit mapping. Requests combining signed context and a session require
exactly one valid mapping for the session class and a matching signed type and
ID, with no raw class-name fallback. The default
resolver requires the Gate ability `context.host_actors.ability` (default
`filament-agentic-chatbot.serve-customer`), called as
`Gate::forUser($actor)->allows($ability, [$reference])`. Typed outcomes are
`sign_in_required`, `host_actor_unsupported` and `host_actor_denied`.

`widget.sign_in_route` is the sign-in link a personal tool's
`sign_in_required` shows in the widget: a route name, an absolute `http(s)` URL
or a path starting with `/`. The public message payload carries it as
`sign_in.url` (`null` without a valid route). The server resolves `/path`
with the Laravel host URL; absolute URLs remain unchanged.

## Configuration

Only the keys in `config_keys` below are supported host configuration. Empty
map/list keys are deliberate extension collections at that exact path. A
published key outside this list is ignored and reported by Doctor with its
upgrade instruction; internal runtime defaults are not host configuration.

## Non-PHP contracts

- The public widget Blade component is
  `filament-agentic-chatbot::chat-widget`. It shows the Agent whose public ID
  is given as `agent="..."`, or else the Agent marked as the app default
  (`widget.public_selector.enabled`); with neither it renders nothing and logs
  one warning. The attributes `area` and `expandable` are unchanged. The
  1.0 release removed the attribute `bot-public-id` and the configuration
  key `widget.bot_public_id` (`AGENTIC_CHATBOT_WIDGET_BOT_PUBLIC_ID`).
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
- `filament-agentic-chatbot:upgrade` (ADR 0055) is the supported upgrade of an
  existing installation. `--dry-run` writes nothing and exits non-zero when a
  check is `blocked`; `--json` prints the report (`version`, `blocked`, and per
  check `key`, `status`, `summary`, `details`). Apply needs `--operator`,
  `--backup-confirmed` and `--workers-stopped`, runs only package and
  AgentGraph migrations and continues an interrupted run. The check keys
  (`storage`, `schema`, `settings`, `authorization`, `contracts`, `runs`,
  `confirmations`, `workers`) and the exit codes are supported; their texts
  are not.

## Executable allowlist

The test suite reads this JSON block directly. Keep it valid JSON.

<!-- PUBLIC_API_ALLOWLIST
{
  "php_types": [
    "Heiner\\FilamentAgenticChatbot\\FilamentAgenticChatbotPlugin",
    "Heiner\\FilamentAgenticChatbot\\Support\\NavigationSection",
    "Heiner\\FilamentAgenticChatbot\\Support\\Authorization\\AdminAbility",
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
    "Heiner\\FilamentAgenticChatbot\\Services\\DataResources\\Testing\\DataResourceWriteTestRunner",
    "Heiner\\FilamentAgenticChatbot\\Services\\DataResources\\Testing\\DataResourceWriteTestReview",
    "Heiner\\FilamentAgenticChatbot\\Services\\DataResources\\Testing\\DataResourceWriteEvidence",
    "Heiner\\FilamentAgenticChatbot\\Services\\Connectors\\Webhooks\\ConnectorCompletionWebhookVerifier",
    "Heiner\\FilamentAgenticChatbot\\Services\\Connectors\\Webhooks\\ConnectorCompletionWebhookVerifierRegistry",
    "Heiner\\FilamentAgenticChatbot\\Services\\Capabilities\\CapabilityInventoryContext",
    "Heiner\\FilamentAgenticChatbot\\Services\\Capabilities\\BotCapabilityView",
    "Heiner\\FilamentAgenticChatbot\\Templates\\Contracts\\AgentTemplateProvider",
    "Heiner\\FilamentAgenticChatbot\\Templates\\AgentTemplate",
    "Heiner\\FilamentAgenticChatbot\\Templates\\AgentTemplateRequirement",
    "Heiner\\FilamentAgenticChatbot\\Channels\\Contracts\\ChannelActivityIndicator",
    "Heiner\\FilamentAgenticChatbot\\Channels\\Contracts\\ChannelDriver",
    "Heiner\\FilamentAgenticChatbot\\Channels\\Contracts\\ChannelMessageRenderer",
    "Heiner\\FilamentAgenticChatbot\\Channels\\Contracts\\ConfirmsAgentWrites",
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
    "Heiner\\FilamentAgenticChatbot\\Contracts\\HostActorResolver",
    "Heiner\\FilamentAgenticChatbot\\Support\\HostActors\\ConfiguredHostActorResolver",
    "Heiner\\FilamentAgenticChatbot\\Support\\HostActors\\HostActorReference",
    "Heiner\\FilamentAgenticChatbot\\Support\\HostActors\\UnsupportedHostActorSetup",
    "Heiner\\FilamentAgenticChatbot\\Support\\WidgetContextToken",
    "Heiner\\FilamentAgenticChatbot\\Support\\WidgetContextTokenIssuance"
  ],
  "plugin_methods": [
    "authorizeUsing",
    "boot",
    "dashboardWidgets",
    "getAuthorizationCallback",
    "getId",
    "getNavigationGroup",
    "getNavigationIcon",
    "getNavigationLabel",
    "getNavigationSections",
    "getNavigationSort",
    "hasDashboardWidgets",
    "hasNavigationSection",
    "isWidgetEnabled",
    "make",
    "navigationGroup",
    "navigationIcon",
    "navigationLabel",
    "navigationSections",
    "navigationSort",
    "overviewWidgets",
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
  "agent_template_provider_methods": [
    "templates"
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
    "agent_tests.grading_model",
    "agent_workflows.authorization.enabled",
    "agent_workflows.authorization.manage_ability",
    "agent_workflows.authorization.require_gates",
    "agent_workflows.authorization.view_ability",
    "api.chat_queue.connection",
    "api.chat_queue.queue",
    "api.chat_stream.cache_store",
    "api.chat_stream.relay_seconds",
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
    "api_connectors.test_account_staging.evidence_ttl_minutes",
    "api_connectors.test_account_staging.review_ttl_days",
    "api_connectors.test_account_staging.unverified_separation_origins",
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
    "authorization.mode",
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
    "bot_conversations.diagnostics.access.enabled",
    "bot_conversations.diagnostics.access.operator_guard",
    "bot_conversations.diagnostics.access.ttl_minutes",
    "bot_conversations.diagnostics.authorization.enabled",
    "bot_conversations.diagnostics.authorization.manage_ability",
    "bot_conversations.diagnostics.authorization.require_gates",
    "bot_conversations.diagnostics.authorization.view_ability",
    "bot_conversations.diagnostics.recording.enabled",
    "bot_conversations.diagnostics.recording.retention_days",
    "bot_handoff_requests.authorization.enabled",
    "bot_handoff_requests.authorization.manage_ability",
    "bot_handoff_requests.authorization.require_gates",
    "bot_handoff_requests.authorization.view_ability",
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
    "bot_handoff_requests.notifications.queue.connection",
    "bot_handoff_requests.notifications.queue.queue",
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
    "channels.activity.indicators",
    "channels.authorization.enabled",
    "channels.authorization.manage_ability",
    "channels.authorization.require_gates",
    "channels.authorization.view_ability",
    "channels.drivers",
    "channels.email.providers.mailgun.enabled",
    "channels.email.providers.mailtrap.enabled",
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
    "chunking.overlap_tokens",
    "chunking.size_tokens",
    "chunking.tokenizer_encoding",
    "chunking.use_estimated_tokens",
    "commerce.anystack_id",
    "commerce.docs_url",
    "commerce.enabled",
    "commerce.support_email",
    "connector_completion_webhooks.enabled",
    "connector_completion_webhooks.max_attempts",
    "connector_completion_webhooks.max_body_bytes",
    "connector_completion_webhooks.max_requests_per_minute",
    "connector_completion_webhooks.max_requests_per_minute_per_ip",
    "connector_completion_webhooks.middleware",
    "connector_completion_webhooks.queue.connection",
    "connector_completion_webhooks.queue.queue",
    "connector_completion_webhooks.rate_limiter",
    "connector_completion_webhooks.retry_seconds",
    "context.allowed_areas",
    "context.authorization.enabled",
    "context.authorization.guards",
    "context.authorization.public_areas",
    "context.authorization.require_auth_for_non_public",
    "context.default_area",
    "context.host_actors.ability",
    "context.host_actors.types",
    "data_resources.authorization.enabled",
    "data_resources.authorization.manage_ability",
    "data_resources.authorization.require_gates",
    "data_resources.authorization.view_ability",
    "data_resources.package_model_allowlist",
    "data_resources.policy_candidate_limit",
    "data_resources.resources",
    "data_resources.scope_sources",
    "data_resources.scope_values",
    "data_resources.write_testing.environment_id",
    "data_resources.write_testing.production_targets",
    "data_resources.write_testing.signing_key",
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
    "ingestion.allow_sync_actions",
    "ingestion.connection",
    "ingestion.max_extracted_bytes",
    "ingestion.max_fetch_bytes",
    "ingestion.max_file_bytes",
    "ingestion.queue",
    "knowledge_gaps.enabled",
    "knowledge_gaps.lookback_days",
    "knowledge_gaps.scan_limit",
    "knowledge_sources.authorization.enabled",
    "knowledge_sources.authorization.manage_ability",
    "knowledge_sources.authorization.require_gates",
    "knowledge_sources.authorization.view_ability",
    "knowledge_sources.generation_retention.days",
    "knowledge_sources.generation_retention.schedule_enabled",
    "knowledge_sources.sync.schedule_enabled",
    "knowledge_sources.uploads.directory",
    "knowledge_sources.uploads.disk",
    "knowledge_sources.uploads.visibility",
    "mcp.max_session_seconds",
    "mcp.max_tools",
    "mcp.provider_presets",
    "models.capabilities",
    "models.chat",
    "models.embedding",
    "network.allow_private_request_urls",
    "openai_compatible.api_key",
    "openai_compatible.base_url",
    "openai_compatible.driver",
    "operations.heartbeat.cache_store",
    "operations.heartbeat.stale_after_seconds",
    "outbound_webhooks.authorization.enabled",
    "outbound_webhooks.authorization.manage_ability",
    "outbound_webhooks.authorization.require_gates",
    "outbound_webhooks.authorization.view_ability",
    "outbound_webhooks.connect_timeout_seconds",
    "outbound_webhooks.conversation_idle_minutes",
    "outbound_webhooks.enabled",
    "outbound_webhooks.lease_seconds",
    "outbound_webhooks.max_attempts",
    "outbound_webhooks.max_payload_bytes",
    "outbound_webhooks.queue.connection",
    "outbound_webhooks.queue.queue",
    "outbound_webhooks.retention_days",
    "outbound_webhooks.retry_delays_seconds",
    "outbound_webhooks.timeout_seconds",
    "product_profile",
    "providers.chat",
    "providers.embedding",
    "read_api.enabled",
    "read_api.middleware",
    "read_api.rate_limit_per_minute",
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
    "vector.database.max_chunks",
    "vector.database.warning_chunks",
    "vector_dimensions",
    "widget.allow_all_domains",
    "widget.context.authorizes_non_public_areas",
    "widget.context.enabled",
    "widget.context.max_payload_bytes",
    "widget.context.refresh_before_seconds",
    "widget.context.required_areas",
    "widget.context.signing_key",
    "widget.context.ttl_minutes",
    "widget.conversation_credentials.required",
    "widget.conversation_starter_icons",
    "widget.default_accent_color",
    "widget.default_area",
    "widget.default_compact_mode",
    "widget.default_empty_state_hint",
    "widget.default_font_preset",
    "widget.default_input_placeholder",
    "widget.default_language",
    "widget.default_position",
    "widget.default_show_sources",
    "widget.default_show_tool_activity",
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
    "widget.sign_in_route",
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
    "workflow.image_generation.disk",
    "workflow.image_generation.height",
    "workflow.image_generation.http.allowed_hosts",
    "workflow.image_generation.http.endpoint",
    "workflow.image_generation.http.headers",
    "workflow.image_generation.http.max_response_bytes",
    "workflow.image_generation.http.provider",
    "workflow.image_generation.model",
    "workflow.image_generation.path",
    "workflow.image_generation.provider",
    "workflow.image_generation.public_base_url",
    "workflow.image_generation.quality",
    "workflow.image_generation.size",
    "workflow.image_generation.steps",
    "workflow.image_generation.timeout",
    "workflow.image_generation.transport",
    "workflow.image_generation.width",
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
    "filament-agentic-chatbot.diagnostics.access",
    "filament-agentic-chatbot.widget.script"
  ],
  "http_routes": [
    "OPTIONS api/filament-agentic-chatbot/chat/{botPublicId}/{any?}",
    "GET api/filament-agentic-chatbot/chat/{botPublicId}/config",
    "POST api/filament-agentic-chatbot/chat/{botPublicId}",
    "POST api/filament-agentic-chatbot/chat/{botPublicId}/bootstrap",
    "POST api/filament-agentic-chatbot/chat/{botPublicId}/complete",
    "GET api/filament-agentic-chatbot/chat/{botPublicId}/diagnostics/conversations/{conversation}/messages/{message}",
    "GET api/filament-agentic-chatbot/chat/{botPublicId}/diagnostics/conversations/{conversation}/messages/{message}/export",
    "DELETE api/filament-agentic-chatbot/chat/{botPublicId}/diagnostics/conversations/{conversation}/access",
    "POST api/filament-agentic-chatbot/chat/{botPublicId}/form-draft",
    "GET api/filament-agentic-chatbot/chat/{botPublicId}/history",
    "GET api/filament-agentic-chatbot/chat/{botPublicId}/history/export",
    "POST api/filament-agentic-chatbot/chat/{botPublicId}/session",
    "GET api/filament-agentic-chatbot/chat/{botPublicId}/turn",
    "DELETE api/filament-agentic-chatbot/chat/{botPublicId}/history",
    "POST api/filament-agentic-chatbot/chat/{botPublicId}/feedback",
    "GET api/filament-agentic-chatbot/connectors",
    "POST api/filament-agentic-chatbot/connectors/continuations/{continuationPublicId}/completion",
    "GET,POST api/filament-agentic-chatbot/channels/{connection}/webhook",
    "GET api/filament-agentic-chatbot/read/v1/submissions",
    "GET api/filament-agentic-chatbot/read/v1/submissions/{submission}",
    "GET api/filament-agentic-chatbot/read/v1/conversations/{conversation}",
    "GET api/filament-agentic-chatbot/read/v1/handoffs/{handoff}",
    "POST filament-agentic-chatbot/diagnostics/conversations/{conversation}/access"
  ],
  "commands": [
    "filament-agentic-chatbot:authorization-preview",
    "filament-agentic-chatbot:collect-knowledge-gaps",
    "filament-agentic-chatbot:doctor",
    "filament-agentic-chatbot:embedding-billing-preflight",
    "filament-agentic-chatbot:maintain-connector-completions",
    "filament-agentic-chatbot:maintain-outbound-webhooks",
    "filament-agentic-chatbot:prune-channel-inbound-attachments",
    "filament-agentic-chatbot:prune-chat-attachments",
    "filament-agentic-chatbot:prune-conversation-diagnostics",
    "filament-agentic-chatbot:prune-knowledge-generations",
    "filament-agentic-chatbot:prune-pending-interaction-drafts",
    "filament-agentic-chatbot:qa-enterprise-smoke",
    "filament-agentic-chatbot:reconcile-ai-usage",
    "filament-agentic-chatbot:reconcile-chat-turn",
    "filament-agentic-chatbot:reconcile-side-effect",
    "filament-agentic-chatbot:reconcile-workflow-resume-deliveries",
    "filament-agentic-chatbot:setup-google-calendar-connector",
    "filament-agentic-chatbot:setup-google-docs-connector",
    "filament-agentic-chatbot:storage-preflight",
    "filament-agentic-chatbot:switch-knowledge-backend",
    "filament-agentic-chatbot:sync-knowledge-sources",
    "filament-agentic-chatbot:upgrade"
  ]
}
PUBLIC_API_ALLOWLIST -->
