# Known Limitations

> **Version**: 0.18.0<br>
> **Last updated**: 2026-09-04

This page documents known constraints, upstream limitations, and workarounds.

---

## 1. `laravel/ai` provider behavior varies by version

The plugin depends on [`laravel/ai`](https://github.com/laravel/ai) at `^0.11.2`.
Provider and gateway support can still vary across SDK and upstream provider versions.

**Impact**:

- Per-node `temperature` and `maxTokens` overrides are passed to the SDK generation options, but exact behavior still depends on the selected provider gateway.
- Streaming support is limited to what the underlying SDK exposes.

**Workaround**: If a provider ignores a generation option, configure matching defaults in the provider or choose a model gateway that supports the option.

---

## 2. PostgreSQL + pgvector is still the default path

The package supports both PostgreSQL + `pgvector` and ChromaDB, but PostgreSQL remains the default and most battle-tested path.

**Impact**: Tests use an in-memory SQLite database with a pgvector shim, which is enough for package validation but not representative of production retrieval performance. If you do not want PostgreSQL, you should run ChromaDB explicitly instead of assuming SQLite can replace a vector backend.

**Workaround**: Use ChromaDB as an alternative vector store backend (see configuration).

ChromaDB keeps similarity thresholds strict. Below-threshold candidates are not available through a compatibility escape hatch.

---

## 3. Workflow batch-map execution limits

`batchMap` nodes enforce `maxItems` (maximum 100), and the workflow still
enforces its global step ceiling. Exceeding either limit terminates execution
with a bounded failure.

**Impact**: Very large collections are intentionally not processed in one chat
workflow.

**Workaround**: Page or pre-filter the source, or split long-running work into
a purpose-built queued integration instead of increasing chat-runtime scope.

---

## 4. LLM-generated workflow JSON

The "Generate from prompt" feature produces workflow JSON via the configured LLM. Generated workflows:

- Are always saved as **drafts** (never auto-published)
- Must pass the full structural + semantic validation pipeline before activation
- May occasionally require manual adjustment of edge connections or node data

**Best practice**: Always review generated workflows in the visual editor before publishing.

---

## 5. Widget SDK CSP restrictions

The embeddable chat widget is loaded through a `<script>` tag and calls the plugin's API endpoints directly. Sites with strict Content Security Policy headers must allow the widget script URL plus the API origin used by the chat endpoints. The current widget runtime also injects its own `<style>` tag, so CSP policies that forbid inline styles can still block the widget even on the same Laravel app.

Production embeds bootstrap short-lived tokens at runtime and send them in the widget token header. Query-string and request-body token compatibility is disabled by default in production but remains available in non-production for migration testing; enabling either mode publicly weakens the intended token boundary.

---

## 6. API knowledge source scope

API knowledge sources support authenticated `GET` JSON endpoints, field mapping, page-number/offset/cursor/next-URL pagination, scheduled full re-sync, per-sync safety limits, and full source replacement after successful sync. OAuth refresh flows and delta/incremental sync are intentionally not universal in this release.

**Impact**: APIs that require provider-specific auth flows, custom request signing, webhooks, or complex delta sync still need a curated endpoint or gateway.

**Workaround**: Start with curated JSON endpoints or API gateways. Use workflow API Connector nodes for live/user-specific lookups instead of syncing private transactional data into the knowledge base.

---

## 7. Delay nodes require a queue worker

Delay/timer nodes dispatch a `ResumeWorkflowRunJob` to the queue. If your queue driver is `sync`, delay nodes will block the HTTP request. The `filament-agentic-chatbot:doctor` command warns about this.

**Workaround**: Use `database`, `redis`, or `sqs` queue driver in production and ensure `php artisan queue:work` is running.

---

## 8. One active Playbook per conversation

An Agent can answer ordinary questions and use approved knowledge without a
Playbook, but it cannot start a second Playbook while one run is still active.

**Impact**: A new process request waits until the active Playbook completes or
is cancelled. This prevents two graphs from competing for the same user reply.

**Workaround**: Put ordered or dependent work in one bounded Playbook. Keep
unrelated chat and knowledge questions with the Agent, and cancel an abandoned
Playbook explicitly before starting another.

---

## 9. Agent interpretation is provider-sensitive

Natural wording, tool selection, and final response quality still vary by
provider and model. Model output is always an untrusted proposal.

**Impact**: A weak model may answer instead of selecting a matching Playbook,
or may ask for clarification. It still cannot grant a capability, bypass an
approval, change a deployment pin, or authorize a write.

**Workaround**: Add representative Agent quality scenarios for unexpected
wording, active Playbook replies, side questions, cancellation, and provider
failure. Use a model that reliably supports the declared tool contract.

---

## 10. AgentGraph and Laravel expose different operational records

AgentGraph is the graph-state authority. `WorkflowRun` and pending-interaction
rows are versioned operational projections of its checkpoints and interrupts.

**Impact**: During a crash or unavailable SDK store, an operational row can
temporarily lag the authoritative AgentGraph state and show reconciliation
required.

**Workaround**: Use the stored AgentGraph run, thread, checkpoint, and interrupt
identities and the supported reconciliation path; never edit projection state
as an execution shortcut.

---

## 11. Schema-v2 collectForm authoring has a runtime boundary

Schema-v2 Ask steps can compile structured fields into `collectForm` runtime nodes, including fields authored as JSON text. The runtime still validates the compiled workflow contract, not arbitrary UI-only draft data.

**Impact**: Invalid JSON or non-list structured field payloads are ignored by the compiler and will not become form fields.

**Workaround**: Keep structured fields as a JSON array of field objects or use the semantic editor controls, then run workflow validation before publishing.
