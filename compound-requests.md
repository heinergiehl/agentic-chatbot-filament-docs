# Compound Requests

Compound requests let a bot handle one visitor message that contains multiple independent items or safe multi-action intent, such as checking several records, querying multiple locations, or preparing several confirmed writes.

The runtime is capability-driven:

- The LLM planner performs the semantic interpretation across languages.
- Registered capabilities define what can be executed.
- Deterministic policy enforces limits, schemas, bot permissions, confirmations, dedupe, and workflow fallbacks.
- Existing workflow collect-input, interruption, delay, resume, and human-in-the-loop behavior stays authoritative for ordinary single-item flows.

## Engine Modes

Set globally in `config/filament-agentic-chatbot.php` or per bot in `runtime_config.compound_requests.engine`.

```php
'compound_requests' => [
    'enabled' => true,
    'engine' => 'legacy', // legacy, shadow, structured
    'max_items' => 5,
    'max_operations' => 6,
    'read_only_auto_execute' => true,
    'write_requires_confirmation' => true,
    'mixed_mode' => 'confirm',
],
```

- `legacy`: bypasses compound planning and uses the normal chat/workflow path.
- `shadow`: records planner and policy decisions without changing the response path.
- `structured`: executes approved compound plans or asks for confirmation/clarification.

The package default is `legacy` for upgrade safety. Use `shadow` first when introducing a new capability in production, then switch specific bots to `structured` after the planner manifest, policy limits, and runtime smoke tests are known-good.

Write confirmations are AgentGraph interrupts. The active confirmation is projected to `bot_pending_interactions`, and replies are routed through the same pending-interaction resolver used by workflow waits before the SDK run is resumed with the exact `interrupt_id`.

Structured compound execution is graph-native by default. After policy allows execution, the orchestrator routes the approved plan through the AgentGraph compound execution graph; `CompoundRequestExecutor` remains the adapter used inside the graph node to call registered capabilities. Set `COMPOUND_GRAPH_ENABLED=false` only as a rollout escape hatch for a host app that must temporarily fall back to direct execution.

Write confirmation and execution currently run as separate AgentGraph runs: one interrupting confirmation graph, then one execution graph after approval. A future parent graph may compose both phases, but the current split keeps confirmation idempotency and write side-effect gating explicit.

## Capability Sources

### Actions

```php
'compound_requests' => [
    'capabilities' => [
        'lookup_weather' => [
            'type' => 'action',
            'action' => 'lookup_weather',
            'label' => 'Look up weather',
            'description' => 'Read weather for one or more locations.',
            'side_effect' => 'read',
            'required_capability' => 'query',
            'supports_batch' => true,
            'schema' => [
                'type' => 'object',
                'required' => ['city'],
                'additionalProperties' => false,
                'properties' => [
                    'city' => ['type' => 'string'],
                ],
            ],
        ],
    ],
],
```

### Laravel AI Tools

Expose already registered tools under `compound_requests.tools.capabilities`. The package reads the tool schema and adds it to the planner manifest.

### API Connectors

API connector capabilities reuse the existing `ApiConnectorExecutor`, including stored auth, method/path allow-lists, bot visibility, SSRF checks, retries, and response JSON-path extraction.

```php
'compound_requests' => [
    'api_connectors' => [
        'enabled' => true,
        'capabilities' => [
            'lookup_weather' => [
                'connector' => 'Weather API', // connector ID, exact name, or base URL
                'method' => 'GET',
                'path_template' => '/weather?city={{city}}',
                'response_json_path' => 'current',
                'label' => 'Look up weather',
                'description' => 'Read weather by city.',
                'schema' => [
                    'type' => 'object',
                    'required' => ['city'],
                    'additionalProperties' => false,
                    'properties' => [
                        'city' => ['type' => 'string'],
                    ],
                ],
            ],
        ],
    ],
],
```

Template placeholders are applied only to structured item inputs that the planner produced and schema validation accepted. They are not used to semantically split user text.

## Safety Rules

- Compound execution works only for registered capabilities. A workflow does not automatically become a compound capability.
- Read-only multi-item requests may auto-run when policy limits, schemas, dedupe, and bot permissions pass.
- Write and mixed read/write plans require confirmation by default.
- Duplicate items are deduped before execution and recorded in the audit metadata.
- Alternative, ambiguous, dependent, sequential, and unsupported plans clarify instead of executing.
- Single-item or incomplete plans fall back to the normal workflow path so workflow collect-input and HITL resume behavior still works.
- If the planner fails or times out, the bot falls back to the normal chat/workflow path.
