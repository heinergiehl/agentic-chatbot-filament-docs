# Filament Agentic Chatbot 0.20.5

**Release status:** Approved<br>
**Release date:** 2026-10-06<br>
**Upgrade baseline:** 0.20.4<br>
**Previous-line security/critical EOL:** 2027-01-02

Version 0.20.5 is a drop-in update of the 0.20 line for the chat widget. It has no migrations, no configuration changes and no panel assets to publish: run `composer update heiner/filament-agentic-chatbot`. The widget script version changes, so browsers load the new widget.

## Conversation starters that use the space

The empty state used to show conversation starters as one narrow column of chips, also in the expanded panel. It now lays them out by its own width (container queries), not by the viewport:

- **Narrow** (below 480 px, the default panel sizes and phones): two-column tiles of equal height with the icon on top, a label of up to two lines and, for grouped starters, the group name as a small caption instead of group headings. The first four show at once; **More suggestions** reveals the rest and **Show fewer** collapses them again.
- **Wide** (480 px and more, for example the expanded panel): every starter at once, one card per group in two columns, with a row per starter and an arrow on hover. **More suggestions** is not needed there. Without groups the starters form one two-column list.

The width decides the `hidden` attribute of each starter as well as the layout, so host pages that force `[hidden]` to `display:none` still show every starter in a wide panel. Browsers without container queries keep the compact chips. The composer's **Suggestions** panel after the first message keeps its chips.

## Motion

Starters fade in one after another when the panel opens. **More suggestions** glides the heading and the visible starters to their new place, fades the revealed starters in and scrolls them into view; **Show fewer** fades the extra starters out first. While the panel expands or collapses, the starters wait and then play in again in the new layout. With reduced motion everything changes at once.

## Upgrade

Follow "Upgrading to v0.20.5" in [UPGRADING](UPGRADING.md). Hosts that override `.frw-conversation-starter` or `.frw-starter-group` styles should check them in a narrow and an expanded panel. Hosts on 0.19.x follow "Upgrading to v0.20.0" first.
