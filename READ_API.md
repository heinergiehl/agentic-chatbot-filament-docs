# Read API

The read API lets a webhook receiver or a host backend fetch the details of a
submission, a conversation or a handoff by the public id it received in a
[webhook payload](OUTBOUND_WEBHOOKS.md). It is read-only, versioned (`v1`) and
authenticated with Agent access tokens.

## Tokens And Scopes

Create a token under **Connect > Agent Access Tokens** and select only the
read scopes the integration needs:

| Scope | Endpoints |
|---|---|
| `submissions:read` | `GET /read/v1/submissions`, `GET /read/v1/submissions/{id}` |
| `conversations:read` | `GET /read/v1/conversations/{id}` |
| `handoffs:read` | `GET /read/v1/handoffs/{id}` |

Read scopes are granted only by name: **All chat abilities** (`*`) does not
include them, and a token with only read scopes cannot chat. A token belongs to
one Agent and reads only that Agent's records. When the token has allowed
areas, it reads only conversations in those areas (and submissions and
handoffs of those conversations). Admin playground, Agent test and editor test
records are never returned.

Send the token as `Authorization: Bearer fac_…` or in the
`X-filament-agentic-chatbot-Access-Token` header. Paths start with the API
prefix, by default `/api/filament-agentic-chatbot`.

## Responses

Every success response is JSON with `"version": 1` and `data`. Timestamps are
ISO 8601 in UTC. Ids are public ids; internal database ids are never returned.

```http
GET /api/filament-agentic-chatbot/read/v1/submissions/0198c1f2-…
Authorization: Bearer fac_…
```

```json
{
  "version": 1,
  "data": {
    "id": "0198c1f2-…",
    "schema_key": "lead",
    "schema_version": 1,
    "status": "submitted",
    "conversation_id": "0198c1e0-…",
    "playbook_run_id": null,
    "submitted_at": "2026-10-03T10:00:00+00:00",
    "created_at": "2026-10-03T10:00:00+00:00",
    "updated_at": "2026-10-03T10:00:00+00:00",
    "fields": { "name": "Ada", "email": "ada@example.com" }
  }
}
```

`GET /read/v1/submissions` lists submissions oldest first with
`limit` (1 to 100, default 25), `since` (created at or after),
`updated_since` (updated at or after), `schema_key` and `cursor`. The response
carries `next_cursor` (null on the last page); pass it unchanged to get the next
page. Cursors are encrypted and work only for the same Agent.

`GET /read/v1/conversations/{id}` returns `id`, `channel`, `status`
(`new` before the first visitor message, `active`, or `ended` after the idle
time; see [Outbound Webhooks](OUTBOUND_WEBHOOKS.md)), `sequence`, `created_at`,
`last_activity_at`, `ended_at`
and `messages`: the newest messages oldest first (`messages` query parameter,
0 to 200, default 50), each with `role` (`visitor`, `agent`, `operator` or
`system`), `text`, `truncated` and `created_at`. Tool calls and internal
messages are not returned.

`GET /read/v1/handoffs/{id}` returns `id`, `conversation_id`, `status`,
`priority`, `team`, `version`, the request, due, response, resolution and
return timestamps, `summary` and `contact` (`name`, `email`).

Text and fields are redacted like webhook content: credential-like field names,
schema fields marked `sensitive`, bearer and basic credentials and runtime
secrets are removed, and the email, phone and link types the Agent's live Safety
settings mask or block are masked. Messages keep at most 4,000 characters.

## Errors And Limits

| Status | `error` | Meaning |
|---|---|---|
| 401 | `unauthenticated` | No token or an unknown token |
| 401 | `token_inactive` | The token is revoked, inactive or expired |
| 403 | `insufficient_scope` | The token lacks the endpoint's read scope |
| 404 | `not_found` | No such record for this token (also other Agents, areas or test records) |
| 422 | `invalid_query` | A query parameter or cursor is invalid |
| 429 | `rate_limited` | Too many requests; see `Retry-After` |

Each token may make `rate_limit_per_minute` requests per minute (the token's
own rate limit, else `read_api.rate_limit_per_minute`, default 60). Unknown
tokens count against `bot_access_tokens.invalid_attempts_per_minute` per IP.

```env
READ_API_ENABLED=true
READ_API_RATE_LIMIT_PER_MINUTE=60
```

The routes use the `read_api.middleware` group (`api` by default) without
session, widget or browser-origin authority.
