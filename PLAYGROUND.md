# Try the Agent Playground

[Open your playground](https://filament-agentic-chatbot.heinerdevelops.tech/playground)

Give a small assistant a personality, ask a question, change its instructions
and compare the answers. No account, installation or API key is needed.

## A tiny example, already set up

Your assistant knows about **Little Orbit**, a fictional paper-rocket workshop:
Saturday 10:00–12:00 at Moonbeam Studio, EUR 12 including materials, ages 8 and
up, with a full refund for cancellations at least 48 hours before the workshop.
The notes are visible beside the chat, so you can compare an answer with its
source. No real bookings, payments or refunds occur.

1. Select **Make room for play** to create your own temporary Agent draft.
2. Ask **What does it cost?** The assistant can look up the workshop notes.
3. Pick **Space captain** or **Just the facts**, or write your own instructions.
4. Select **Apply & start fresh**, then ask the same question again.
5. Compare the wording and look for the knowledge-source indicator under answers.

You can also edit the first greeting. Applying changes starts a new test chat;
the message allowance belongs to the whole playground and does not reset.
AI answers can be mistaken; the visible workshop notes are the reference.

![Hosted Agent Playground with editable instructions, workshop notes and a private test chat](https://raw.githubusercontent.com/heinergiehl/agentic-chatbot-filament-docs/main/images/agentic-chatbot/playground-workbench.png)

Hosted demo interface, captured live on 2026-10-20. The Laravel host provides
this simplified page; your installation retains the plugin's normal editor.

## What is fixed in this demo?

- Chat: **Claude Haiku 5.5** through Anthropic.
- Knowledge: one shared, fictional text Source, embedded with Google's
  **gemini-embedding-001**. Visitors do not need to re-ingest it.
- Access: your own draft and test conversation, never another visitor's or
  the live product assistant's data.
- Limits: **20 messages over two hours**, with additional per-IP and shared
  daily limits. Availability depends on the demo's remaining allowance.
- No publishing, model changes, credentials, uploads, external tools, customer
  records, bookings or write operations.

These restrictions belong to the public demo host. They do not limit the
providers or tools available in your own installation.

## How it relates to the plugin

The demo runs the plugin's existing editor test chat with a saved draft and an
immutable test deployment that is never activated. The normal durable chat
runtime, authorization and knowledge retrieval still apply. The Laravel host
provides the simplified page, private visitor identity, fixed configuration,
usage limits and expiry. No second AI chat engine is used.

Playground drafts and conversations expire after two hours. Cleanup runs every
ten minutes and waits for active turns before deletion. Unfinished or uncertain
turns and unsettled AI usage receipts can be retained until they are reconciled.
Use fictional information only.
Provider processing and operational usage records remain
subject to the host's [privacy policy](https://filament-agentic-chatbot.heinerdevelops.tech/privacy).

## Three ways to explore

| Demo | What to try |
|---|---|
| [Playground](https://filament-agentic-chatbot.heinerdevelops.tech/playground) | Change instructions and test a small assistant of your own. |
| [Product assistant](https://filament-agentic-chatbot.heinerdevelops.tech/) | Ask about the actual plugin, pricing, releases and integrations. |
| [Fictional store](https://filament-agentic-chatbot.heinerdevelops.tech/store/login) | Sign in as Alex or Sam, read your own orders and confirm a permitted address change. |

The [read-only admin](https://filament-agentic-chatbot.heinerdevelops.tech/demo-admin)
shows the product assistant's setup and your browser's demo conversations;
it remains separate from the playground.
