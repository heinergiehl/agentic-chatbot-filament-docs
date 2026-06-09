# Release Notes: v0.15.0

`v0.15.0` is the current Commercial Early Access line for Filament Agentic Chatbot. It is a polish and release-hardening update after `v0.14.0`, with a special focus on safer live database answers, clearer launch readiness, and a stronger widget preview path.

The plugin is still a young commercial product. It is already useful for Laravel and Filament teams that want to own their AI assistant control plane, but production installs should still use staging, queues, provider checks, quality scenarios, and normal release review before public traffic.

## Highlights

- **Guided Data Resources**: admins can define approved live Eloquent reads from Filament, choose models and fields, set return/filter/sort policy, configure limits, add aliases, and sync code-reviewed defaults when needed.
- **Safer live data answers**: Data Resources no longer behave like broad database exposure. Bots approve only the resources they may use, and bot-level policy can narrow the global resource contract.
- **Better widget preview**: the bot editor makes it easier to inspect theme, copy, area overrides, launcher behavior, and Markdown-style answer rendering before copying the embed snippet.
- **Sharper launch readiness**: bot setup, channel setup, Data Resources, dashboard previews, diagnostics, and release checks now communicate rollout state more clearly.
- **Release gate hardening**: the marketplace readiness command covers Composer validation, platform checks, static analysis, dead-code checks, workflow-editor checks, Pint, PHPUnit, PHPStan, and Composer audit.

## Upgrade From v0.14.0

1. Update the package constraint to `^0.15.0` or to the exact marketplace version you receive.
2. Run `composer update heiner/filament-agentic-chatbot --with-dependencies`.
3. Run `php artisan migrate`.
4. If Filament assets are cached in deployment, run `php artisan filament:assets`.
5. Clear caches: `php artisan config:clear && php artisan route:clear && php artisan view:clear`.
6. Run `php artisan filament-agentic-chatbot:doctor`.
7. Review Data Resources, bot approvals, workflow Query data steps, channel diagnostics, quality scenarios, and one real widget/API answer in staging.

No special destructive migration step is required for this release, but production installs that use live data answers should verify returned fields, safety scopes, and per-bot approvals before exposing workflows to visitors.

## Documentation Focus

The matching docs snapshot refreshes the Filament plugin page around higher-signal product screenshots:

- live widget preview,
- Data Resource readiness,
- workflow focus canvas,
- workflow dark mode,
- workflow quality checks,
- conversation review,
- public widget experience,
- API connectors and channels.

The main Filament page intentionally avoids table-heavy or empty-state screenshots. Deeper implementation views remain in the GitHub docs and demo panel.

## Links

- Upgrade guide: [UPGRADING.md](UPGRADING.md)
- Known limitations: [KNOWN_LIMITATIONS.md](KNOWN_LIMITATIONS.md)
- Plugin release: [heinergiehl/filament-agentic-chatbot v0.15.0](https://github.com/heinergiehl/filament-agentic-chatbot/releases/tag/v0.15.0)
- Previous docs snapshot: [v0.13.1](https://github.com/heinergiehl/agentic-chatbot-filament-docs/releases/tag/v0.13.1)
