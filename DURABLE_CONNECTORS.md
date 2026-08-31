# Durable Connector jobs

Use a normal Connector call when an HTTP response contains the final result.
Use durable completion when the provider accepts a job and exposes an
authoritative endpoint for reading its status and final result. A webhook is
optional: it accelerates a status check but never supplies the trusted result.

Durable operations run inside a deployment-pinned Playbook. Direct Agent tools
remain bounded reads. The same Agent may answer independent read requests while
one Playbook is open; it cannot open a second Playbook or bypass the first one's
approval, wait, or cancellation rules.

## Publish the provider protocol

In a Connector operation's **Advanced** tab, expand **Protocol contract**,
enable **Wait for an external job** and choose **Background job with durable
Playbook resume**. Configure
the provider's actual completion protocol, test the draft, publish the
operation, and release a Playbook/Agent with the new immutable dependency pins.
Editing the draft never changes an in-flight job.

For example, a provider returning a job ID, a `Location` status URL, and JSON
job states can publish this `execution.async_completion` object:

```json
{
  "enabled": true,
  "mode": "durable",
  "completion_signal": "status",
  "job_id_path": "id",
  "location_header": "Location",
  "status_path": "status",
  "pending_http_statuses": [202],
  "pending_values": ["queued", "running"],
  "success_values": ["completed"],
  "failure_values": ["failed", "cancelled"],
  "poll_interval_ms": 5000,
  "max_attempts": 100,
  "max_elapsed_ms": 30000,
  "max_wait_seconds": 3600
}
```

`completion_signal: status` is the durable default. A successful HTTP response
with a missing, malformed, or unrecognized job status is not completion proof.
Only a declared success value completes the job. If the provider instead
documents `202` while pending and a final successful HTTP response without a
job-state field, explicitly select `completion_signal: http_status`.

`location_path` can locate the status URL in JSON instead of a response header.
The final status response must satisfy the operation's response decoder,
outcome policy, schema and output mapping. Every status request rechecks the
pinned environment, allowed origin/path, redirects, response limits, and runtime
authority. A provider cannot redirect the job to an arbitrary destination.

The first exhausted limit ends polling. Defaults are 100 checks, at least five
seconds between checks, 30 seconds per status request, and one hour total;
`Retry-After` may increase the interval. The supported maxima are 1,000 checks,
300 seconds per status request, and seven days total. Pending results have
`ok: false`, `usable: false`, `outcome: pending`; they contain no final business
facts. Neither the browser request nor a model invocation remains open during
the durable wait.

The initial request still requires normal authorization, exact input binding,
and write confirmation. An accepted write is journaled with its original
invocation and pending side-effect ledger entry. Each later wake-up can only
read that job's status; it cannot repeat the initial write.

## Optional signed completion notification

Add this to the same completion object when the provider supports registering
a callback URL through a request header:

```json
{
  "webhook": {
    "enabled": true,
    "verifier": "hmac_sha256",
    "secret_credential": "completion_webhook_secret",
    "callback_header": "X-Connector-Callback-Url",
    "signature_header": "X-Connector-Signature",
    "timestamp_header": "X-Connector-Timestamp",
    "event_id_path": "event_id",
    "job_id_path": "job_id",
    "timestamp_tolerance_seconds": 300
  }
}
```

Store the secret value in the Connector's encrypted **Completion webhook
signing secret** credential. The published contract contains only its key. A
blank secret field keeps the saved value. Set a stable, externally reachable
HTTPS `APP_URL`; only local/testing environments permit HTTP. The callback URL
is generated from that configured origin, never from the visitor's Host header.

The runtime reserves a job UUID before dispatch and supplies its URL in the
configured header. The endpoint is:

```text
POST /api/filament-agentic-chatbot/connectors/continuations/{continuationPublicId}/completion
```

The built-in verifier expects a Unix timestamp header and signature
`v1=<hex HMAC-SHA256>` over `timestamp + "." + exact raw request body`. The
signed JSON must contain the event ID and the same external job ID returned
by the initial call. The endpoint has its own body/rate limits and signature
authentication; widget tokens are not webhook credentials. Successful admission
returns HTTP 202 with `{"accepted":true}`.

Events are deduplicated and correlated with the immutable operation,
environment and job. A worker checks the matching AgentGraph checkpoint and
interrupt before using the existing resume-delivery path. Early events survive
the gap before the graph wait is persisted. Duplicate, stale, foreign, or
out-of-order events never gain execution authority. Lost events fall back to
scheduled polling. Callback payloads cannot replace status URLs, visitor input,
or answer evidence.

Providers with a different signature algorithm can use the host-registered
`ConnectorCompletionWebhookVerifier` interface and
`ConnectorCompletionWebhookVerifierRegistry`; select its stable registered ID
in the operation. Registration belongs in the host composition root. Unknown
or duplicate verifier IDs fail closed.

## Failure, cancellation and replay

A timeout, exhausted check budget, lost worker, or provider failure after
accepting a write does not prove that no external change occurred. Such writes
become `unknown` and require operator reconciliation. The runtime does not
silently resubmit them. Reads may safely terminate as failed.

Cancelling a Playbook stops local continuation. It does not assert that the
provider cancelled the remote job. Terminal graph projection and closing the
local job/side-effect records commit atomically. Recovery after an SDK-terminal
checkpoint repairs those projections without another external call.

Independent read results are saved in encrypted, bounded presentation receipts
before Playbook dispatch and after each read. Their exact turn, conversation,
deployment and evidence bindings are checked on recovery. Replaying an already
committed client turn uses the same canonical answer through JSON or SSE.
When a Playbook write is uncertain, independently verified reads remain
available in `read_answer`; they do not clear the uncertainty or unlock retry.

## Workbench testing and supported limits

The operation workbench uses its existing server-attested draft-test permit,
exact draft hash and input, and staging write confirmation. A durable diagnostic
performs bounded polling within that request: at most 30 seconds and ten status
checks, also subject to tighter operation limits. It does not invent a graph,
callback registration, or resumable test authority. Only an actual final
success produces passing publication evidence. Pending/expired jobs are not
successful tests; uncertain staging writes require reconciliation.

Use representative staging inputs that finish within the diagnostic budget.
Callback-only providers, providers requiring callback registration before even
a diagnostic can start, callback URLs supplied through arbitrary body templates,
and jobs without an authoritative status-read endpoint need a reviewed provider
adapter. They are not automatically supported. Durable completion and automatic
result pagination cannot be enabled on the same operation; model any subsequent
result retrieval as a separate declared Playbook step.

See [Operations](OPERATIONS.md#durable-connector-completion) for workers,
scheduling and diagnostics, [Upgrading](../UPGRADING.md) for migrations, and
[ADR 0009](adr/0009-durable-external-operations.md) for authority boundaries.
