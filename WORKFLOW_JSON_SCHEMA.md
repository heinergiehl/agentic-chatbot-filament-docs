# Workflow JSON Schema Reference

This document describes the exact JSON format used by the **Filament Agentic Chatbot** workflow engine. Use this as a reference when generating workflow JSON with an AI assistant, or when building workflows programmatically.

## How to Use

1. **Ask an AI** (ChatGPT, Claude, etc.) to generate a workflow JSON using this schema.
2. **Copy the JSON** output from the AI.
3. In the workflow editor, click **📥 Import** in the sidebar.
4. **Paste** the JSON (or upload a `.json` file) and click **✅ Import**.
5. The workflow loads into the visual editor — tweak as needed, then **💾 Save**.

---

## Top-Level Structure

```json
{
  "schemaVersion": 1,
  "nodes": [ ... ],
  "edges": [ ... ],
  "viewport": { "x": 0, "y": 0, "zoom": 1 }
}
```

| Field           | Type      | Required           | Description                                  |
| --------------- | --------- | ------------------ | -------------------------------------------- |
| `schemaVersion` | `integer` | No (defaults to 1) | Schema version for forward compatibility.    |
| `nodes`         | `array`   | **Yes**            | Array of node objects (min 1).               |
| `edges`         | `array`   | No                 | Array of edge objects connecting nodes.      |
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
| `type`     | `string` | **Yes**  | One of the 15 node types listed below.                                      |
| `position` | `object` | **Yes**  | Canvas coordinates: `{ "x": number, "y": number }`.                         |
| `data`     | `object` | **Yes**  | Node configuration. Must include `"label"` (string, max 200 chars).         |

---

## Node Types & Data Fields

### 1. `trigger` — Starts the Workflow

Every workflow **must** have at least one trigger node.

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

| Data Field    | Type     | Required | Values                                      |
| ------------- | -------- | -------- | ------------------------------------------- |
| `label`       | `string` | **Yes**  | Display name                                |
| `triggerType` | `string` | **Yes**  | `"user_message"`, `"webhook"`, or `"event"` |
| `webhookPath` | `string` | No       | Path for webhook triggers                   |
| `eventName`   | `string` | No       | Event name for event triggers               |

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
| `buttons`        | `string` | No       | JSON array of `{"label": "...", "value": "..."}` for button type |
| `cards`          | `string` | No       | JSON array of card objects for carousel type                     |
| `imageUrl`       | `string` | No       | URL or `{{variable}}` for image type                             |

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
| `inputType`    | `string`  | **Yes**  | `"text"`, `"email"`, `"number"`, `"date"`, `"choice"` |
| `choices`      | `string`  | No       | Comma-separated or JSON array (for `"choice"` type)   |
| `validation`   | `string`  | No       | Validation rule                                       |
| `required`     | `boolean` | **Yes**  | Whether an answer is required                         |

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

---

### 6. `knowledgeBase` — RAG Retrieval

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
    "timeout": 30
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

---

### 9. `apiConnector` — Saved API Profile

```json
{
  "id": "api_1",
  "type": "apiConnector",
  "position": { "x": 400, "y": 400 },
  "data": {
    "label": "Call CRM",
    "connectorId": "",
    "method": "POST",
    "pathSuffix": "/contacts",
    "extraHeaders": "{}",
    "body": "{\"name\": \"{{user_name}}\"}",
    "responseJsonPath": "data.id",
    "outputVariable": "contact_id",
    "timeout": 30
  }
}
```

| Data Field         | Type      | Required | Values                                                 |
| ------------------ | --------- | -------- | ------------------------------------------------------ |
| `label`            | `string`  | **Yes**  |                                                        |
| `connectorId`      | `string`  | **Yes**  | ID of a saved API Connector profile (select in editor) |
| `method`           | `string`  | **Yes**  | `"GET"`, `"POST"`, `"PUT"`, `"PATCH"`, `"DELETE"`      |
| `pathSuffix`       | `string`  | No       | Path appended to connector's base URL                  |
| `extraHeaders`     | `string`  | No       | JSON object of additional headers                      |
| `body`             | `string`  | No       | JSON body for POST/PUT/PATCH                           |
| `responseJsonPath` | `string`  | No       | Dot-notation path to extract from response             |
| `outputVariable`   | `string`  | **Yes**  | Variable to store the result                           |
| `timeout`          | `integer` | No       | Timeout override in seconds                            |

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
| `expression`   | `string` | **Yes**  | Value/expression. Supports `{{variables}}`. |

---

### 11. `loop` — Iterate Over a Collection

```json
{
  "id": "loop_1",
  "type": "loop",
  "position": { "x": 400, "y": 400 },
  "data": {
    "label": "Process Items",
    "collectionVariable": "items",
    "itemVariable": "item",
    "indexVariable": "index",
    "maxIterations": 20
  }
}
```

| Data Field           | Type      | Required | Values                                                   |
| -------------------- | --------- | -------- | -------------------------------------------------------- |
| `label`              | `string`  | **Yes**  |                                                          |
| `collectionVariable` | `string`  | **Yes**  | Variable holding the array to iterate                    |
| `itemVariable`       | `string`  | **Yes**  | Variable name for the current item (default: `"item"`)   |
| `indexVariable`      | `string`  | **Yes**  | Variable name for the current index (default: `"index"`) |
| `maxIterations`      | `integer` | **Yes**  | Safety limit (default: 20)                               |

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

- **At least one `trigger` node** is required.
- **All edge sources and targets** must reference existing node IDs.
- **No self-loop edges** (source ≠ target on same edge).
- **No duplicate node IDs**.
- **Max 200 nodes** and **500 edges** per workflow.
- All nodes must have a valid `type`, `position`, and `data.label`.

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
- Valid node types: trigger, sendMessage, collectInput, condition, aiAgent, knowledgeBase, action, httpRequest, apiConnector, setVariable, loop, delay, switchRouter, note
- Every workflow must have at least one "trigger" node
- Edges connect nodes: { id, source, target, sourceHandle? }
- For condition nodes, use sourceHandle "true" or "false"
- For switchRouter nodes, use sourceHandle "case_0", "case_1", ..., "default"
- Use {{variable_name}} syntax for variable interpolation in string fields
- Built-in variables: {{input}} (user message), {{output}} (current output)

Here's what I want the workflow to do:
[DESCRIBE YOUR WORKFLOW HERE]
```
