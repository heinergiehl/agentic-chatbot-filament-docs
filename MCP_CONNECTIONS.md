# MCP Servers

Provider profiles are
connection presets, not certification of third-party accounts or every tool
offered by those providers.

An MCP server connection provides reviewed reads and separately approved,
synchronous create/update operations to Agents (as direct tools) and published
Playbooks. Every write needs its own operation review, an isolated staging test
and confirmation of the visitor's concrete action; a direct MCP write always
shows the visitor a confirmation card (ADR 0038). Command
execution, software control, local processes and asynchronous MCP writes remain
unsupported. HTTP and MCP use the same operation workbench, immutable revisions,
Agent/Playbook pins, capability gateway, ledger and access policy. See
[ADR 0013](adr/0013-reviewed-integration-writes.md) for this bounded expansion.

## Operator flow

### Official client migration status

The bounded investigation of `laravel/mcp v1.0.0` on 19 September 2026 resulted
in a documented deferral. Its client excludes the currently supported
`2025-03-26` profile; stock session-404 and `HEADER_MISMATCH` handling also resend
one logical tool call without the product's retry admission. The existing guarded
client remains the sole productive client. No fallback, vendor patch or new
Composer dependency was introduced.

The public transport injection API is usable, but migration still needs raw tool
definitions, physical-send receipts, product egress controls and shared response
limits; the investigation is recorded in the package repository's
documentation archive.
The offline reproduction is `scripts/qa/mcp-client-spike.php`; it accepts an
extracted official v1.0.0 source directory and an output JSON path, with all HTTP
requests intercepted by fixtures.

### Guided GitHub setup

1. Open **Connect > APIs & MCP > MCP servers**, choose **GitHub**, name the connection,
   select **One Agent**, and save the account credentials. The provider endpoint
   is already filled; **Server settings** remains available for advanced setup.
2. Select **Set up repository access**. Enter the organization or username,
   repository name, and optionally a branch or tag.
3. Choose the reads to prepare: **Repository documentation** (`README.md`),
   **Image and screenshot links** (up to 20 links without a known file path),
   **Files by path**, **Recent open issues** (at most 10, newest first), or
   **Recent commits** (at most 10). Documentation and image links are selected
   initially. Exact file reads require a visitor-supplied path;
   setup tests them by listing the repository root. The selected ref applies to files and
   images as well as commits. Repositories without `README.md` need advanced tool setup for their
   documentation entry point.
4. **Test and add to Agent draft** discovers the actual tool declarations,
   binds the repository in the executable contracts, prepares descriptions and
   examples, and tests every selected read through the capability gateway.
   Only after all pass does it publish their revisions and append the selection
   to the saved Agent draft. Existing capabilities remain assigned.
5. Follow **Review Agent release** to publish and test the candidate, then
   activate it. The live Agent keeps its previous deployment until activation.
   A saved connection, a prepared tool and a live Agent are distinct states.

The guided read classification applies only to the allowlisted tools on the
official hosted GitHub endpoint, including its `/mcp/readonly` endpoint.
An editable provider label or a server's read-only hint does not authorize it.
All discovered request constraints and definition fingerprints are retained;
the shortcuts expose only the inputs they need. New required inputs stop setup.
The adapter requests GitHub's four curated read tools with `X-MCP-Tools` and
`X-MCP-Readonly: true` for both discovery and calls. This includes the Git tree
tool omitted by GitHub's default catalog. Competing toolset headers cannot widen
this selection; authentication and existing lockdown settings are preserved.
These headers select the server catalog and do not grant live Agent access.
Identical setup reuses the exact existing prepared operations. Customized drafts
or changed remote definitions require review through advanced tool setup and
are never silently overwritten. A failed selection adds no tools to the Agent.

Prepared GitHub reads also include curated response mappings. Documents become
bounded source sections with their headings; directory listings, issues and
commits expose named fields instead of a JSON text dump. The Agent selects
verified sections or fields through the existing evidence contract. It does not
gain permission to invent a summary, fetch embedded links or expose other fields.

Mapped data and presentation metadata share the existing direct-read limits of
16,000 bytes per result and 48,000 bytes per turn. Large files or directories can
therefore require a narrower request. The chat explains this limit instead of
presenting an incomplete result as complete. Repeating an identical successful
read within one model invocation references its existing evidence without
resending the full document or calling the server again.
For native providers that support tool choice, including Gemini, the final
model step requests an answer from the available evidence with tool selection
disabled. The existing step, token and evidence limits still apply.

### Advanced and other providers

1. Open **Connect > APIs & MCP > MCP servers** and create a connection.
2. Choose GitHub, Tavily, HubSpot, Notion, Linear, Google Calendar, Google Docs,
   or the advanced **Own MCP server** option. Only GitHub currently has curated
   functions; other presets supply connection settings, not automatic tool approval.
   Enter the complete HTTPS MCP endpoint, including
   its path and any required trailing slash. No processes are installed on the VPS.
3. Choose the Agents (one, selected or all; see
   [Agent access](API_CONNECTORS.md#agent-access-and-shared-connections)) and
   the owner scope, then save the authentication settings.
   Bearer tokens, header API keys, custom authentication headers and OAuth are
   supported. Credentials use the existing encrypted Connector storage and
   remain blank when editing saved secret fields.
4. For OAuth, save the connection and select **Connect account**. If no client ID
   is saved, the app discovers the server's OAuth metadata and registers a public
   client when the provider supports dynamic registration with PKCE. Complete
   the provider's account consent. Existing client IDs are reused.
   Providers requiring a manually registered client use **Manual OAuth settings**:
   copy the displayed callback URI to the provider, enter the client ID, optional
   secret, endpoints and scopes, then save. **Discover OAuth settings** can fill
   endpoints for review. Registration or account consent does not approve tools.
5. Select **Import tools** to import several tools under one review (see
   below), or **Import one tool** (**Advanced data access** for GitHub).
   Search the importable tools and review the selected
   description. The original input schema is under **Technical details**;
   incompatible or excluded tools and their causes are under **Compatibility details**.
   Choose the operation's effect. Outside the curated GitHub reads, an
   authenticated operator must verify the exact data function and record its
   purpose and review basis. A read review permits only reads. A separate write
   review permits one synchronous create/update operation, its fixed targets,
   and tenant/actor scope. Both exclude software control and commands. Server
   hints are not proof. Supply fixed arguments to restrict the accessible data.
   For example, `{"owner":"example","repo":"public-docs"}` binds those declared
   inputs to that repository and removes them from model-visible inputs.
   A tool without separate repository inputs needs its own appropriately scoped
   provider contract; a prompt alone does not restrict a general search tool.
   Optionally enable **Source in chat** and enter a public source name, the
   configured data scope and an optional HTTPS source link. These fields describe
   the source to visitors; they are separate from its MCP endpoint and do not
   restrict or expand access. Guided GitHub setup derives them from the fixed
   owner and repository automatically.
6. Import the selected tool as a draft. Review its purpose, matching examples,
   input policies and output mapping in the operation workbench. Test that draft
   and publish its immutable operation revision through the normal lifecycle.
7. Attach published reads in the Agent's Connector tools or in a Playbook
   Capability step; published writes work in both and always ask the visitor
   to confirm. Publish the Agent to make the new version live. Saving,
   discovery and operator review never grant write access by themselves.

The supported structured-output schema includes FastMCP's boolean
`x-fastmcp-wrap-result` root annotation. The original declaration and annotation
remain hash-pinned; the portable validator checks the declared `structuredContent`
object and its fields without interpreting the annotation as a constraint or
unwrapping its `result` field. Unknown extensions and unsupported validation
keywords still block import. See the [FastMCP output documentation](https://github.com/PrefectHQ/fastmcp/blob/main/docs/servers/tools.mdx).

Refreshing an imported tool is an explicit draft replacement in the discovery
dialog. It keeps the operation identity and published revision, replaces the
draft's discovered schema and default mapping, and requires review, testing and
publication again. Existing Agent deployments retain their old revision pins.
Changed fixed argument scopes get separate operation identities.

### Import tools

**Import tools** discovers every tool of the server and lists it in one table
with the server's hint, its status and the access to grant:

- A tool the server marks read-only (`readOnlyHint: true`, no destructive hint)
  starts as **Read**. Every other tool starts **Off**.
- **Read** is offered only when the server does not declare changes
  (`readOnlyHint: false` or `destructiveHint: true`). A positive hint never
  approves a tool by itself.
- **Write** imports a draft without write approval. It still needs its own
  write review (fixed targets, tenant and actor scope) and an isolated staging
  test before publication, and visitors always confirm MCP writes (ADR 0038).
- Tools without a supported schema are listed as unavailable.

One review covers the whole import: an approved purpose, the confirmation that
the selected read tools only read data and that no tool controls software. The
importer re-discovers the server, rejects a selection the fresh declarations do
not allow and stores one signed record (`mcp_server_import_review.v1`) with the
exact selected tools, their definition hashes and effects. Each imported read
also carries its usual signed read review, so testing, publication and the
Gateway check each operation as before. Imported tools are drafts: test and
publish each one, then select it for an Agent. Curated GitHub connections keep
their guided repository setup and do not offer this import.

Opening the import again compares the server with the imported operations. An
operation whose tool the server now declares differently is marked **Changed**,
one whose tool disappeared **Removed**; the published revision is the
reference when one exists. Marking changes no access: published revisions and
Agent pins stay, and a changed declaration still fails before `tools/call`.
Selecting a changed tool refreshes its draft under the new review; it needs a
new test and publication. Unchanged imported tools are listed as **Imported**.

### Notion account and page scope

The hosted Notion server uses an interactive account login. Its consent grants
the connected account's workspace permissions; it is not a provider-enforced
read-only token limited to one FAQ. Use a dedicated workspace containing only
appropriate demonstration content for a public demo. The app separately permits
only the reviewed read operations and fixed arguments published to the Agent.

For one FAQ, review the discovered page-fetch function and bind its page ID in
**Fixed arguments**. Do not grant a workspace-wide search tool merely to let the
Agent find that one page. Include the FAQ's name, scope and exact source link in
**Source in chat**, then test the operation and Agent candidate before activation.
Additional pages or a search-and-fetch Playbook require their own reviewed scope.

Notion requires HTTPS for the OAuth callback except for HTTP loopback development
addresses such as `127.0.0.1`. A named development host ending in `.localhost`
does not satisfy that exception. Serve and sign in to the actual application at
its configured accepted origin throughout registration and callback; do not
substitute another callback host midway through an existing session. Production
hosts should use their configured HTTPS application URL. Provider rejection of a
callback is reported separately from an unavailable server or account login.

### Model context and source links

Published MCP operation metadata can include `mcp_source` version 1: `label`
(120 characters), `scope` (240 characters) and optional `url` (1,000 bytes).
The URL must use HTTPS without credentials, query strings, fragments or
whitespace. Recognized credential literals are rejected. The source must be
appropriate for public chat display. Scope enforcement remains in the executable
request contract and capability policy, not this descriptive field.

The operation revision and Agent deployment pin this metadata. The model receives
one compact source entry per connection and distinct source, with a short source
reference on each corresponding tool. Only tools available in that turn contribute
entries. The whole source catalogue is limited to 8,192 UTF-8 bytes; publication
rejects excess metadata instead of silently dropping or truncating sources. The
catalogue also counts toward the routing-description and normal model input budgets.

Source name, configured scope and exact source link can be answered from this
published catalogue without a live MCP read. Questions about actual contents still
need a matching approved tool and its existing evidence contract. A source link
does not prove that the source is currently reachable, and an absent link is not
invented. All providers use this same context path; it does not add another router
or an extra model call.

After a successful MCP read, the same pinned source label, scope and optional
link are also available as separate selectable answer evidence. This lets one
answer include both requested content and its configured source link even when
the provider response omits that link. Provider result fields remain intact;
the additional source fields describe published configuration, not a fresh lookup.

Tool selection still depends on the configured model. Candidate tests should cover
source-link questions, adjacent follow-ups and actual content reads with that
model before activation; compact metadata alone does not guarantee correct routing.

Discovery retains bounded `serverInfo` name, version and optional title for
diagnostics. These values are server-reported, not verified source facts. Raw
server instructions, icons and the entire remote capability catalogue are not
injected into the model. The model still receives each assigned operation's
purpose, matching example and required input schema. Instructions and schemas
stay fixed within the native model invocation.

Existing deployments keep their original metadata. Edit generic source fields in
the operation workbench, review and test the operation, then publish the Agent
again. This preserves request mappings and the existing data-read
review. GitHub identity remains derived from the bound repository. Server-reported
diagnostics cannot be changed through the source fields.

### Additional provider presets

The MCP client, discovery, schema import, authentication, data review and
execution are provider-independent. A server can be connected through **Own MCP
server** without adding application code. The GitHub setup and image
projection are optional provider-specific conveniences, not another runtime.

Applications can add named connection presets through
`filament-agentic-chatbot.mcp.provider_presets` in the published configuration:

```php
'mcp' => [
    'provider_presets' => [
        'company_knowledge' => [
            'label' => 'Company knowledge',
            'endpoint' => 'https://mcp.example.com/mcp',
            'docs_url' => 'https://docs.example.com/mcp',
            'setup_hint' => 'Connect the account that may read the approved knowledge.',
            'auth_types' => ['oauth2', 'bearer'],
            'auth_type' => 'oauth2',
        ],
    ],
],
```

Keep the other published `mcp` settings when adding this entry. Up to 1,000
additional presets are accepted. Keys use lowercase letters, digits and
underscores, start with a letter and contain at most 64 characters. `label` and
`endpoint` are required; documentation, setup hint and authentication options
are optional. URLs require HTTPS and cannot contain credentials; server endpoints
also exclude query strings and fragments. Authentication uses the existing `none`, `bearer`, `api_key`,
`custom_header` or `oauth2` methods; the default without a list is `bearer`.

Presets contain connection metadata only. They cannot override built-in keys,
embed credentials or commands, preapprove tools, or bypass the individual data
review. Even a preset pointing to GitHub's endpoint receives no automatic
curated approval. Server compatibility still depends on the supported protocol
and schema subset below, regardless of the preset name.

Default output mappings include ordinary text blocks and text embedded in resource
blocks, such as GitHub file contents. Resource URIs and binary payloads are not
selected by these mappings, and resource links are not fetched. Existing drafts
receive the new defaults only when explicitly refreshed. Structured output titles
and descriptions are copied into the allowed mapping's `presentation`; hidden
siblings remain excluded.

New imports keep a draft-only `import_basis`, stripped before publication. Refresh
compares that basis, local semantic edits and the freshly reviewed source by field
identity. Unchanged local fields adopt the source; independent local descriptions
and examples survive; competing edits report the exact path without saving.
The success notification lists retained local paths. Execution/schema/security
changes still cross the ordinary review and publication boundary; local execution
overrides are not semantically merged. Draft/environment locks remain mandatory.
Without a basis, refresh preserves the draft until the explicit first-adoption
option is selected. Published revisions never change in place.

MCP mappings may explicitly declare `transform: mcp_json`, `mcp_document`,
`mcp_content` or `mcp_github_images` on a content-block path with nested `fields`. `mcp_json` strictly
decodes one text block containing a JSON object or list. `mcp_document` projects
embedded text resources, or ordinary text when no resource exists, into bounded
`title`/`text`/optional `source` sections. `mcp_content` accepts embedded text
documents as `sections`, or a text block containing an array of objects as
`entries`, for file tools that also return directories. The nested mappings
still explicitly allowlist fields. Invalid, ambiguous, binary-only or oversized
content fails the read; these transforms do not fetch URLs, repair JSON, or
silently truncate source data. They are unavailable to HTTP operation contracts.

For a provider that wraps a document in JSON, nest `mcp_document` under
`mcp_json` and select the document string explicitly. The optional `content_tag`
selects one exact tag-delimited body, for example Notion's `<content>` body:

```php
'faq' => [
    'path' => 'response.content',
    'transform' => 'mcp_json',
    'fields' => [
        'title' => 'title',
        'url' => 'url',
        'sections' => [
            'path' => 'text',
            'transform' => 'mcp_document',
            'content_tag' => 'content',
            'fields' => ['title' => 'title', 'text' => 'text'],
        ],
    ],
],
```

This is an explicit output contract, not automatic provider detection. The tag
must be a simple ASCII name of 1 to 64 characters. Missing, repeated, nested,
incomplete or attributed target tags fail the read. Source limits apply before
body selection. Document projection preserves paragraph and HTML break lines;
it does not execute markup or treat document text as instructions.

Productive Connector answers preserve selected public contact details, such as
a support email address. Credential fields, known credential values and
intrinsic authentication secrets remain redacted. The separate trace and
diagnostic redaction policy still applies, including configured personal-data
patterns; it is not reapplied as a blanket filter to the approved answer.

`mcp_github_images` projects the official `get_repository_tree` result into
image-file links. It requires a complete recursive tree with matching bound
owner/repository and reference, validates unique relative paths, and excludes
symlinks, submodules and non-raster files. Links are derived from those checked
fields; provider-supplied URLs are ignored. It returns up to 20 links within a
9,000-byte selection, prioritizing screenshot filenames and `docs/` paths, with
the full supported image-file count, returned count and `has_more` flag. This is
a declared selection, not a claim to have inspected image content. Existing
131,072-byte source and 8,192-node transformation limits still apply. Truncated
provider trees and oversized sources fail explicitly. No image is downloaded or
executed, and the Agent does not need to invent an input path.

## Reviewed Playbook writes

Use advanced tool review to select **Create or update through a Playbook**, explicitly approve **Create one record** or
**Update one record**, and bind at least one precise target in **Fixed arguments**. The
reviewed target values must be required request-schema constants outside model
inputs. Approve the actual data operation; neither a tool name nor remote
read-only, destructive or idempotency hints establish safe permission.

Declare tenant and actor scope separately. **Use the connection owner policy** uses the saved
connection's Agent/owner policy and connected provider account. It does not
impersonate a visitor. **Bind an exact fixed tool argument** additionally compares the declared
identity with the current server-attested tenant or actor; missing or foreign
identity fails before dispatch. Bind record identifiers as fixed targets when
only one record is allowed. Restrict writable inputs in the declared tool schema
and use a narrower server tool when its schema cannot express that boundary.

In the existing operation workbench:

1. Keep confirmation enabled, **Single item only**, invocation identity and
   Playbook-run scope. Select **Reject duplicate** or **Return saved completed
   result**. The latter reads an already persisted success for the exact
   invocation without another provider call. Unknown outcomes require manual
   reconciliation. No provider-idempotency header or automatic retry is supported.
2. Configure a business-success predicate and a remote record identity path. For
   a result envelope containing `structuredContent: {status: "created", id: "T-42"}`,
   use `{"path":"structuredContent.status","operator":"equals","value":"created"}`
   as `success_when`. With an empty response extraction path, use
   `structuredContent.id` for the record identity. If extraction selects
   `structuredContent`, the identity path is `id`. Keep output mappings limited
   to approved fields. HTTP 200 or `isError: false` alone is not success evidence.
3. Save and use **Review operation access** to approve the exact final draft.
   Meaningful changes to inputs, targets, environment, effect, result or recovery
   rules require a new review. Display labels do not change execution authority.
4. Configure a separate staging-only MCP connection using a different origin,
   environment binding and credentials, with the same Agent/owner scope and
   tool definition. Run the existing explicitly confirmed staging-write test.
   An unavailable isolated endpoint or incompatible definition blocks publication.
5. Publish the successfully evidenced exact operation, select it in a Playbook
   Capability step after an Approval step, then publish its owning Agent.
   Ordinary Agent tests, candidate comparisons and workbench read tests cannot
   perform this write.

The request follows the existing gateway, confirmation, side-effect ledger and
reconciliation path. Confirmation binds the materialized action and current
conversation, actor, tenant, deployment, connection/environment and schema.
The concrete target and arguments are shown before an explicit Approval step
can grant the write. The saved request remains immutable; a trusted input
correction or a confirmation older than ten minutes requires a fresh preview
and confirmation. A changed request or authority cannot reuse the old proof.
Duplicate execution does not
repeat an effect. Timeouts, lost responses, process crashes after possible
send, `isError`, an unmet business-success predicate, missing result identity
and asynchronous results remain unknown until explicitly reconciled. There is
no exactly-once guarantee across an arbitrary provider network.

The separate signed review is `mcp_write_access_review.v1`. Existing
`mcp_data_access_review.v1` approvals and historical write ledgers are preserved;
neither is automatically upgraded or replayed. Guided GitHub setup and its
curated read-only endpoint remain read-only.

## Providers and authentication

| Profile | Endpoint | Setup |
| --- | --- | --- |
| GitHub | `https://api.githubcopilot.com/mcp/` | Fine-grained token or a registered OAuth client; restrict repository access in GitHub. |
| Tavily | `https://mcp.tavily.com/mcp/` | API key supplied as a bearer token, or OAuth. Provider quotas apply. |
| HubSpot | `https://mcp.hubspot.com` | A HubSpot MCP auth app and OAuth with PKCE. |
| Notion | `https://mcp.notion.com/mcp` | Save and select **Connect account** for dynamic client registration and OAuth; a standard Notion integration token does not authenticate this endpoint. |
| Linear | `https://mcp.linear.app/mcp` | Restricted API key as bearer token, or OAuth. |
| Google Calendar | `https://calendarmcp.googleapis.com/mcp/v1` | Workspace Developer Preview access, enabled service and Google OAuth. |
| Google Docs | `https://docsmcp.googleapis.com/mcp/v1` | Workspace Developer Preview access, enabled service and Google OAuth; writes require separate Playbook review and isolated staging evidence. |

Current provider setup references: [GitHub](https://github.com/github/github-mcp-server),
[Tavily](https://docs.tavily.com/documentation/mcp),
[HubSpot](https://developers.hubspot.com/docs/apps/developer-platform/build-apps/integrate-with-the-remote-hubspot-mcp-server),
[Notion](https://developers.notion.com/guides/mcp/get-started-with-mcp),
[Linear](https://linear.app/docs/mcp),
[Google Workspace](https://developers.google.com/workspace/guides/configure-mcp-servers).

The account connected by the administrator supplies access for that connection.
An anonymous visitor does not automatically obtain their own provider identity.
Use public documentation and dedicated demonstration accounts for a public demo.
Read-only credentials can still disclose private content. Scope permissions and
fixed arguments at the provider and published contract boundaries.

## Protocol and execution boundary

The supported transport is Streamable HTTP over HTTPS, with JSON or bounded
SSE responses to POST requests. The client requests MCP `2025-06-18` and accepts
`2025-03-26`, `2025-06-18`, or `2025-11-25` negotiation. It initializes an isolated
session, sends the initialized notification, follows bounded tool-list cursors,
and sends at most one `tools/call`. Session headers and exact JSON-RPC response
IDs are verified. There is no automatic tool-call retry or session reconnect.

GitHub-style `x-mcp-header` input annotations are supported within the bounded
schema subset. Header names must be unique, valid HTTP tokens of at most 128
characters on statically reachable string, integer or boolean properties.
Only the verified declaration and bound arguments supply `Mcp-Param-*` headers;
caller-provided protocol headers are replaced. Unsafe ASCII, Unicode and sentinel
values use the MCP Base64 encoding, and parameter headers are limited to 16 KiB
per call. This extension does not add negotiation of the 2026 protocol revision.

The client reuses `ConnectorTransport` to retain DNS-pinned network authority,
redirect blocking, TLS verification, circuit breaking and actual HTTP call
budgets. `mcp.max_tools` bounds the catalog (default 500, hard cap 1000);
`mcp.max_session_seconds` bounds one session (default 60, hard cap 120). Catalog
pages, message sizes and SSE events are additionally bounded. Each handshake and
catalog request consumes an outbound call, not just the final tool invocation.

The imported declaration fingerprint includes the tool's input/output schemas,
descriptions and annotations. Before every productive call the client checks
the selected tool's current declaration in the same session. A missing or changed
declaration fails before `tools/call`. This checks declared metadata, not the
provider's private implementation. Remote descriptions and read-only/idempotency
hints never independently authorize an operation.

Executable MCP requests declare `request.transport: mcp` and
`request.mcp: {tool_name, definition_hash}` in the existing v3 contract.
Reviewed custom reads store a signed `request.mcp.data_access` record bound to
the connection, exact endpoint, tool definition, full request and read effect.
Writes use the distinct `request.mcp.write_access` contract described above;
a read review cannot grant a write. Import, publication and the gateway enforce
these reviews before dispatch or a write-ledger claim. Historical unreviewed
MCP writes remain blocked.
An application-key change requires renewed custom-function reviews. Curated
GitHub approval requires both the exact official endpoint and an allowlisted
read function with fixed owner/repository outside model inputs.
`body_template` contains arguments, not a caller-controlled JSON-RPC message.
The `core/mcp` strategy binding freezes the local protocol, dispatcher and
result-processing implementation dependencies. HTTP outcome bindings do not
include MCP-only result checks. Authority and confirmation payloads include the
exact tool identity. The dispatcher checks MCP-only content before the response
mapper consumes the MCP result envelope;
default mappings select text and, when an output schema is declared, structured
content. Curated output, schema validation, size limits and redaction still apply.
Without a declared structured output schema, a successful tool result containing
non-text blocks (including image, audio, binary resource or resource link) fails
as unsupported content instead of appearing as an empty read. A dispatched write
with that result remains unknown and requires reconciliation. Empty `content`
is still a valid empty read.

The browser OAuth flow uses S256 PKCE, encrypted short-lived state, one-use
consumption and bindings to the operator session, connection environment,
credentials and callback. Resource indicators accompany authorization, token
exchange and refresh. Discovery follows Bearer authentication challenges and
the standard OAuth/OIDC metadata locations, including path-based issuers.
Metadata, registration and token endpoints cross the same network policy;
credentials are never sent when discovering metadata or registering a client.
Dynamic registration supports RFC 7591 public clients only when the server
advertises token endpoint authentication `none` and S256 PKCE. Registration
sends the configured app callback, client name, grant types and configured scope,
without saved account credentials. Responses are bounded and checked before
the client ID and discovered endpoints are saved in encrypted credential storage.
Registration is serialized per connection, never automatically retried, and
cannot overwrite a concurrently changed connection or an existing client ID.
It creates no Agent capabilities. A provider requiring a registration secret or
a confidential client remains on the manual setup path.

## Current limits

- No local `stdio` processes, package installation, legacy standalone SSE
  transport, resources/prompts, MCP Apps, server-requested sampling/elicitation,
  or MCP Tasks. Unsupported server requests fail closed.
- Discovery accepts the existing bounded Connector JSON Schema subset. References,
  unions and unsupported constraints are reported rather than silently removed.
  Input objects are restricted to declared properties, including the unconstrained
  `additionalProperties: {}` form. Nonempty schema-valued additional properties
  remain unsupported. Provider defaults do not become permission to invent
  required inputs. An invalid or overly complex individual declaration appears
  as unavailable without an executable fingerprint; it does not hide compatible
  tools in the same catalogue. Invalid or duplicate names still reject discovery.
- Business result pagination and asynchronous tool completion need a separately
  reviewed contract; HTTP pagination/continuation settings cannot be applied to
  an MCP tool. Catalog pagination is supported.
- Direct Agent tools are input-grounded reads and separately reviewed
  synchronous create/update writes that the visitor confirms (ADR 0038).
  Dependent reads use Playbooks. Software-control tools, bulk writes, deletes
  and asynchronous MCP writes are excluded.
- Existing MCP write histories and unresolved outcomes remain available for
  review and reconciliation; they are not converted to reads or retried.

Package tests cover discovery, OAuth, versioned import, guarded runtime execution,
guided GitHub preparation, direct Agent reads and failure handling with controlled server responses. Real
provider accounts and VPS deployment require their own integration verification.
