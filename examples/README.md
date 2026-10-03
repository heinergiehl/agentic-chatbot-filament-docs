# Playbook examples

These examples use the only editable Playbook format: semantic
`schemaVersion: 2` documents with `steps` and `transitions`. Compiled Runtime
v1 graphs are immutable internal artifacts and cannot be imported into the
editor.

## Import

1. Open an Agent's optional Playbook.
2. Choose **Import** in the Playbook Builder.
3. Paste or upload one of the JSON documents below.
4. Review dependencies and approvals, save the draft, then publish it.

| File | Purpose |
| --- | --- |
| [Collect contact](authoring-v2/01-collect-contact.json) | Typed Request Input followed by a bounded Result. |
| [Approved lead save](authoring-v2/02-approved-lead-save.json) | Explicit Approval, a declared write Capability, and separate success/decline Results. |

The Agent owns natural conversation, knowledge questions, and final wording.
Use a Playbook only for a bounded process with explicit inputs, deterministic
branches, capabilities, approvals, waits, or structured results.

## Vertical blueprint

The [Incident Management example](incident-management/README.md) contains
host-app models, migrations, seed data, Data Resource definitions, and a
semantic Playbook that combines those resources.

Publication resolves every referenced action, API operation, Data Resource,
and child Playbook into the immutable deployment closure. Example JSON never
grants execution authority by itself.
