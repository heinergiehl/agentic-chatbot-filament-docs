# Agent Templates

A template is a starting point for a new Agent. It prefills the instructions of the Create Agent wizard, switches on built-in Tools and, when the use case needs data from your app, records which Tool the Agent still needs. Templates replace the Solution Kits of earlier versions.

A template never grants authority. Creating from one needs the same ability as creating any Agent (`agents.manage`, ADR 0053), the new Agent is always a **Draft** (ADR 0045), and Tools are assigned through the usual rules. A template creates no app data tool, no API tool and no MCP tool.

## Where templates appear

- **Create Agent, step 1 "Start with"**: one card per template and **Start from scratch** as the last card and the default. Choosing a card prefills the later steps. You can edit everything before you create the Agent; a value you changed yourself is kept when you pick another card.
- **Agents list, empty state**: the same cards. Choosing one opens Create Agent with that template selected through the `template` query parameter, for example `?template=lead-capture`. An unknown key falls back to **Start from scratch**.

## Built-in templates

| Template (key) | Built-in Tools | After you create the Agent |
| --- | --- | --- |
| **FAQ from your website** (`faq`) | none | Opens the form to add a Source |
| **Customer support with handoff** (`customer-support`) | Handoff | Opens the Agent Overview |
| **Lead capture** (`lead-capture`) | Lead capture | Opens the Agent Overview |
| **Order status** (`order-status`) | none | Opens the form to set up an app data tool |

The first three answer from Sources you add. **Order status** needs an app data tool for your orders. The Agent starts as a Draft with that requirement stored in `runtime_config.template` (`key` and `required_tool_kinds`), and the Agent's readiness shows a blocking check, `template_requirement_missing`, until an app data tool is assigned to the draft and compiles to at least one tool (an assigned tool with App data reads off and every write withheld does not count). **Publish** stays disabled until then. A stored requirement that cannot be read blocks Publish too (`template_requirement_invalid`, see below). The template does not create the app data tool and never claims the Agent is ready before your app mapping exists. Other templates store only their `key`.

No template ships a Workflow, and there is no appointment template.

### If Publish is blocked by `template_requirement_invalid`

The check fails closed when `runtime_config.template` on the Agent is not readable: `required_tool_kinds` is not a list, or it names a kind this version does not know. The package never writes such a value. It comes from a manual edit of the Agent's `runtime_config`, from a restore of data written by another version, or from corruption. The Agent keeps working as a Draft and a Live version is not touched; only Publish is blocked.

The least risky recovery restores the value the template would have stored, so the guard stays in place. For **Order status**, in `php artisan tinker`:

```php
$agent = \Heiner\FilamentAgenticChatbot\Models\Bot::findOrFail($id);
$runtime = $agent->runtime_config;
$runtime['template'] = ['key' => 'order-status', 'required_tool_kinds' => ['app_data']];
$agent->forceFill(['runtime_config' => $runtime])->save();
```

For a template without a Tool requirement, store only `['key' => '<template key>']`. If the Agent does not need the requirement any more, remove it with `unset($runtime['template'])`; the check is then gone and Publish no longer asks for an app data tool. Alternatively create the Agent again from the template and copy its Instructions. Nothing in the UI edits this value.

## Add your own templates

Implement `Heiner\FilamentAgenticChatbot\Templates\Contracts\AgentTemplateProvider` and tag it:

```php
use App\Chatbot\ShopTemplates;
use Heiner\FilamentAgenticChatbot\Templates\Contracts\AgentTemplateProvider;

public function register(): void
{
    $this->app->singleton(ShopTemplates::class);
    $this->app->tag(ShopTemplates::class, AgentTemplateProvider::class);
}
```

```php
namespace App\Chatbot;

use Heiner\FilamentAgenticChatbot\Templates\AgentTemplate;
use Heiner\FilamentAgenticChatbot\Templates\AgentTemplateRequirement;
use Heiner\FilamentAgenticChatbot\Templates\Contracts\AgentTemplateProvider;

final class ShopTemplates implements AgentTemplateProvider
{
    public function templates(): iterable
    {
        yield new AgentTemplate(
            key: 'returns-help',
            title: 'Returns help',
            description: 'Explains the returns policy and looks up the status of a return.',
            icon: 'heroicon-o-arrow-uturn-left',
            instructions: [
                'setup_intent' => 'knowledge',
                'role' => 'Explain our returns policy and help customers with their returns.',
                'boundaries' => ['Do not promise refunds', 'Say so when the Sources do not contain the answer'],
            ],
            builtInTools: ['human_handoff'],
            requiredToolKinds: [
                new AgentTemplateRequirement(AgentTemplateRequirement::APP_DATA, 'App data tool for returns'),
            ],
            afterCreate: AgentTemplate::AFTER_APP_DATA_TOOL,
        );
    }
}
```

An `AgentTemplate` validates when you construct it and throws `InvalidArgumentException` for an invalid value.

| Field | Meaning |
| --- | --- |
| `key` | Unique lowercase slug of up to 64 characters (`order-status`). `scratch` is reserved and refused by the catalog. Used in the `template` query parameter and stored on the Agent |
| `title`, `description` | The card text. Use plain, concrete copy. The package resolves translations when the provider runs, so call `__()` inside `templates()` |
| `icon` | A Heroicon name such as `heroicon-o-truck` |
| `instructions` | Prefilled Instructions values: `setup_intent` (`conversation` or `knowledge`), `role`, `boundaries` (list), `audience`, `tone`, `answer_length` (`short`, `balanced`, `detailed`), `uncertainty` (`clarify_once`, `state_limits`, `abstain`), `fallback_behavior`, `citation_policy` and `custom_instructions` |
| `builtInTools` | `human_handoff` and `lead_capture`. Without `human_handoff`, the Agent is created with Handoff off |
| `requiredToolKinds` | List of `AgentTemplateRequirement`. The only kind is `AgentTemplateRequirement::APP_DATA` with a human label such as "App data tool for orders". Each stored kind blocks Publish until the Tool is assigned |
| `workflows` | Optional list of `['key' => ..., 'name' => ..., 'description' => ..., 'workflow' => <Workflow definition>]`, at most five. They are created as unpublished Workflow drafts of the new Agent, in one transaction with the Agent. They are neither published nor assigned. A template with Workflows is offered only to someone who may create Workflows (`workflows.manage`) |
| `afterCreate` | `AgentTemplate::AFTER_KNOWLEDGE_SOURCE` or `AgentTemplate::AFTER_APP_DATA_TOOL`: the form to open after creating the Agent. Without it the Overview opens. If the person may not open that form, the Overview opens too |

### What is ignored

A template that cannot be offered never breaks the Agents pages. The package leaves it out and writes a warning:

- an invalid template (an unknown built-in Tool, a bad key, an unknown instructions key and so on); templates the provider yielded before it are kept, the rest of that provider is skipped,
- a key that another provider or a built-in template already uses; the first one registered wins and built-in templates are registered first,
- the reserved key `scratch`, which belongs to **Start from scratch**,
- a tagged class that does not implement `AgentTemplateProvider`,
- a provider that the container cannot resolve: it stops the remaining tagged providers from loading; the built-in templates and the providers read before it stay available.

A template whose `icon` has the right form but does not exist is kept and shown with the default icon (`heroicon-o-sparkles`); the warning names the provider.

Provider and resolution exceptions log only the fixed diagnostic code
`template_provider_failed` or `template_provider_resolution_failed` and the
exception class. Exception messages and trace arguments are never logged.

If you submit a template key that is no longer offered (for example the provider was removed while the wizard was open), creating the Agent fails with a validation message instead of creating a different Agent.

## Porting a Solution Kit provider

See [Upgrading to 1.0](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/UPGRADING.md). The Kit's Workflows become `workflows`, its Agent behavior becomes `instructions`, and its approvals, resource slots and API connection slots are gone: assign the Tools after creating the Agent.
