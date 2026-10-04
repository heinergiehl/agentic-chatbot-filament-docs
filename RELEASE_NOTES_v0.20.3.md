# Filament Agentic Chatbot 0.20.3

**Release status:** Approved<br>
**Release date:** 2026-10-04<br>
**Upgrade baseline:** 0.20.2<br>
**Previous-line security/critical EOL:** 2027-01-02

Version 0.20.3 is a drop-in update of the 0.20 line for the Playbook editor. It has no migrations and no configuration changes: run `composer update heiner/filament-agentic-chatbot`. The editor script version changes with the release, so browsers load the new editor.

## Confirmation branches on the Canvas

The Canvas view draws the **Approved** and **Declined** branches of an "Ask visitor to confirm" step again. Playbooks store these branches under the runtime names `valid` and `invalid`, while the step card offers handles named Approved and Declined, so the Canvas left both branches unconnected; the List view showed them as Confirmed and Cancelled. The Canvas now uses the same branch aliases as the List view, and AI task branches stored as `success`, `default` or `error` attach to the handles their card shows.

Opening a Playbook or moving its steps on the Canvas keeps the stored branch names, so stored Playbooks and published artifacts stay unchanged. Runtime behavior did not change: published Playbooks already followed these branches.

## Upgrade

Follow "Upgrading to v0.20.3" in [UPGRADING](UPGRADING.md). Hosts on 0.19.x follow "Upgrading to v0.20.0" first.
