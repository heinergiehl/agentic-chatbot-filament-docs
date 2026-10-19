# Support and Version Policy

Commercial support helps you install, configure and operate the plugin in your Laravel/Filament application within your purchase entitlement. Selected release `v1.0.0`; intended publication `2026-10-19`. Approval is conditional release authorization, not completed acceptance. The source remains a release candidate until required local gates and publisher finalization pass. Final source and archive certification are pending. The last shipped release remains `0.20.5` until publication. Existing entitlements are unchanged.

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
[Upgrading to 1.0](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/UPGRADING.md#upgrading-to-10) before evaluating the candidate
with existing data. Back up and rehearse the procedure in staging first.

Historical policy for the shipped `0.20` line: patch releases are intended as
compatible defect/security fixes; a new minor line may contain documented
breaking changes. A candidate is not a stable support line. Security fixes may
remove an unsafe path without a normal deprecation window. No compatibility
bridge is promised unless the applicable release notes explicitly name it.

## Supported lines and EOL

- Current shipped support line before publication: `0.20`. On stable `1.0.0` publication, `1.0` becomes the current supported line.
- Conditional successor transition: `0.20` security/critical EOL: `2027-01-17`, based on intended stable publication on `2026-10-19`. This date takes effect only with that publication.
- Previous line: `0.19` security/critical EOL: `2027-01-02`.
- The previously announced `0.18` security/critical EOL remains `2026-12-04` and the `0.17` EOL remains `2026-12-03`.
- The current minor receives supported defect and security fixes. The immediately previous minor receives critical/security fixes for 90 days after its successor is released; other fixes require upgrading.
- Older minors and prereleases are EOL. They may continue to run, but no fix, compatibility, or security claim is made.
- A future successor's release notes must publish the resulting EOL date. Material EOL changes require at least 60 days' notice unless an urgent security or upstream compatibility issue makes continued support unsafe.

The `0.20` line's 90-day security/critical transition starts on actual stable
publication. If publication moves from `2026-10-19`, recalculate its EOL and
refresh the canonical mirror and pin before freezing the replacement source.
Candidate evaluation and conditional approval do not start the support clock.

Support lifetime does not extend marketplace access, downloads, or updates beyond the entitlement in the purchase record. Customers may keep using versions already licensed under the applicable order and commercial license.

## Supported runtime

The authoritative install and certification ranges are in [Compatibility and Certification Matrix](COMPATIBILITY.md). The candidate requires PHP 8.3+, Laravel 12.61.1+ or 13.12.0+, Filament 5.10.2+ within 5.x, a supported database, persistent queue, scheduler and shared cache. Production App data tools require a supported server database; SQLite queries are limited to local/testing. Third-party providers, models, SDKs, browsers, Telegram, Slack, Mailtrap, Mailgun, ChromaDB, and host infrastructure remain subject to their own behavior and must be staged with the buyer's exact configuration.
