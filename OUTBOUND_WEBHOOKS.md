# Outbound Webhooks

Outbound webhooks let a committed Agent business event trigger an external,
non-conversational automation. Typical receivers are a host backend,
ticketing service, n8n, Make, or Zapier. These are notifications, not CRM leads:
no contact details or conversation content are sent. They are not instructions for the
model and they never bypass the capability gateway.

## Setup

1. Open **Connect > Overview > Forward events > Outgoing webhooks** and create an endpoint for one Agent. The existing outgoing-webhooks URL remains available.
2. Choose the exact event subscriptions the receiver needs.
3. Copy the generated signing secret into the receiver.
4. Save the endpoint. New endpoints are inactive.
5. Send a signed test and wait for a successful delivery in the ledger.
6. Activate the endpoint.

Only absolute public HTTPS destinations are accepted. DNS is resolved and
pinned for each request; localhost, private, reserved, metadata, redirect, and
DNS-rebinding destinations fail closed. Changing the Agent, URL, signing secret
or subscriptions automatically pauses the endpoint and requires a new successful
test followed by activation. Renaming an endpoint does not invalidate its test.
Queued signed tests are bound to the exact configuration requested; they cannot
verify a later edit. A test acknowledged after an edit records its delivery but
does not verify the new configuration.

The expanded verification hash includes Agent and subscriptions. Endpoints
verified under the earlier URL/secret-only contract require a new signed test
and explicit activation. There is no automatic migration of test evidence.
Until retested, an old active flag grants no delivery authority and the list
shows **Verification required**. Starting the new test pauses that old flag.

## Events And Payload

Supported subscriptions are:

- `outcome.recorded`: a verified conversation outcome was recorded.
- `handoff.created`: a new operator handoff case was created.
- `handoff.updated`: a public handoff activity, status, assignment or priority changed.
- `handoff.resolved`: an operator resolved the case.
- `handoff.returned_to_agent`: an operator returned the conversation to the Agent.

`webhook.test` is an explicit signed test for one destination, not a subscription.
The form includes a masked synthetic payload preview without querying a
conversation or executing a capability.

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
idempotency. If a response is lost, delivery may be retried even when the receiver
already accepted the event. The body and event ID stay stable across retries;
the signature timestamp is generated for each attempt. This notification retry
contract never authorizes replay of a Capability write or continuation of a Playbook.

- Any `2xx` response succeeds.
- `408`, `425`, `429`, and `5xx` responses retry with bounded backoff. A valid
  `Retry-After` is capped at 24 hours; invalid values use the configured backoff.
- Other `4xx` responses enter the dead-letter state immediately.
- Network, timeout, and bounded-response-read failures retry.
- Every attempt uses a database lease so overlapping workers cannot own the
  same attempt. Expired leases can be reclaimed; late workers cannot overwrite
  a winning delivery, change endpoint counters or verify a changed contract.
- Successful request and bounded response hashes are retained as evidence;
  response bodies are not stored. Only the first 64 KiB of a response is hashed,
  with a marker that distinguishes truncated and complete responses. Large
  responses do not invalidate an otherwise successful HTTP acknowledgement.
- Before dispatch the endpoint, exact event/Agent binding, subscription,
  verification and current activation are checked again. Host actor/tenant
  permissions govern administration; queued transport receives no ambient
  operator authority and cannot move an event to another Agent.
- A dead-letter retry requires the current authenticated, authorized operator,
  an active verified endpoint and a recorded reason of 1 to 500 characters.
  The current host SQL management scope is checked again. Paused endpoints and
  unrelated deliveries cannot be used to bypass that check.

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

Start with **Connect > Overview > Outgoing webhooks > Delivery ledger**. The list shows
Agent, activation and latest delivery status; the ledger shows attempts,
next attempt and safe error details. A non-retryable `4xx`
usually means a receiver contract or authentication error. Repeated `5xx` or
transport failures indicate receiver, DNS, TLS, firewall, or queue issues. Fix
the destination first, send a new signed test when the configuration changed, and use a
reasoned manual retry only when the receiver's idempotency ledger is available.

## Controlled Receiver Acceptance

Deterministic package tests use fake HTTP replies; they do not certify a real
receiver. As of 28 September 2026, current real-receiver acceptance is still open.
Use a receiver you control with public HTTPS, the copied signing secret and a
durable event-ID deduplication ledger. Send an explicit signed test, verify the
timestamp and exact body signature, inspect the delivery receipt, then activate
the endpoint. Record the endpoint public ID, event ID, timestamp and HTTP receipt.
On staging, replay the same ID and verify one receiver side effect, test a stale
or modified signature, then use controlled 429/503 and lost-acknowledgement cases.
Finally pause the endpoint before a queued attempt and verify no request arrives.
No real receiver send or external acceptance was performed in the CP03 slice.
