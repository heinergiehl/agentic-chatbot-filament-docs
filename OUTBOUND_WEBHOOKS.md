# Outbound Webhooks

Outbound webhooks let a committed Agent business event trigger an external,
non-conversational automation. Typical receivers are a host backend, CRM,
ticketing service, n8n, Make, or Zapier. They are not instructions for the
model and they never bypass the capability gateway.

## Setup

1. Open **Connect > Webhooks** and create an endpoint for one Agent.
2. Choose the exact event subscriptions the receiver needs.
3. Copy the generated signing secret into the receiver.
4. Save the endpoint. New endpoints are inactive.
5. Send a signed test and wait for a successful delivery in the ledger.
6. Activate the endpoint.

Only absolute public HTTPS destinations are accepted. DNS is resolved and
pinned for each request; localhost, private, reserved, metadata, redirect, and
DNS-rebinding destinations fail closed. Changing the URL or signing secret
automatically deactivates the endpoint and requires a new successful test.

## Events And Payload

Supported subscriptions are:

- `outcome.recorded`
- `handoff.created`
- `handoff.updated`
- `handoff.resolved`
- `handoff.returned_to_agent`

Every payload is versioned and uses public identifiers:

```json
{
  "id": "0198...",
  "type": "outcome.recorded",
  "version": 1,
  "occurred_at": "2026-08-29T12:00:00+00:00",
  "bot": { "id": "support-agent" },
  "subject": { "type": "conversation_outcome", "id": "0198..." },
  "data": {
    "outcome": {
      "id": "0198...",
      "key": "appointment_booked",
      "classification": "success",
      "source": "host.calendar",
      "evidence_type": "calendar_event",
      "context_area": "public",
      "channel": "web",
      "value_minor_units": 14900,
      "currency": "EUR",
      "currency_exponent": 2,
      "occurred_at": "2026-08-29T12:00:00+00:00"
    }
  }
}
```

Handoff payloads contain only status, priority, team, version, SLA timestamps,
and the public activity transition. Customer contact data, conversation text,
handoff reason/summary, internal notes, operator identity, evidence references,
credentials, and internal database IDs are excluded.

## Signature Verification

Each request includes:

- `Idempotency-Key` and `X-Agentic-Webhook-Id`: stable event ID
- `X-Agentic-Webhook-Delivery`: delivery-ledger ID
- `X-Agentic-Webhook-Event`: event type
- `X-Agentic-Webhook-Timestamp`: Unix timestamp
- `X-Agentic-Webhook-Signature`: `v1=<hex HMAC-SHA256>`

The signed input is `<timestamp>.<raw request body>`. Verify the raw bytes before
JSON decoding, use a constant-time comparison, and reject stale timestamps. For
example:

```php
$timestamp = (string) $request->header('X-Agentic-Webhook-Timestamp');
$provided = (string) $request->header('X-Agentic-Webhook-Signature');
$expected = 'v1='.hash_hmac(
    'sha256',
    $timestamp.'.'.$request->getContent(),
    config('services.agentic_webhooks.secret'),
);

abort_unless(abs(time() - (int) $timestamp) <= 300, 401);
abort_unless(hash_equals($expected, $provided), 401);
```

Persist the event ID before applying the receiver's side effect. A repeated ID
must return the same success acknowledgement without repeating the side effect.

## Delivery Contract

The outbox row is written in the same database transaction as the canonical
outcome or handoff activity. Queue dispatch happens only after commit. Delivery
is therefore at least once, not exactly once; the event ID provides receiver
idempotency.

- Any `2xx` response succeeds.
- `408`, `425`, `429`, and `5xx` responses retry with bounded backoff.
- Other `4xx` responses enter the dead-letter state immediately.
- Network, timeout, and bounded-response-read failures retry.
- Every attempt uses a database lease so overlapping workers cannot own the
  same attempt.
- Request and bounded response hashes are retained as evidence; response bodies
  are not stored.
- A dead-letter retry requires an authorized operator and a recorded reason.

Laravel Scheduler runs the recovery sweep every minute. It redispatches missed
fanout, due retries, and expired worker leases, then prunes terminal ledgers
after the configured retention period:

```bash
php artisan filament-agentic-chatbot:maintain-outbound-webhooks --dry-run
php artisan filament-agentic-chatbot:maintain-outbound-webhooks --limit=500
```

Production requires an asynchronous queue worker and Laravel Scheduler. A
dedicated queue is optional:

```env
OUTBOUND_WEBHOOKS_ENABLED=true
OUTBOUND_WEBHOOK_QUEUE_CONNECTION=database
OUTBOUND_WEBHOOK_QUEUE=agentic-chatbot-webhooks
OUTBOUND_WEBHOOK_CONNECT_TIMEOUT_SECONDS=3
OUTBOUND_WEBHOOK_TIMEOUT_SECONDS=10
OUTBOUND_WEBHOOK_LEASE_SECONDS=120
OUTBOUND_WEBHOOK_MAX_ATTEMPTS=8
OUTBOUND_WEBHOOK_RETENTION_DAYS=30
```

```bash
php artisan queue:work database --queue=agentic-chatbot-webhooks
```

Production administration defaults to strict Gate mode. Register
`filament-agentic-chatbot.view-outbound-webhooks` and
`filament-agentic-chatbot.manage-outbound-webhooks`; tenant-aware record Gates
must also bind the package `AdminAuthorizationQueryScope` at SQL level.

## Incident Handling

Start with **Connect > Webhooks > Delivery ledger**. A non-retryable `4xx`
usually means a receiver contract or authentication error. Repeated `5xx` or
transport failures indicate receiver, DNS, TLS, firewall, or queue issues. Fix
the destination first, send a new signed test when URL/secret changed, and use a
reasoned manual retry only when the receiver's idempotency ledger is available.
