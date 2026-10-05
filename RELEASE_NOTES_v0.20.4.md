# Filament Agentic Chatbot 0.20.4

**Release status:** Approved<br>
**Release date:** 2026-10-05<br>
**Upgrade baseline:** 0.20.3<br>
**Previous-line security/critical EOL:** 2027-01-02

Version 0.20.4 is a drop-in update of the 0.20 line for the Agent editor and the Agent runtime. It has no migrations and no configuration changes: run `composer update heiner/filament-agentic-chatbot`, then `php artisan filament:assets` so the panel serves the changed Agent page stylesheet.

## Read-only Agent view

Admins whose Gates allow viewing Agents (`filament-agentic-chatbot.view-bots`) but not managing them (`filament-agentic-chatbot.manage-bots`) used to get no link from the Agents list and a 403 on the editor. They now open an Agent in a read-only view at `/{panel}/bots/{record}`. It shows the saved draft with all fields disabled: Overview, AI Setup, Knowledge & capabilities, Website (with the embed code), Advanced and Versions, plus the release state and an **Analytics** link.

The view has no save, **Publish**, **Restore**, **Test** or assignment actions, and it leaves out the **Tests** tab and **API key overrides**. Knowledge, API/MCP, data and Playbook rows appear only when the viewer may see that record. The edit page still requires `manage-bots`, and every write checks `manage-bots` on the server, also when a user who could manage the Agent opens the view. Users who can manage the Agent see an **Edit** action there, and the list opens the editor for them.

The Agent panels expose no client-callable record readers. Livewire lets the browser call public component methods, so the Settings, Website, Versions and Tests panels no longer offer public methods that return the Agent record, and the Website panel reads installation hosts only for the Agent it authorized. A browser request cannot read another Agent's hosts past the host query scope.

## Thinking level for Gemini 3 Agents

Gemini 3 models think by default, and thinking tokens are billed as output. An Agent may set `runtime_config.agent.gemini_thinking_level` to `low`, `medium` or `high`. Publication pins the value as `model.gemini_thinking_level` in the immutable deployment, and every Agent request sends it as the Gemini thinking level. Without the key the provider default stays, so existing Agents behave as before.

Publication and the runtime contract validator refuse the key for other drivers, for Gemini models before version 3 and for other values. The editor has no field for it; see [Public API](PUBLIC_API.md).

## Upgrade

Follow "Upgrading to v0.20.4" in [UPGRADING](UPGRADING.md). Hosts on 0.19.x follow "Upgrading to v0.20.0" first.
