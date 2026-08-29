# Support and Version Policy

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

## SemVer before 1.0

- Patch releases (`0.17.x`) are intended to be backward compatible defect and security fixes for the same minor line.
- Minor releases (`0.x.0`) may contain breaking runtime, configuration, schema, or public-API changes. Every breaking change must be in `CHANGELOG.md`, `UPGRADING.md`, and the versioned release notes.
- Deprecated productive paths are not kept indefinitely. A deprecation period is provided only when the release notes explicitly name it.
- Security fixes may remove an unsafe path without a normal deprecation window.

## Supported lines and EOL

- Current target line: `0.17` (candidate until the protected release contract is approved).
- Previous line: `0.16` security/critical EOL: `2026-11-17`.
- The current minor receives supported defect and security fixes. The immediately previous minor receives critical/security fixes for 90 days after its successor is released; other fixes require upgrading.
- Older minors and prereleases are EOL. They may continue to run, but no fix, compatibility, or security claim is made.
- A future successor's release notes must publish the resulting EOL date. Material EOL changes require at least 60 days' notice unless an urgent security or upstream compatibility issue makes continued support unsafe.

Support lifetime does not extend marketplace access, downloads, or updates beyond the entitlement in the purchase record. Customers may keep using versions already licensed under the applicable order and commercial license.

## Supported runtime

The authoritative install and certification ranges are in [Compatibility and Certification Matrix](COMPATIBILITY.md). In short: PHP 8.3+, Laravel 12.61.1+ or 13.12.0+, Filament 5.2+, and a production-capable vector store/queue. Third-party providers, models, SDKs, browsers, Telegram, Slack, WhatsApp, Mailtrap, Mailgun, ChromaDB, and host infrastructure remain subject to their own behavior and must be staged with the buyer's exact configuration.
