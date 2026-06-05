# Release Notes: v0.13.1

`v0.13.1` is a documentation release for the current Filament Agentic Chatbot `0.13` line. It does not introduce a new plugin runtime package; it snapshots the public docs, product tour, and launch material after the `v0.13.0` release.

Use this release when you want the documentation state that matches the polished Commercial Early Access presentation, refreshed screenshots, and expanded operator guidance after `v0.13.0`.

## Highlights

- Refreshed the public README product tour and Filament plugin page copy so the docs now follow a clearer flow: bots, sources, conversation review, widget, workflow library, visual editor, focus mode, toolbar and themes, editor sidebars, Quality Lab, handoff inbox, and API connectors.
- Regenerated the full `images/agentic-chatbot` screenshot set from the current demo panel, including the new knowledge-source create flow, a multi-turn conversation review, updated workflow editor canvas zoom, focus mode, toolbar positioning, light/dark mode, and live widget views for desktop and mobile.
- Added focused sidebar screenshots for workflow authoring tabs where the tab itself is the subject: Quality, Generate, Trace, and Releases.
- Expanded knowledge-source documentation with the new create flow, ingestion visibility, API-backed sources, and operator-facing source health details.
- Expanded workflow and AgentGraph documentation around runtime architecture, smart workflow building, prompt templates, JSON schema, quality loops, run tracing, and release operations.
- Expanded API connector, API integration, chat widget, channel, bot, operations, privacy, support, refund/license, data-retention, and known-limitation docs for commercial evaluation.
- Added and updated launch-support material, including upgrade guidance, ship checklist, incident-management blueprint, marketplace readiness notes, and release validation context.
- Improved the screenshot automation script so future captures seed representative demo records, avoid accidental focused inputs, support the local `.localhost` demo host, and produce stable workflow/sidebar/widget captures.

## Product Tour Updates

- **Knowledge Sources:** the create screenshot now shows the first Basics step with bot assignment, source name, source type, and the Next action before any text is selected or content is filled.
- **Conversation Review:** the transcript screenshot now shows a real multi-turn review with user messages, assistant replies, citations, feedback state, and operator actions.
- **Workflow Editor:** canvas screenshots are zoomed in so nodes are readable; focus mode uses the full viewport; the draggable toolbar is shown in both right-aligned and above-canvas positions.
- **Workflow Tabs:** Quality, Generate, Trace, and Releases now use compact sidebar-focused screenshots so the docs explain the tab content without repeating a full editor screenshot each time.
- **Themes:** the editor is shown in both light and dark mode, with dark mode presented as a first-class authoring surface.
- **Widget:** desktop and mobile screenshots show the public widget opened on the live widget section rather than only the launcher.

## Documentation Scope

This release includes documentation updates for:

- bot setup and assistant profile tuning,
- knowledge ingestion, source health, API-fed sources, and retrieval behavior,
- AgentGraph runtime architecture and workflow authoring,
- workflow quality checks, run traces, releases, import/export, and prompt templates,
- API connectors and reusable external service profiles,
- chat widget deployment, signed widget access, theming, and public delivery,
- channels, conversations, handoff, feedback, analytics, and AI usage operations,
- security, privacy, data retention, incident response, support, refunds, and licensing,
- upgrade and ship-checklist material for commercial rollout.

## Notes

- This is a **docs release**. It does not replace the plugin runtime release notes in [RELEASE_NOTES_v0.13.0.md](RELEASE_NOTES_v0.13.0.md).
- For runtime upgrade instructions, continue to use [UPGRADING.md](UPGRADING.md) and the `v0.13.0` release notes.
- The GitHub release archive for this tag is useful when you need stable docs for the current `0.13` line instead of the evolving `main` branch.

## Links

- Full docs entry point: [README.md](README.md)
- Filament plugin page copy: [FILAMENT_PLUGIN_PAGE.md](FILAMENT_PLUGIN_PAGE.md)
- Upgrade guide: [UPGRADING.md](UPGRADING.md)
- Operations guide: [OPERATIONS.md](OPERATIONS.md)
- Workflow docs: [AGENTIC_WORKFLOWS.md](AGENTIC_WORKFLOWS.md)
- Knowledge source docs: [KNOWLEDGE_SOURCES.md](KNOWLEDGE_SOURCES.md)
- Chat widget docs: [CHAT_WIDGET.md](CHAT_WIDGET.md)
- Previous runtime release: [RELEASE_NOTES_v0.13.0.md](RELEASE_NOTES_v0.13.0.md)
