# Playground and live demo

There are two ways to explore Agentic Chatbot:

| Demo | What you can do |
| --- | --- |
| [Product assistant](https://filament-agentic-chatbot.heinerdevelops.tech/) and [read-only admin](https://filament-agentic-chatbot.heinerdevelops.tech/demo-admin) | Ask about the plugin, inspect its configured Agent, sources, connections and Playbooks, and review conversations from your browser. No customer login is needed. Editing and publishing are disabled here. |
| [Glide Playground](https://filament-agentic-chatbot.heinerdevelops.tech/playground/) | Open your own temporary Filament backend. Edit Agents, knowledge and Playbooks, test, publish, and chat with the resulting Agent in the widget. No account or API key is needed. |

The old Store account and Alex/Sam sign-in have been retired. Old Store and Shop bookmarks lead to the Playground. There is no customer account to choose in either current demo.

## Try the complete editing loop

Glide is a fictional e-bike rental in Amsterdam, Barcelona, Berlin and Lisbon. Your sandbox starts with an Agent, three knowledge sources, a fleet of 16 bikes, selected API connections, booking and bike-problem Playbooks, and three Agent tests.

1. Open the Playground and choose **Open my back office**. Your browser receives a private sandbox. Use the public page's **Chat with Glide** button to try the website widget too.
2. Ask which bike suits a city ride and what the rental policy says. Inspect the fleet App data tool, retrieved knowledge and conversation trace. Ask about weather to try an API read.
3. Open **Agents**, change the instructions or welcome message, save and use the editor's test chat. Publish when ready, then try the widget again. Draft changes do not replace the published version until you publish.
4. Open **Knowledge**, add a short text or sample file, wait for ingestion and attach it to the Agent. Publish the changed Agent and check whether the answer uses your new source.
5. Open **Playbooks** and inspect **Book a test ride** in the step list or canvas. It checks the calendar, branches, asks for confirmation and saves a sandbox booking. Try Cancel as well as Confirm, and inspect the run and stored submission. This does not reserve a real bike or charge money.
6. Report a fictional bike problem or ask for a person. Inspect your sandbox Inbox, claim the case and try an operator reply. The public product Inbox does not promise a staff response time.
7. Run the seeded Agent tests, inspect versions and usage, or start again with the reset action. Reset discards your sandbox changes.

![The native Glide Playground showing the booking Playbook and chat widget](https://raw.githubusercontent.com/heinergiehl/agentic-chatbot-filament-docs/main/images/agentic-chatbot/playground-native.webp)

Native hosted Playground interface captured on 2026-10-20. It uses the plugin's normal Filament editor, with host restrictions described below.

## What the demos cover

| Capability | Available exercise or limit |
| --- | --- |
| Agent instructions, Safety, draft testing, publish and versions | Editable in your Playground backend; the product backend is read-only. |
| Knowledge and citations | Seeded sources plus your own text/files. Website and JSON API ingestion are restricted on the public host. |
| App data reads | Playground fleet records; the product assistant has a read-only plugin catalog. |
| APIs and MCP | Playground weather and calendar APIs, with a PokéAPI connection for experiments. The product assistant has GitHub release and read-only MCP connections. Arbitrary external credentials and tools are restricted. |
| Playbooks and confirmation | Booking and bike-problem examples, native step list/canvas, confirmation and sandbox submissions. A booking is a demo record, not an external transaction. |
| Handoff and human replies | Playground Inbox with your own conversations. The product backend exposes only your browser's conversations. |
| Agent tests, conversation traces and usage | Available in the Playground. Shared host provider credentials and settings remain protected. |
| Authenticated customer data and personal writes | Supported by the plugin with host identity, scopes and policies; not demonstrated by the current public demos. The retired Store is not a current walkthrough. |
| External writes, reconciliation and recovery | Require an integration and controlled failure tests in your own host; the demo booking does not certify these cases. |
| Telegram, Slack, WhatsApp, email, outbound webhooks and Read API | Require your own provider/channel configuration. They are not end-to-end public demo exercises. |
| Other AI providers, vector stores, production roles and deployment operations | Consult the setup guides and test in your own installation. The public Playground runs one fixed provider/model configuration. |

The demos illustrate the main authoring and chat flow. They do not certify every integration, model or production failure mode.

## Limits and data

- A sandbox lasts **two hours** and permits **60 provider calls**, including chat turns, Playbook AI steps, grading and embeddings. One message can use multiple calls. Shared daily and per-IP limits can also pause new sandboxes or AI calls.
- The host fixes chat to **Claude Haiku 5.5 at low effort**, with Google embeddings. Visitors cannot replace credentials, change provider settings or gain administrator privileges.
- You may edit, publish and operate your sandbox. Seeded fleet data is read-only. The host limits sources to text/files and restricts network destinations and tool operations.
- Use fictional information and sample files only. Chat and source content may be sent to the configured AI providers. Sandbox cleanup removes expired sandbox data; do not use it for durable storage. See the [privacy notice](https://filament-agentic-chatbot.heinerdevelops.tech/privacy).

These are demo-host restrictions. Your purchased installation uses your own data, providers, policies and infrastructure. Start with the [Quick Start](QUICKSTART.md) and [known limitations](KNOWN_LIMITATIONS.md).
