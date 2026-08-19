# Compound Requests: 0.17 Migration Notice

The productive Compound Request subsystem was removed in `v0.17.0`. Its bot modes, planner/executor, confirmation records, configuration, and runtime entry path no longer exist. This page remains at the old URL so bookmarks fail safely instead of teaching an unsupported configuration.

## Use the workflow runtime instead

| Former intent | Current supported design |
| --- | --- |
| Several independent read requests in one visitor turn | Publish typed workflow entry routes. The Authorized Entry Turn Plan admits only fully covered independent reads and runs them inside one AgentGraph workflow. |
| Sequential or dependent work | Model the sequence explicitly with workflow nodes and typed variables. |
| Bounded processing of a collection | Use `batchMap`, with a maximum of 100 items and the global workflow step budget. |
| External API read/write | Publish an API Connector v3 operation and bind its exact revision/schema/environment in the workflow. |
| Write or mixed operation | Add an explicit confirmation waitpoint and let the capability gateway own payload binding, idempotency, outcome, and reconciliation. |
| Ambiguous multi-intent request | Ask a typed clarification; do not execute the apparently safe subset. |

## Upgrade steps

1. Back up the database and use a maintenance window.
2. Run the 0.17 migrations; they intentionally retire live pointers containing removed `compoundRequest`, `apiConnector`, or `loop` runtime nodes.
3. Open every retired workflow and model the intent through current schema-v2 authoring and connector v3 contracts.
4. Replace collection loops with bounded `batchMap`.
5. Validate, run saved quality scenarios, publish a new immutable deployment, and make it live explicitly.
6. Run Doctor and verify a real chat plus the resulting workflow run/trace before reopening traffic.

Do not copy old configuration keys or restore retired database rows. Historical 0.16 behavior remains documented only in its versioned release notes and changelog.

See [Upgrade Guide](UPGRADING.md), [Agentic Workflows](AGENTIC_WORKFLOWS.md), [API Connectors](API_CONNECTORS.md), and [Release Notes v0.17.0](RELEASE_NOTES_v0.17.0.md).
