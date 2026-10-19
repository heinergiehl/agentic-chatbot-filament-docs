# Support and Version Policy

Commercial support helps you install, configure and operate the plugin in your Laravel/Filament application within your purchase entitlement. Published `v1.0.0` on `2026-10-19` at `17:40:33 UTC`. The verified [GitHub v1.0.0 Release](https://github.com/heinergiehl/filament-agentic-chatbot/releases/tag/v1.0.0) is the publication authority; approval metadata alone does not establish publication. See the [published source and archive identity](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/RELEASE_NOTES_v1.0.0.md#published-artifact). Existing entitlements are unchanged.

## Contact and hours

- Primary support: `webdevislife2021@gmail.com`
- Public documentation: `https://github.com/heinergiehl/agentic-chatbot-filament-docs`
- Security reports: send privately to the primary support address; do not include credentials, raw customer conversations, or production tokens
- Business hours: Monday-Friday, 09:00-17:00 Europe/Berlin, excluding German public holidays

## Included support

For customers with an active support/update entitlement, support covers installation and upgrades on the supported matrix, configuration of providers/queues/ingestion/widget embedding, reproducible defect triage, security intake, and documented workarounds.

Support does not include custom feature development, host or provider infrastructure operation, prompt/content authoring, migration of unrelated application code, data recovery, legal/compliance advice, or implementation services unless separately contracted.

## Response targets

These are first-response targets during business hours, not resolution guarantees or service credits unless a written agreement says otherwise:

| Severity | Definition | First-response target |
| --- | --- | --- |
| Critical | Supported production is unavailable, a credible security incident exists, or the chat API is unusable with no workaround | 4 business hours |
| High | Major supported functionality is broken with no reasonable workaround | 1 business day |
| Standard | Partial degradation, configuration question, documentation issue, or defect with workaround | 2 business days |

Priority depends on a reproducible report containing plugin version, Laravel/Filament/PHP versions, database/vector backend, queue driver, provider/model, exact steps, expected/actual result, and sanitized logs. Never send API keys, bearer tokens, full conversation exports, or customer personal data.

## Version and upgrade policy

Breaking runtime, configuration, schema and public API changes are documented
in the changelog, upgrade guide and versioned release notes. Read
[Upgrading to 1.0](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/UPGRADING.md#upgrading-to-10) before upgrading
existing data. Back up and rehearse the procedure in staging first.

Historical policy for the shipped `0.20` line: patch releases are intended as
compatible defect/security fixes; a new minor line may contain documented
breaking changes. A candidate is not a stable support line. Security fixes may
remove an unsafe path without a normal deprecation window. No compatibility
bridge is promised unless the applicable release notes explicitly name it.

## Supported lines and EOL

- Current supported stable line: `1.0`, published as `v1.0.0` on `2026-10-19`.
- Previous line: `0.20` security/critical EOL: `2027-01-17`, 90 days after actual stable publication.
- Previous line: `0.19` security/critical EOL: `2027-01-02`.
- The previously announced `0.18` security/critical EOL remains `2026-12-04` and the `0.17` EOL remains `2026-12-03`.
- The current minor receives supported defect and security fixes. The immediately previous minor receives critical/security fixes for 90 days after its successor is released; other fixes require upgrading.
- Older minors and prereleases are EOL. They may continue to run, but no fix, compatibility, or security claim is made.
- A future successor's release notes must publish the resulting EOL date. Material EOL changes require at least 60 days' notice unless an urgent security or upstream compatibility issue makes continued support unsafe.

The `0.20` line's 90-day security/critical transition began on actual stable
publication, `2026-10-19`. Candidate evaluation and conditional approval alone
did not start the support clock.

Support lifetime does not extend marketplace access, downloads, or updates beyond the entitlement in the purchase record. Customers may keep using versions already licensed under the applicable order and commercial license.

## Supported runtime

The authoritative install and certification ranges are in [Compatibility and Certification Matrix](COMPATIBILITY.md). The 1.0 release requires PHP 8.3+, Laravel 12.61.1+ or 13.12.0+, Filament 5.10.2+ within 5.x, a supported database, persistent queue, scheduler and shared cache. Production App data tools require a supported server database; SQLite queries are limited to local/testing. Third-party providers, models, SDKs, browsers, Telegram, Slack, Mailtrap, Mailgun, ChromaDB, and host infrastructure remain subject to their own behavior and must be staged with the buyer's exact configuration.
