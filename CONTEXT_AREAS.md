# Context Areas

Context areas control who a bot is meant for and which runtime scope applies to a conversation.

## Built-In Areas

Filament Agentic Chatbot supports area-based access such as:

- `public`
- `member`
- `admin`

You can use these to separate public-facing and authenticated assistant behavior.

## Why Context Areas Matter

They let you keep one app with multiple assistant experiences:

- a public website bot
- a signed-in member help bot
- an internal admin bot

Each bot can define its own allowed areas and default area.

## Typical Patterns

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
- operations workflows
- staff-only docs

## Access Control

Area rules work together with:

- domain allowlists
- auth guards
- optional area abilities
- widget signing

That lets you keep a public bot open while protecting internal assistant experiences.

## Related Docs

- [Bots](BOTS.md)
- [Chat Widget](CHAT_WIDGET.md)
- [Security and Privacy](SECURITY_AND_PRIVACY.md)
