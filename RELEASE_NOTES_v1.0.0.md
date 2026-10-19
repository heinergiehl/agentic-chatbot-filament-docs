# Filament Agentic Chatbot 1.0.0

**Release status:** Approved, conditional release authorization<br>
**Selected release:** `v1.0.0`<br>
**Release date:** `2026-10-19` (intended publication)<br>
**Upgrade baseline:** `0.20.5`<br>
**Previous-line security/critical EOL:** `2027-01-17` (conditional on the intended publication date)

Selected release `v1.0.0`; intended publication `2026-10-19`. Approval is conditional release authorization, not completed acceptance. The source remains a release candidate until required local gates and publisher finalization pass. Final source and archive certification are pending. The last shipped release remains `0.20.5` until publication. Final golden-path acceptance and dialogue evaluation are incomplete. If the stable criteria fail, revise the selection before any tag. If publication moves, revise metadata and mirror D before freezing a new source. No gate result is asserted by approval metadata.

## What changes from 0.20.5

The package continues to provide self-hosted support Agents inside Laravel and
Filament, using your own AI provider account. An Agent can answer from selected
Sources, use approved App data, API and MCP tools, and hand a conversation to an
operator. Ordinary conversation needs no Workflow. The shop examples in the
guides are host integration recipes; they do not install a commerce integration.

The 1.0 candidate brings these changes to that existing product:

- **Setup in the host database.** Fresh installations use the host connection
  and the bounded `database` vector backend. Settings manages app-wide provider
  keys and embedding billing acceptance. Health and Doctor report prerequisites,
  including scheduler and worker heartbeats. Existing pgvector installations
  must preserve their effective connection, backend and embedding profile.
- **One Agent lifecycle.** Draft, Live and Paused describe visitor availability.
  First Publish can make the Agent Live in the publication transaction. Later
  Publish and Restore preserve Live/Paused availability. Reviewed dependency
  publication updates the selected dependency without activating unrelated
  Agent Draft edits.
- **Knowledge refresh within published authority.** Website and Files Sources
  stage complete generations before activation. Current mode follows complete
  generations of the pinned Source set and profile; Frozen mode retains its
  exact generation pins. Failed or incomplete refreshes preserve the previous
  active generation.
- **Explicit data access.** Administration has operate, configure, publish and
  admin abilities. App data tools can be proposed from Filament Resources,
  then reviewed for fields and row scopes. Personal Tools bind host actor type
  and ID, and queued execution rechecks customer authority. Optional host read
  policies supplement the Tool's scopes.
- **Operational follow-through.** Handoff has authorized recipients, durable
  notifications and Agent business hours. Unverified actions have an operator
  queue and reconciliation; a timeout or missing receipt is not write success.
  Connection health and readable confirmation values support diagnosis.
- **Workflow and panel editing.** List and canvas share Workflow commands and
  structural Paths. For each has an explicit body, Test uses the saved Draft,
  and runs open in a drawer. Navigation groups Build, Connect, Inbox,
  Conversations and Settings; operational outcomes and usage remain distinct
  from answer quality. Product terminology is aligned in English, German,
  French and Spanish.

These are implemented component behaviors, not a claim that every provider,
host configuration or end-to-end conversation has passed release acceptance.
See [Product overview](PRODUCT_OVERVIEW.md), [Compatibility](COMPATIBILITY.md)
and the [1.0.0 changelog](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/CHANGELOG.md#100---2026-10-19).

## Breaking changes and upgrade

This is not a drop-in 0.20 patch. Start with the
[ordered 0.20.5 upgrade procedure](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/UPGRADING.md#ordered-0205-to-10-procedure)
on an isolated restored copy of your data. The guide names every changed public
configuration/API contract and UI label; the main upgrade decisions are:

| Before | 1.0 requirement |
| --- | --- |
| `laravel/ai ^0.11.2`, `heiner/agent-graph 0.18.1` | `laravel/ai ^1.2.1`, exact `heiner/agent-graph 0.19.0`; Filament minimum `5.10.2` |
| Implicit pgvector and dedicated PostgreSQL defaults | Fresh installs default to the host connection and `database`; old installs explicitly retain their effective storage and embedding profile |
| Agent permission mode | Reviewed Tool assignment and immutable operation contracts; conversion preserves previously denied authority |
| `channels.whatsapp`, `WhatsAppCloudChannelDriver`, `WhatsAppChannelMessageRenderer` | Removed, without a replacement WhatsApp driver; choose a supported channel |
| Solution Kits and `SolutionKitProvider` | Agent templates and `AgentTemplateProvider`; port host extensions using the upgrade guide |
| Direct App data update arguments `record`, `changes`, `expected_version` | Direct callers send `record` and `changes`; the server binds the record version. Workflow `mutate_data_resource.expected_version` is unchanged |
| Workflow Agent prompt editor and separate Runs page | Agent instructions live in the Agent editor; Workflow runs use the Runs drawer |

Capture old effective configuration and permissions before updating. Back up
all distinct host, package and AgentGraph databases together with private
storage and encryption keys. Stop admission, scheduler and workers, reconcile
in-flight work, then follow preflight, dependency update, migration/upgrade,
assets, worker restart and verification in the guide's order.

An upgrade never re-dispatches an uncertain write or runs a waiting Workflow.
Pending cards survive only when their bound Version and authority remain valid;
otherwise they expire. Historical artifacts retain their original bytes and
hashes. If a contract is not executable, stop at preflight and resolve it rather
than rewriting history. Rollback requires restoring the matching old package,
databases, storage, configuration and keys from the paired backup; migration
rollback alone is insufficient.

## Requirements and limits

Use PHP 8.3+, Laravel 12.61.1+ or 13.12.0+, and Filament 5.10.2+ within 5.x,
with the Composer-resolved dependencies. Supported package databases are
MySQL 8.4+, MariaDB 11.4+, PostgreSQL 15+ and SQLite 3.39+. These ranges are
distinct from the exact versions in the recorded matrix.

Production needs a persistent asynchronous worker, scheduler, shared cache,
HTTPS and explicit website/administration access. Production App data tool
queries require a supported server database; SQLite queries are local/testing
only. Default database vector capacity is 3,000 chunks per Agent at 1,536
dimensions, with a warning at 800 and lower limits at larger dimensions.
Use pgvector or ChromaDB for larger collections through the documented backend
switch procedure.

Confirmation is on by default. Personal App data tool writes, MCP writes, lead
capture and updates with **Allow updating any record** require it. Eligible
operations may disable **Ask visitor to confirm**; team approval remains
separate. Authorization, exact payload binding, duplicate fencing and
reconciliation still apply. There is no general external exactly-once guarantee.

AI answers and Tool selection need validation against your content and model.
Test simulates writes and does not prove a production change. Only one Workflow
can be active in a conversation. Provider adapters and default-off channels do
not certify a buyer's provider account. See [Known limitations](KNOWN_LIMITATIONS.md)
and [Security and privacy](SECURITY_AND_PRIVACY.md) before production access.

## Evidence and release readiness

Documentation baseline: reviewed merge
`85fa4d2d3e94b51d4e6d39c2f1e1027284b58e4c`. Final source C is selected only
after independent review and orchestrator checks/merge of these docs. Neither
this baseline nor the private mirror commit is final exact-source certification.

| Evidence | Current boundary |
| --- | --- |
| Preliminary golden path | W11.1 records two of six complete criteria on its named historical candidate. It is not final 1.0 acceptance. |
| W111b continuation | The latest phase-one record at `9e1180d030f4e1a95c63b5d3e9d3cc48ca5e6628` is preparation only, on source `91f1d405676124718220d875cc74691540636aff`; criteria 3, 4 and 5 remain incomplete. Earlier unknown costs remain unknown. |
| Merged corrections | Host configuration preserves required widget areas; Anthropic replay omits historical thinking blocks; App data staging binds the original principal and actor map through dispatch. Reviewed deterministic regressions do not replace rerunning the live scenarios. |
| Final gates | Exact-source/archive certification, reviewed dialogue evaluation and complete current golden-path acceptance are pending. Public GitHub/Filament delivery and rendering are pending. |
| Long-duration soak | `long_duration_soak=not_run`; optional under `release-1.0-risk-focused.v1`. |

The recorded five-target database matrix and 0.20.5 upgrade/restore rehearsal
support their named sources and environments. They do not certify this future
release ZIP. Current static UI evidence also does not replace live acceptance.
The retained FAQ image is historical, predates the citation-width fix and awaits
an actual current live-flow capture; the other retained images have their own
recorded provenance. No setup-time or completed shop acceptance claim is made.

Release policy `release-1.0-risk-focused.v1` makes a multi-hour soak optional.
**No long-duration soak occurred**. Bounded fault/recovery tests and simulated
scheduler checks do not establish production concurrency, automatic crash
recovery or long-duration resource stability. Final acceptance still requires
the exact-candidate targeted risky-path evidence, reviewed dialogue evaluation
with at least 95% task success and zero safety violations, database/host and
upgrade/restore checks, and all other required artifact gates. No gate is
reported passed by these notes.

Release order is local verification, GitHub tag and published Release, then
direct Live update. There is no separate VPS staging prerequisite. Product
App data write-test staging and its permits remain required. The intended demo
chat model is `claude-haiku-5-5`, effort `low`; this is configuration intent,
not evidence that the public demo has been updated. There is no daily demo
spend cap. Ordinary authorization, usage accounting, token/rate limits and the
kill switch remain required.

## Installation and support

Follow [Quickstart](QUICKSTART.md) for a fresh host and the ordered upgrade guide
for an existing installation. Purchased downloads and the demo may run a
different version from this candidate. After verified publication through your purchased channel, use
`composer require heiner/filament-agentic-chatbot:^1.0`. Until then, evaluate
only the exact candidate artifact supplied by the owner.

The [Support policy](SUPPORT_POLICY.md) retains the shipped `0.20` line until
stable publication. On publication, `1.0` becomes the supported stable line;
`0.20` receives security/critical fixes for 90 days, through `2027-01-17` if
publication occurs on `2026-10-19`.
License and support entitlements are unchanged by this preparation. Contact
`webdevislife2021@gmail.com` with versions, sanitized steps and logs, never keys
or customer data. [License and refund terms](REFUND_AND_LICENSE.md) describe the
commercial boundary; provider usage and infrastructure remain separate costs.
