# Filament Agentic Chatbot 0.20.2

**Release status:** Approved<br>
**Release date:** 2026-10-04<br>
**Upgrade baseline:** 0.20.1<br>
**Previous-line security/critical EOL:** 2027-01-02

Version 0.20.2 is a drop-in update of the 0.20 line for the public widget. It has no migrations and no configuration changes: run `composer update heiner/filament-agentic-chatbot`. The widget script version changes with the release, so browsers load the new widget.

## Full-width answers

Answers use the full width of the panel. A sender line above the answer shows the Agent's avatar, name and time ("Support team" for operator replies), once for a run of answers from the same sender; the avatar column beside every answer is gone. In the normal panel size the answer text is about a sixth wider, and nested lists, list paragraphs and quotes take less room, so long answers need less scrolling. Visitor messages keep their right-aligned bubble without an avatar. The layout applies to every style template in light and dark, on phones and in the expanded panel.

## Host page styles

Widget text keeps its own colors and sizes when the host page styles bare elements such as `p`, `li` or `td`. Before, a global rule like `p { color: gray }` on the host page turned answer headings gray and could recolor the tool activity. Host CSS that targeted the removed `.frw-assistant-wrap .frw-avatar` or `.frw-sender-label` elements no longer has an element to style.

## Upgrade

Follow "Upgrading to v0.20.2" in [UPGRADING](UPGRADING.md). Hosts on 0.19.x follow "Upgrading to v0.20.0" first.
