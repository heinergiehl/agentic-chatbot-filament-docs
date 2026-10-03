# Localization

Filament Agentic Chatbot follows the Filament plugin convention: translations
are namespaced PHP files, registered through the package service provider and
used with semantic keys.

```php
__('filament-agentic-chatbot::common.overview')
__('filament-agentic-chatbot::common.queued_queued_total_source_s', ['queued' => 2, 'total' => 7])
trans_choice('filament-agentic-chatbot::playbooks.handles_workflow_generation.published_operations', $count)
```

The files live in `resources/lang/{locale}/`, one file per product area:

| File | Content |
|---|---|
| `common.php` | words and phrases shared by several screens (Save, Overview, Agents, statuses) and the navigation |
| `agents.php` | Agent editor, Agents list, setup, widget settings, release and test pages |
| `playbooks.php` | Playbook list, editor pages, runs |
| `knowledge.php` | knowledge sources |
| `channels.php` | channels, delivery events, outgoing webhooks, Connect overview |
| `api-connectors.php` | API Connectors, operations, Integration Studio, capability bridge |
| `mcp.php` | MCP connections and operations |
| `data-resources.php` | Data Resources |
| `observe.php` | conversations, submissions, handoffs, action reviews, analytics widgets |
| `usage.php` | AI usage, usage events and Agent access tokens |
| `widget.php` | built-in texts of the public chat widget (flat keys, all four languages complete) |
| `activity.php`, `runtime.php` | visitor-facing runtime messages |
| `workflow-editor.php` | catalog of the React Playbook editor |

A key is `area.group.slug`: the group is the class or view that owns the text
(for example `edit_bot`), the slug is a short form of the English text that
keeps its negation (`playbook_not_saved`, not `playbook_saved`). Texts
used by several classes of one area sit in `{area}.shared.*`; short texts used
in several places live in `common.*`.

`activity.php` and `runtime.php` hold runtime and visitor-facing messages.
`workflow-editor.php` is the catalog of the React Playbook editor: its `texts`
array uses the English source copy as keys and is passed to the editor. The
English file lists the texts the editor's `t()` calls use plus labels the
server sends for translation, and the German file translates all of them;
`WorkflowEditorTranslationsTest` checks both.

English is the plugin's default and source language: the `en` files define
every key. German (`de`), French (`fr`) and Spanish (`es`) are shipped with
every key of every file, including the widget, the runtime messages and the
Playbook editor catalog. The German translation was reviewed; **French and
Spanish are machine translations** with a hand-checked glossary and are not
reviewed by native speakers. Expect wording you may want to adjust and report
or fix it (see below). A key that a language lacks, for example after a new
key was added to English, falls back to English, so keep your application's
`fallback_locale` at `en`. Nothing in the package configuration assumes
German.

Register: German uses informal "du" to the admin and the visitor. French uses
"vous" for the admin and the visitor. Spanish uses informal "tú". Product terms
stay in English in every language: Agent (Agente in Spanish), Playbook, MCP,
Webhook, API Connector, Solution Kit, Widget.

| Term | de | fr | es |
|---|---|---|---|
| Data Resource | Datenressource | ressource de données | recurso de datos |
| Handoff | Übergabe | transfert | traspaso |
| Knowledge | Wissen | connaissances | conocimiento |
| Submission | Einsendung | soumission | envío |
| Live | Live | en ligne | activo |
| Draft | Entwurf | brouillon | borrador |
| Step | Schritt | étape | paso |
| Chunk | Abschnitt | segment | fragmento |

## Override A Text Or Add A Language

Publish the files and edit only what you need:

```bash
php artisan vendor:publish --tag=filament-agentic-chatbot-translations
```

They are copied to `lang/vendor/filament-agentic-chatbot/{locale}/`. Laravel
merges these files over the package files per key, so keep only the keys you
change:

```php
// lang/vendor/filament-agentic-chatbot/de/common.php
return [
    'agents' => 'Assistenten',
];
```

To re-word the English text, edit `lang/vendor/filament-agentic-chatbot/en/…`
the same way. To fix a French or Spanish wording for your installation, publish
the files and change only the keys you disagree with; to contribute the fix back,
edit `resources/lang/fr/…` or `resources/lang/es/…` and keep the placeholders
and plural forms of the English value. To add a language (for example `fa`), create
`lang/vendor/filament-agentic-chatbot/fa/{area}.php` files with the keys you
translate; missing keys fall back to English. Set the panel language with the
normal application locale (`APP_LOCALE` or `app()->setLocale()`).

Placeholders such as `:count` and plural forms such as
`{1} :count frame|[0,*] :count frames` keep the syntax of the English value.

## Writing UI Text In The Package

- Wrap every visible admin string in `__('filament-agentic-chatbot::area.group.key')`
  and add the English and the German value in the same commit. Never build a
  sentence from fragments; use one text with `:placeholders`.
- Do not compute keys dynamically. Use a `match` over literal keys so the
  checks below can see every key.
- Paths, URLs, header names, identifiers and JSON samples are values, not UI
  copy. Leave them unwrapped.

## QA Guards

- `tests/Unit/AdminTranslationFilesTest.php` fails when code uses a key that
  English does not define, when English has a key no source uses, when German,
  French or Spanish miss or add a key compared with English, when a translation drops or adds placeholders or plural
  forms, when the key of a short negated text drops the negation, and when
  a translation leaves the product glossary above (Data Resource, Handoff,
  Playbook, Knowledge). French and Spanish are held to the same completeness
  rules as German: every English key, no extra keys, the same placeholders.
  It also checks that `activity.php` and `runtime.php` exist in every shipped
  language with the same keys and placeholders.
- `tests/Unit/TranslationOverrideTest.php` proves that files in
  `lang/vendor/filament-agentic-chatbot/` override the package per key, that
  the publish tag delivers the files, and that placeholders and plural forms
  work.
- `tests/Unit/LocalizationCoverageTest.php` fails when a Filament UI call or
  the workflow editor uses a hard-coded English literal.

`WorkflowEditorTranslationsTest` and `WidgetScriptTest` apply the same
completeness rules to the editor catalog and the widget texts for all three
translations.

Run the panel in another language with `APP_LOCALE={locale}`. Agent prompts and
the widget texts an admin writes are stored per Agent in its configuration;
the widget's built-in texts come from `widget.php` in the Agent's widget
language (`WidgetScriptTest` checks that every language has the English keys).
