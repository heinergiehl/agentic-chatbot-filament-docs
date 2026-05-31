# Release Notes: v0.9.8

`v0.9.8` is a commercial early-access maintenance release focused on buyer-reported widget and Analytics regressions, plus the expanded model-provider setup work.

## Highlights

- **Analytics page fix**: the bot Analytics page no longer fails because of a missing Heroicon component.
- **Widget script compatibility**: the chat widget script is now served from the current extensionless route, the legacy `.js` route, and any configured custom script route.
- **Published-config safety**: existing installs that still have `filament-agentic-chatbot/widget.js` in a published config or copied embed snippet continue to work after updating.
- **Expanded chat providers**: per-bot provider/model setup now covers Gemini, OpenAI, Anthropic, xAI, OpenRouter, DeepSeek, Groq, Mistral, Ollama, and Azure OpenAI.
- **Expanded embedding providers**: setup checks and dimension resolution now cover Gemini, OpenAI, OpenRouter, Mistral, Ollama, Azure OpenAI, Cohere, Jina AI, and Voyage AI.
- **Provider credential readiness**: chat and embedding keys are resolved independently, same-provider chat keys can be reused for embeddings, and local Ollama setups no longer require a placeholder API key.

## Upgrade from v0.9.7

1. Update your package constraint to allow `^0.9.8`.
2. Run `composer update heiner/filament-agentic-chatbot --with-dependencies`.
3. Run `php artisan optimize:clear`.
4. If Filament assets are cached in your deployment process, run `php artisan filament:assets`.

No new database migrations are required for this release.

## Notes

- Existing embed snippets that use `/filament-agentic-chatbot/widget.js` remain supported.
- New snippets should use `/filament-agentic-chatbot/widget`.
- If the chat and embedding providers are different, configure an embedding API key separately; the chat key is reused only when both providers match.
- If a customer still sees a 404 for the widget script after updating, clear route/config caches and verify the package routes are loaded with `php artisan route:list`.

## Links

- Full changelog: [CHANGELOG.md](CHANGELOG.md)
- Upgrade guide: [UPGRADING.md](UPGRADING.md)
- Known limitations: [KNOWN_LIMITATIONS.md](KNOWN_LIMITATIONS.md)
- Previous release: [RELEASE_NOTES_v0.9.7.md](RELEASE_NOTES_v0.9.7.md)
