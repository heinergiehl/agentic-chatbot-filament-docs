# Filament Agentic Chatbot 0.17.5

**Release status:** Candidate<br>
**Target release date:** 2026-09-04<br>
**Upgrade baseline:** 0.17.4<br>
**Previous-line security/critical EOL:** 2026-11-17

> This candidate is not buyer-visible. Only the protected exact-source and exact-artifact workflow may publish the immutable release.

Version 0.17.5 corrects continuation of active Playbook waitpoints without broadening the Agent's authority.

## Deterministic standalone continuation

A short, unambiguous whole-message reply to an active text or choice waitpoint now resumes the AgentGraph interrupt before model dispatch. The complete visitor message is stored as the submitted value, so continuation does not depend on provider interpretation and does not incur another model request.

The admission is deliberately narrow. Questions, cancellation, conditions, uncertainty, negation, quoted text, multiline input, and mixed statements remain ordinary Agent turns and do not consume the pending waitpoint. Approval, form, and operator-review interrupts retain their dedicated typed continuation paths.

## Upgrade requirements

There is no new plugin database migration, configuration key, dependency change, or Playbook republish requirement. Run both Doctor commands after updating and repeat saved release-candidate tests for each live Playbook waitpoint path.

```bash
composer update heiner/filament-agentic-chatbot --with-all-dependencies
php artisan filament-agentic-chatbot:doctor
php artisan agent-graph:doctor
```

## Release scope

All Agent-first capabilities, security boundaries, dependency requirements, and 0.17 migration requirements remain in force. This patch changes only bounded standalone continuation admission and the internal published-asset digest check used by the protected release workflow.
