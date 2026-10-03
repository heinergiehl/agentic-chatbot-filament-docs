# Solution Kits

Solution Kits are versioned, app-aware starting points for common Agent jobs. A
Kit installs a coherent Agent profile, one or more Playbook drafts, optional
Agent tests, widget copy, optional mappings to existing app reads, and
measurable outcome goals.

They are deliberately not live runtime templates. Installation creates
authoring state only; the normal immutable Playbook and Agent publishing stay
authoritative.

## Built-in Customer Support Kit

The first built-in Kit is **Customer Support & Human Handoff**. It creates:

- an inactive bilingual support Agent with explicit non-invention and
  least-data boundaries;
- optional mappings to customer/account and order/subscription Data Resources;
- optional mappings to published, global, unowned read-only API operations;
- a Human handoff Playbook that collects a validated reason and contact email,
  asks for explicit visitor approval, then creates one operator handoff;
- two Agent tests: "I need help from a person." must call the Human handoff
  Playbook tool, and "What can you help me with?" must not call it; each turn
  also has a short rubric; and
- `resolved` and `handoff` outcome goals for later Analytics evidence.

The Kit never embeds credentials. Connector secrets remain in their existing
server-owned Connector configuration.

## Install A Kit

1. Open **Agentic Chatbot > Build > Agents**.
2. Choose **Use Solution Kit**.
3. Select the Kit and name the Agent.
4. Select a model with verified developer-instruction and tool-calling support.
5. Optionally map existing Data Resources and published read-only API
   operations.
6. Add at least one allowed website domain.
7. For a write-capable Kit, explicitly approve its controlled write boundary.
8. Review the exact draft assets and choose **Install Solution Kit**.

The installation is one database transaction. A retry by the same authenticated
operator with the same hidden idempotency identity returns the original
installation. Reusing that identity for different input or across operator
boundaries fails closed. A late persistence failure rolls back every Agent,
Playbook, Agent test, and audit record created by the attempt.

## What Installation Does Not Do

Installation does not:

- activate the Agent;
- publish a Playbook or Agent deployment;
- assign an unpublished Playbook to Agent authority;
- call an external API;
- execute a write; or
- bypass host Filament authorization.

The operator must be authorized to create Agents and Playbooks. Agent tests are
part of editing the Agent (the Tests tab of the Agent editor), so the installer
also requires the right to edit the new Agent before it creates the Kit's
tests; a denial rolls back the whole installation. Production Gate mode
therefore applies to the Kit wizard in exactly the same way as it applies to
the individual resources.

## Guided Release Path

After installation, the Agent Overview shows a Kit-specific release path:

1. verify the immutable installation ledger still points to all installed
   Playbooks;
2. publish the Playbook as a verified immutable deployment;
3. assign that published Playbook under the Agent's tools;
4. publish the Agent so its live version contains every installed Playbook;
   and
5. enable public Agent traffic only after the normal channel/embed checks pass.

Beside these steps, an **Agent tests** item shows the results of the Agent's
tests on the saved draft (for example "0 of 2 tests passed. 2 not run on the
saved draft.") and links to the Tests tab of the Agent editor. Tests warn and
never block publishing, so this item is never the next required step. A test
result counts only for the draft and test it ran with; changing either shows
the test as outdated. The Kit's tests are ordinary Agent tests: operators may
edit or delete them without breaking the installation.

Publishing a Playbook does not update an already live Agent version. These are
intentional release boundaries, not extra wizard steps that can be automated
away.

## App-aware Mapping Rules

Data Resource slots can select only resources already present in the host's
approved Data Resource registry. Connector slots can select only operations
that are:

- visible to the current authorized operator;
- attached to a global Connector rather than an Agent-specific Connector;
- unowned rather than actor- or tenant-owner scoped;
- active and backed by a published immutable revision;
- read-only; and
- valid under the same Agent Connector capability policy used at publication.

Required slots fail validation when empty. Unknown slot names, inactive
resources, unpublished operations, write operations, over-cap mappings, and
values removed by Agent normalization all fail closed.

## Installation Evidence And Versioning

`agent_solution_kit_installations` stores one immutable row per installed
Agent. It records the Kit key/version, definition hash, normalized request hash,
manifest hash, idempotency hash, actor identity, safe plan projection, and exact
artifact IDs/fingerprints: `playbooks` with each draft fingerprint and `tests`
with each Agent test id and test fingerprint. Raw idempotency keys and
credentials are never stored.

Existing installations are never rewritten when a provider changes a Kit.
Publish a new semantic version for intentional definition changes. Only one
definition may be registered for a key in one application boot; duplicate keys
fail during catalog resolution rather than winning by load order.

## Add A Host-defined Kit

Implement the public `SolutionKitProvider` contract, return strict
`SolutionKitDefinition` objects, then tag the provider with the interface class:

The excerpt shows the registration shape. Replace the Playbook placeholder with
a complete schema-v2 authoring Playbook before registering a real Kit.

```php
<?php

namespace App\Chatbot;

use Heiner\FilamentAgenticChatbot\SolutionKits\Contracts\SolutionKitProvider;
use Heiner\FilamentAgenticChatbot\SolutionKits\SolutionKitDefinition;

final class SalesQualificationKitProvider implements SolutionKitProvider
{
    public function solutionKits(): iterable
    {
        yield new SolutionKitDefinition([
            'key' => 'sales-qualification',
            'version' => '1.0.0',
            'name' => 'Sales Qualification',
            'summary' => 'Qualifies a prospect through a bounded, tested Playbook.',
            'description' => 'A host-owned sales starting point.',
            'agent' => [
                'assistant_profile' => [
                    'role' => 'Answer product questions and qualify explicit sales interest.',
                    'audience' => 'Prospective customers.',
                    'answer_length' => 'balanced',
                    'uncertainty' => 'clarify_once',
                    'boundaries' => ['Never invent pricing, availability, or commitments.'],
                ],
                'system_prompt' => null,
                'capability_mode' => 'query_only',
                'requires_write_approval' => false,
                'widget' => ['title' => 'Sales assistant'],
            ],
            'resource_slots' => [],
            'connector_slots' => [],
            'playbooks' => [
                // At least one complete schema-v2 authoring Playbook, for
                // example with the key 'qualify_lead'.
            ],
            'tests' => [[
                'key' => 'qualifies_interested_prospect',
                'name' => 'An interested prospect starts the qualification',
                'turns' => [[
                    'message' => 'We want a demo for 40 users.',
                    'tools_called' => ['playbook:qualify_lead'],
                    'rubric' => 'The answer asks for the details the qualification needs.',
                ]],
            ]],
            'outcomes' => [[
                'key' => 'qualified_lead',
                'label' => 'Qualified lead',
                'classification' => 'success',
                'description' => 'A verified downstream event marked the lead qualified.',
            ]],
        ]);
    }
}
```

```php
use App\Chatbot\SalesQualificationKitProvider;
use Heiner\FilamentAgenticChatbot\SolutionKits\Contracts\SolutionKitProvider;

public function register(): void
{
    $this->app->singleton(SalesQualificationKitProvider::class);
    $this->app->tag(SalesQualificationKitProvider::class, SolutionKitProvider::class);
}
```

Definitions are closed contracts. Unknown fields, duplicate keys, embedded
credential-like keys, invalid semantic versions, unsupported capability modes,
write-capable Kits without explicit installation approval, unpublishable
Playbooks, blocking workflow findings, invalid test turns, and conflicting
known outcome classifications are rejected before any database mutation.

### Kit tests

`tests` is optional (at most 24 entries). Each entry is
`{key, name, turns}`. `turns` uses the Agent test format of the Agent editor:
up to 10 visitor messages, each
`{message, tools_called, tools_not_called, contains, not_contains, rubric}`.
Only `message` is required; the lists default to empty and `rubric` to none.
Tool checks compare exact tool names, such as `search_knowledge` or a
capability `tool_name`. Text checks ignore case. A rubric is graded by a model
when the test runs.

A Kit cannot know the id of a Playbook before installation, so a test names a
Kit Playbook tool as `playbook:<playbook key>`. The key must belong to a
Playbook of the same Kit, and a literal `playbook_<id>` is rejected. The
installer replaces each reference with the tool name of the created Playbook
(`playbook_<workflow id>`). Tests are created with the Agent, warn when they do
not pass, and never block publishing.

Use a separately registered `CapabilityProvider` for host actions referenced by
a Kit Playbook. Productive execution still goes exclusively through the
`CapabilityExecutionGateway`; a Kit is never an execution boundary.

## Upgrade And Recovery

Run `php artisan migrate` before opening the wizard. If the installation table,
Playbook draft columns, or Agent test tables are missing, installation stops
with a migration instruction and creates nothing.

There is no automatic Kit upgrade or destructive uninstall. After installation,
the Agent, drafts, tests, and deployments follow their normal resource
lifecycle. Soft-deleting an Agent retains its immutable installation evidence.
Only permanent deletion of the owning Agent removes that evidence through the
database cascade, subject to the host's deletion and retention policy.
