# Troubleshooting

Use this guide with the version of the package you installed. These instructions
describe **1.0.0**. Start with [Quickstart](QUICKSTART.md) and check
[Compatibility](COMPATIBILITY.md) before changing configuration. For an existing
installation, follow the [upgrade procedure](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/UPGRADING.md#upgrading-to-10)
and take backups before migrations or a vector-backend change.

## Common First-Run Issues

### Composer authentication

For `Authentication required (...composer.sh)`, use the private repository URL,
buyer email and licence key displayed by Anystack after purchase. When activation
fingerprints are enabled, enter the password exactly as `<license-key>:<fingerprint>`.
Use the displayed fingerprint; do not invent one or put credentials in a repository
URL. Keep Composer `auth.json` and licence keys out of source control and support
logs. See [Anystack's Composer instructions](https://anystack.sh/docs/integrations/php).

If Composer tries `Failed to clone the git@github.com:...`, check that the app uses
the purchased Anystack Composer repository from Quickstart. A source checkout's
GitHub SSH access is separate from buyer authentication. Contact support with a
sanitized error if the purchased download still falls back to an inaccessible URL.

### Composer runtime API

An error mentioning `composer-runtime-api ^2.2` means the Composer runtime is too
old for the supported Laravel framework. Check `composer --version`, update to
Composer 2.2+ using your installation's update method, then retry the install.
Changing the package's dependency constraints does not fix an old Composer binary.

### Missing Filament panel provider

If installation reports `No Filament panel provider was found in app/Providers.`, first install the
panel builder in the host app:

```bash
php artisan filament:install --panels --no-interaction
```

If `app/Providers/Filament/AdminPanelProvider.php` is still missing, create it:

```bash
php artisan make:filament-panel admin
```

Register `FilamentAgenticChatbotPlugin::make()` in that provider and add the explicit
access grant from Quickstart. Signing in to Filament alone grants no plugin access.

### Source pending

Check the worker serving the configured ingestion queue. With the default queues:

```bash
php artisan queue:work --queue=agentic-chat,default --timeout=150 --tries=1
```

Serve any custom `ingestion.queue` and host-default queue names too. Check failed
jobs and **Settings > Health** for the cause before retrying. Source re-sync also needs the
scheduler. See [Operations](OPERATIONS.md).

### This domain is not allowed

For `This domain is not allowed for this chatbot.`, check the Agent's **Allowed hosts**
field in the **Allowed websites** section of **Channels**. Its code field
is `allowed_domains`. Enter hosts such as `app.example.com` or `*.example.com` and
allow the actual embedding host. An empty list blocks public widget access.
HTTP(S) URLs without a port are normalized to their host. Bare hosts must contain
no path, credentials or port: use `localhost`, not `localhost:8000`. Keep origin
checks enabled; do not broaden the allowlist just to hide an error.

### Please sign in to use this chat

For `Please sign in to use this chat.`, verify the Agent's audience and host login.
Same-origin session integration needs
`AGENTIC_CHATBOT_API_INCLUDE_SESSION_AUTH_CONTEXT=true` and an authorized host
user/guard for a non-public audience. External websites need the signed host
identity endpoint and explicit scopes from the [authenticated recipe](QUICKSTART.md#6-separate-recipe-signed-in-order-support).
A `204` from that endpoint means a guest, so it cannot authorize member access.
Check token expiry, Agent, audience and origin binding. Do not disable authorization
or change a personal Tool to public as a workaround.

### Chroma heartbeat errors

For `Could not reach chroma` or a failure at `/api/v2/heartbeat`, ensure Chroma is
running and `AGENTIC_CHATBOT_CHROMA_URL` points to its reachable service URL.
`The route api/v2/heartbeat could not be found` usually means that URL points to
Laravel's HTTP server instead. The adapter probes `/api/v2/heartbeat` and falls
back to `/api/v1/heartbeat`; check your Chroma server/API compatibility and
configured token, tenant and database. The default `database` vector backend
needs no Chroma service. See [Ingestion and retrieval](INGESTION_AND_RETRIEVAL.md).

### Vector backend mismatch

For `Unsupported vector backend`, `AGENTIC_CHATBOT_VECTOR_BACKEND` must be
`database`, `pgvector` or `chroma`. For `have no vectors in the configured backend`
or a warning that existing knowledge is indexed in another backend, restore the
previous setting and verify the existing index. Changing an environment variable
does not copy vectors. To move them, follow the backed-up procedure in
[Upgrading](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/UPGRADING.md)
using `php artisan filament-agentic-chatbot:switch-knowledge-backend` with an explicit
target backend. Inspect its `--dry-run` plan first; cut over only after copy and
verification succeed. Rebuild cached configuration and restart workers after
the authorized configuration change.

For pgvector index dimension limits, check [Known limitations](KNOWN_LIMITATIONS.md)
and the embedding profile. Do not change dimensions on already indexed content
without the documented rebuild procedure.

## Getting help

Send stack/package versions, the failing command and sanitized reproduction steps
to the contact in [Support policy](SUPPORT_POLICY.md). Remove keys, licence
credentials, customer records and signed tokens from any logs you share.
