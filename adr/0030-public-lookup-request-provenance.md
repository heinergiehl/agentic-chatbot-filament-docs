# ADR 0030: Public lookup request provenance and native admission feedback

Status: Accepted for the authorized local dialogue-v2 correction, 2026-09-25.

## Evidence

The N05 candidate discarded native questions following typed argument rejection.
Its published language list excluded Spanish despite Spanish acceptance cases.
The holiday output omitted `types`, making a nationwide bank closure appear to
be a general public holiday. Wttr returns the nearby area Saint-Merri for Paris;
its nearby-area name is not an exact city identity echo. These are distinct
software, publication and source-contract defects, not evidence that every
failure can be solved by changing the model.

## Decision

1. A completed native text answer after a typed, nonexecuted admission rejection
   remains valid conversation. Rejection diagnostics and absence of execution
   evidence remain intact. Failed SDK tools, unfinished provider proposals,
   empty output and other abnormal finishes retain their technical errors.
   No prose grants execution, changes a pending revision or satisfies routing
   evidence. This implements ADR 0029 without a general answer reviewer.
2. Public search strings use the published field's schema bounds, within the
   existing 160-character upper bound. One- and two-character queries are valid
   when the schema permits them. Credential fields, sensitive target binding,
   literal fields and canonical dependencies retain their existing restrictions.
3. Add `connector_request_value.v1` alongside ADR 0027's canonical tuple. This
   is restricted to one exact, visitor-source-bound string on a public read,
   with no incoming dependency links. Its pinned response adapter must validate
   the complete request and attach local request provenance after decoding.
   It cannot be substituted for canonical coordinate or entity-selection tuples.
4. The Wttr adapter fixes HTTPS host, method, path and query; validates bounded
   nearby-place coordinates and dated Celsius forecasts; drops arbitrary remote
   fields; and attaches the admitted city itself. The result explicitly says
   `provider_selected_nearby_forecast`. Local request provenance is not a provider
   city echo or a claim that a district equals a city. Published country/region
   conditions still check the actual provider area. This resource is unsuitable
   for an application requiring independently verified exact place identity.
5. The public-holiday resource uses a pinned Nager decoder to select only records
   explicitly carrying `Public`. It retains category, geographic applicability
   and date together, rejects malformed scope and omits unrelated remote fields.
   Nationwide and regional records are returned in separate named collections;
   a regional record is never promoted to nationwide applicability.
   `Bank` alone and `Observance` are excluded from this resource's purpose.
   This is provider decoding, not a conversational classifier. Repeated per-cell
   presentation metadata is omitted to keep the complete list within context.
   Books publish an interpreted
   public query and the real three-record result window; no exhaustive catalogue
   claim follows. Supported response languages must include the tested languages.
   General catalogue queries use `*:*` with a stable key sort; the guided book
   Playbook must explicitly repin its operation revision through normal publication.

Runtime ABI v16 requires new Agent publication. Existing deployments, receipts,
Graph waits and unknown outcomes are not rewritten. The canonical request-tuple
contract, Gateway authority and exact-candidate activation gates are unchanged.

## Verification

`WttrForecastTest` exercises normal publication and the real Workbench/Gateway
with deterministic HTTP fixtures, including nearby place preservation, injected
request metadata, malformed values, changed paths, foreign endpoints and outage.
It rejects dependency links, interpreted targets, identity substitution and
writes for the new single-value binding. Existing Open-Meteo tuple tests prove
that its stronger source-receipt and coordinate-binding rules remain intact.
Native completion, connector continuation and public-query tests cover the
other changed boundaries. Live acceptance is recorded separately; this ADR
does not declare a model or candidate accepted.

`NagerPublicHolidayDecoderTest` checks mixed Public/Bank categories, bank-only
and observance exclusion, preservation of regional scope, injected extra fields,
invalid calendar dates, missing categories and malformed subdivisions.
