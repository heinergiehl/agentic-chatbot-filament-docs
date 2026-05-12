# Localization

Filament Agentic Chatbot loads Laravel translation files under the package namespace:

```php
__('filament-agentic-chatbot::filament-agentic-chatbot.navigation.group')
```

Enterprise administration surfaces such as Bot Access Tokens and AI Usage use translation keys for labels, helper text, actions, empty states, and notifications.

## Publish Translation Files

```bash
php artisan vendor:publish --tag=filament-agentic-chatbot-translations
```

Then edit:

```text
lang/vendor/filament-agentic-chatbot/{locale}/filament-agentic-chatbot.php
```

For example:

```text
lang/vendor/filament-agentic-chatbot/de/filament-agentic-chatbot.php
lang/vendor/filament-agentic-chatbot/fa/filament-agentic-chatbot.php
```

## Current Coverage

The translation file currently covers:

- Agentic Chatbot navigation group
- Bot Access Tokens resource
- Bot Access Token create/rotate/revoke notifications
- AI Usage resource
- AI usage dashboard widgets

Older workflow-editor labels and some legacy bot/source form labels still need a broader translation sweep before `1.0`.

## Recommended Project Workflow

1. Publish the package translations.
2. Create a locale folder for each project language.
3. Translate keys without changing array names.
4. Test the Filament panel with `APP_LOCALE={locale}`.
5. Keep user-facing bot prompts and widget copy per bot, because those are stored in bot configuration rather than package translations.
