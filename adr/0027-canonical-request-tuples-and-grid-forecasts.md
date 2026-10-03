# ADR 0027: Canonical request tuples and separate forecast grids

- Status: Accepted for the paused S8e candidate; model/UI acceptance remains open
- Date: 2026-09-21
- Extends ADRs 0025 and 0026; preserves ADRs 0008, 0009 and 0020

## Problem

Open-Meteo's verified geocoding lookup provides a public location ID and WGS84
coordinates. Its forecast endpoint accepts coordinates, and returns the selected
weather grid's coordinates. These can differ from the requested location.
Neither copying the geocoding ID into an alleged provider echo nor equating the
two coordinate pairs establishes provider identity. The existing scalar
canonical contract therefore cannot honestly represent this request.

## Decision

A new opt-in `canonical.mode: request_tuple_v1` binds every required target
input to one fresh, intact, flat source record. The target must declare an
implementation-pinned request-bound response decoder. Its `request_binding`
manifest descriptor specifies version `connector_request_tuple.v1`, the complete
input/type map, identity input and identity response path. Every schema input
must be required and linked; additional or optional selectors are rejected.
All links use the same pinned source, domain and freshness policy. The identity
link points to the source's required exact response identity. The other scalar
fields come from that same source record. Collections are outside this mode.

The binder and Gateway require explicit proofs for every tuple field, exact
values and the same evidence ID. Visitor literals and confirmed labels cannot
replace these proofs. Existing deployment, invocation, actor, conversation,
source-turn freshness, truncation and successful execution checks still apply.
Tuple consumption additionally rechecks the persisted evidence and execution
hashes against their admitted in-memory pair. Changing or removing a receipt
after admission prevents dispatch. This does not restore authority from history.

A flat record whose unique ID was verified by the source Gateway needs no
fabricated collection-completeness witness. Explicit partial/incomplete flags
still fail. The original scalar canonical mode retains its single-input and
explicit completeness requirements; bounded search remains explicit selection.

## Dispatch and provider semantics

`ConnectorRequestBoundResponseDecoder` is an opt-in strategy extension resolved
by `ConnectorRequestBoundResults`. The existing capability dispatcher validates
the published contract and final authorized request before transport, disables
redirects, and binds the result after the existing synchronous response path.
The decoder implementation hash also covers that service and dispatcher. Core
strategies and the geocoding decoder retain their existing hashes. There is no
new transport, turn loop, transition owner or direct provider call in the adapter.

The first adapter, `open-meteo/forecast-v1`, admits only HTTPS GET to the public
`api.open-meteo.com/v1/forecast` endpoint, with the exact admitted latitude and
longitude and fixed current-temperature, Celsius, GMT, land-cell and one-day
options. It rejects replacement endpoints, duplicate/multiple coordinates,
extra query selectors, body data, mapping, pagination and async contracts.
It checks both the authoring template and final URL after credential handling.

The result has two explicitly different parts:

- `request_binding` is **local adapter provenance**, labelled
  `adapter_request_binding.v1`: selected public ID, requested coordinates,
  endpoint and fixed selection options. It is attached only after successful
  dispatch and decoding. Provider-supplied fields cannot populate this wrapper.
- `result_kind: grid_forecast`, `grid`, `current`, `current_units` and `time_zone`
  preserve validated forecast facts. The grid is not the geocoded place or an
  observation station. Provider default model selection is stated explicitly.

The scalar result-identity verifier checks the local wrapper's public ID. This
is request provenance, not a claim that Open-Meteo echoed a GeoNames ID. The
coordinate relationship follows the exact transport request and the documented
provider protocol. No proximity threshold, label similarity or grid equality
heuristic is asserted. Arbitrarily incorrect geographic output from a trusted
provider cannot be detected by inventing such a heuristic.

See the [provider forecast documentation](https://open-meteo.com/en/docs) for
grid coordinates and cell/model selection, and the executable
[forecast profile](../examples/open-meteo-forecast-v1.json).

## Publication and rollout

This is an additive opt-in inside unreleased ABI v9. Old code rejects the new
mode/strategy. Agent publication requires the complete tuple; Workbench can use
explicit diagnostic inputs through the same Gateway. New adapters need real
Workbench evidence and immutable revisions before candidate publication. Code
changes to the pinned adapter path require republication. Existing deployments,
revisions and receipts are never rewritten.

S8e publishes only a paused local candidate. Public weather activation, model
routing/answer quality, and widget acceptance remain separate. The active books
deployment remains unchanged. No migration or temporary compatibility bridge is
introduced. Verification and concrete IDs are in the
[S8e result](../archive/plans/runtime-reliability/S8e-result.md).
