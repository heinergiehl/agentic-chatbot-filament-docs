# Workflow JSON Schema Reference

This document describes the executable `schemaVersion: 1` JSON format used by the **Filament Agentic Chatbot** workflow engine. The visual editor stores `schemaVersion: 2` semantic workflows as the authoring source of truth and compiles them to this runtime shape at validation, preview, publish, activation, and execution boundaries.

Use this reference for runtime fixtures, diagnostics, low-level imports, or programmatic engine payloads. For normal editor authoring, prefer the semantic workflow editor and its AI Draft flow.

Runtime `schemaVersion: 1` payloads are not a lossless visual-editor authoring format. The current editor persists `schemaVersion: 2` semantic workflows; existing runtime JSON should be treated as execution/API-oriented unless it is converted into schema v2 first.

## How to Use

1. Ask an AI or backend process to generate runtime workflow JSON using this schema only when you need an executable graph.
2. In the workflow editor, use AI Draft or schema v2 JSON for editable semantic authoring. Low-level schema v1 JSON is suitable for runtime fixtures, diagnostics, and programmatic execution paths.
3. Validate the workflow before publishing. Validation runs against the same compiled runtime graph used by execution.

---

## Top-Level Structure

```json
{
  "schemaVersion": 1,
  "nodes": [ ... ],
  "edges": [ ... ],
  "policies": { ... },
  "viewport": { "x": 0, "y": 0, "zoom": 1 }
}
```

| Field           | Type      | Required           | Description                                  |
| --------------- | --------- | ------------------ | -------------------------------------------- |
| `schemaVersion` | `integer` | No (defaults to 1) | Schema version for forward compatibility.    |
| `nodes`         | `array`   | **Yes**            | Array of node objects (min 1).               |
| `edges`         | `array`   | No                 | Array of edge objects connecting nodes.      |
| `policies`      | `object`  | No                 | Compiled workflow-level policy settings from schema v2 authoring payloads. |
| `viewport`      | `object`  | No                 | Canvas viewport position (`x`, `y`, `zoom`). |

---

## Node Object

Every node in the `nodes` array must have this shape:

```json
{
  "id": "unique_string_id",
  "type": "trigger",
  "position": { "x": 400, "y": 60 },
  "data": {
    "label": "Human-Readable Label",
    ...type-specific fields...
  }
}
```

| Field      | Type     | Required | Description                                                                 |
| ---------- | -------- | -------- | --------------------------------------------------------------------------- |
| `id`       | `string` | **Yes**  | Unique node identifier (e.g. `"trigger_1"`, `"ai_agent_1"`). Max 100 chars. |
| `type`     | `string` | **Yes**  | One of the supported node types listed below.                               |
| `position` | `object` | **Yes**  | Canvas coordinates: `{ "x": number, "y": number }`.                         |
| `data`     | `object` | **Yes**  | Node configuration. Must include `"label"` (string, max 200 chars).         |

---

## Common Node Runtime Controls

Most node types may include these optional fields inside `data`:

| Data Field          | Type      | Required | Description |
| ------------------- | --------- | -------- | ----------- |
| `nodeRetryAttempts` | `integer` | No       | 0-5 retries after the first failed node execution. Use only for transient technical executor exceptions. |
| `nodeRetryDelayMs`  | `integer` | No       | 0-5000 ms before the first node retry. |
| `nodeRetryBackoff`  | `boolean` | No       | Default `true`. Doubles the node retry delay between attempts. |

Node retry is executed by the AgentGraph runtime for thrown node exceptions. It does not retry user clarification, invalid workflow input, validation branches, human interrupts, delays, or API business errors. HTTP Request and API Connector nodes also have request-level `retryAttempts`, `retryDelayMs`, `retryBackoff`, and `retryUnsafeMethods`; those fields apply to outbound HTTP calls, not to the whole workflow node.

---

## Node Types & Data Fields

Current supported node types:

`trigger`, `sendMessage`, `collectInput`, `collectForm`, `condition`, `aiAgent`, `answer`, `queryRewrite`, `summarize`, `structuredOutput`, `knowledgeBase`, `confidenceCheck`, `guardrail`, `contextBuilder`, `rerank`, `errorHandler`, `confirmation`, `action`, `httpRequest`, `apiConnector`, `setVariable`, `entityExtractor`, `memoryRead`, `memoryWrite`, `end`, `join`, `batchMap`, `delay`, `switchRouter`, `validation`, `transform`, `log`, `randomSplit`, `codeExpression`, `subWorkflow`, `intentClassifier`, `sentiment`, and `note`.

The visual editor also exposes a `Data Retrieval` palette item. Persisted JSON stores it as an `action` node with `actionKey: "query_data_resource"`.

### 1. `trigger` — Starts the Workflow

Every executable workflow **must** have exactly one trigger node.

```json
{
    "id": "trigger_1",
    "type": "trigger",
    "position": { "x": 400, "y": 60 },
    "data": {
        "label": "User Message",
        "triggerType": "user_message"
    }
}
```

| Data Field    | Type     | Required | Values           |
| ------------- | -------- | -------- | ---------------- |
| `label`       | `string` | **Yes**  | Display name     |
| `triggerType` | `string` | **Yes**  | `"user_message"` |

Supported trigger types:

- `user_message` for chat-driven workflows

---

### 2. `sendMessage` — Send a Response

```json
{
    "id": "msg_1",
    "type": "sendMessage",
    "position": { "x": 400, "y": 300 },
    "data": {
        "label": "Reply to User",
        "messageType": "text",
        "messageContent": "{{ai_response}}"
    }
}
```

| Data Field       | Type     | Required | Values                                                           |
| ---------------- | -------- | -------- | ---------------------------------------------------------------- |
| `label`          | `string` | **Yes**  |                                                                  |
| `messageType`    | `string` | **Yes**  | `"text"`, `"image"`, `"card"`, `"carousel"`, `"buttons"`         |
| `messageContent` | `string` | **Yes**  | The message body. Supports `{{variables}}`.                      |
| `buttons`        | `string` | No       | JSON array of `{"label": "...", "value": "..."}` or a `{{variable}}` that resolves to that array at runtime |
| `cards`          | `string` | No       | JSON array of card objects or a `{{variable}}` that resolves to that array at runtime |
| `imageUrl`       | `string` | No       | Public URL or `{{variable}}` for image type                      |
| `imageArtifact`  | `string` | No       | JSON object or `{{variable}}` with `disk`, `path`, `mime`, optional `public_url`; channels can upload this directly |

For `messageType: "image"`, provide `imageUrl`, `imageArtifact`, or both. A generated image workflow should usually pass both `{{generated_image.image_url}}` and `{{generated_image.image_artifact}}`: public web/widget clients can use the URL, while Slack and Telegram can upload the stored artifact directly when URL fetching is unreliable.

---

### 3. `collectInput` — Ask the User a Question

```json
{
    "id": "input_1",
    "type": "collectInput",
    "position": { "x": 400, "y": 200 },
    "data": {
        "label": "Ask Name",
        "prompt": "What is your name?",
        "variableName": "user_name",
        "inputType": "text",
        "required": true
    }
}
```

| Data Field     | Type      | Required | Values                                                |
| -------------- | --------- | -------- | ----------------------------------------------------- |
| `label`        | `string`  | **Yes**  |                                                       |
| `prompt`       | `string`  | **Yes**  | Question to ask the user                              |
| `variableName` | `string`  | **Yes**  | Variable to store the answer in                       |
| `inputType`    | `string`  | **Yes**  | `"text"`, `"email"`, `"number"`, `"date"`, `"time"`, `"choice"` |
| `choices`      | `string`  | No       | Comma-separated or JSON array (for `"choice"` type)   |
| `validation`   | `string`  | No       | Validation rule                                       |
| `required`     | `boolean` | **Yes**  | Whether an answer is required                         |

Input validation stays deterministic at workflow boundaries. `inputType: "date"` and the `date` validation rule accept canonical `YYYY-MM-DD` values only; use semantic extraction or a transform step before validation when users may say "tomorrow" or use locale-specific formats. `inputType: "time"` and the `time` rule accept 24-hour `HH:MM`. `validation` can combine pipe-separated rules such as `email`, `number`, `date`, `time`, `url`, `min:n`, `max:n`, `money`, `money:EUR`, `money:USD`, `money:GBP`, and `regex:/.../`.

---

### 3b. `collectForm` — Collect Structured Fields

`collectForm` is the runtime node used for schema v2 Ask steps with `inputType: "form"`, form/wizard presentation, or `structuredFields`. It stores a structured object in `variableName` and keeps the semantic slot metadata in `structuredFields`, `slotContract`, `constraints`, `parsing`, `normalization`, `policy`, `examples`, and `canonicalization`.

Use schema v2 authoring for new form workflows. Low-level runtime JSON may still use `collectForm` directly for test fixtures or engine diagnostics.

---

### 4. `condition` — If/Else Branch

Has **two outputs**: `"yes"` and `"no"` handles.

```json
{
    "id": "cond_1",
    "type": "condition",
    "position": { "x": 400, "y": 300 },
    "data": {
        "label": "Check Language",
        "leftOperand": "{{language}}",
        "operator": "equals",
        "rightOperand": "english"
    }
}
```

| Data Field     | Type     | Required | Values                                                                                                                                         |
| -------------- | -------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `label`        | `string` | **Yes**  |                                                                                                                                                |
| `leftOperand`  | `string` | **Yes**  | Left side of comparison. Supports `{{variables}}`.                                                                                             |
| `operator`     | `string` | **Yes**  | `"equals"`, `"not_equals"`, `"contains"`, `"not_contains"`, `"greater_than"`, `"less_than"`, `"is_empty"`, `"is_not_empty"`, `"matches_regex"` |
| `rightOperand` | `string` | **Yes**  | Right side of comparison                                                                                                                       |

**Edge sourceHandles**: Use `"yes"` for the yes-branch and `"no"` for the no-branch.

---

### 5. `aiAgent` — LLM Processing

```json
{
    "id": "ai_1",
    "type": "aiAgent",
    "position": { "x": 400, "y": 400 },
    "data": {
        "label": "Generate Response",
        "provider": "",
        "model": "",
        "systemPrompt": "You are a helpful assistant.",
        "userPromptTemplate": "Context: {{context}}\n\nQuestion: {{input}}",
        "temperature": 0.7,
        "maxTokens": 2048,
        "outputVariable": "ai_response"
    }
}
```

| Data Field           | Type      | Required | Values                                          |
| -------------------- | --------- | -------- | ----------------------------------------------- |
| `label`              | `string`  | **Yes**  |                                                 |
| `provider`           | `string`  | No       | AI provider (leave `""` for bot default)        |
| `model`              | `string`  | No       | Model name (leave `""` for bot default)         |
| `systemPrompt`       | `string`  | **Yes**  | System instructions for the LLM                 |
| `userPromptTemplate` | `string`  | **Yes**  | User prompt template. Supports `{{variables}}`. |
| `temperature`        | `number`  | **Yes**  | 0.0 – 2.0 (default: 0.7)                        |
| `maxTokens`          | `integer` | **Yes**  | Max response tokens (default: 2048)             |
| `outputVariable`     | `string`  | **Yes**  | Variable name to store the AI response          |
| `emitProviderDeltas` | `boolean` | No       | Forward ephemeral model deltas to an explicit `WorkflowRunner` callback (default: `true`) |

> **Runtime note:** `emitProviderDeltas` does not publish or hide a chat message. Durable replies are committed first and rendered from the canonical outcome. Schema-v2 authoring derives this flag from the typed step kind.

> `temperature` and `maxTokens` are validated, preserved in workflow JSON, and passed to the Laravel AI SDK where the selected provider supports them.

---

### 6. `knowledgeBase` — Knowledge Retrieval

```json
{
    "id": "kb_1",
    "type": "knowledgeBase",
    "position": { "x": 400, "y": 200 },
    "data": {
        "label": "Search Docs",
        "query": "{{input}}",
        "topK": 6,
        "minSimilarity": 0.65,
        "outputVariable": "context"
    }
}
```

| Data Field       | Type      | Required | Values                                               |
| ---------------- | --------- | -------- | ---------------------------------------------------- |
| `label`          | `string`  | **Yes**  |                                                      |
| `query`          | `string`  | **Yes**  | Search query. Supports `{{variables}}`.              |
| `topK`           | `integer` | **Yes**  | Number of results to retrieve (default: 6)           |
| `minSimilarity`  | `number`  | **Yes**  | Minimum similarity threshold 0.0–1.0 (default: 0.65) |
| `outputVariable` | `string`  | **Yes**  | Variable to store retrieved context                  |

---

### Agentic Utility Nodes

These nodes are available in addition to the core message, logic, AI, and integration nodes:

| Node Type | Purpose | Important Data Fields |
| --- | --- | --- |
| `answer` | Final grounded LLM response from knowledge/data variables | `contextVariable`, `dataVariable`, `questionTemplate`, `fallbackMessage`, `requireContext`, `outputVariable` |
| `queryRewrite` | Rewrite user input into an internal search or lookup query | `inputTemplate`, `instructions`, `provider`, `model`, `outputVariable` |
| `summarize` | Summarize long context or API results before a later step | `sourceTemplate`, `instructions`, `maxLength`, `provider`, `model`, `outputVariable` |
| `structuredOutput` | Extract JSON and validate it against a compact schema or JSON Schema-style object | `sourceTemplate`, `schema`, `instructions`, `outputVariable`, `rawOutputVariable` |
| `confidenceCheck` | Branch when retrieved context/data is strong enough | `sourceVariable`, `countVariable`, `errorVariable`, `minCount`, `minTextLength`, `outputVariable` |
| `guardrail` | Deterministically route unsafe/missing-content input | `inputTemplate`, `bannedTerms`, `requiredTerms`, `detectEmail`, `detectPhone`, `detectUrl`, `maxLength`, `outputVariable` |
| `contextBuilder` | Combine variables, retrieved records, and user input into one context string | `sources`, `includeInput`, `separator`, `outputVariable` |
| `rerank` | Reorder retrieved records or resolve API candidates by query and field preferences | `sourceVariable`, `recordsPath`, `queryTemplate`, `textFields`, `scoringMode`, `provider`, `model`, `preferredValues`, `limit`, `outputVariable` |
| `errorHandler` | Route based on an upstream error variable and write a fallback message | `errorVariable`, `fallbackMessage`, `outputVariable` |
| `confirmation` | Ask the user to confirm or cancel before sensitive work continues | `prompt`, `variableName`, `confirmLabel`, `cancelLabel` |
| `entityExtractor` | Extract emails, phones, URLs, numbers, dates, or regex matches | `inputTemplate`, `fields`, `outputVariable`, `writeIndividualVariables` |
| `memoryRead` | Read scoped workflow memory | `scope`, `namespace`, `key`, `defaultValue`, `outputVariable` |
| `memoryWrite` | Persist small scoped facts for later turns or later nodes | `scope`, `namespace`, `key`, `valueTemplate`, `valueMode`, `memoryType`, `merge`, `outputVariable` |
| `end` | Finish the workflow and optionally set a status | `finalMessage`, `statusVariable`, `statusValue` |

`confirmation`, `structuredOutput`, `confidenceCheck`, `guardrail`, and `errorHandler` use `sourceHandle: "valid"` and `sourceHandle: "invalid"` for their branches. The editor also accepts legacy `yes`/`no` handles for confirmation and normalizes them.

Per-node `temperature` and `maxTokens` values on AI-backed nodes are passed through the Laravel AI SDK generation options where the selected provider gateway supports them.

For simple workflows, use `scope: "conversation"` for chat state and `scope: "workflow_run"` for one-run scratch state. The runtime also accepts `session`, `actor`, and `bot` for advanced API/import use cases where broader reuse is intentional. Actor- and bot-scoped memory is long-term memory and requires `longTermMemoryKind`, `longTermMemoryProvenance`, and `longTermMemoryRetentionDays`; valid kinds are `explicit_preference`, `stable_fact`, and `recurring_task_pattern`. `memoryType: "semantic"` is accepted as metadata, but it does not create vector-search memory by itself and long-term semantic recalls are not proof for active workflow routing.

---

### 7. `action` — Run a Backend Action

```json
{
    "id": "action_1",
    "type": "action",
    "position": { "x": 400, "y": 500 },
    "data": {
        "label": "Send Email",
        "actionKey": "send_email",
        "inputMapping": "{\"to\": \"{{user_email}}\", \"subject\": \"Your answer\"}",
        "outputVariable": "action_result"
    }
}
```

| Data Field       | Type     | Required | Values                                   |
| ---------------- | -------- | -------- | ---------------------------------------- |
| `label`          | `string` | **Yes**  |                                          |
| `actionKey`      | `string` | **Yes**  | Registered action identifier             |
| `inputMapping`   | `string` | **Yes**  | JSON string mapping inputs to the action |
| `outputVariable` | `string` | **Yes**  | Variable to store the result             |

Common built-in action keys:

- `store_submission`: persists a schema-driven record. `inputMapping` typically includes `schema_key`, `payload`, and optionally `schema_version`, `status`, `dedupe_key`, and `meta`.
- `query_data_resource`: performs a read-only lookup against a configured internal resource. `inputMapping` must include `resource_key` and may include `mode`, `filters`, `filter_clauses`, `select`, `limit`, and `sort`.
- `format_records_for_chat`: formats a `query_data_resource` result for chat output as cards, an image gallery, or a compact bullet list.
- `generate_image`: generates an image through a native Laravel AI image provider or a generic HTTP JSON image endpoint. `inputMapping` must include `prompt` and may include `transport`, `provider`, `model`, `url`, `headers`, `body`, `response_image_path`, `response_image_url_path`, `size`, `quality`, `width`, `height`, `steps`, `disk`, `path`, and `public_base_url`.

In the visual workflow editor, `query_data_resource` is also exposed as the dedicated `Data Retrieval` node preset. Persisted workflow JSON still serializes it as an `action` node with `actionKey: "query_data_resource"`.

For Telegram and Slack, `generate_image.image_artifact` lets the channel drivers upload the stored image directly from Laravel storage. `generate_image.image_url` is still returned for web clients and for providers that prefer public URLs. When the image provider returns bytes or base64, the action stores the file and builds both the storage artifact and a URL from the storage disk URL or `AGENTIC_CHATBOT_WORKFLOW_IMAGE_PUBLIC_BASE_URL`.

`query_data_resource` is validated against the linked bot and immutable deployment binding at publish time and runtime. `inputMapping.allowed_resource_keys` is required and must contain at least one literal resource key; missing or empty means no access. A static `resource_key` must appear in that list. Publish pins each listed key plus its versioned Data Resource contract hash into the deployment artifact. Runtime requires the bot policy, the pinned workflow binding/current contract hash, and server-attested row scope to agree.

Use `filters` when filter field names are known while authoring the workflow. Use `filter_clauses` for generic user-driven query plans where a previous `structuredOutput` step extracts safe field/operator/value clauses. Dynamic `mode`, `filter_clauses.*.field`, `filter_clauses.*.operator`, `sort.column`, `sort.direction`, and `limit` values must be exact `{{variable}}` templates; the action still validates resolved fields and sort columns against the resource allowlists at runtime.

Blank `filter_clauses.*.field` values are ignored so fixed-size query-plan slots can be used safely when the visitor request needs fewer filters. Non-empty fields are still rejected unless the resource allow-list permits them.

Custom actions may also declare `capability: query` or `capability: write` in config. When present, publish-time and runtime checks compare that requirement against the linked bot mode.

---

### 8. `httpRequest` — Call an External API

```json
{
    "id": "http_1",
    "type": "httpRequest",
    "position": { "x": 400, "y": 400 },
    "data": {
        "label": "Fetch Weather",
        "method": "GET",
        "url": "https://api.example.com/weather?city={{city}}",
        "headers": "{}",
        "body": "{}",
        "outputVariable": "weather_data",
        "timeout": 30,
        "retryAttempts": 1,
        "retryDelayMs": 250,
        "retryBackoff": true,
        "retryUnsafeMethods": false
    }
}
```

| Data Field       | Type      | Required | Values                                            |
| ---------------- | --------- | -------- | ------------------------------------------------- |
| `label`          | `string`  | **Yes**  |                                                   |
| `method`         | `string`  | **Yes**  | `"GET"`, `"POST"`, `"PUT"`, `"PATCH"`, `"DELETE"` |
| `url`            | `string`  | **Yes**  | Full URL. Supports `{{variables}}`.               |
| `headers`        | `string`  | **Yes**  | JSON object string of headers                     |
| `body`           | `string`  | **Yes**  | JSON body string (for POST/PUT/PATCH)             |
| `outputVariable` | `string`  | **Yes**  | Variable to store the response                    |
| `timeout`        | `integer` | **Yes**  | Timeout in seconds (default: 30)                  |
| `continueOnFail` | `boolean` | No       | Default `false`. When false, missing URLs, request errors, blocked URLs, and non-2xx responses stop execution. |
| `retryAttempts`  | `integer` | No       | 0-5 retries after the first failed request        |
| `retryDelayMs`   | `integer` | No       | 0-5000 ms before the first retry                  |
| `retryBackoff`   | `boolean` | No       | Default `true`. Doubles the delay between retries |
| `retryUnsafeMethods` | `boolean` | No    | Default `false`. Allows retries for POST/PUT/PATCH/DELETE only when the target API is idempotent |

Runtime variables:

- `{{outputVariable}}`: decoded response for successful responses, or the preserved previous value / empty string on failure
- `{{outputVariable_status}}`: HTTP status code, `blocked`, or `error`
- `{{outputVariable_error}}`: failure message when the request fails

Non-2xx responses stop execution unless `continueOnFail` is true. Unsupported methods are blocked before a request is sent. Only `GET` requests are retried by default. `POST`, `PUT`, `PATCH`, and `DELETE` retry only when `retryUnsafeMethods` is enabled.

---

### 9. `apiConnector` — Versioned Saved API Capability

```json
{
    "id": "api_1",
    "type": "apiConnector",
    "position": { "x": 400, "y": 400 },
    "data": {
        "label": "Call CRM",
        "connectorId": "12",
        "apiOperationRevisionId": "47",
        "apiOperationContractHash": "<sha256>",
        "inputMapping": "{\"name\": \"{{user_name}}\"}",
        "outputVariable": "contact_id",
        "continueOnFail": false
    }
}
```

| Data Field                    | Type      | Required | Values |
| ----------------------------- | --------- | -------- | ------ |
| `label`                       | `string`  | **Yes**  | Presentation label |
| `connectorId`                 | `string`  | **Yes**  | Saved connector identity |
| `apiOperationRevisionId`      | `string`  | **Yes**  | Immutable operation revision selected in the editor |
| `apiOperationContractHash`    | `string`  | **Yes**  | SHA-256 contract identity for that revision |
| `inputMapping`                | `object|string` | No | Declared capability input names mapped from workflow values |
| `outputVariable`              | `string`  | **Yes**  | Variable to store the mapped operation result |
| `continueOnFail`              | `boolean` | No       | Presentation/routing policy; default `false` |
| `allowEmptyResponse`          | `boolean` | No       | Presentation policy for an empty mapped result |
| `missingResponseMessage`      | `string`  | No       | Optional fallback presentation |

Published runtime snapshots additionally contain the revision's locked method, path template, header/request mappings, request/response schemas, output mapping, side-effect/confirmation declaration, timeout/retry/idempotency policy, and named environment binding. Authoring nodes cannot override those fields. Runtime never falls back from a missing revision to a mutable operation key.

Runtime variables:

- `{{outputVariable}}`: decoded response or extracted JSON path value
- `{{outputVariable_status}}`: HTTP status code, `blocked`, `mapping_error`, or `error`
- `{{outputVariable_raw}}`: raw response body when a request was sent
- `{{outputVariable_error}}`: failure message when the connector fails or returns a non-2xx response

Non-2xx responses preserve the decoded response and raw body, then stop execution unless `continueOnFail` is true. Unsupported methods are blocked before a request is sent. Only `GET` requests are retried by default. `POST`, `PUT`, `PATCH`, and `DELETE` retry only when `retryUnsafeMethods` is enabled.

---

### 10. `setVariable` — Set a Variable

```json
{
    "id": "var_1",
    "type": "setVariable",
    "position": { "x": 400, "y": 300 },
    "data": {
        "label": "Set Greeting",
        "variableName": "greeting",
        "expression": "Hello, {{user_name}}!"
    }
}
```

| Data Field     | Type     | Required | Values                                      |
| -------------- | -------- | -------- | ------------------------------------------- |
| `label`        | `string` | **Yes**  |                                             |
| `variableName` | `string` | **Yes**  | Name of the variable to set                 |
| `expression`   | `string` | **Yes**  | Literal/template value. Supports `{{variables}}`. Use `transform` or `codeExpression` for data manipulation. |

---

### 11. `batchMap` — Map a Bounded Collection

```json
{
    "id": "batch_map_1",
    "type": "batchMap",
    "position": { "x": 400, "y": 400 },
    "data": {
        "label": "Process Items",
        "collectionVariable": "items",
        "itemVariable": "item",
        "indexVariable": "index",
        "maxItems": 20
    }
}
```

| Data Field           | Type      | Required | Values                                                   |
| -------------------- | --------- | -------- | -------------------------------------------------------- |
| `label`              | `string`  | **Yes**  |                                                          |
| `collectionVariable` | `string`  | **Yes**  | Variable holding the array to iterate                    |
| `itemVariable`       | `string`  | **Yes**  | Variable name for the current item (default: `"item"`)   |
| `indexVariable`      | `string`  | **Yes**  | Variable name for the current index (default: `"index"`) |
| `maxItems`           | `integer` | **Yes**  | Hard item limit (default: 20, maximum: 100)              |

Connect the per-item body from the `batchMap` handle and the post-collection
path from `done`. The body returns to the controller automatically. Every
iteration receives isolated `itemVariable` and `indexVariable` values; outputs
are combined in collection order. External capabilities in the body keep their
normal gateway and side-effect rules.

---

### 12. `delay` — Pause Execution

```json
{
    "id": "delay_1",
    "type": "delay",
    "position": { "x": 400, "y": 350 },
    "data": {
        "label": "Wait 3 seconds",
        "delaySeconds": 3,
        "waitMessage": "Please hold on..."
    }
}
```

| Data Field     | Type      | Required | Values                        |
| -------------- | --------- | -------- | ----------------------------- |
| `label`        | `string`  | **Yes**  |                               |
| `delaySeconds` | `integer` | **Yes**  | Seconds to pause              |
| `waitMessage`  | `string`  | No       | Message shown during the wait |

---

### 13. `switchRouter` — Multi-Way Branch

Routes to different branches based on a value. Has **dynamic outputs** — one per case plus a default.

```json
{
    "id": "switch_1",
    "type": "switchRouter",
    "position": { "x": 400, "y": 400 },
    "data": {
        "label": "Route by Category",
        "switchValue": "{{category}}",
        "cases": "[{\"case\": \"billing\", \"label\": \"Billing\"}, {\"case\": \"technical\", \"label\": \"Technical\"}]",
        "defaultLabel": "General"
    }
}
```

| Data Field     | Type     | Required | Values                                                     |
| -------------- | -------- | -------- | ---------------------------------------------------------- |
| `label`        | `string` | **Yes**  |                                                            |
| `switchValue`  | `string` | **Yes**  | Value to evaluate. Supports `{{variables}}`.               |
| `cases`        | `string` | **Yes**  | JSON array of `{"case": "value", "label": "Display Name"}` |
| `defaultLabel` | `string` | **Yes**  | Label for the default/fallback route                       |

**Edge sourceHandles**: Use `"case_0"`, `"case_1"`, etc. for cases, and `"default"` for the fallback.

---

### 14. `note` — Canvas Annotation

Notes cannot be connected to other nodes. They are visual annotations only.

```json
{
    "id": "note_1",
    "type": "note",
    "position": { "x": 100, "y": 100 },
    "data": {
        "label": "Note",
        "noteContent": "This section handles user authentication.",
        "color": "#fbbf24"
    }
}
```

| Data Field    | Type     | Required | Values                            |
| ------------- | -------- | -------- | --------------------------------- |
| `label`       | `string` | **Yes**  |                                   |
| `noteContent` | `string` | No       | Markdown-like text content        |
| `color`       | `string` | No       | Hex color for the note background |

---

### 15. `join` — Merge Parallel Branches

A pass-through node that merges multiple incoming branches into a single continuation point. It has no configuration — it simply forwards execution to its outgoing edge. Use this when several branches (e.g. from a `condition` or `switchRouter`) should converge back to a shared path.

```json
{
    "id": "join_1",
    "type": "join",
    "position": { "x": 800, "y": 400 },
    "data": {
        "label": "Merge Paths"
    }
}
```

| Data Field | Type     | Required | Values |
| ---------- | -------- | -------- | ------ |
| `label`    | `string` | **Yes**  |        |

No additional configuration needed. Connect multiple source nodes into this node, then connect its single output to the next step.

---

## Edge Object

Edges connect nodes together. Each edge must reference existing node IDs.

```json
{
    "id": "e-1",
    "source": "trigger_1",
    "target": "kb_1",
    "sourceHandle": null,
    "targetHandle": null
}
```

| Field          | Type           | Required | Description                                                                                              |
| -------------- | -------------- | -------- | -------------------------------------------------------------------------------------------------------- |
| `id`           | `string`       | **Yes**  | Unique edge identifier (e.g. `"e-1"`, `"edge_trigger_to_kb"`).                                           |
| `source`       | `string`       | **Yes**  | ID of the source node.                                                                                   |
| `target`       | `string`       | **Yes**  | ID of the target node.                                                                                   |
| `sourceHandle` | `string\|null` | No       | Output handle name. Required for condition (`"yes"`, `"no"`) and switch (`"case_0"`, `"default"`) nodes. |
| `targetHandle` | `string\|null` | No       | Input handle name (usually null).                                                                        |

---

## Variable Interpolation

Use double-braces `{{variable_name}}` in any string field to reference workflow variables. Common built-in variables:

| Variable     | Description                                           |
| ------------ | ----------------------------------------------------- |
| `{{input}}`  | The original user message that triggered the workflow |
| `{{output}}` | The current workflow output                           |

Variables are created by nodes that have `outputVariable`, `variableName`, `itemVariable`, or `indexVariable` fields.

---

## Validation Rules

The import validator enforces these rules:

- **Exactly one `trigger` node** is required.
- **All edge sources and targets** must reference existing node IDs.
- **No self-loop edges** (source ≠ target on same edge).
- **No duplicate node IDs**.
- **Max 200 nodes** and **500 edges** per workflow.
- All nodes must have a valid `type`, `position`, and `data.label`.

Runtime payload schema validation for structured output and action payload contracts supports JSON Schema-style `type`, `properties`, `required`, `items`, `enum`, `additionalProperties`, `minLength`, `maxLength`, string `format` (`email`, `url`, `uri`, `date`, `date-time`), string `pattern`, and numeric `minimum` / `maximum`. This validator is intentionally deterministic; semantic normalization should happen before values cross into these contracts.

---

## Complete Example

Here's a full workflow that greets the user, searches a knowledge base, generates an AI response, and replies:

```json
{
    "schemaVersion": 1,
    "nodes": [
        {
            "id": "trigger_1",
            "type": "trigger",
            "position": { "x": 400, "y": 60 },
            "data": {
                "label": "User Message",
                "triggerType": "user_message"
            }
        },
        {
            "id": "kb_1",
            "type": "knowledgeBase",
            "position": { "x": 400, "y": 220 },
            "data": {
                "label": "Search Knowledge",
                "query": "{{input}}",
                "topK": 6,
                "minSimilarity": 0.65,
                "outputVariable": "context"
            }
        },
        {
            "id": "ai_1",
            "type": "aiAgent",
            "position": { "x": 400, "y": 400 },
            "data": {
                "label": "Generate Response",
                "provider": "",
                "model": "",
                "systemPrompt": "You are a helpful assistant. Answer using the provided context. If the context doesn't contain relevant information, say so honestly.",
                "userPromptTemplate": "Context:\n{{context}}\n\nUser Question:\n{{input}}",
                "temperature": 0.7,
                "maxTokens": 2048,
                "outputVariable": "ai_response"
            }
        },
        {
            "id": "msg_1",
            "type": "sendMessage",
            "position": { "x": 400, "y": 600 },
            "data": {
                "label": "Reply to User",
                "messageType": "text",
                "messageContent": "{{ai_response}}"
            }
        }
    ],
    "edges": [
        { "id": "e-1", "source": "trigger_1", "target": "kb_1" },
        { "id": "e-2", "source": "kb_1", "target": "ai_1" },
        { "id": "e-3", "source": "ai_1", "target": "msg_1" }
    ],
    "viewport": { "x": 0, "y": 0, "zoom": 1 }
}
```

---

## Advanced Example: Conditional Routing with Input Collection

```json
{
    "schemaVersion": 1,
    "nodes": [
        {
            "id": "trigger_1",
            "type": "trigger",
            "position": { "x": 400, "y": 60 },
            "data": { "label": "User Message", "triggerType": "user_message" }
        },
        {
            "id": "input_1",
            "type": "collectInput",
            "position": { "x": 400, "y": 200 },
            "data": {
                "label": "Ask Category",
                "prompt": "What can I help you with? Choose: billing, technical, or general",
                "variableName": "category",
                "inputType": "choice",
                "choices": "billing,technical,general",
                "required": true
            }
        },
        {
            "id": "switch_1",
            "type": "switchRouter",
            "position": { "x": 400, "y": 380 },
            "data": {
                "label": "Route by Category",
                "switchValue": "{{category}}",
                "cases": "[{\"case\": \"billing\", \"label\": \"Billing\"}, {\"case\": \"technical\", \"label\": \"Technical\"}]",
                "defaultLabel": "General"
            }
        },
        {
            "id": "ai_billing",
            "type": "aiAgent",
            "position": { "x": 100, "y": 560 },
            "data": {
                "label": "Billing AI",
                "provider": "",
                "model": "",
                "systemPrompt": "You are a billing support specialist. Help with invoices, payments, and subscriptions.",
                "userPromptTemplate": "{{input}}",
                "temperature": 0.5,
                "maxTokens": 1024,
                "outputVariable": "ai_response"
            }
        },
        {
            "id": "ai_tech",
            "type": "aiAgent",
            "position": { "x": 400, "y": 560 },
            "data": {
                "label": "Tech Support AI",
                "provider": "",
                "model": "",
                "systemPrompt": "You are a technical support engineer. Help with bugs, setup, and configuration.",
                "userPromptTemplate": "{{input}}",
                "temperature": 0.3,
                "maxTokens": 2048,
                "outputVariable": "ai_response"
            }
        },
        {
            "id": "ai_general",
            "type": "aiAgent",
            "position": { "x": 700, "y": 560 },
            "data": {
                "label": "General AI",
                "provider": "",
                "model": "",
                "systemPrompt": "You are a friendly general assistant.",
                "userPromptTemplate": "{{input}}",
                "temperature": 0.7,
                "maxTokens": 1024,
                "outputVariable": "ai_response"
            }
        },
        {
            "id": "msg_reply",
            "type": "sendMessage",
            "position": { "x": 400, "y": 740 },
            "data": {
                "label": "Send Reply",
                "messageType": "text",
                "messageContent": "{{ai_response}}"
            }
        }
    ],
    "edges": [
        { "id": "e-1", "source": "trigger_1", "target": "input_1" },
        { "id": "e-2", "source": "input_1", "target": "switch_1" },
        {
            "id": "e-3",
            "source": "switch_1",
            "target": "ai_billing",
            "sourceHandle": "case_0"
        },
        {
            "id": "e-4",
            "source": "switch_1",
            "target": "ai_tech",
            "sourceHandle": "case_1"
        },
        {
            "id": "e-5",
            "source": "switch_1",
            "target": "ai_general",
            "sourceHandle": "default"
        },
        { "id": "e-6", "source": "ai_billing", "target": "msg_reply" },
        { "id": "e-7", "source": "ai_tech", "target": "msg_reply" },
        { "id": "e-8", "source": "ai_general", "target": "msg_reply" }
    ],
    "viewport": { "x": 0, "y": 0, "zoom": 0.85 }
}
```

---

## AI Prompt Template

Copy-paste this prompt to any AI to generate workflows:

```
Generate a workflow JSON for the Filament Agentic Chatbot plugin.

The JSON must follow this structure:
- Top level: { schemaVersion: 1, nodes: [...], edges: [...] }
- Each node needs: id (string), type (string), position: {x, y}, data: {label, ...type-specific fields}
- Optional common node runtime retry fields live inside data: nodeRetryAttempts (0-5), nodeRetryDelayMs (0-5000), nodeRetryBackoff (boolean). Use them only for transient technical node exceptions, not for user clarification, validation branches, or HTTP status handling.
- Valid node types: trigger, sendMessage, collectInput, condition, aiAgent, answer, queryRewrite, summarize, structuredOutput, knowledgeBase, confidenceCheck, guardrail, contextBuilder, rerank, errorHandler, confirmation, action, httpRequest, apiConnector, setVariable, entityExtractor, memoryRead, memoryWrite, end, join, batchMap, delay, switchRouter, intentClassifier, sentiment, validation, transform, log, randomSplit, codeExpression, subWorkflow, note
- Every workflow must have exactly one "trigger" node
- Edges connect nodes: { id, source, target, sourceHandle? }
- For condition nodes, use sourceHandle "yes" or "no"
- For validation-style nodes (`validation`, `confirmation`, `structuredOutput`, `confidenceCheck`, `guardrail`, `errorHandler`), use sourceHandle "valid" or "invalid"
- For switch-style nodes (`switchRouter`, `randomSplit`, `intentClassifier`, `sentiment`), use sourceHandle "case_0", "case_1", ..., "default"
- Use {{variable_name}} syntax for variable interpolation in string fields
- Built-in variables: {{input}} (user message), {{output}} (current output)

Here's what I want the workflow to do:
[DESCRIBE YOUR WORKFLOW HERE]
```
