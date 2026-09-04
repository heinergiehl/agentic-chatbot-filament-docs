# Filament Agentic Chatbot 0.17.3

**Release status:** Approved<br>
**Release date:** 2026-09-04<br>
**Upgrade baseline:** 0.16.1<br>
**Previous-line security/critical EOL:** 2026-11-17

Version 0.17.3 fixes Gemini multi-step tool completion for the Agent-first runtime. It updates Laravel AI to `^0.11.2` and AgentGraph to the exact `0.16.2` release.

## Gemini tool completion

Laravel AI now owns the shared multi-step generation loop. Gemini provider continuation state, including thought signatures, is carried into the request after a Knowledge, Data Resource, Connector, or Playbook tool result. This prevents a successful tool call from ending in an empty assistant response solely because the provider's continuation state was lost.

The plugin still owns two bounded Gemini adaptations:

- usage accounting keeps prompt, cache-read, tool-use prompt, completion, and reasoning tokens disjoint; and
- Connector name recovery accepts only one exact semantic suffix after the server-owned operation prefix. Canonical names win, while ambiguous, partial, fuzzy, Playbook, and unrelated names fail closed.

Laravel AI approval decisions are deliberately not admitted as another productive authorization path. AgentGraph interrupts own Playbook approval state, and `CapabilityExecutionGateway` remains the only productive capability boundary.

## Upgrade requirements

There is no new plugin database migration. The dependency update still requires a maintenance window because immutable productive artifacts pin the exact AgentGraph release.

1. Stop queue workers and schedulers and back up both package stores.
2. Update the plugin, Laravel AI, and AgentGraph together.
3. Run migrations and both Doctor commands.
4. Recompile and republish every live Playbook, then publish and test replacement Agent candidates.
5. Activate only the exact candidates that passed persistent candidate tests, then restart workers and verify a real conversation.

```bash
composer update heiner/filament-agentic-chatbot heiner/agent-graph laravel/ai --with-all-dependencies
php artisan migrate --force
php artisan filament-agentic-chatbot:doctor
php artisan agent-graph:doctor
```

Read the complete [upgrade guide](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/UPGRADING.md) before changing a production installation.

## Release scope

All Agent-first capabilities, security boundaries, migration requirements, and buyer-facing behavior introduced in v0.17.0 remain in force. Version 0.17.3 changes no Connector, Data Resource, Playbook, widget, or channel authority contract beyond the exact dependency and provider-loop cutover described above.
