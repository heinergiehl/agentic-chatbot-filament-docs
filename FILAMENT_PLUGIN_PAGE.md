# AI Chatbot & Support Agent for Filament

[![Try the live demo: chat with the AI agent, then change and publish it in a real Filament admin. No signup or API key needed.](https://raw.githubusercontent.com/heinergiehl/agentic-chatbot-filament-docs/main/images/agentic-chatbot/demo-banner.webp)](https://filament-agentic-chatbot.heinerdevelops.tech/playground/?utm_source=filamentphp&utm_medium=plugin_page&utm_campaign=listing&utm_content=banner)

**[Try the live demo, no signup](https://filament-agentic-chatbot.heinerdevelops.tech/playground/?utm_source=filamentphp&utm_medium=plugin_page&utm_campaign=listing&utm_content=top_link)** · [Buy a license](https://checkout.anystack.sh/agentic-chatbot) · [Setup guide](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/QUICKSTART.md) · [Support](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/SUPPORT_POLICY.md)

Answer support questions, help customers check their orders and hand the conversation to your team when the AI cannot help. You add a chat widget to your website and configure it in your **Laravel and Filament** admin. You self-host it and use your own AI provider keys.

- **FAQ from your content.** Answers shipping, returns or pricing questions from text, Files, Website or JSON API Sources and cites where the answer came from.
- **Order status for signed-in customers.** Reads only the records and fields you approve, scoped to the customer from your app's own login. Before a permitted change such as a new **delivery address**, the customer reviews the values and presses **Confirm**.
- **Handoff to your team.** An unresolved conversation moves to the Inbox in Filament, where an operator replies in the same chat and hands it back to the Agent.
- **Runs on your database.** Knowledge search works in MySQL, MariaDB, PostgreSQL or SQLite without a separate vector service. Per-Agent limits apply; larger collections can use pgvector.

One license covers one legal entity and one Licensed Application, including development, staging and production. AI provider usage and hosting are paid separately. [License and refund terms](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/REFUND_AND_LICENSE.md).

## Try the live demo

The [live demo](https://filament-agentic-chatbot.heinerdevelops.tech/playground/?utm_source=filamentphp&utm_medium=plugin_page&utm_campaign=listing&utm_content=demo_section) opens your own temporary Filament admin for Glide, a fictional e-bike rental. No account or API key is needed.

1. Ask the chat which bike suits a city ride, or whether it will rain on Saturday. The answer combines knowledge, fleet data and a weather API.
2. Change the Agent's instructions, press **Publish** and ask again.
3. Open the booking Workflow in the step list or on the canvas, book a test ride and press **Confirm**.
4. Ask for a person, then answer yourself from the Inbox.

You can also [ask the product assistant](https://filament-agentic-chatbot.heinerdevelops.tech/?utm_source=filamentphp&utm_medium=plugin_page&utm_campaign=listing&utm_content=assistant) about the plugin. A sandbox lasts two hours and allows 60 AI provider calls. Customer order lookups need your own app's login and are not part of the public demo. [Exercises and limits](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/PLAYGROUND.md).

## What it looks like in your app

These screenshots come from a shop host configured with its own customer login, order Tool and update policy. The plugin does not discover or authorize customer data on its own.

![Shop chat showing a delivery answer and its Source citation](https://raw.githubusercontent.com/heinergiehl/agentic-chatbot-filament-docs/main/images/agentic-chatbot/w10-2-faq.png)

Answer a public delivery question from your approved Sources.

![Signed-in shop customer viewing the status of their own order](https://raw.githubusercontent.com/heinergiehl/agentic-chatbot-filament-docs/main/images/agentic-chatbot/w10-2-order-status.png)

Read Order status after the customer's normal host login.

![Delivery address confirmation showing the target order, proposed values and Confirm and Cancel controls](https://raw.githubusercontent.com/heinergiehl/agentic-chatbot-filament-docs/main/images/agentic-chatbot/w10-2-address-confirm.png)

Review a permitted delivery address change before confirming.

![Authorized operator replying to the customer's handed-off conversation](https://raw.githubusercontent.com/heinergiehl/agentic-chatbot-filament-docs/main/images/agentic-chatbot/w10-2-handoff.png)

Continue an unresolved conversation in the team's Inbox.

![Workflow step list for collecting an issue and handing it to the team](https://raw.githubusercontent.com/heinergiehl/agentic-chatbot-filament-docs/main/images/agentic-chatbot/w10-2-workflow.png)

Add a Workflow when support needs a defined sequence.

## How you set it up in Filament

Each Agent keeps its instructions, AI provider, model, Sources and Tools in one Filament editor. Start from a template such as FAQ, customer support with Handoff or order status. **Test** runs the saved Draft and simulates writes. **Publish** creates an immutable Version, and **Restore** brings back an earlier one.

- **App data tools** expose only the Eloquent records and fields you choose. You can start one from an existing Filament Resource, then review its scopes, fields and permissions.
- **API and MCP tools** use operations you import from OpenAPI, Postman or cURL, or tools from supported remote MCP servers. Read the [MCP guide](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/MCP_CONNECTIONS.md) before connecting a server.
- **Workflows are optional.** A Workflow is never required for ordinary or knowledge-grounded chat. Add one when a task needs fixed steps, collected inputs, a decision or team approval.
- **Inbox and insights** show handoffs, conversations, feedback, knowledge gaps and AI cost per Agent.

Confirmation is on by default. Personal App data tool writes, MCP writes, lead capture and updates with **Allow updating any record** require it. Administrators may disable **Ask visitor to confirm** only for eligible operations, such as a reviewed non-personal write. Team approval is separate, and authorization still applies. AI answers can be wrong, so test representative questions with your own content. [Known limitations](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/KNOWN_LIMITATIONS.md).

**Embed on your website.** Allow your domains, then copy the script from **Channels**. The widget uses **tokenless bootstrap**: the loader calls the origin-checked `/bootstrap` endpoint and keeps short-lived access tokens in memory. [Widget guide](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/CHAT_WIDGET.md).

**Setup in four steps:**

1. Check the [requirements](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/COMPATIBILITY.md): a supported Laravel and Filament app and database, your own AI provider account, a persistent queue worker, the scheduler and a shared cache.
2. After purchase, install through the private Composer repository from Anystack. The [Quickstart](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/QUICKSTART.md) shows how to register the plugin, grant access and run the installer.
3. Create an Agent from a template, add a Source and test representative questions.
4. Publish the Agent, allow your website and paste the embed script.

Upgrading an existing installation? Follow the [upgrade guide](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/UPGRADING.md) first.

## License and support

Support covers installation and configuration guidance and reproducible defect triage within your entitlement. Email `webdevislife2021@gmail.com` with sanitized reproduction steps. The [support policy](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/SUPPORT_POLICY.md) lists hours and first-response targets.

You run the application, database, queues, backups and monitoring, and requests use your own AI provider account. SaaS use of your Licensed Application is permitted under the default license. Redistributing the plugin or reselling it as a general-purpose hosted builder requires separate rights. [License and refund terms](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/REFUND_AND_LICENSE.md).
