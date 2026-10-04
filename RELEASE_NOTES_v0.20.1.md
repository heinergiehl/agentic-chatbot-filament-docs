# Filament Agentic Chatbot 0.20.1

**Release status:** Approved<br>
**Release date:** 2026-10-04<br>
**Upgrade baseline:** 0.20.0<br>
**Previous-line security/critical EOL:** 2027-01-02

Version 0.20.1 is a drop-in update of the 0.20 line for the public widget. It has no migrations and no configuration changes: run `composer update heiner/filament-agentic-chatbot`. The widget script version changes with the release, so browsers load the new widget.

## Streaming answers

Streamed answers flow evenly instead of arriving in bursts. The widget reveals the received draft at a pace that follows the backlog and trails the stream by about a quarter second.

Markdown answers render as Markdown while they stream, with the rules of the committed HTML: lists (also nested and numbered from any start), code blocks (also inside list items), aligned tables, quotes and headings show as they will stay, and raw HTML and images are left out as on the server. Unfinished emphasis and code show in their final form and a link shows as its label until its target is complete, so raw Markdown syntax never appears. The committed answer replaces the preview without a visible jump, and a pulsing caret marks the end of the text while it is written. Long answers stream as smoothly as short ones.

## Elapsed time

Until the first words arrive, the status line shows how long the Agent has been working, from the third second on, for example "Thinking… · 7s", in the widget language.

## Expandable panel

On screens wider than 640 px, **Expand chat** in the widget header turns the panel into a tall panel above the launcher (`clamp(560px, 46vw, 760px)` wide) for long answers, tables and forms. **Collapse chat** or Escape restores it, and the choice is remembered per Agent and area in the visitor's browser. Phones keep the full-screen sheet.

- Hide the button with `data-expandable="false"` on the script tag, `:expandable="false"` on the Blade component or the SDK option `expandable: false`.
- Change the width with the CSS custom property `--fac-expanded-width`.

## Upgrade

Follow "Upgrading to v0.20.1" in [UPGRADING](UPGRADING.md). Hosts on 0.19.x follow "Upgrading to v0.20.0" first.
