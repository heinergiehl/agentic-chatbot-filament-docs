# Audiences (context areas)

An audience controls who an Agent is meant for and which runtime scope applies to a conversation. The Filament panel calls it **Audience**. In code, widget attributes, API payloads and configuration it is still called the `area` (`data-area`, `area`, `AGENTIC_CHATBOT_WIDGET_CONTEXT_REQUIRED_AREAS`). Both names mean the same thing.

## Built-in audiences

Filament Agentic Chatbot supports audience-based access such as:

- `public`
- `member`
- `admin`

You can use these to separate public-facing and authenticated assistant behavior.

## Why audiences matter

They let you keep one app with multiple assistant experiences:

- a public website Agent
- a signed-in member help Agent
- an internal admin Agent

Each Agent can define its own allowed audiences and default audience.

## Typical patterns

### Public

Use for:

- website visitors
- public help pages
- presales and onboarding questions

### Member

Use for:

- signed-in customers
- protected account help
- user-specific guidance

### Admin

Use for:

- internal support
- operations Workflows
- staff-only docs

## Access control

Audience rules work together with:

- domain allowlists
- auth guards
- optional audience abilities
- widget signing

That lets you keep a public Agent open while protecting internal assistant experiences.

## Related docs

- [Agents](BOTS.md)
- [Chat Widget](CHAT_WIDGET.md)
- [Security and Privacy](SECURITY_AND_PRIVACY.md)
