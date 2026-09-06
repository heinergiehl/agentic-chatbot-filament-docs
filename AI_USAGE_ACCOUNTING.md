# AI usage accounting

The plugin reports provider-measured consumption for its own recorded calls and
calculates token costs using the tariff frozen when each call starts. These
amounts are not imported provider invoices. A shared provider API key does not
identify which application caused an account-level charge.

## Receipt and budget lifecycle

Both synchronous chat and supported native streams use the same model-step
reservation and settlement owner. The SDK still owns tool execution. A step is
reserved immediately before dispatch; completed receipts settle before the next
tool or model step. An unused deferred stream creates no reservation. Abandoning
a partially consumed stream cannot restart its transport by iterating it again.

Provider-specific adapters preserve terminal usage metadata for Gemini, OpenAI,
Azure, Anthropic, Xai, OpenRouter, DeepSeek, Groq, Mistral, OpenAI-compatible and
Ollama. Local protocol tests cover these adapters; this is not a live provider
certification. An unsupported protocol, lost terminal event or contradictory
counter remains unknown. Zero-token embeddings whose SDK response loses counter
presence remain unknown. Raw SDK aggregate token totals are not the reporting
authority.

`reserved` calls with a saved receipt can be retried by the settlement worker.
A provider or database failure is `reconciliation_required`. Expiry without a
complete receipt changes this to `awaiting_evidence` and retains the reservation.
It never releases unknown spend as available budget. A later complete native
receipt can still settle the call. Historic `failed` calls whose reservations
were already released can also be resolved without releasing another call's
reservation.

Settlement updates the original month and both bot and access-token scopes
atomically. It does not move delayed receipts into the month of reconciliation.
The database uniquely binds a provider request ID to one call, shared by native
and operator-supplied receipts. Replaying the same call is idempotent; reusing a
receipt for another call is rejected. The ledger stores no API keys or prompts.

## Configured tariffs

Flat tariffs remain supported for standard text calls. Their explicit integer
rates mean a uniform configured token tariff, not automatic knowledge of a
provider's current prices. Use `variants` when operation, service tier, prompt
size, modality or cache lifetime affects the price. For example, this is a
synthetic tariff, not a bundled provider price:

```php
'usage' => [
    'pricing' => [
        'provider:exact-model-id' => [
            'version' => 'reviewed-tariff-2026-09',
            'effective_from' => '2026-09-01T00:00:00Z',
            'currency_code' => 'USD',
            'minor_units_per_unit' => 100,
            'variants' => [[
                'operation' => 'chat',
                'service_tier' => 'standard',
                'input_modalities' => ['text'],
                'output_modalities' => ['text'],
                'prompt_tiers' => [[
                    'up_to' => 200000,
                    'rates' => [
                        'input' => 100000000,
                        'output' => 500000000,
                        'reasoning' => 500000000,
                        'cache_read' => 10000000,
                        'cache_write_5m' => 125000000,
                        'cache_write_1h' => 200000000,
                    ],
                ], [
                    'up_to' => null,
                    'rates' => [
                        'input' => 200000000,
                        'output' => 1000000000,
                        'reasoning' => 1000000000,
                        'cache_read' => 20000000,
                        'cache_write_5m' => 250000000,
                        'cache_write_1h' => 400000000,
                    ],
                ]],
            ]],
        ],
    ],
],
```

Each rate is micro-minor-units per million tokens. With USD and a scale of 100,
100000000 means USD 1 per million. Rates use checked integer arithmetic. The
combined call amount rounds upward once to the next micro-minor-unit, which is
USD 0.00000001 at that scale. No exchange conversion or invoice rounding is
implied.

There is one variant per operation and service tier. Embeddings use operation
`embedding` and no output modalities. Prompt tiers are whole-request bands,
selected using input including cache reads and writes; they are not marginal
tax-style brackets. An unbounded last tier uses `up_to: null`. A finite final
bound deliberately leaves larger calls unpriced. Reservations cover the most
expensive reachable band and token category, even with decreasing rates.

The generic input/output/cache-read rate applies uniformly to the variant's
declared modalities. An explicit `input_audio`, `output_audio`,
`cache_read_audio`, or corresponding text/image/video rate overrides that
modality. Different rates require a complete provider-reported partition;
missing mixed-modality details are not guessed. Cache writes can use a uniform
`cache_write` rate or explicit `cache_write_5m` and `cache_write_1h` rates. Detail
maps partition the existing five token buckets; they do not add extra tokens.

OpenAI/Azure package chat calls explicitly request the standard service tier
when none was specified. Anthropic requests `standard_only`. Explicit `auto`,
null, priority or other provider options are not silently changed. Unknown or
unsupported request dimensions prevent a hard cost reservation; actual receipt
dimensions determine settlement. Unexpected model identities retain measured
tokens but do not reuse the requested model's price.

Bundled Gemini GenerateContent tariffs cover tokenized input modalities and
text/thinking output, including the distinct Gemini 2.5 audio-input/cache rates.
Provider-hosted tool fees, cache storage duration, regional or speed surcharges,
image-generation units, credits and taxes are not inferred from token totals.
Observed uncovered charges leave the call cost unknown. The UI must not call
such an amount a complete or reconciled provider bill. Price sources:
[Gemini](https://ai.google.dev/gemini-api/docs/pricing),
[Anthropic](https://platform.claude.com/docs/en/about-claude/pricing),
[OpenAI service tiers](https://developers.openai.com/api/reference/resources/responses/methods/create).

## Operator receipt review

In **AI Usage**, an explicitly authorized manager can open an eligible call and
choose **Review receipt**. The two-step action accepts verified evidence, shows
the five counters, exact calculated amount, tariff and call version, then applies
that reviewed result. Scope and management authorization are checked again at
application time. The actor comes from the Filament login. The receipt is an
operator attestation against an original per-request provider record; the plugin
cannot authenticate a pasted document as a provider invoice.

The existing CLI offers the same domain operation for trusted server operators:

```bash
php artisan filament-agentic-chatbot:reconcile-ai-usage --call=<public-uuid> --evidence=/private/receipt.json
php artisan filament-agentic-chatbot:reconcile-ai-usage --call=<public-uuid> --evidence=/private/receipt.json --expected-version=<preview-version> --operator=<accountable-operator> --reason="Matched original request receipt" --force
```

The first command is read-only. Evidence is a bounded local JSON document:

```json
{
  "schema": "ai_usage_reconciliation_evidence.v1",
  "call_public_id": "exact-usage-call-uuid",
  "provider": "canonical-provider",
  "model": "exact-model-id",
  "provider_request_id": "exact-provider-request-id",
  "evidence_reference": "Private provider export, exact request row",
  "usage": {
    "input_tokens": 100,
    "output_tokens": 10,
    "reasoning_tokens": 0,
    "cache_read_tokens": 0,
    "cache_write_tokens": 0
  }
}
```

Supply canonical disjoint counters, not inclusive raw counters copied blindly
from a provider schema. Every bucket needs an explicit integer, including zero.
The evidence must identify this plugin call and the original provider request.
Daily/key/account totals cannot establish that attribution. Never use guesses,
a successful answer or a timeout alone as evidence of zero consumption.

Optional `usage_details` contains the same modality/TTL partitions as a measured
receipt. `billing_context` supplies operation, service tier, input/output
modalities and unsupported dimensions. Known native token counts, modality
partitions, model identity, service tier and additional fees cannot be erased by
operator evidence, including after a partial native receipt.

A `pricing_snapshot` may supply a reviewed historical missing tariff or add
previously unpriced dimensions. A valid tariff that already prices the receipt
cannot be replaced. Supplements preserve all previously bound rates and
dimensions. A known settled amount is never overwritten through this action.
An unresolved additional fee still prevents a complete token-cost settlement.

The audit stores encrypted evidence and verification reason, operator identity,
hashes, and before/after accounting values in one transaction with settlement.
A stale preview, conflicting receipt or failed audit write commits no partial
budget correction. No model request, tool, Playbook or external write is retried.

## Verification

Run `composer test:ai-usage` for the bounded receipt, budget, pricing and reporting
integration. `scripts/qualify/GeminiUsageReceiptsLiveTest.php` is an opt-in small
provider check. It requires explicit credential-source authorization and records
only sanitized usage evidence. It does not retrieve a provider invoice. Missing
credentials, denied network approval and unknown responses are not passed live
validation.
