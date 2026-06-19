# Known Limitations

> **Version**: 0.16.1<br>
> **Last updated**: 2026-06-19

This page documents known constraints, upstream limitations, and workarounds.

---

## 1. `laravel/ai` provider behavior varies by version

The plugin depends on [`laravel/ai`](https://github.com/laravel/ai) at `^0.7 || ^1.0`.
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

ChromaDB now keeps similarity thresholds strict by default. `AGENTIC_CHATBOT_CHROMA_ALLOW_THRESHOLD_BYPASS=true` is available only as an explicit compatibility escape hatch and marks bypassed chunks.

---

## 3. Workflow loop execution limits

Loop nodes enforce a hard iteration ceiling (configurable via `workflow.max_steps`). Exceeding the limit terminates the workflow with a user-facing error.

**Impact**: Very large loop-count workflows will fail. Default is 50 steps.

**Workaround**: Increase `max_steps` in config, or break complex logic into smaller chat-focused workflows.

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

Query-string and request-body widget tokens are still accepted by default for compatibility. Production hosts should disable them and use the widget token header before public rollout.

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

## 8. Structured Compound Requests need explicit capability contracts

`legacy` remains the default compound engine. `shadow` and `structured` depend on registered action, tool, or API Connector capabilities with schemas, side-effect metadata, and bot-level approval.

**Impact**: Ambiguous, dependent, unsafe alternative, or incomplete single-item plans may stay on the normal assistant/workflow path instead of executing as compound requests. Write and mixed read/write plans still require confirmation by default.

**Workaround**: Roll out per bot: start with `shadow`, inspect audit records, add schemas for allowed capabilities, then switch selected bots to `structured`.

---

## 9. Turn understanding is provider-sensitive

Workflow turn understanding can classify pending answers, corrections, side questions, cancellations, and compound follow-ups. Provider JSON behavior and confidence calibration still vary by model.

**Impact**: Low-confidence or malformed classifications intentionally fall back to deterministic pending-input behavior. This can ask a clarifying question or keep the workflow halted instead of guessing.

**Workaround**: Run `composer run-script eval:workflow-turns` and `composer run-script eval:workflow-understanding` with your staging provider/model before enabling aggressive routing in production.

---

## 10. AgentGraph confirmation and execution runs are separate

Compound write confirmation and compound execution may create distinct AgentGraph runs. Workflow waitpoints also project pending interactions from SDK interrupts.

**Impact**: Admin/debug views can show a confirmation run, an execution run, and a workflow run for one visitor turn. This is intentional so confirmations, cancellations, and replacements keep independent durable state.

**Workaround**: Use the stored `agent_graph_run_id`, `agent_graph_thread_id`, `agent_graph_interrupt_id`, and pending-interaction records when debugging a turn.

---

## 11. Schema-v2 editor authoring is required

Schema-v2 Ask steps can compile structured fields into `collectForm` runtime nodes, including fields authored as JSON text. The runtime still validates the compiled workflow contract, not arbitrary UI-only draft data.

The editor save, validate, publish, and import paths require schema v2 authoring payloads. Schema v1 remains the executable runtime graph for diagnostics, archives, and low-level integrations, but it is not the canonical editable workflow format.

**Impact**: Old runtime JSON may need conversion or a manual rebuild as semantic steps before it can be edited and published through the current editor.

**Workaround**: Keep structured fields as a JSON array of field objects or use the semantic editor controls, then run workflow validation before publishing. Rebuild ambiguous schema v1 workflows in schema v2.

---

## 12. Pending interaction projections can be repaired, not guessed

AgentGraph checkpoints and interrupts are the source of truth for SDK-backed workflow waitpoints. `bot_pending_interactions` rows are projections used for chat routing and admin visibility.

**Impact**: If a pending interaction is expired, stale, or points at a changed interrupt, the runtime closes or reprojects it instead of guessing. A stale `resolving` claim is released only after the configured timeout and only when the underlying interrupt still matches.

**Workaround**: Tune `AGENTIC_CHATBOT_WORKFLOW_PENDING_RESOLVING_TIMEOUT_SECONDS`, run `php artisan filament-agentic-chatbot:doctor`, and inspect AgentGraph interrupt metadata when a conversation appears stuck.

---

## 13. Streaming fallback depends on transport and provider support

LLM token streaming still depends on provider and SDK support. Deterministic workflow messages can simulate small `text_delta` chunks so the widget behaves consistently, but this is not the same as provider-native token streaming.

**Impact**: Some workflow nodes may emit complete messages instead of provider token deltas. If execution fails mid-stream, the widget receives a safe structured error event and `[DONE]`, not raw stack traces.

**Workaround**: Configure `AGENTIC_CHATBOT_WORKFLOW_STREAMING_LLM_DEFAULT`, `AGENTIC_CHATBOT_WORKFLOW_STREAMING_SIMULATE_DETERMINISTIC`, deterministic delay, and chunk size for your UX target.
