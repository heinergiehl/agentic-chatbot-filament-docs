# Example Workflows

Ready-to-import JSON workflows demonstrating the **Filament Agentic Chatbot** workflow engine.

## How to Use

1. Copy the JSON from any file below (or download the `.json` file).
2. In the Filament workflow editor, click **📥 Import** in the sidebar.
3. Paste the JSON (or upload the file) and click **✅ Import**.
4. Review and customise — then **💾 Save** and **🚀 Publish**.

## Workflows

| #   | File                                                                                         | Description                                                                 | Nodes Used                                                                                                                    |
| --- | -------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| 01  | [SaaS Onboarding](workflows/01-saas-onboarding.json)                                         | Progressive onboarding wizard with enterprise lead detection                | trigger, sendMessage, collectInput, knowledgeBase, condition, aiAgent, join                                                   |
| 02  | [Support Ticket Router](workflows/02-support-ticket-router.json)                             | AI-based intent classification routing to 4 department specialists          | trigger, collectInput, knowledgeBase, aiAgent (classify + answer), switchRouter, join                                         |
| 03  | [E-Commerce Order Status](workflows/03-ecommerce-order-status.json)                          | Order lookup via API with status-specific card responses                    | trigger, collectInput, httpRequest, condition, switchRouter, sendMessage (card), delay                                        |
| 04  | [Lead Qualification](workflows/04-lead-qualification.json)                                   | Multi-step lead collection with CRM action and AI-powered responses         | trigger, collectInput, setVariable, condition, aiAgent, action, join                                                          |
| 05  | [Early Access Feedback Triage](workflows/05-early-access-feedback-triage.json)               | Structured buyer feedback intake with docs assist and submission capture    | trigger, collectInput, knowledgeBase, aiAgent, condition, switchRouter, setVariable, join, action                             |
| 06  | [FAQ with Confidence Check](workflows/06-faq-with-confidence-check.json)                     | Two-stage AI: confidence evaluation before answering or escalating          | trigger, collectInput, knowledgeBase, condition (nested), aiAgent ×2, sendMessage (buttons)                                   |
| 07  | [Content Research Assistant](workflows/07-content-research-assistant.json)                   | Multi-step content generation: research → outline → full draft              | trigger, collectInput ×4, knowledgeBase, aiAgent (outline + draft), delay                                                     |
| 08  | [Plugin Feedback Collector](workflows/08-plugin-feedback-collector.json)                     | Structured plugin feedback capture with a short streamed closing reply      | trigger, sendMessage, collectInput, intentClassifier, setVariable, condition, join, action, aiAgent                           |
| 09  | [Filament Plugin Portfolio Concierge](workflows/09-filament-plugin-portfolio-concierge.json) | Live plugin catalog retrieval plus playful preference capture and sentiment | trigger, intentClassifier, setVariable, action, knowledgeBase, aiAgent, sendMessage, collectInput, sentiment, condition, join |
| 10  | [Generic Image Generation Channel Smoke](workflows/10-generic-image-generation-channel-smoke.json) | Provider-neutral image generation smoke test for Telegram or Slack delivery | trigger, action (`generate_image`), errorHandler, sendMessage (image)                                                         |
| 11  | [Local OpenAI-Compatible Image Channel Smoke](workflows/11-local-openai-compatible-image-channel-smoke.json) | Local `x/z-image-turbo` smoke test through the generic image generation action | trigger, action (`generate_image`), errorHandler, sendMessage (image)                                                         |
| 12  | [Gemini Imagen Fast Channel Smoke](workflows/12-gemini-imagen-fast-channel-smoke.json) | Google Gemini API Imagen 4 Fast smoke test through the generic HTTP image transport | trigger, action (`generate_image`), errorHandler, sendMessage (image)                                                         |
| 13  | [Natural Preference Memory Lab](workflows/13-natural-preference-memory-lab.json) | Conversation-scoped preference memory with natural recall and knowledge follow-ups | trigger, memoryRead, intentClassifier, structuredOutput, memoryWrite, contextBuilder, queryRewrite, knowledgeBase, confidenceCheck, answer, sendMessage |
| 14  | [Natural Intake Correction Memory Lab](workflows/14-natural-intake-correction-memory-lab.json) | Stateful intake journal that handles corrections, recall, and docs follow-ups | trigger, memoryRead, intentClassifier, structuredOutput, memoryWrite, contextBuilder, queryRewrite, knowledgeBase, confidenceCheck, answer, sendMessage |
| 15  | [Adversarial Reliability Lab](workflows/15-adversarial-reliability-lab.json) | Sneaky local stress test for turn routing, interruptions, guardrails, confirmation gates, choice normalization, and memory recall | trigger, note, memoryRead, intentClassifier, condition, collectInput, guardrail, confirmation, memoryWrite, setVariable, sendMessage |

## Vertical Blueprints

| Folder | Description |
| --- | --- |
| [Incident Management](incident-management/README.md) | Runnable app-side example for operational incidents, rescue stations, rescuers, earthquake history, live data resources, and a manager workflow. |

## Customisation Tips

- **AI models**: All `aiAgent` nodes leave `provider` and `model` empty — they inherit the bot's default. Set them explicitly to use a different provider per node.
- **Knowledge base**: Connect a bot with ingested sources so `knowledgeBase` nodes return real results.
- **Actions**: Workflow 04 references `save_lead` — register it in your `ActionRegistry` or swap it with your own action key.
- **Structured writes**: Workflow 05 uses the built-in `store_submission` action with `schema_key` `feedback_form`. Link the workflow to a bot in `query_and_write` mode and add a matching submission schema before saving or publishing.
- **Data resources**: Workflow 09 uses the built-in `query_data_resource` action with `resource_key` `filament_plugins`. Register a matching data resource and allow it on the target bot before importing or publishing.
- **Image generation**: Workflow 10 uses the built-in `generate_image` action. Use `RAG_WORKFLOW_IMAGE_TRANSPORT=laravel_ai` with a native image provider, or `http_json` for local/custom/cloud HTTP image endpoints. Workflow 11 is prewired for a local OpenAI-compatible image endpoint at `http://127.0.0.1:11434/v1/images/generations` with model `x/z-image-turbo`. Workflow 12 is prewired for Google Gemini API Imagen 4 Fast; configure `RAG_WORKFLOW_IMAGE_HTTP_HEADERS` with your `x-goog-api-key` header and allow `generativelanguage.googleapis.com`. Generated image workflows pass both `imageUrl` and `imageArtifact`; Slack and Telegram can upload the stored artifact directly, while widgets and public-link channels can use the URL. Set `RAG_WORKFLOW_IMAGE_PUBLIC_BASE_URL` when you also want local stored files to have externally reachable URLs behind a tunnel.
- **Agentic nodes**: Use `answer` for grounded final responses, `confidenceCheck` after retrieval, `guardrail` before sensitive actions, `entityExtractor` before structured mappings, and `memoryRead`/`memoryWrite` for small conversation-scoped facts.
- **Adversarial testing**: Workflow 15 is designed for local test chat. It intentionally waits for multi-turn input, rejects probe text containing secrets, URLs, emails, or phone numbers, requires confirmation before writing memory, and lets you recall/reset the saved probe to verify state handling.
- **HTTP endpoints**: Workflow 03 uses placeholder URLs — replace them with your real API endpoints.
- **Supported triggers**: Example workflows use the `user_message` trigger for chat-first flows.
