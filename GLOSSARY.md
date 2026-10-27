# Glossary

The product uses one set of terms in the Filament panel, the chat widget, the buyer and operator guides, and marketing copy. This page is the reference for those terms in English, German, French and Spanish, and it records where developer terms stay.

## English terms

| Concept | 1.0 term | Replaces in the UI |
| --- | --- | --- |
| The configured assistant | Agent | Bot, Chatbot (as an entity), Agent Control Center |
| Unpublished editable state | Draft | saved draft, candidate |
| State answering visitors | Live | active, available, selected version, live version, visitor access |
| Kill switch state | Paused | inactive, availability off |
| Published snapshot | Version | release, deployment, selected version |
| Make the Draft live | Publish | publish candidate, activate, republish |
| Knowledge item | Source | knowledge source (allowed in docs), generation, chunk (docs only) |
| Something the Agent can call | Tool | capability, operation (UI), Data Resource (UI) |
| Read or write tool over host Eloquent data | App data tool | Data Resource |
| Tool over an HTTP API | API tool | connector operation |
| Tool from an MCP server | MCP tool | MCP capability |
| Configured external system | Connection | API connector, MCP connection (as UI labels) |
| Fixed multi-step process | Workflow | Playbook, process |
| Unit of a Workflow | Step | node, trigger (editor UI) |
| Branch of a Workflow | Path | link, edge (editor UI) |
| Values passed between steps | Data | variables, saved details, saved results, outputs |
| Visitor approves a write | Confirm | approve (for visitors), confirmation card (allowed) |
| Team member approves an action | Approve | review, action review |
| Write whose result is not known | Unverified action | unknown outcome, unknown write |
| Person takes over | Handoff | human handoff (allowed) |
| Where visitors chat | Website, Channel | bot, chatbot (as the place) |

Three terms are not in the original table and were decided in W10.1:

| Concept | 1.0 term | Replaces in the UI |
| --- | --- | --- |
| Who a chat is meant for (`public`, `member`, `admin`) | Audience | area, context area |
| A piece of indexed Source text the search returns | Text section | chunk, fragment |
| One fetch of a Source's content | Import | generation |

English navigation, page titles, field labels and actions use sentence case, for example "API connections", "API connection setup" and "App data tool". Product nouns such as Agent, Workflow and Source keep their glossary capitalization.

An audience is the same setting as the `area` in widget attributes, API payloads and configuration; it says who a conversation serves, not where it happens. Where a screen talks about the place a visitor chats, it says Website or Channel.

## German (du)

German UI copy addresses the admin as "du". Quoted visitor messages keep their natural register, including "Sie" and "Ihr". Use "der Workflow", "das Tool" and "die Verbindung". "Agent" is a weak masculine noun: "der Agent", but "den Agenten", "dem Agenten", "des Agenten" and the plural "Agenten". "Agents" is wrong.

| Concept | German term |
| --- | --- |
| Agent | Agent (Plural: Agenten) |
| Draft | Entwurf |
| Live | Live |
| Paused | Pausiert |
| Version | Version |
| Publish | Veröffentlichen |
| Source | Quelle |
| Tool | Tool (Plural: Tools); never "Werkzeug" or "Fähigkeit" |
| App data tool | App-Daten-Tool |
| API tool | API-Tool |
| MCP tool | MCP-Tool |
| Connection | Verbindung; API connection: API-Verbindung; never "Connector" |
| Workflow | der Workflow (Plural: Workflows) |
| Step | Schritt |
| Path | Pfad |
| Data | Daten |
| Confirm | Bestätigen |
| Approve | Freigeben (Approvals: Freigaben) |
| Unverified action | Ungeprüfte Aktion |
| Handoff | Übergabe |
| Website, Channel | Website, Kanal |
| Audience | Zielgruppe |
| Text section | Textabschnitt |
| Import | Import |
| Conversation | Gespräch (Plural: Gespräche) |

## French (vous)

French UI copy addresses the reader as "vous".

| Concept | French term |
| --- | --- |
| Agent | Agent (pluriel : Agents) |
| Draft | Brouillon |
| Live | En ligne |
| Paused | En pause |
| Version | Version |
| Publish | Publier |
| Source | Source |
| Tool | Outil |
| App data tool | Outil de données de l’application |
| API tool | Outil API |
| MCP tool | Outil MCP |
| Connection | Connexion; API connection: connexion API; never "connecteur" |
| Workflow | Workflow (masculin) |
| Step | Étape |
| Path | Chemin |
| Data | Données |
| Confirm | Confirmer |
| Approve | Approuver (Approvals : Approbations) |
| Unverified action | Action non vérifiée |
| Handoff | Transfert |
| Website, Channel | Site web, Canal |
| Audience | Audience |
| Text section | Section de texte |
| Import | Import |

## Spanish (tú)

Spanish UI copy addresses the admin as "tú". Quoted visitor messages may use "usted". The existing translations were mostly "tú"; the few "usted" imperatives in the setup checks and read-tool messages were changed to "tú".

| Concept | Spanish term |
| --- | --- |
| Agent | Agente (plural: Agentes) |
| Draft | Borrador |
| Live | En vivo (a Version: versión en vivo; not "activo", which stays for enabled states) |
| Paused | En pausa |
| Version | Versión |
| Publish | Publicar |
| Source | Fuente |
| Tool | Herramienta |
| App data tool | Herramienta de datos de la aplicación |
| API tool | Herramienta de API |
| MCP tool | Herramienta MCP |
| Connection | Conexión; API connection: conexión de API; never "conector" |
| Workflow | Workflow (masculino) |
| Step | Paso |
| Path | Ruta |
| Data | Datos |
| Confirm | Confirmar |
| Approve | Aprobar (Approvals: Aprobaciones) |
| Unverified action | Acción no verificada |
| Handoff | Traspaso |
| Website, Channel | Sitio web, Canal |
| Audience | Audiencia |
| Text section | Sección de texto |
| Import | Importación |

## Where developer terms stay

The replaced terms are UI and buyer vocabulary. They stay valid in the places below.

1. **Identifiers.** Translation keys, configuration keys, class, table, route and command names, environment variables, JSON and API field names. A Workflow is stored by the `playbooks.*` translation keys and runtime classes such as `AgentPlaybookTurn`; an App data tool is a Data Resource in code, in `filament-agentic-chatbot.data_resources` and in `query_data_resource`; an API connection is an API connector in `filament-agentic-chatbot.api_connectors`; an audience is the `area` field.
2. **Developer documentation.** `docs/PUBLIC_API.md`, `docs/AGENT_RUNTIME_ARCHITECTURE.md`, `docs/AGENTGRAPH_SDK_USAGE.md`, `docs/AI_CONTEXT.md`, `docs/WORKFLOW_JSON_SCHEMA.md`, `docs/RELEASE_ASSURANCE.md`, ADRs, plans and the Markdown files of released versions (release notes, `CHANGELOG.md` entries and `UPGRADING.md` sections of released versions). Data Resource, capability, deployment, generation, chunk and area are the accurate terms there.
3. **Buyer and operator guides** use the 1.0 term in prose and name the developer term once where a reader needs it, for example "App data tools (Data Resources in code)".
4. **Model-facing and runtime text.** System prompts, tool names and descriptions sent to the model, exception and log messages. These are not UI copy and keep the runtime vocabulary.
5. **Words with another meaning.** "Model capabilities" and the assistant capability profile (what a model can do), token "abilities" (permissions), "chunk" for the parts of a channel message in delivery events, "generation" for AI generation (Workflow generation queue, image generation), "area" for a part of the admin panel ("each Agentic Chatbot area") or a layout (safe area), "Bot" in Telegram and Slack bot tokens, "chatbot" in the product name Agentic Chatbot and in visitor-facing widget messages, "release" in release notes.
6. **Workflow editor strings** (`resources/lang/*/workflow-editor.php`, the editor groups of `resources/lang/*/playbooks.php` and `resources/js/workflow-editor`) follow this glossary. Source strings used as translation keys change together with their TypeScript call sites; runtime identifiers stay unchanged. Output in response-safety settings describes the assistant’s reply, and a Path’s exit is its connection point, rather than Data passed between Steps.

## Checking

Terminology is a review rule, not a test: a change that adds or edits UI text in `resources/lang` is reviewed against the replaced terms and the German, French and Spanish decisions above. Use a replaced term only in one of the exception classes above.
