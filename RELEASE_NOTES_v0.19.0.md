# Filament Agentic Chatbot 0.19.0

**Release status:** Approved<br>
**Release date:** 2026-09-05<br>
**Upgrade baseline:** 0.18.0<br>
**Previous-line security/critical EOL:** 2026-12-04

Version 0.19.0 improves Playbook authoring, Connector request and response contracts, and runtime handling of incomplete provider results. Approval admits this candidate to local release assurance; availability is determined by the published GitHub Release and its verified archive.

## Playbook editor

The editor uses a compact step finder and one Review panel with repair links. Duplicate reports for the same repair are combined, while equally named steps retain separate targets. Panels respond to the editor's available width and preserve field focus and canvas framing as they dock, collapse, or become drawers.

Forms and verified results have visual field controls. Common processes can start from a small template that remains editable through ordinary steps and undo. Advanced JSON controls appear only for structures that the visual editor cannot represent. Direct process tests and Agent conversation tests are presented separately; release history shows whether the exact published Playbook is included in the live Agent.

Playbook settings distinguish the internal name used in the editor from the title shown to visitors. Rename opens the existing permission-checked details dialog. Save and validation feedback is bound to its own operation, so an earlier timeout cannot erase or fail a later save. A conflicting editor keeps autosave and mutations paused until the current draft is explicitly loaded.

Widget initialization and history requests have a 15-second deadline. Stalled requests show the existing retry action; responses arriving after the deadline cannot replace a newer session or history. This deadline does not apply to productive chat turns or replay writes.

## Connector and runtime corrections

Connector requests support explicit OpenAPI query parameter serialization and preserve response nullability. Unsupported unions and parameter forms produce import diagnostics. Registered authentication strategies may return headers without query parameters.

HTTP destination pinning retains all validated DNS addresses in one cURL resolve entry. An unreachable IPv6 address no longer replaces an available IPv4 address; private-network rejection and proxy restrictions remain in force.

Pagination aggregates approved output fields, retains verified earlier pages when a later response is rejected, and marks page or item limits as partial results. Conflicting page context cannot relabel records from another page.

Terminal provider completion errors remain errors even when accompanied by text. Verified facts and canonical Playbook outcomes survive those failures; unfinished prose and whole-turn retries cannot replace them. Short free-text acknowledgements and side requests do not automatically resume a Playbook waitpoint.

## Required upgrade

This is a breaking minor release. Connector implementation bindings change. Before reopening traffic:

1. Finish or reconcile in-flight external operations under their matching release, and take a verified backup.
2. Install 0.19.0 with its declared dependencies. Test and republish every used Connector operation, including custom request codecs.
3. Select the new operation revisions in dependent Playbooks and publish them, including affected parent Playbooks.
4. Republish the dependent Agent candidates, run their saved release tests, and activate only passing candidates.
5. Refresh Filament assets, run both Doctor commands, and verify the Widget and Playbook with fresh conversations.

Existing releases remain immutable. Do not rewrite their hashes or treat old conversation-bound deployments as upgraded. This release adds no database migration and changes no Composer dependency constraint relative to 0.18.0.

See [Upgrading](UPGRADING.md#0190-connector-contracts-and-editorruntime-corrections), [Compatibility](COMPATIBILITY.md), and [Support Policy](SUPPORT_POLICY.md). The previously announced 0.17 security/critical EOL remains 2026-12-03.
