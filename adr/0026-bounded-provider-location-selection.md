# ADR 0026: Explicit selection from bounded provider search results

- Status: Accepted for the bounded location-selection slice; forecast binding remains open
- Date: 2026-09-21
- Extends ADR 0025 and preserves ADRs 0008, 0009 and 0020
- Follow-up: [ADR 0027](0027-canonical-request-tuples-and-grid-forecasts.md)
  defines the separate request-tuple and forecast-grid boundary.

## Problem

The S5 automatic canonical contract requires a complete unique resolution and
an exactly verified single target selector. Open-Meteo search supplies bounded
GeoNames matches without a query echo or global completeness witness. Its
`/v1/get?id=...` endpoint does supply a unique location ID and WGS84 coordinates.
Rejecting all explicit offers from the search unnecessarily prevents a visitor
from selecting a concrete returned public ID. Treating one returned match as
unique, or generating a provider query echo, would instead invent evidence.

## Decision

A published read-dependency offer may opt into `mode: bounded_selection_v1`.
This is explicit selection only. The source must be a pinned Connector read;
a successful Gateway execution and its intact delivered evidence bind the
actual request to the returned page. A provider query echo is unnecessary for
this mode. Configured result-identity checks still execute normally. The target
must be a pinned Connector read with a public literal string input and required
exact result identity on that input. The value offered is exactly that public
string, not a label mapped to another hidden ID or coordinate.

The mode accepts `collection_complete: false` and `has_more: true`. These describe
the search space, not damaged delivery. Transport/projection truncation,
`complete: false`, `partial: true`, empty, duplicate, nested, hidden, oversized
or over-bound candidates remain ineligible. Existing bounds of 12 candidates
and 86400 seconds maximum apply. Automatic invocation-local dependency
registration ignores these links even for a single complete result. The tool
schema omits their read-proof input and explains the explicit offer route.

The existing question review, exact displayed value, delivery seal, pending
revision, original-source hash, execution/evidence pair, deployment, actor,
conversation, age and Gateway revalidation remain mandatory. Confirmation
approves only the displayed public value. It does not prove global uniqueness
or transfer any other candidate fields. Context conditions remain independently
source-bound; choosing an ID does not erase a conflicting region or country.
There is no new conversation, task, graph, transport or execution owner.

## Provider adapter and publication

`open-meteo/geocoding-v1` is a pure, implementation-hashed response-decoder
strategy. It validates positive integer provider IDs, finite WGS84 coordinates,
country codes and required public name/country/admin1 strings. It renders the
provider ID losslessly as decimal text so the existing public-string offer can
carry it. It preserves the provider's names and coordinates, discards unrelated
fields, rejects malformed/oversized responses and duplicate IDs, and marks
searches as not globally complete. It performs no HTTP calls and synthesizes
neither query echoes nor geographic aliases. Records lacking admin1 are outside
this deliberately narrow profile and fail closed.

The executable profile is
[open-meteo-location-selection-v1.json](../examples/open-meteo-location-selection-v1.json).
Its target verifies the ID and compares supplied ISO country/region context
with the returned `country_code`/`admin1`. The integration currently resolves
locations; it contains no forecast operation. Names remain untrusted provider
data for normal answer/question review, never instructions.

This is an additive versioned opt-in on ABI v9. Existing links and strategy
bindings retain their meaning. Older code rejects the unknown three-field
offer policy; new candidates therefore require this implementation. New
operations pin the decoder key, version and source hash through normal
publication. Any adapter change requires new operation evidence/revisions and
a new Agent candidate; immutable artifacts are never rewritten. Deployment146
has no such pin or link and remains compatible. No global ABI bump is warranted.

## Deliberately unimplemented boundary

[Open-Meteo forecast](https://open-meteo.com/en/docs) accepts coordinate pairs and
reports a model grid cell. Those coordinates do not verify the selected GeoNames
ID. This slice does not weaken S5 to authorize that request. It does not preserve
a search record's coordinates as cross-turn execution authority, nor reject
legitimate provider metadata changes at a later ID lookup by inventing equality.
A subsequent bounded change must bind the complete fresh coordinate pair to the
actual request and represent the grid result separately from the selected place.
It must keep the Gateway and immutable publication boundary. Model/UI acceptance
and public activation wait for that complete weather integration.

## Provider evidence and tests

[Primary geocoding documentation](https://open-meteo.com/en/docs/geocoding-api)
documents bounded search, location IDs, `/v1/get`, WGS84 and administrative fields.
Two real public Workbench/Gateway reads initially returned HTTP 200, without
model calls or credentials. Retained fixtures contain only allowlisted provider
location fields. They include an actual New York, Florida result (4165941),
separate from New York City (5128581). Florida is not categorically invalid;
selecting NYC while retaining Florida is a conflict.

Focused tests cover real-protocol parsing, normal Workbench publication, exact
identity, country/region conflict and correction, bounded explicit choice,
empty and damaged results, untrusted extra instructions, stale/cross-scope and
tampered source evidence, automatic-proof denial and unpinned target rejection.
Existing delivery/revision/sibling and canonical-target regression suites remain
required. The slice result records final counts and isolated host identities.
