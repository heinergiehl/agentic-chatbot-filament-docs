# Localization

Filament Agentic Chatbot loads Laravel translation files under the package namespace:

```php
__('filament-agentic-chatbot::filament-agentic-chatbot.navigation.group')
```

The PHP-based Filament administration UI uses package translations for labels, helper text, actions, empty states, notifications, option labels, widget headings, and navigation labels.

## Publish Translation Files

```bash
php artisan vendor:publish --tag=filament-agentic-chatbot-translations
```

Then edit:

```text
lang/vendor/filament-agentic-chatbot/{locale}/filament-agentic-chatbot.php
lang/vendor/filament-agentic-chatbot/{locale}/workflow-editor.php
```

For example:

```text
lang/vendor/filament-agentic-chatbot/de/filament-agentic-chatbot.php
lang/vendor/filament-agentic-chatbot/de/workflow-editor.php
lang/vendor/filament-agentic-chatbot/fa/filament-agentic-chatbot.php
lang/vendor/filament-agentic-chatbot/fa/workflow-editor.php
```

## Current Coverage

The translation file currently covers:

- Agentic Chatbot navigation group
- Bot, source, API connector, workflow, conversation, submission, workflow run, Bot Access Token, and AI Usage Filament resources
- Filament resource navigation labels, model labels, form labels, table labels, actions, notifications, empty states, widget headings, and common option labels
- AI usage dashboard widgets
- English fallback strings under the `raw` array for broad legacy UI coverage
- React workflow editor labels, tooltips, helper copy, sidebar tabs, settings fields, run/debug panels, release history, test chat empty states, and node catalog copy

The React workflow editor is configured through `resources/lang/{locale}/workflow-editor.php`. Its `texts` array uses the English source copy as keys, so project translators can replace visible editor text without touching the compiled JavaScript.

## QA Guard

The package includes `tests/Unit/LocalizationCoverageTest.php`, which fails when new hard-coded English strings are added to common PHP/Filament UI APIs or workflow editor UI surfaces without going through the package translation helpers.

## Recommended Project Workflow

1. Publish the package translations.
2. Create a locale folder for each project language.
3. Translate keys without changing array names.
4. Test the Filament panel with `APP_LOCALE={locale}`.
5. Keep user-facing bot prompts and widget copy per bot, because those are stored in bot configuration rather than package translations.
