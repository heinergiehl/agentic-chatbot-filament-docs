# Filament Agentic Chatbot 1.0.0

**Release status:** Approved (release authorization); GitHub publication completed<br>
**Published release:** `v1.0.0`<br>
**Published at:** `2026-10-19T17:40:33Z`<br>
**Upgrade baseline:** `0.20.5`<br>
**Previous-line security/critical EOL:** `2027-01-17`

The immutable [GitHub v1.0.0 Release](https://github.com/heinergiehl/filament-agentic-chatbot/releases/tag/v1.0.0) is published, with three
verified release assets. Approval metadata alone does not establish publication.
These online notes were updated after publication and the reviewed Live demo;
the tagged source and published ZIP retain their original documentation bytes.

## Published artifact

| Identity | Published value |
| --- | --- |
| Source commit | `10768454d746f1b6e8ed21f3c3322ec2f6999e5b` |
| Composer lock SHA-256 | `7f4732634c423a18be34b3b93d164b594183352020b1d442fc42b999c5a7f062` |
| ZIP | [filament-agentic-chatbot-1.0.0.zip](https://github.com/heinergiehl/filament-agentic-chatbot/releases/download/v1.0.0/filament-agentic-chatbot-1.0.0.zip), 5,960,921 bytes |
| ZIP SHA-256 | `eb49ac9af315251ab3ca477f96e8f13d3ac9b98f81af7894bad5c0ffa8b2fb57` |
| Public docs pinned by the released source | `269f35c1d53c01c546198aa95a396b303b9d67a7` |

The [file manifest](https://github.com/heinergiehl/filament-agentic-chatbot/releases/download/v1.0.0/filament-agentic-chatbot-1.0.0.manifest.json)
and [checksum file](https://github.com/heinergiehl/filament-agentic-chatbot/releases/download/v1.0.0/filament-agentic-chatbot-1.0.0.sha256)
remain attached to that Release. The downloaded ZIP's 1,964 files were verified.
The public docs main branch can advance after publication; a later docs pin is
not a replacement release identity and does not change the tag, lock or ZIP.

## What changes from 0.20.5

The package continues to provide self-hosted support Agents inside Laravel and
Filament, using your own AI provider account. An Agent can answer from selected
Sources, use approved App data, API and MCP tools, and hand a conversation to an
operator. Ordinary conversation needs no Workflow. The shop examples in the
guides are host integration recipes; they do not install a commerce integration.

The 1.0 release brings these changes to that existing product:

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

Local evidence below was recorded on 2026-10-19 against C1 source
`07a31f21d88ef869c3cbf6883be1e90065db2476`, Composer lock SHA-256
`7f4732634c423a18be34b3b93d164b594183352020b1d442fc42b999c5a7f062` and ZIP SHA-256
`b9d947c796e5955c2066e7b44f970a23087954a5e17bc0a204d800a3ba04451a`.
C1 is a local acceptance artifact. This historical table does not certify the later released artifact. The final
required gates passed separately on the published identity listed above; the
postpublication online documentation does not replace that immutable artifact.

| Evidence | Current boundary |
| --- | --- |
| Preliminary golden path | W11.1 records two of six complete criteria on its named historical candidate. It is not final 1.0 acceptance. |
| C1 native FAQ | Anonymous public Turn 2 completed with a real citation to Agent 1 / Source 1 / Generation 1 / chunk 1. Haiku 5.5 at low effort; Gemini embedding-001, 1,536 dimensions. The earlier pre-dispatch failed turn is retained. |
| C1 customer core | Signed own-order read, one exact native Confirm write, same-request replay and distinct-turn duplicate fencing, and foreign-order read/change refusal are recorded in `fast-haiku-stage-core`. Earlier partial Inbox/Playbook results are superseded by the continuation below. |
| C1 Inbox and Playbook continuation | `fast-haiku-remainder` records one operator reply visible after normal visitor history refresh; automatic polling did not show it within 45 seconds. Its later `PHASE3_REPORT.md` records native confirmation 4 completing the existing Graph/WorkflowRun once, ledger attempt 1 and order version 1 to 2. The final model answer retained conservative result wording; no completion screenshot or extra answer-polishing turn is claimed. Earlier caller failures remain recorded. |
| C1 accounting | Historical unknown outcomes and unmeasured embedding costs retain their full holds; no unknown cost is declared zero. |
| Merged corrections | Host configuration preserves required widget areas; Anthropic replay omits historical thinking blocks; App data staging binds the original principal and actor map through dispatch. Reviewed deterministic regressions do not replace rerunning the live scenarios. |
| Final gates | The retained final recorder reports all eight required gates passed on the exact published source, lock and ZIP with its original docs pin: source quality, marketplace readiness, reference-host core acceptance, targeted runtime/security, keyless Laravel 12 and 13 installs, upgrade/restore and docs drift. Full dialogue evaluation remained optional and was not run. |
| Long-duration soak | `long_duration_soak=not_run`; optional under `release-1.0-risk-focused.v1`. |

The recorded five-target database matrix and earlier development upgrade/restore
rehearsal retain their named source/environment boundaries. No full matrix rerun
on the released ZIP is claimed. The FAQ image is the actual 2026-10-19 local C1
anonymous answer/citation capture; no 375 px recapture is claimed. The other
images retain their dated provenance. FAQ PNG SHA-256:
`8544582e04b4048c40f14a5ada33e7f81f291a826afacfdde091c13d6a12d31f`.
Full screenshot provenance is in source file
`docs/release/W10.2_SCREENSHOT_EVIDENCE.md`. The C1 reports remain under
`.claude/worktrees/w111b/.tmp/w111b-prep/fast-haiku-faq-run`,
`fast-haiku-stage-core` and `fast-haiku-remainder`; they are retained operator
evidence, not purchased archive files.

**No long-duration soak occurred**. The final evidence records broad pgvector
qualification, full package suite, full database matrix, full dialogue evaluation,
SMTP exhaustion and long soak as `not_run`. Bounded fault/recovery tests and
simulated scheduler checks do not establish production concurrency, automatic
crash recovery or long-duration resource stability. No setup-time guarantee or
blanket production/security qualification follows from publication.

## Verified live shop demo

After GitHub publication, the exact released ZIP was deployed to the
[HTTPS Example Shop](https://filament-agentic-chatbot.heinerdevelops.tech/shop).
The reviewed host commit was `c9f2efdf5ade79606c06a44255ea98e90ac6dc93`.
The public demo now shows the fictional shop, with session-specific Alex/Sam
customers and orders. Follow the [demo walkthrough](QUICKSTART.md#try-the-live-shop-demo).

An independent deployment review verified all 100 canonical host files and all 1,964
published package files in the active deployment. The queue worker, scheduler,
PHP-FPM and nginx were active. Doctor reported zero required failures, with
workflow-trace privacy and commercial-profile warnings still recorded. The
demo uses three physical stores: host, shop and package, with AgentGraph
sharing the package connection. Retained legacy backups are preserved.

The Source completed genuine `gemini-embedding-001` ingestion at 1,536
dimensions before activation. Normal HTTPS Chrome acceptance with
`claude-haiku-5-5`, effort `low`, verified a policy citation, own-order reads,
foreign-order refusal, native Confirm, one delivery-address write and a
completed Graph run. The order advanced to version 2 with one succeeded ledger
attempt. The native Inbox request, database notification and staff reply were
stored; authorized owner history contained the reply and foreign history was
denied. Alex/Sam isolation and revocation of old browser leases were verified.

The model produced unnecessarily cautious follow-up prose despite the native
lookup and successful write. Canonical execution evidence and the order record
establish success; this is not an unqualified answer-quality claim. A live-widget
staff-reply screenshot was not captured, and automatic foreground polling was
not validated. Live duplicate/stale/cancel paths were not exhaustively rerun;
prior deterministic checks retain their scope. No SMTP or broad dialogue matrix
acceptance is claimed.

The host's targeted checks passed 22 tests / 877 assertions. An encrypted
off-host paired snapshot and exact-identity recovery passed full Doctor with
admission closed and provider keys empty. Recovery is point-in-time evidence,
not a guarantee covering later public traffic. The snapshot was taken at
`2026-10-19T18:51:41.687110Z`.

At the recorded usage observation, 15 Anthropic native receipts had known
price-snapshot cost **USD 0.0071658**. One Gemini retrieval receipt was unpriced;
Source ingestion had no separate native usage receipt or measured token/cost
total. Those costs remain unknown. This is native accounting, not a provider
invoice or an all-in total; subsequent public traffic can advance usage.
There is no daily demo spend cap. Ordinary authorization, accounting,
token/rate limits, kill switch and write-test safeguards remain required.

## Installation and support

Follow [Quickstart](QUICKSTART.md) for a fresh host and the ordered upgrade guide
for an existing installation. Use
`composer require heiner/filament-agentic-chatbot:^1.0` with your purchased
Composer channel. Match your installed version to these notes.

The supported stable line is now `1.0`. Under the [Support policy](SUPPORT_POLICY.md),
`0.20` receives security/critical fixes through `2027-01-17`, 90 days after
actual publication on `2026-10-19`. License and support entitlements are unchanged.
Contact `webdevislife2021@gmail.com` with versions, sanitized steps and logs,
never keys or customer data. [License and refund terms](REFUND_AND_LICENSE.md)
describe the commercial boundary; provider usage and infrastructure are separate.
