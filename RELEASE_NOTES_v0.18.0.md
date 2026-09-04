# Filament Agentic Chatbot 0.18.0

**Release status:** Approved<br>
**Release date:** 2026-09-04<br>
**Upgrade baseline:** 0.17.5<br>
**Previous-line security/critical EOL:** 2026-12-03

Version 0.18.0 improves the two interfaces customers and operators touch most often: the public Widget and the visual Playbook Builder. It also adds a safe inspection path for published Playbooks.

## Structured Widget conversation starters

Administrators can configure up to four starters with a short visible label, the exact prompt sent to the Agent, and an optional allowlisted icon. The Widget keeps these as native buttons and submits them through the normal conversation path. The empty-state hint, avatar treatment, themes, composer states, responsive layout, and preview now use the same normalized configuration. A closed Widget is inert and hidden from the accessibility tree; closing it by keyboard or button returns focus to the launcher.

Existing saved Bot configurations containing `quick_prompts` remain readable. The Filament form hydrates them as structured rows and the next save persists `conversation_starters`.

## Read-only Playbook inspection

Authorized operators can open a Playbook in a dedicated read-only viewer. It exposes the process structure and step configuration without rendering mutation controls or creating a second execution path. The existing edit authorization and immutable deployment rules remain unchanged.

## Playbook Builder refinement

The workbench, sidebar, checks panel, header, settings panel, node and edge presentation, responsive docking, and keyboard behavior have been tightened for desktop and narrow layouts. Shipped editor assets are rebuilt from the same source and remain covered by the release asset-diff gate.

## Upgrade requirements

This release has no new database migration, Composer dependency change, Agent recreation requirement, or Playbook deployment ABI change. Existing Agents and Playbooks do not need to be republished solely because of this upgrade.

Two public authoring contracts do change:

- Custom widget clients must consume `conversation_starters` instead of `quick_prompts`.
- Host-defined Solution Kits must use structured starter objects with `label`, `prompt`, and an optional supported `icon`.

The built-in Customer Support and Human Handoff Kit is versioned as `1.1.0`. Existing installed Kit state remains unchanged until an administrator reviews and applies the newer Kit plan.

After updating, clear application caches, refresh Filament assets, run both Doctor commands, and smoke-test the Widget and Playbook viewer in the real host application.

```bash
composer update heiner/filament-agentic-chatbot:^0.18 --with-all-dependencies
php artisan config:clear
php artisan view:clear
php artisan route:clear
php artisan filament:assets
php artisan filament-agentic-chatbot:doctor
php artisan agent-graph:doctor
```
