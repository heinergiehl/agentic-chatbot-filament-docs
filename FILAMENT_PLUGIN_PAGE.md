# AI Support Agent & Chatbot for Filament

Answer support questions, read approved business data and let visitors confirm permitted changes in chat. Configure the Agent in your **Laravel and Filament** application, **self-host** it, and use **your own AI provider keys**.

[Open the Playground](https://filament-agentic-chatbot.heinerdevelops.tech/playground/) · [Ask the product assistant](https://filament-agentic-chatbot.heinerdevelops.tech/) · [Buy a license](https://checkout.anystack.sh/agentic-chatbot) · [Setup guide](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/QUICKSTART.md)

## Try the real Filament backend

The **Glide Playground** gives each browser a temporary sandbox for a fictional e-bike rental. Edit Agent instructions, add text or file knowledge, inspect the bike fleet, try weather and calendar APIs, change a Playbook in the native step list or canvas, then **test and publish**. The Playground page also has the chat widget so you can try the result as a visitor.

No sign-up or API key is needed. The separate [read-only admin](https://filament-agentic-chatbot.heinerdevelops.tech/demo-admin) shows the product assistant's configuration without changing it. There is no Store account or Alex/Sam login in the current demos.

![The native Glide Playground with its booking Playbook and chat widget](https://raw.githubusercontent.com/heinergiehl/agentic-chatbot-filament-docs/main/images/agentic-chatbot/playground-native.webp)

The hosted Playground runs Claude Haiku 5.5 with Google embeddings, with 60 provider calls over two hours and shared availability limits. Publishing is enabled; provider credentials, global settings and arbitrary network access remain restricted. [Guided exercises, feature coverage and limits](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/PLAYGROUND.md).

Commercial proprietary software for your application. The default license covers one legal entity and one Licensed Application, including development, staging and production. AI usage and infrastructure costs are separate. [License and refund terms](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/REFUND_AND_LICENSE.md).

## Three concrete uses

### Answer questions from your knowledge

Attach selected text, Files, Website or JSON API Sources. The Agent searches that content and can include citations in its answer. Review answers with your own content and provider before serving visitors.

### Help signed-in customers with an order

Expose approved Eloquent fields through an App data tool. Bind orders to the customer and tenant from your host identity, then configure an allowed address update. The customer confirms the proposed values before that personal write runs. Filament Resource import helps propose a Tool Draft; you still review scopes, fields and permissions.

### Continue a conversation with your support team

Enable Handoff, choose authorized notification recipients and configure business hours. Operators can assign the conversation, add internal notes, reply in the same chat and explicitly return it to the Agent.

## Start with an Agent; add a Workflow when needed

Give each Agent its instructions, provider, model, Sources and Tools. **Test** runs the saved Draft and simulates writes. **Publish** creates an immutable Version; **Restore** selects an earlier Version while keeping Live/Paused availability. Pause and Resume control whether the Agent answers visitors.

A Workflow is never required for ordinary or knowledge-grounded chat. Add one when a task needs a defined sequence, input collection, a decision or team approval. The Workflow Builder provides a step list and canvas for that bounded process.

In the Playground, the booking Playbook checks availability, asks for confirmation and stores a demo submission. The bike-problem Playbook demonstrates handoff. Customer-specific order access is an example for your own host integration, not a current public Store demo.

## Connect only the data and operations you choose

App data tools expose selected records and fields. API tools expose reviewed operations from your configured Connections; MCP tools connect to supported remote servers. An adapter's availability does not certify every provider, model or server configuration. Read the [MCP guide](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/MCP_CONNECTIONS.md) before connecting a server.

Confirmation is on by default. Personal App data tool writes, MCP writes, lead capture and updates with **Allow updating any record** require confirmation. Administrators may disable **Ask visitor to confirm** for eligible operations, such as a reviewed non-personal write. Team approval is separate. Authorization and execution controls still apply when visitor confirmation is disabled.

An Unverified action means the result could not be established and needs reconciliation. AI output can be wrong; test your data boundaries, failure behavior and representative questions. Read the [known limitations](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/KNOWN_LIMITATIONS.md).

## Embed on your website

Copy the generated script from **Channels** after allowing the intended domains. Configure the welcome text and appearance in Filament.

Production uses **tokenless bootstrap**: the loader calls the origin-checked `/bootstrap` endpoint and keeps short-lived access tokens in memory. Signed-in customer data additionally needs trusted host identity and explicit Tool scopes. [Widget integration guide](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/CHAT_WIDGET.md).

## Setup overview

1. **Check your host.** You need a compatible Laravel/Filament app, supported database, your own AI provider account, persistent queue worker, scheduler and shared cache. Production App data tools require a supported server database. [Requirements and tested configurations](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/COMPATIBILITY.md).
2. **Install after purchase.** Use the private Composer repository and credentials from Anystack. Follow the [Quickstart](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/QUICKSTART.md) to register the plugin, grant access and run the installer.
3. **Create and test.** Start with an anonymous FAQ Agent, add a Source and test representative questions. Configure identity and record scopes separately before adding personal Tools.
4. **Publish and embed.** Review readiness, publish the Agent, allow the website and verify a conversation in your deployment.

For an existing installation, follow the [upgrade guide](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/UPGRADING.md) before changing the package. The linked compatibility and setup guides identify their documentation target; match them to your download. Demo content may differ from your installed package.

## Support and license

Support covers installation/configuration guidance and reproducible defect triage within your entitlement. Contact `webdevislife2021@gmail.com` with sanitized reproduction steps. [Support policy](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/SUPPORT_POLICY.md) defines hours and first-response targets.

You run the application, database, queues, backups and monitoring. Requests use your configured AI provider account. SaaS use of your Licensed Application is permitted under the default license; redistribution of the plugin and resale as a general-purpose hosted builder require separate rights. [Refund and license terms](https://github.com/heinergiehl/agentic-chatbot-filament-docs/blob/main/REFUND_AND_LICENSE.md).
