# Compatibility and Certification Matrix

Target release: `1.0.0`.<br>
**Release status:** Approved, conditional on required gates and publication.

Selected release `v1.0.0`; intended publication `2026-10-19`. Approval is conditional release authorization, not completed acceptance. The source remains a release candidate until required local gates and publisher finalization pass. Final source and archive certification are pending. The last shipped release remains `0.20.5` until publication.

This guide describes the **1.0 candidate**. It is not a released stable version.
Use the supported ranges below when preparing a candidate host, and read the
limits beside each item. A supported range is not a certification of every
version, provider or deployment.

Historical artifact evidence for `0.20.5` applies to that shipped artifact only.
Its ZIP, host and Golden Path evidence does not certify the candidate dependency
upgrades. The recorded Track C matrix below covers
the stated database versions in one PHP/Laravel environment, without a new
candidate release-artifact or Laravel 12 host certification.

The later development upgrade rehearsal exercised a fresh SQLite install and
a Laravel 12/PostgreSQL upgrade and paired restore with retained 0.20.5 data.
It is recorded in `docs/release/UPGRADE_REHEARSAL_1.0.md`, with its own source,
lock and environment. It does not replace final Laravel 12/13 host acceptance
or certify a new ZIP. Current static UI checks likewise establish their named
screens and layouts, not a completed live FAQ/customer-support golden path.

## Framework and runtime

| Surface | Supported range | Release evidence |
| --- | --- | --- |
| PHP | `8.3+` | The local artifact assurance path uses PHP 8.4; PHP 8.3 remains within the supported Composer range. |
| Laravel | Laravel `12.61.1+` or Laravel `13.12.0+` | Historical artifact assurance installs the same byte-verified ZIP in separate Laravel 12 and 13 hosts; candidate host certification is pending. |
| Filament | `5.10.2+` within Composer's resolved 5.x line | Install constraint checked by the release-contract tests; candidate host/UI certification is separate. |
| Laravel AI | `^1.2.1` | Install constraint and declared provider/model profiles. Live provider/model acceptance is separate. |
| AgentGraph | `0.19.0` | Exact dependency installed transitively. Retained published Workflow fixtures are checked by ContractFormatStabilityTest; an ADR alone is not execution evidence. |
| HTTP stack | Guzzle `^7.15.2` / PSR-7 `^2.13` or Guzzle `^8.0.2` / PSR-7 `^3.0` | Composer dependency constraints, not certification of every resolved combination. |
| Database | MySQL 8.4+, MariaDB 11.4+, PostgreSQL 15+ or SQLite 3.39+ | See the recorded candidate matrix below. The earlier PostgreSQL 16 + pgvector Golden Path belongs to the historical artifact. |
| Alternative vector store | ChromaDB | Supported adapter; not part of the exact-artifact PostgreSQL certification and must be staged by the buyer. |
| Queue | Laravel database, Redis, or SQS-style asynchronous worker | A supervised asynchronous worker is required for production delays, ingestion, and background work. `sync` is not a production Golden Path. |

The Docker/PostgreSQL setup is a reproducible release-validation host, not a requirement that customers deploy with Docker. Buyers may install the package into any host that satisfies the supported Composer, Laravel, Filament, database/vector-store, queue, and extension contracts.

## 1.0 candidate: package databases

Fresh candidate installs use the application's default connection and the
`database` vector backend (W1.3, ADR 0047). Existing installations preserve their
recorded storage through the preflight; `pgvector` and `chroma` remain supported.

Verified on 2026-10-16 on the integrated C1 code
`97c464964096486902b2dea90c3bcf1647b9fa06` with
`composer test:db-matrix -- --require-all`. All five targets and ten phases
completed with zero failures and zero errors. Both MariaDB driver combinations
below are certified for these cases. Counts are **tests / assertions / skipped**:

| Database | Supported range (D6) | Exact tested version | Laravel driver | Matrix phase | Slice on real migrations |
| --- | --- | --- | --- | --- | --- |
| SQLite | `3.39+` | `3.46.0` | `sqlite` | 59 / 244 / 1 | 1,972 / 13,530 / 52 |
| MySQL | `8.4+` | `8.4.11` | `mysql` | 17 / 88 / 1 | 1,972 / 13,464 / 58 |
| MariaDB | `11.4+` | `11.4.13-MariaDB-ubu2404` | `mariadb` | 17 / 87 / 1 | 1,972 / 13,463 / 58 |
| MariaDB | `11.4+` | `11.4.13-MariaDB-ubu2404` | `mysql` | 17 / 88 / 1 | 1,972 / 13,464 / 58 |
| PostgreSQL | `15+` | `15.19`, pgvector `0.8.7` | `pgsql` | 18 / 293 / 0 | 1,972 / 13,656 / 58 |

The matrix phase migrates from scratch per test. The slice selects 211 test
files covering `tests/Unit/V1`, migrations, knowledge, retrieval, Data Resources,
usage, memory, chat outcomes, runtime contracts and side effects, on real
package and AgentGraph migrations. Installation bookkeeping is restored
through its migration after clearing test rows. Side-effect checks cover
same-second renewal, expired, replaced and interrupted leases, stale read
replicas and concurrent primary ownership changes. The merged migrations
000013, 000014, 000015 and 000018 use the portable blueprint and pass these
checks. SQLite App data tool queries remain restricted to `local` and `testing`.

Expected skips are excluded from the evidence: historical migration
characterizations needing the hand-built schema, SQLite trigger fault
injections on other drivers, pgvector cases outside PostgreSQL, and the
MySQL-family repeatable-read snapshot case on SQLite and PostgreSQL. The full
default suite is a separate in-memory SQLite check. The matrix does not certify
the entire suite or throughput on the other engines.
`docs/RELEASE_ASSURANCE.md` records source boundaries, counts, hashes,
environment, Docker images and the diagnostic merge-baseline findings.

SQLite 3.39 was not run and is not certified by this newer SQLite result.
PostgreSQL 17.8 passed the earlier W1.3 matrix tests, separately from this run.
A supported range is not evidence for an untested version. On the `mysql`
driver, both MySQL and MariaDB store package JSON as `LONGTEXT` and use
`VARCHAR(760)` for dependency `node_path`. The `mariadb` driver retains its
byte-preserving JSON alias and `VARCHAR(1024)` on fresh schemas; publication
remains limited to 760 on every driver. Both usage-accounting JSON branches
run in the five-target matrix. `UPGRADING.md` explains the storage changes;
`docs/KNOWN_LIMITATIONS.md` records the remaining limits.

## AI providers

The product UI and Laravel AI integration expose Gemini, OpenAI, Anthropic, xAI, OpenRouter, DeepSeek, Groq, Mistral, Ollama, Azure OpenAI, and OpenAI-compatible chat gateways. Embedding adapters include Gemini, OpenAI, OpenRouter, Mistral, Ollama, Azure OpenAI, Cohere, Jina AI, and Voyage AI.

An available adapter is not a certified provider/model pair. Releases do not certify live provider/model pairs. Before production, run Doctor and the Agent tests with the exact provider, model, region, account policy, and structured-output/tool profile you will use.

## Browser widget and channels

- The public widget requires JavaScript, `fetch`, server-sent events, Web Crypto-capable browsers, a CSP that permits the configured script/API origin, and an exact Allowed hosts entry.
- Production embeds use tokenless bootstrap and short-lived header tokens; query/body token compatibility is disabled by default in production.
- Telegram is available by default; Slack and Mailtrap Email are explicit opt-ins. Historical testing claims for these three providers do not supply attributable receipts for the current installation, so real-provider acceptance remains pending per connection. Mailgun Email is built in but default-off and fails closed until its separate real-provider acceptance is complete. Any enabled channel still depends on buyer-owned provider credentials, webhook configuration, platform policy, private attachment storage, and a staging smoke test.

## What “certified” means

For a release to be called certified, all required local gates must pass for the exact source commit and the exact ZIP hash: source quality and dependency audits, calibrated retrieval with real pgvector, Laravel 12/13 PostgreSQL installs, supported upgrade, migration rollback/re-apply, and the reference-host Golden Path. A skipped or unavailable external credential is reported as untested, never as passed.

The 1.0 policy `release-1.0-risk-focused.v1` also requires targeted authority,
duplicate delivery, worker interruption/recovery and unknown-write evidence,
plus the reviewed dialogue evaluation. A long-duration soak is optional.
**No long-duration soak occurred**. Simulated scheduler or bounded recovery
checks do not certify production concurrency or sustained resource stability.
Final source, lock, archive and public-docs identities remain pending; no final
1.0 certification is claimed here.
