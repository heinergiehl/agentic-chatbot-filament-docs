# Filament Agentic Chatbot 0.17.4

**Release status:** Approved<br>
**Release date:** 2026-09-04<br>
**Upgrade baseline:** 0.16.1<br>
**Previous-line security/critical EOL:** 2026-11-17

Version 0.17.4 improves native structured-tool routing for deployment-pinned Data Resources without widening database access or accepting model-invented aliases.

## Exact Data Resource arguments

Each Data Resource tool now names the exact arguments admitted by its immutable deployment. Current deployments expose `sort_by`; compatible older pins continue to expose `sort_field`. The description also states that a free-form `query`, `order_by`, and other undeclared aliases are not accepted.

If a provider still proposes an undeclared field, the call stops before the capability gateway and before any database query. The result identifies each rejected field and allows only a bounded correction of the same tool call with arguments declared in its schema. Filter values still have to come from the latest visitor message, immutable field, scope, mode, sort, and limit contracts still apply, and guessed values remain rejected.

## Upgrade requirements

There is no new plugin database migration, configuration key, or dependency change. Run both Doctor commands after updating and repeat saved release-candidate tests for every Data Resource route exposed by a live Agent.

```bash
composer update heiner/filament-agentic-chatbot --with-all-dependencies
php artisan filament-agentic-chatbot:doctor
php artisan agent-graph:doctor
```

The `v0.17.3` source tag was not promoted to an immutable GitHub release after its protected native Gemini routing gate rejected an undeclared sort alias. Version 0.17.4 preserves that fail-closed boundary and improves the provider-facing correction contract.

## Release scope

All Agent-first capabilities, security boundaries, dependency requirements, and migration requirements from v0.17.3 remain in force. This patch changes only provider guidance and the non-executing error response for undeclared Data Resource arguments.
