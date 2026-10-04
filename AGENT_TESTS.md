# Agent Tests

Tests check that an Agent keeps answering the way you expect after you change
its instructions, tools, knowledge or model. They live in the Agent editor
under **Tests**.

## What a test is

A test is a short conversation: one or more visitor messages in order. Each
message can have checks:

| Check | Passes when |
| --- | --- |
| Tool called | The Agent called this tool while answering the message. |
| Tool not called | The Agent did not call this tool. |
| Answer contains | The answer contains the text, ignoring case. |
| Answer does not contain | The answer does not contain the text, ignoring case. |
| Rubric | A model judges that the answer meets your description, for example "The answer gives the price and asks for the delivery date". |

Tool names are the names the Agent sees, for example `search_knowledge`,
`playbook_12` or the tool name of an API operation or Data Resource. The test
form suggests the tools of the saved draft. A message without checks still has
to get an answer.

## Create tests

- **From a conversation:** open a conversation under **Insights >
  Conversations** and choose **Create test**. The visitor messages become the
  test, and each message expects the tools the Agent called in its answer.
  Clicks on Confirm or Cancel are left out.
- **From the test chat:** in the Agent editor, open **Test**, chat with the
  draft and choose **Save as test**.
- **From feedback and knowledge gaps:** the Agent's Analytics page offers
  **Create test** for negative feedback and for a question the knowledge did
  not answer.
- **By hand:** **Tests > New test**.
- **Off-topic checks:** when **Stay strictly on topic** is on in the draft,
  **Add off-topic checks** creates one test with four typical off-topic
  requests (a poem, Python decorators, an election, a recipe) and one request
  built from the scope text, in the Agent's default language. Each off-topic
  answer must contain the first sentence of the refusal (the Agent's own
  text or the translated default); the in-scope answer must not. The checks
  are text checks, so a run needs no grading call. Edit the requests when
  they belong to the Agent's topics.

A new test opens for editing, so you can add text checks or a rubric.

## Run tests

**Run** runs one test; **Run all** runs every test of the Agent, one after the
other. A run uses the saved draft, not the live version, in the same sandbox
as the test chat: write tools propose their cards but write nothing, and the
handoff tool is not offered. Each run starts a new test conversation.

Click a test to see its last result: every message with the tools the Agent
called, the answer, and each check with a tick or a cross. A rubric check
shows the model's one-sentence reason.

The list shows one result per test:

- **Passed** or **Failed** for the current draft and test.
- **Outdated** after you changed the draft or the test since the last run.
- **Error** when the Agent did not answer (also when a provider failure
  replaced the answer with a fallback message) or a rubric could not be graded.

## Before publishing

The Publish dialog warns when tests failed or have no result for the current
draft and links to the Tests tab. Tests never block publishing.

## Rubric grading

The rubric is graded with the tested Agent version's own provider and model:
one short call with a fixed prompt, temperature 0 and at most 300 output
tokens. The call is recorded in **Insights > Usage** like every model call
(stage `test_grading`). To grade with a cheaper model of the same provider,
set `AGENTIC_CHATBOT_AGENT_TESTS_GRADING_MODEL`.

A grader can be wrong. Keep rubrics short and concrete, and prefer tool and
text checks where they are enough.

## Limits

- Up to 10 visitor messages per test and 10 entries per check.
- A run keeps the last 10 results per test.
- Runs happen in the browser request, one test at a time; a slow provider makes
  **Run all** take a while.
