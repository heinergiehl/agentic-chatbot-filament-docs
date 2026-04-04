# API Connectors

API connectors let you save reusable external API connection profiles and reference them from workflow nodes. Instead of configuring base URL, authentication, headers, and timeout on every HTTP node, you define them once in a connector and select it when building workflows.

## When To Use Connectors vs HTTP Request Nodes

| Scenario | Use |
|----------|-----|
| One-off call to an external URL | HTTP Request node |
| Repeated calls to the same service across multiple workflows | API Connector |
| Service requires authentication that should be stored securely | API Connector |
| Quick prototype or test integration | HTTP Request node |

If you find yourself copy-pasting the same base URL and auth header into multiple HTTP nodes, create a connector instead.

## Creating A Connector

Navigate to **Agentic → API Connectors** in your Filament panel and click **New API Connector**.

### Connection Details

| Field | Description |
|-------|-------------|
| **Name** | A human-readable label, e.g., "Stripe API", "Internal CRM", "SendGrid" |
| **Description** | Optional notes about what this connector is used for |
| **Base URL** | The root URL for the API, e.g., `https://api.stripe.com/v1` |
| **Authentication Type** | How the connector authenticates (see below) |
| **Auth Credentials** | JSON-formatted credentials, stored encrypted at rest |

### Authentication Types

| Type | Credential JSON Format | What Happens |
|------|------------------------|--------------|
| **None** | — | No auth headers are added |
| **API Key** | `{"header_name": "X-Api-Key", "api_key": "sk-..."}` | Adds the specified header with the key value |
| **Bearer Token** | `{"token": "your-token"}` | Adds `Authorization: Bearer your-token` |
| **Basic Auth** | `{"username": "user", "password": "pass"}` | Adds `Authorization: Basic <base64>` |
| **Custom Header** | `{"header_name": "X-Custom", "header_value": "value"}` | Adds the specified header with the specified value |

> **Security note:** All credential values are stored using Laravel's encrypted casting. They are never stored in plain text in the database.

### Request Defaults

| Field | Description | Default |
|-------|-------------|---------|
| **Default Headers** | JSON object merged into every request, e.g., `{"Content-Type": "application/json"}` | none |
| **Default Timeout** | Seconds before a request times out | 30 |
| **Verify SSL** | Whether to verify the server's TLS certificate | true |
| **Expected Response Format** | `json`, `xml`, or `text` — helps the connector parse responses | auto-detect |
| **Active** | Whether this connector is available for use in workflows | true |

### Internal Notes

Use the collapsible **Notes** section to record rate limits, usage policies, contact info for the API provider, or any other context your team might need.

## Using A Connector In A Workflow

1. Open a workflow in the editor
2. Add an **API Connector** node from the sidebar
3. Select the connector from the dropdown
4. Configure the **endpoint path** (appended to the connector's base URL)
5. Configure the **HTTP method**, **body**, and any **per-request headers**
6. Map workflow variables into the request and response

The connector node automatically applies the saved base URL, authentication, default headers, and timeout. You only need to specify what is unique to this particular call.

## Example: Stripe Charge Lookup

**Connector setup:**

| Field | Value |
|-------|-------|
| Name | Stripe API |
| Base URL | `https://api.stripe.com/v1` |
| Auth Type | Bearer Token |
| Credentials | `{"token": "sk_live_..."}` |
| Default Headers | `{"Content-Type": "application/x-www-form-urlencoded"}` |
| Timeout | 15 |

**Workflow node:**

| Field | Value |
|-------|-------|
| Connector | Stripe API |
| Method | GET |
| Path | `/charges/{charge_id}` |
| Variables | `charge_id` from a previous Collect Input node |

The connector merges its auth and headers with the node's path and variables to produce the final request.

## Managing Connectors

### Listing

The connector list shows name, base URL, auth type badge, active status, and last update time. Use the search bar to filter by name.

### Editing

Update credentials, headers, or timeout at any time. Changes take effect on the next workflow execution — they do not affect runs already in progress.

### Deactivating

Toggle **Active** off to disable a connector without deleting it. Workflow nodes referencing a deactivated connector will fail at runtime with a clear error message.

### Deleting

Bulk delete is available from the list view. Deleting a connector that is still referenced by workflow nodes will cause those nodes to fail on next execution.

## Connector Dry Runs

From the workflow editor, you can perform a **dry run** on an API Connector node to test the connection without running the full workflow. This sends a real request using the connector's saved settings and shows the response status, headers, and body.

## Best Practices

- **One connector per service** — create one connector for Stripe, one for SendGrid, etc.
- **Use descriptive names** — "Production CRM API" is better than "API 1"
- **Rotate credentials** — update the connector's auth JSON when you rotate API keys
- **Disable SSL verification only for development** — never in production
- **Add notes** — record rate limits and usage constraints so your team does not hit them unexpectedly
- **Test with dry runs** before publishing a workflow that depends on a new connector

## Related Docs

- [Agentic Workflows](AGENTIC_WORKFLOWS.md) — how workflows use connectors
- [Workflow JSON Schema](WORKFLOW_JSON_SCHEMA.md) — the `apiConnector` node type schema
- [Security And Privacy](SECURITY_AND_PRIVACY.md) — credential storage and data handling
