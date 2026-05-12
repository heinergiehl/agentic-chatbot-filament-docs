# OpenAI-Compatible Providers

Use the `openai_compatible` chat provider when a model vendor or gateway exposes a Chat Completions compatible API but is not represented as a first-class Laravel AI SDK provider in this package.

This is useful for Qwen/DashScope compatible mode, private gateways, local OpenAI-compatible proxies, and provider endpoints that can be called by changing only API key, model name, and base URL.

## Configure Globally

```env
RAG_CHAT_PROVIDER=openai_compatible
RAG_CHAT_MODEL=qwen-plus
RAG_OPENAI_COMPATIBLE_DRIVER=openrouter
RAG_OPENAI_COMPATIBLE_BASE_URL=https://dashscope-intl.aliyuncs.com/compatible-mode/v1
RAG_OPENAI_COMPATIBLE_API_KEY=your-provider-key
```

## Configure Per Bot

In **Agentic Chatbot > Bots**:

1. Set **Chat Provider** to **OpenAI-Compatible**.
2. Set **Model Source** to **Manual ID** if the model is not in the curated list.
3. Enter the provider model ID, for example `qwen-plus`.
4. Enter **Custom Base URL**.
5. Enter the bot's chat provider API key, or rely on `RAG_OPENAI_COMPATIBLE_API_KEY`.

The custom base URL is used for normal bot answers and workflow AI Agent nodes. If a bot uses `openai_compatible` and no base URL can be resolved from bot config or env, the runtime fails before making a provider call.

## Known Base URLs

Always verify provider docs before production rollout. These values are common as of May 12, 2026:

| Provider | Region / surface | Base URL |
| --- | --- | --- |
| Qwen / Alibaba Cloud Model Studio | Beijing | `https://dashscope.aliyuncs.com/compatible-mode/v1` |
| Qwen / Alibaba Cloud Model Studio | Singapore / international | `https://dashscope-intl.aliyuncs.com/compatible-mode/v1` |
| Qwen / Alibaba Cloud Model Studio | US Virginia | `https://dashscope-us.aliyuncs.com/compatible-mode/v1` |
| DeepSeek | Official OpenAI-compatible API | `https://api.deepseek.com` |
| Private gateway | Your gateway | `https://ai-gateway.example.com/v1` |

Sources:

- Alibaba Cloud Model Studio OpenAI-compatible docs: https://help.aliyun.com/zh/model-studio/compatibility-of-openai-with-dashscope
- Alibaba Cloud Model Studio regional base URL docs: https://help.aliyun.com/zh/model-studio/qwen-mt-api
- DeepSeek API docs: https://api-docs.deepseek.com/

## When To Use The Built-In Provider Instead

If the provider is already first-class in the plugin, prefer that provider unless you need a custom gateway URL:

- `deepseek` for the standard DeepSeek integration
- `openrouter` for OpenRouter routed models
- `openai` for OpenAI
- `mistral`, `groq`, `anthropic`, `gemini`, `xai`, or `azure` for their normal hosted APIs

Use `openai_compatible` when the base URL itself is part of the integration requirement.

## Cost And Budget Notes

The usage dashboard can record provider-reported token usage for OpenAI-compatible responses. Estimated cost needs pricing configuration:

```php
// config/filament-agentic-chatbot.php
'usage' => [
    'pricing' => [
        'openai_compatible:qwen-plus' => [
            'input_cents_per_million' => 10,
            'output_cents_per_million' => 30,
        ],
    ],
],
```

If pricing is not configured, token budgets still work and cost events show as unpriced.

## Troubleshooting

| Symptom | Check |
| --- | --- |
| `OpenAI-compatible chat providers require a custom base URL.` | Add **Custom Base URL** on the bot or set `RAG_OPENAI_COMPATIBLE_BASE_URL`. |
| 401/403 from provider | Confirm the API key belongs to the same region/account as the base URL. |
| Model not found | Switch **Model Source** to **Manual ID** and use the exact provider model ID. |
| Provider rejects `/v1` path | Use the vendor's documented base URL. Some providers expect `/v1`; others document the root host. |
| Cost dashboard shows `Unpriced` | Add pricing entries under `filament-agentic-chatbot.usage.pricing`. |
