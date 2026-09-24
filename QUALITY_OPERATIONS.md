# Quality Operations

Quality Operations turns the existing Quality Tests into a continuous, auditable improvement loop without adding another runtime or provider path.

## Automated Published Agent tests

Open **Improve > Quality Tests**, edit a **Published Agent** test, enable automation, and choose its cadence. The package scheduler claims due scenarios every five minutes and dispatches one queued job per claim. Each job runs the existing `AgentQualityConversationRunner`, so it crosses the persistent chat path and retains the same deployment hash, conversation-turn checks, route evidence, retrieved source cards, zero-write assertions, latency, token, and cost evidence as a manual run.

Automation is unavailable for Playbook drafts and archived tests. A claim token prevents overlapping dispatch. Stale claims are recoverable after the configured lease; unsuccessful dispatches and runs retain a bounded error code and failure count. The next due time advances only through the claim owner.

No separate AI credential is requested or stored. The run uses the Agent's existing provider and model resolution: a configured per-Agent key takes precedence, otherwise the centrally configured app provider key is used.

## Candidate-versus-live release evidence

For an active **Published Agent** scenario, publish a release candidate and choose **Compare candidate**. The Quality Tests page runs the saved conversation twice in separate server-attested no-write sessions: once against the exact live deployment when one exists, and once against the exact candidate. Each run is bound to its deployment ID, immutable deployment hash, scenario fingerprint, role, and a shared comparison UUID. Candidate-only capabilities and pinned Playbooks are available when authoring the scenario, while a live deployment that lacks a newly introduced target fails that baseline deterministically.

The review card reports a deterministic verdict (`no_regression`, `improved`, `regressed`, `still_failing`, `candidate_passed`, `candidate_failed`, or `inconclusive`), score/latency/cost deltas, and newly introduced versus resolved failed checks. It does not ask a model to judge whether another model was correct. A changed Agent draft, candidate pointer, deployment hash, scenario contract, incomplete turn set, unknown external outcome, or mismatched comparison binding makes the evidence stale or inconclusive.

Enable **Require candidate pass before activation** only for release-critical scenarios. Candidate activation then retains the normal signed representative-turn and capability-manifest requirements and additionally requires the latest complete passing candidate run for every enabled scenario, bound to the exact candidate and current scenario fingerprint. Archived scenarios do not gate activation. Knowledge-gap regressions enable this candidate gate automatically; resolving the gap still separately requires a passing run against the current live Agent and an active Knowledge Source.

For responses that may use different valid wording, **Must contain one phrase
from each group** accepts several phrases per required idea. The contract
stores `response.contains_one_of_each` as a list of
`{"alternatives":["Preis","price","pricing"]}` objects. Each group needs
one case-insensitive match; all groups must match. `contains` still requires
every listed literal, and `excludes` still rejects every listed literal.
Changing these checks changes the scenario fingerprint, so the next candidate
needs a fresh run. Phrase checks are bounded examples; review the saved answer
for unsupported claims and source attribution before treating a scenario as
complete customer acceptance.

## Direct-read response regressions and diagnostics

The v2 candidate uses native assistant text. It does not require Claims JSON, a
closed direct-read selection document, or a second general answer reviewer.
Tool input admission, authorization, result shape, source delivery, status, and
the canonical turn commit remain deterministic.

A routing case requires the exact set of deployment-pinned choices. The grader
compares committed capability executions, successful or failed result codes,
Knowledge retrieval delivery, Playbook run state, and the canonical answer. A
Decision label is diagnostic only. A typed Connector input clarification may be
expected alongside independent successful reads. Incomplete, truncated,
unknown, or unexpected executions cannot become a passing release check through
an answer marker.

Retrieved source cards come only from execution-matched material delivered to
the Agent. API and Data Resource cards may have no URL. The same committed cards
appear in JSON, SSE completion, turn status, and history; the widget labels
them as retrieved sources. Inline citation count records valid numbered markers
only. Neither a card nor a marker proves that every sentence is correct.
Operation status comes from the Gateway, Graph, and turn ledger.

Release checks fail closed on degraded turns, provider errors, retryable or
non-completed results, failed capability executions, and partial or truncated
read evidence. Old Claim coverage markers do not turn a partial read into a
complete result. User-answer quality is assessed separately against the task
and delivered facts. The frozen v2 case set and offline contract grader are in
evals/runtime-dialogue-v2; they require an independent human answer review
for a full pass. The N04 candidate has no live dialogue or widget acceptance
until N05 records the prescribed attempts.

## Production acceptance for mixed requests

Record the exact package commit, host configuration, deployment hash, provider,
model and effective context budget for each acceptance run. A passing unit suite
proves its exercised contracts; production answer quality also needs real
conversations against the integrations and model customers will use.

| Boundary | Required evidence |
| --- | --- |
| Request coverage | Every requested concern has a verified result, a useful source-specific question, or an accurate limitation in the same turn. A successful sibling lookup cannot hide an omitted concern. |
| Input recovery | Missing values, invalid identifiers, corrected values, negation and changed scope retain only verified context. Completed independent work is not dispatched again. |
| Result fidelity | Displayed values match the correct call and record, including dates, units, currency direction and regional scope. An HTTP success alone is insufficient. |
| Failure handling | Local rejection, provider validation, no matches, missing resources, authentication, rate limits, timeout and incompatible responses remain distinct. Exercise controlled faults deterministically. |
| Execution safety | Tenant and actor scope, write confirmation, duplicate delivery, restart and unknown outcomes retain their existing authorization and reconciliation contracts. Run the relevant release assurance checks before claiming these boundaries certified. |
| Model suitability | Compare identical scenarios, contracts and effective budgets. Record omissions and unnecessary questions separately from software faults, latency and cost. A weak-model failure remains a quality failure. |

Keep a small acceptance set with unrelated integrations and input shapes. The
opt-in `diverse-apis` browser suite adds currency-pair and holiday-year/country
requests, mixed clarification, and provider-rejected input recovery. Its per-turn
checks compare canonical execution inputs and delivered data with visible
answers. It uses independent fixtures and the normal candidate release gates;
it does not change the main widget or certify untested integrations.

Critical customer scenarios should be saved as candidate-gated Quality Tests.
Require passing routing and answer-quality evidence after material runtime,
model, prompt or Connector changes. Keep provider-dependent probes bounded;
use deterministic regression tests for a diagnosed software defect before the
next relevant browser run. The release procedure remains
[Release assurance](RELEASE_ASSURANCE.md).

The bounded [mixed API acceptance record](audits/2026-09-08-diverse-api-runtime-acceptance.md)
separates the observed model failures, fixed rendering defect and remaining
runtime work. Its live conversation quality checks are not all passing.

## Verified knowledge-gap detection

The detector never treats “no citation” alone as a knowledge gap. A case is created only when all of these durable facts are present:

1. The Chat Turn has a canonical committed `completed` outcome.
2. Redacted operator evidence records `knowledge_searched=true`.
3. The deterministic Agent decision is `safe_capability_fallback`.
4. The canonical assistant message contains no sources.
5. The conversation is not a server-attested admin live test.

Questions are normalized only for grouping volatile URLs, emails, UUIDs, and long numbers. The displayed excerpt is encrypted at rest. One immutable occurrence is linked to each qualifying Chat Turn, and a database uniqueness constraint prevents replay duplication.

## Operator resolution workflow

In an Agent's **Analytics > Knowledge** tab:

1. Review the sampled conversation.
2. Mark the gap in progress.
3. Create the idempotent Published Agent regression. Its contract requires a completed answer, Knowledge-search routing, a citation, and zero writes, and automatically becomes a candidate-activation gate.
4. Add or repair the Knowledge Source and complete ingestion so it has an active generation.
5. Run the linked scenario against the current live Agent deployment.
6. Choose **Verify resolved**, select the completed source, and record operator evidence.

Resolution fails closed if the source belongs to another Agent, has no active generation, the linked scenario is missing, or its latest complete run is stale or failing. The exact Knowledge Source, quality run, operator identity, encrypted note, and time are retained. A later qualifying occurrence automatically reopens a resolved gap and clears stale resolution evidence while preserving the regression scenario for rerun.

Deleting or soft-deleting the Knowledge Source, deleting the passing run, or deleting the linked regression also invalidates the proof immediately. The gap reopens and clears the stale source/run/operator evidence; it keeps the linked regression when that scenario still exists so the operator can repair knowledge and rerun it. An ignored decision remains ignored when its optional regression is deleted.

Ignoring a case also requires a verified operator identity and an encrypted reason. It remains auditable and can be reopened.

## Scheduler and queue

The package registers both sweeps every five minutes:

```bash
php artisan filament-agentic-chatbot:run-due-quality-scenarios
php artisan filament-agentic-chatbot:collect-knowledge-gaps
```

Run Laravel Scheduler and an asynchronous queue worker under process supervision. Configure the queue's `retry_after` or visibility timeout above the 900-second job timeout, and keep the claim-stale lease above both. Use `--dry-run`, `--scenario`, `--bot`, and `--limit` for incident diagnosis without broad mutation. Invalid selectors fail with exit code 2 instead of broadening to every Agent or scenario. If the quality queue is stopped, due scenarios remain claimable; if a worker is lost after claim, the stale-claim lease permits safe redispatch.

Relevant settings are under `filament-agentic-chatbot.quality_operations` and use the `AGENTIC_CHATBOT_` environment prefix. Keep the claim-stale interval longer than the quality job timeout and monitor repeated `automation_failure_count`, `automation_last_error_code`, old due times, and growing open-gap counts.

## Privacy and retention

Question excerpts and operator notes are encrypted through Laravel's application key. Runtime evidence stores identifiers, status codes, hashes, and bounded redacted routing facts—not provider prompts, credentials, connector payloads, or full model responses. Conversation deletion follows the existing privacy guard; nullable sample references detach cleanly while the host can retain the operational gap ledger under its documented retention policy.
