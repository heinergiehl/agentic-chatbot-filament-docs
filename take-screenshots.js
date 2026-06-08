/**
 * Screenshot capture script for the Filament Agentic Chatbot public docs.
 *
 * Default target: the local sandbox started by the plugin repo.
 * Override with: AGENTIC_DOCS_BASE_URL=https://your-demo.example node take-screenshots.js
 */

const { chromium } = require('playwright');
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const DEFAULT_BASE_URL = 'http://filament-agentic-chatbot.localhost:8000';
const BASE_URL = process.env.AGENTIC_DOCS_BASE_URL || DEFAULT_BASE_URL;
const DEMO_APP_DIR = process.env.AGENTIC_DOCS_DEMO_APP_DIR || path.resolve(__dirname, '..', 'filament-demos');
const OUT_DIR = path.join(__dirname, 'images', 'agentic-chatbot');

const VIEWPORT = { width: 1600, height: 1200 };
const focusModeAccessibleName = 'Enter focus mode';

const screenshots = {
  botList: '01-bot-list.png',
  botEdit: '02-bot-edit.png',
  sourceList: '03-source-ingestion-table.png',
  sourceCreate: '03b-new-source-form.png',
  transcript: '04-conversation-transcript.png',
  widgetDesktop: '05-widget-desktop.png',
  widgetMobile: '06-widget-mobile.png',
  workflowList: '07-workflow-list.png',
  workflowCanvas: '08-workflow-editor-canvas.png',
  workflowFocus: '09-workflow-editor-focus-mode.png',
  workflowQuality: '10-workflow-quality-panel.png',
  workflowGenerate: '11-workflow-generate-tab.png',
  workflowRuns: '12-workflow-runs-tab.png',
  workflowRunTrace: '12b-workflow-run-trace.png',
  qualityLab: '13-quality-lab.png',
  handoffInbox: '14-handoff-inbox.png',
  workflowReleases: '15-workflow-releases-tab.png',
  apiConnectors: '16-api-connectors-list.png',
  workflowToolbar: '17-workflow-toolbar-positioning.png',
  workflowToolbarHeader: '17b-workflow-toolbar-above-canvas.png',
  workflowDark: '18-workflow-editor-dark-mode.png',
};

function browserLaunchArgs() {
  let hostname = '';

  try {
    hostname = new URL(BASE_URL).hostname;
  } catch (error) {
    return [];
  }

  if (!hostname.endsWith('.localhost')) {
    return [];
  }

  return [`--host-resolver-rules=MAP ${hostname} 127.0.0.1`];
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true, args: browserLaunchArgs() });
  const context = await browser.newContext({ viewport: VIEWPORT });
  const page = await context.newPage();

  try {
    await loginToAdmin(page);
    prepareDocsConversationPath();

    await captureAdminPage(page, '/admin/bots', screenshots.botList, /Bots/i, async () => {
      await waitForFirstTableRow(page);
    }, { clip: 'main' });

    await captureBotWidgetPreviewPage(page, screenshots.botEdit);

    await captureNewSourcePage(page, screenshots.sourceCreate);

    await captureConversationReviewPage(page, screenshots.transcript);

    await captureAdminPage(page, '/admin/agent-workflows', screenshots.workflowList, /Workflows/i, async () => {
      await waitForFirstTableRow(page);
    }, { clip: 'main' });

    await captureWorkflowEditor(page, screenshots.workflowCanvas, async () => {
      await activateControl(page.locator('#mode-build'));
      await waitForWorkflowCanvas(page);
      const fitBriefNode = page.locator('.react-flow__node').filter({ hasText: /Build fit brief|Route intent/i }).first();

      if (await isVisible(fitBriefNode)) {
        await fitBriefNode.click();
      }
    }, { zoomClicks: -2 });

    await captureWorkflowEditor(page, screenshots.workflowFocus, async () => {
      await activateControl(page.locator('#mode-build'));
      await waitForWorkflowCanvas(page);
      await closeSettingsSelection(page);
      await collapseWorkflowSidebar(page);
      await collapseSettingsPanel(page);
      await page.getByRole('button', { name: focusModeAccessibleName }).first().click();
      await page.waitForFunction(() => document.body.classList.contains('fi-wf-focus-mode-active'));
      await page.waitForTimeout(700);
    }, { clip: 'canvas-tight', zoomClicks: -1 });

    await captureWorkflowEditor(page, screenshots.workflowQuality, async () => {
      await activateControl(page.locator('#mode-debug'));
      await activateControl(page.locator('#tab-quality'));
      await page.locator('#panel-quality').waitFor({ state: 'visible' });
      await page.getByText(/Fit recommendation stays grounded|Public widget fit check|Quality/i).first().waitFor({ state: 'visible' });
    }, { clip: 'sidebar', zoomClicks: 0 });

    await captureWorkflowEditor(page, screenshots.workflowGenerate, async () => {
      await activateControl(page.locator('#mode-generate'));
      const workflowBrief = page.getByRole('textbox', { name: 'Workflow brief' });
      await workflowBrief.waitFor({ state: 'visible' });
      await workflowBrief.fill('Build a guided fit-assessment workflow that asks the visitor about widget, retrieval, and workflow needs, then returns a concise recommendation.');
    }, { clip: 'sidebar', zoomClicks: 0 });

    await captureQualityScenarioCreatePage(page, screenshots.qualityLab);

    await captureAdminPage(page, '/admin/api-connectors', screenshots.apiConnectors, /Api Connectors/i, async () => {
      await waitForFirstTableRow(page);
    }, { clip: 'main' });

    await captureWorkflowEditor(page, screenshots.workflowDark, async () => {
      await forceDarkMode(page);
      await activateControl(page.locator('#mode-build'));
      await waitForWorkflowCanvas(page);
      await closeSettingsSelection(page);
      await collapseWorkflowSidebar(page);
      await collapseSettingsPanel(page);
      await page.getByRole('button', { name: focusModeAccessibleName }).first().click();
      await page.waitForFunction(() => document.body.classList.contains('fi-wf-focus-mode-active'));
      await page.waitForTimeout(700);
    }, { clip: 'canvas-tight', zoomClicks: -1 });

    await captureWidget(page, screenshots.widgetDesktop);
    await captureMobileWidget(browser);
  } finally {
    await browser.close();
  }

  console.log(`\nAll screenshots saved to: ${OUT_DIR}`);
}

async function loginToAdmin(page) {
  console.log(`Logging in at ${BASE_URL}...`);
  await goto(page, '/admin/login');

  const demoButton = page.getByRole('button', { name: /Enter Demo/i }).first();

  if (await isVisible(demoButton)) {
    await Promise.all([
      page.waitForURL(/\/admin(?:\/)?$/, { timeout: 30_000 }).catch(() => {}),
      demoButton.click(),
    ]);
    await waitForUi(page);
    return;
  }

  const email = process.env.AGENTIC_DOCS_ADMIN_EMAIL;
  const password = process.env.AGENTIC_DOCS_ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error('Could not find the Enter Demo button. Set AGENTIC_DOCS_ADMIN_EMAIL and AGENTIC_DOCS_ADMIN_PASSWORD for protected demos.');
  }

  await page.getByRole('textbox', { name: /Email/i }).fill(email);
  await page.getByRole('textbox', { name: /Password/i }).fill(password);
  await Promise.all([
    page.waitForURL(/\/admin(?:\/)?$/, { timeout: 30_000 }).catch(() => {}),
    page.getByRole('button', { name: /Sign in|Log in|Login/i }).click(),
  ]);
  await waitForUi(page);
}

async function captureAdminPage(page, adminPath, fileName, heading, beforeShot, options = {}) {
  await goto(page, adminPath);
  await page.getByRole('heading', { level: 1, name: heading }).waitFor({ state: 'visible', timeout: 30_000 });

  if (beforeShot) {
    await beforeShot();
  }

  if (options.clip === 'main') {
    await saveLocatorScreenshot(page, page.locator('main').first(), fileName, { padding: 18 });

    return;
  }

  if (options.clip === 'table') {
    await saveLocatorScreenshot(page, page.locator('.fi-ta, table').first(), fileName, { padding: 18 });

    return;
  }

  await saveScreenshot(page, fileName, options.fullPage ?? true);
}

async function captureNewSourcePage(page, fileName) {
  await goto(page, '/admin/knowledge-sources/create');
  await page.getByRole('heading', { level: 1, name: /New Source|Create Source|Create Knowledge Source|Sources/i }).first().waitFor({ state: 'visible', timeout: 30_000 });
  await page.getByText(/Choose the bot and source type|Source Type|Bot/i).first().waitFor({ state: 'visible', timeout: 30_000 });

  await page.waitForTimeout(900);
  await saveLocatorScreenshot(page, page.locator('main').first(), fileName, { padding: 18 });
}

async function captureBotWidgetPreviewPage(page, fileName) {
  await goto(page, '/admin/bots');
  await page.getByRole('heading', { level: 1, name: /Bots/i }).waitFor({ state: 'visible', timeout: 30_000 });
  await waitForFirstTableRow(page);
  await page.locator('tbody tr').filter({ hasText: /Filament Agentic Demo Assistant|Agentic Internal Ops Assistant|Portfolio Concierge/i }).first().getByRole('link').first().click();
  await page.waitForURL(/\/admin\/bots\/\d+\/edit$/, { timeout: 30_000 });

  const widgetTab = page.getByRole('tab', { name: /Widget/i }).first();

  if (await isVisible(widgetTab)) {
    await widgetTab.click();
  }

  await page.getByRole('heading', { name: /Appearance/i }).first().waitFor({ state: 'visible', timeout: 30_000 });
  await page.getByText(/Preview Area|Use the floating widget preview/i).first().waitFor({ state: 'visible', timeout: 30_000 });
  await page.locator('[data-widget-preview-frame]').first().waitFor({ state: 'visible', timeout: 30_000 });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(1500);
  await saveScreenshot(page, fileName, false);
}

async function captureConversationReviewPage(page, fileName) {
  const preparedPath = prepareDocsConversationPath();

  if (preparedPath) {
    await goto(page, preparedPath);
    await page.getByRole('heading', { level: 1, name: /Conversation Review|Conversation:/i }).waitFor({ state: 'visible' });
    await page.locator('.fi-convo-bubble-bot, .fi-convo-bubble-user').nth(3).waitFor({ state: 'visible', timeout: 30_000 });
    await page.waitForTimeout(900);
    await saveLocatorScreenshot(page, page.locator('main').first(), fileName, { padding: 18 });

    return;
  }

  await goto(page, '/admin/bot-conversations');
  await page.getByRole('heading', { level: 1, name: /Conversations/i }).waitFor({ state: 'visible' });
  await waitForFirstTableRow(page);

  const row = page.locator('tbody tr').first();
  const reviewLink = row.getByRole('link', { name: /Review|View|Inspect/i }).first();

  if (await isVisible(reviewLink)) {
    await reviewLink.click();
  } else {
    await row.getByRole('link').first().click();
  }

  await page.waitForURL(/\/admin\/bot-conversations\/\d+$/, { timeout: 30_000 });
  await page.getByRole('heading', { level: 1, name: /Conversation Review|Conversation:/i }).waitFor({ state: 'visible' });
  await page.locator('code, .fi-convo-bubble-bot, .fi-convo-bubble-user').first().waitFor({ state: 'visible' });
  await page.waitForTimeout(1200);
  await saveLocatorScreenshot(page, page.locator('main').first(), fileName, { padding: 18 });
}

async function captureQualityScenarioCreatePage(page, fileName) {
  await goto(page, '/admin/bot-quality-scenarios/create');
  await page.getByRole('heading', { level: 1, name: /Create|New|Quality/i }).first().waitFor({ state: 'visible', timeout: 30_000 });

  await selectFilamentSelectByIndex(page, 0, 'Filament Agentic Demo Assistant');
  await selectFilamentSelectByIndex(page, 1, 'Agentic vs RAG Fit Advisor');
  await fillFirstVisibleTextbox(page, /Name/i, 'Public widget fit check');
  await fillFirstVisibleTextbox(page, /Description/i, 'Checks that the assistant recommends the right product path without overpromising.');
  await fillFirstVisibleTextbox(page, /User Message|Message/i, 'We need a branded widget, grounded answers, and workflow routing for a customer portal. Is this a fit?');
  await fillFirstVisibleTextarea(page, /Expectations|Expected|Checks/i, 'Answer mentions widget branding, retrieval, workflow routing, and a review-before-publish step.');

  await page.waitForTimeout(900);
  await saveLocatorScreenshot(page, page.locator('main').first(), fileName, { padding: 18 });
}

function prepareDocsConversationPath() {
  if (!fs.existsSync(path.join(DEMO_APP_DIR, 'vendor', 'autoload.php')) || !fs.existsSync(path.join(DEMO_APP_DIR, 'bootstrap', 'app.php'))) {
    return null;
  }

  const php = String.raw`
require __DIR__.'/vendor/autoload.php';
$app = require __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$conn = class_exists(\App\Support\DemoAgenticConnection::class)
    ? \App\Support\DemoAgenticConnection::resolve()
    : config('filament-agentic-chatbot.database.connection', config('database.default'));

$schema = \Illuminate\Support\Facades\DB::connection($conn)->getSchemaBuilder();
if (! $schema->hasTable('agentic_bots') || ! $schema->hasTable('bot_conversations') || ! $schema->hasTable('bot_messages')) {
    exit(0);
}

$bot = \Illuminate\Support\Facades\DB::connection($conn)->table('agentic_bots')
    ->whereIn('public_id', ['feedback-loop', 'admin-copilot', 'portfolio-concierge'])
    ->orderByRaw("case public_id when 'feedback-loop' then 0 when 'admin-copilot' then 1 else 2 end")
    ->first();

if (! $bot) {
    exit(0);
}

$now = now();
$runtimeConfig = json_decode((string) ($bot->runtime_config ?? '{}'), true);
$runtimeConfig = is_array($runtimeConfig) ? $runtimeConfig : [];
$runtimeConfig['widget'] = array_merge(
    is_array($runtimeConfig['widget'] ?? null) ? $runtimeConfig['widget'] : [],
    [
        'style_template' => 'clean',
        'font_preset' => 'inter',
        'size_preset' => 'comfortable',
        'accent_color' => '#2563eb',
        'title' => 'Agentic Demo Assistant',
        'subtitle' => 'Grounded answers and guided workflows',
        'welcome_message' => 'Ask about setup, widget embedding, workflow routing, or quality checks.',
        'input_placeholder' => 'Ask about workflows, sources, or widget setup...',
        'quick_prompts' => [
            'Show setup steps',
            'Explain workflow routing',
            'Review quality gates',
        ],
        'preview_area' => 'public',
        'area_overrides' => [
            [
                'area' => 'public',
                'style_template' => 'clean',
                'font_preset' => 'inter',
                'size_preset' => 'comfortable',
                'accent_color' => '#2563eb',
                'title' => 'Agentic Demo Assistant',
                'subtitle' => 'Grounded answers and guided workflows',
                'welcome_message' => 'Ask about setup, widget embedding, workflow routing, or quality checks.',
                'input_placeholder' => 'Ask about workflows, sources, or widget setup...',
                'quick_prompts' => [
                    'Show setup steps',
                    'Explain workflow routing',
                    'Review quality gates',
                ],
            ],
        ],
    ]
);

\Illuminate\Support\Facades\DB::connection($conn)->table('agentic_bots')->where('id', $bot->id)->update([
    'runtime_config' => json_encode($runtimeConfig, JSON_THROW_ON_ERROR),
    'updated_at' => $now,
]);

$session = 'docs-tour-conversation-review';
$createdAt = $now->copy()->subMinutes(42);
$updatedAt = $now->copy()->subMinutes(35);

$conversation = \Illuminate\Support\Facades\DB::connection($conn)->table('bot_conversations')
    ->where('bot_id', $bot->id)
    ->where('session_id', $session)
    ->first();

$payload = [
    'bot_id' => $bot->id,
    'session_id' => $session,
    'context_area' => 'public',
    'meta' => json_encode([
        'source' => 'docs-screenshot-tour',
        'summary' => 'Curated review conversation for the public documentation tour.',
    ], JSON_THROW_ON_ERROR),
    'created_at' => $createdAt,
    'updated_at' => $updatedAt,
];

if ($conversation) {
    \Illuminate\Support\Facades\DB::connection($conn)->table('bot_conversations')->where('id', $conversation->id)->update($payload);
    $conversationId = $conversation->id;
} else {
    $conversationId = \Illuminate\Support\Facades\DB::connection($conn)->table('bot_conversations')->insertGetId($payload);
}

\Illuminate\Support\Facades\DB::connection($conn)->table('bot_messages')->where('bot_conversation_id', $conversationId)->delete();

$sourceDocs = [
    [
        'label' => 'Quickstart',
        'locator' => 'Install',
        'score' => 0.92,
        'preview' => 'Install the package, publish config, run migrations, and register the Filament plugin.',
    ],
    [
        'label' => 'Chat Widget',
        'locator' => 'Embedding',
        'score' => 0.88,
        'preview' => 'Use the Blade component, JavaScript loader, or npm package to embed the widget.',
    ],
];

$sourceWorkflow = [
    [
        'label' => 'Agentic Workflows',
        'locator' => 'Runtime',
        'score' => 0.9,
        'preview' => 'Published workflows can collect input, call actions or API connectors, search knowledge, and return structured replies.',
    ],
];

$messages = [
    ['user', 'How fast can I install the plugin and get a branded support widget online?', null, null],
    ['assistant', "Most teams can install it in under 15 minutes. The package ships with the Filament admin for bots, sources, conversations, and an embeddable widget you can brand with your own title, accent color, welcome copy, and allowed areas.", $sourceDocs, ['content_format' => 'plain_text', 'feedback' => 'positive']],
    ['user', 'Can it route a lead through a workflow and still cite the docs it used?', null, null],
    ['assistant', 'Yes. A published workflow can collect lead context, branch by intent, call API connectors, search knowledge sources, and return a cited answer. The admin can inspect the transcript and the workflow run afterward.', $sourceWorkflow, ['content_format' => 'plain_text']],
    ['user', 'What should my team review before publishing the workflow?', null, null],
    ['assistant', 'Check source freshness, run the linked quality scenarios, inspect the latest run trace, and publish a version note. Failed scenarios stay visible in the editor so fixes happen before the draft becomes live.', $sourceWorkflow, ['content_format' => 'plain_text', 'feedback' => 'positive']],
];

foreach ($messages as $index => [$role, $content, $sources, $meta]) {
    \Illuminate\Support\Facades\DB::connection($conn)->table('bot_messages')->insert([
        'bot_conversation_id' => $conversationId,
        'role' => $role,
        'content' => $content,
        'sources' => $sources === null ? null : json_encode($sources, JSON_THROW_ON_ERROR),
        'meta' => $meta === null ? null : json_encode($meta, JSON_THROW_ON_ERROR),
        'created_at' => $createdAt->copy()->addMinutes($index * 2),
        'updated_at' => $createdAt->copy()->addMinutes($index * 2),
    ]);
}

if ($schema->hasTable('agent_workflows') && $schema->hasTable('bot_quality_scenarios') && $schema->hasTable('bot_quality_runs')) {
    $workflowQuery = \Illuminate\Support\Facades\DB::connection($conn)->table('agent_workflows')
        ->where('name', 'Agentic vs RAG Fit Advisor');

    if ($schema->hasColumn('agent_workflows', 'deleted_at')) {
        $workflowQuery->whereNull('deleted_at');
    }

    $workflow = $workflowQuery->orderByDesc('id')->first();

    if ($workflow) {
        $qualityBotId = $workflow->bot_id ?: $bot->id;
        $qualityScenarios = [
            [
                'name' => 'Public widget fit check',
                'description' => 'Docs screenshot scenario: validates a practical buyer fit answer.',
                'user_message' => 'We need a branded widget, grounded answers, and workflow routing for a customer portal. Is this a fit?',
                'is_blocking' => true,
                'expectations' => [
                    'required_text' => ['widget', 'grounded', 'workflow'],
                    'requires_citation' => true,
                    'expected_path' => ['public_widget', 'retrieval', 'fit_brief'],
                    'max_latency_ms' => 2500,
                ],
                'run' => [
                    'status' => 'passed',
                    'score' => 94,
                    'latency_ms' => 1180,
                    'cost_cents' => 2,
                    'failure_summary' => null,
                    'response_excerpt' => 'Yes. Start with the branded widget, keep answers grounded in approved sources, and route complex requests through a workflow draft before publishing.',
                    'checks' => [
                        ['key' => 'required_text', 'status' => 'passed', 'message' => 'Widget, grounded answer, and workflow routing were all mentioned.'],
                        ['key' => 'citation', 'status' => 'passed', 'message' => 'Answer cited approved setup documentation.'],
                        ['key' => 'path', 'status' => 'passed', 'message' => 'Scenario reached the fit brief path.'],
                    ],
                ],
            ],
            [
                'name' => 'Fit recommendation stays grounded',
                'description' => 'Docs screenshot scenario: keeps the recommendation clear without overpromising.',
                'user_message' => 'Should we use a simple RAG bot or the agentic workflow plugin for onboarding and support triage?',
                'is_blocking' => false,
                'expectations' => [
                    'required_text' => ['RAG', 'workflow', 'triage'],
                    'requires_citation' => true,
                    'max_latency_ms' => 2500,
                ],
                'run' => [
                    'status' => 'passed',
                    'score' => 96,
                    'latency_ms' => 1240,
                    'cost_cents' => 2,
                    'failure_summary' => null,
                    'response_excerpt' => 'Use a simple grounded bot for documentation Q&A; choose the agentic plugin when onboarding or support triage needs branching, data capture, or API steps.',
                    'checks' => [
                        ['key' => 'required_text', 'status' => 'passed', 'message' => 'Recommendation compared simple RAG and workflow triage clearly.'],
                        ['key' => 'citation', 'status' => 'passed', 'message' => 'Answer cited knowledge sources.'],
                    ],
                ],
            ],
        ];

        foreach ($qualityScenarios as $scenarioData) {
            $scenario = \Illuminate\Support\Facades\DB::connection($conn)->table('bot_quality_scenarios')
                ->where('agent_workflow_id', $workflow->id)
                ->where('name', $scenarioData['name'])
                ->first();

            $scenarioPayload = [
                'bot_id' => $qualityBotId,
                'agent_workflow_id' => $workflow->id,
                'name' => $scenarioData['name'],
                'description' => $scenarioData['description'],
                'user_message' => $scenarioData['user_message'],
                'context_messages' => null,
                'expectations' => json_encode($scenarioData['expectations'], JSON_THROW_ON_ERROR),
                'is_blocking' => $scenarioData['is_blocking'],
                'is_active' => true,
                'last_run_at' => $now->copy()->subMinutes($scenarioData['run']['status'] === 'failed' ? 9 : 53),
                'source' => 'manual',
                'source_bot_message_id' => null,
                'created_at' => $now->copy()->subHours(3),
                'updated_at' => $now->copy()->subMinutes(8),
            ];

            if ($scenario) {
                \Illuminate\Support\Facades\DB::connection($conn)->table('bot_quality_scenarios')->where('id', $scenario->id)->update($scenarioPayload);
                $scenarioId = $scenario->id;
            } else {
                $scenarioId = \Illuminate\Support\Facades\DB::connection($conn)->table('bot_quality_scenarios')->insertGetId($scenarioPayload);
            }

            $scenarioModel = new \Heiner\FilamentAgenticChatbot\Models\BotQualityScenario();
            $scenarioModel->forceFill([
                'bot_id' => $qualityBotId,
                'agent_workflow_id' => $workflow->id,
                'user_message' => $scenarioData['user_message'],
                'context_messages' => [],
                'expectations' => $scenarioData['expectations'],
            ]);

            $workflowDraftData = json_decode((string) ($workflow->draft_workflow_data ?: $workflow->workflow_data ?: '{}'), true);
            $workflowDraftData = is_array($workflowDraftData) ? $workflowDraftData : [];
            $workflowDraftFingerprint = \Heiner\FilamentAgenticChatbot\Models\AgentWorkflow::payloadFingerprint(
                $workflowDraftData,
                (int) ($workflow->draft_schema_version ?? $workflow->schema_version ?? \Heiner\FilamentAgenticChatbot\Models\AgentWorkflow::SCHEMA_VERSION)
            );
            $scenarioFingerprint = $scenarioModel->qualityFingerprint();

            \Illuminate\Support\Facades\DB::connection($conn)->table('bot_quality_runs')->where('bot_quality_scenario_id', $scenarioId)->delete();

            $run = $scenarioData['run'];
            $runTime = $now->copy()->subMinutes($run['status'] === 'failed' ? 9 : 53);
            \Illuminate\Support\Facades\DB::connection($conn)->table('bot_quality_runs')->insert([
                'bot_quality_scenario_id' => $scenarioId,
                'bot_id' => $qualityBotId,
                'agent_workflow_id' => $workflow->id,
                'workflow_run_id' => null,
                'status' => $run['status'],
                'target' => 'workflow_draft',
                'workflow_draft_fingerprint' => $workflowDraftFingerprint,
                'scenario_fingerprint' => $scenarioFingerprint,
                'score' => $run['score'],
                'checks' => json_encode($run['checks'], JSON_THROW_ON_ERROR),
                'response_excerpt' => $run['response_excerpt'],
                'failure_summary' => $run['failure_summary'],
                'latency_ms' => $run['latency_ms'],
                'prompt_tokens' => 740,
                'completion_tokens' => 230,
                'cost_cents' => $run['cost_cents'],
                'started_at' => $runTime->copy()->subSeconds(2),
                'finished_at' => $runTime,
                'created_at' => $runTime,
                'updated_at' => $runTime,
            ]);
        }
    }
}

echo $conversationId;
`;

  const result = spawnSync('php', ['-r', php], {
    cwd: DEMO_APP_DIR,
    encoding: 'utf8',
    timeout: 30_000,
  });

  if (result.status !== 0) {
    console.warn(`  could not prepare docs conversation: ${result.stderr || result.stdout}`);
    return null;
  }

  const conversationId = (result.stdout || '').trim();

  if (!/^\d+$/.test(conversationId)) {
    return null;
  }

  return `/admin/bot-conversations/${conversationId}`;
}

async function captureWorkflowEditor(page, fileName, beforeShot, options = {}) {
  await goto(page, '/admin/agent-workflows');
  await page.getByRole('heading', { level: 1, name: /Workflows/i }).waitFor({ state: 'visible' });
  await resetWorkflowToolbarPlacement(page);
  await waitForFirstTableRow(page);

  const workflowRow = await preferredWorkflowRow(page);
  await workflowRow.getByRole('link').first().click();

  await page.getByRole('heading', { level: 1, name: /Agentic vs RAG|Setup|Agentic Showcase|Buyer Qualification|Workflow/i }).waitFor({ state: 'visible' });
  await page.locator('#workflow-editor-root').waitFor({ state: 'visible' });
  await page.waitForTimeout(1000);
  await exitFocusModeIfActive(page);
  await expandWorkflowSidebarIfCollapsed(page);

  if (options.clip !== 'sidebar' && options.fitCanvas !== false) {
    await fitWorkflowCanvas(page);
  }

  if (beforeShot) {
    await beforeShot();
  }

  if (options.clip !== 'sidebar' && options.fitCanvas !== false) {
    await fitWorkflowCanvas(page);
  }

  await zoomWorkflowCanvas(page, options.zoomClicks ?? -1);
  await page.waitForTimeout(500);

  if (options.clip === 'sidebar') {
    await saveWorkflowSidebarScreenshot(page, fileName, { blur: options.blur ?? true });
  } else if (options.clip === 'canvas-tight') {
    await saveWorkflowCanvasTightScreenshot(page, fileName, { blur: options.blur ?? true });
  } else {
    await saveLocatorScreenshot(page, page.locator('#workflow-editor-root').first(), fileName, {
      blur: options.blur ?? true,
      padding: 0,
    });
  }
}

async function preferredWorkflowRow(page) {
  const preferredNames = [
    /Agentic vs RAG Fit Advisor/i,
    /Setup & Support Navigator/i,
    /Plugin Feedback Collector/i,
    /Agentic Showcase Command Center/i,
  ];

  for (const name of preferredNames) {
    const row = page.locator('tbody tr').filter({ hasText: name }).first();

    if (await isVisible(row)) {
      return row;
    }
  }

  return page.locator('tbody tr').first();
}

async function zoomWorkflowCanvas(page, clicks = 7) {
  if (clicks === 0) {
    return;
  }

  const zoomButton = page.getByRole('button', { name: clicks > 0 ? 'Zoom in' : 'Zoom out' }).first();

  if (!(await isVisible(zoomButton))) {
    return;
  }

  for (let index = 0; index < Math.abs(clicks); index++) {
    await zoomButton.click();
    await page.waitForTimeout(120);
  }
}

async function fitWorkflowCanvas(page) {
  const candidates = [
    page.getByRole('button', { name: /Fit view|Fit to view|Fit graph|Center graph/i }).first(),
    page.locator('button[title*="Fit" i], button[aria-label*="Fit" i]').first(),
  ];

  for (const candidate of candidates) {
    if (await isVisible(candidate)) {
      await candidate.click();
      await page.waitForTimeout(500);
      return;
    }
  }
}

async function dockWorkflowToolbarOnCanvasRight(page) {
  const canvasBox = await getWorkflowCanvasBox(page);

  if (!canvasBox) {
    return;
  }

  await dragWorkflowToolbarTo(page, canvasBox.x + canvasBox.width - 36, canvasBox.y + 28);
}

async function dockWorkflowToolbarAboveCanvasRight(page) {
  const canvasBox = await getWorkflowCanvasBox(page);

  if (!canvasBox) {
    return;
  }

  await dragWorkflowToolbarTo(page, canvasBox.x + canvasBox.width - 36, canvasBox.y - 24);
}

async function dragWorkflowToolbarTo(page, targetX, targetY) {
  const dragHandle = page.getByRole('button', { name: /Drag toolbar/i }).first();

  if (!(await isVisible(dragHandle))) {
    return;
  }

  const handleBox = await dragHandle.boundingBox();

  if (!handleBox) {
    return;
  }

  const startX = handleBox.x + handleBox.width / 2;
  const startY = handleBox.y + handleBox.height / 2;

  await page.mouse.move(startX, startY);
  await page.mouse.down();
  await page.mouse.move(targetX, targetY, { steps: 18 });
  await page.mouse.up();
  await page.waitForTimeout(700);
}

async function getWorkflowCanvasBox(page) {
  const canvas = page.locator('.fi-wf-canvas').first();
  await canvas.waitFor({ state: 'visible', timeout: 30_000 });

  return canvas.boundingBox();
}

async function closeSettingsSelection(page) {
  const closeSettings = page.locator('button.fi-wf-settings-close').first();

  if (await isVisible(closeSettings)) {
    await closeSettings.click();
    await page.waitForTimeout(500);
  }
}

async function collapseSettingsPanel(page) {
  const collapseButtons = page.locator('button.fi-wf-settings-collapse-btn');
  const count = await collapseButtons.count().catch(() => 0);

  for (let index = 0; index < count; index++) {
    const button = collapseButtons.nth(index);

    if (await button.isVisible().catch(() => false)) {
      await button.click({ force: true }).catch(() => {});
      await page.locator('.fi-wf-panel-settings--collapsed').first().waitFor({ state: 'visible', timeout: 30_000 }).catch(() => {});
      await page.waitForTimeout(700);

      if (await page.locator('.fi-wf-panel-settings--collapsed').first().isVisible().catch(() => false)) {
        return;
      }
    }
  }

  await page.evaluate(() => {
    const rawLayout = window.localStorage.getItem('fi-wf-editor-panel-layout');
    const layout = rawLayout ? JSON.parse(rawLayout) : {};

    window.localStorage.setItem('fi-wf-editor-panel-layout', JSON.stringify({
      ...layout,
      settingsWidth: 0,
      lastExpandedSettingsWidth: layout.lastExpandedSettingsWidth || 320,
    }));
  }).catch(() => {});
  await page.reload({ waitUntil: 'domcontentloaded' });
  await waitForUi(page);
  await page.locator('#workflow-editor-root').waitFor({ state: 'visible', timeout: 30_000 });
  await waitForWorkflowCanvas(page);
  await page.locator('.fi-wf-panel-settings--collapsed').first().waitFor({ state: 'visible', timeout: 30_000 }).catch(() => {});
  await page.waitForTimeout(700);
}

async function resetWorkflowToolbarPlacement(page) {
  await page.evaluate(() => {
    window.localStorage.removeItem('fi-wf-floating-hud-placement-v1');
  }).catch(() => {});
}

async function forceDarkMode(page) {
  await page.emulateMedia({ colorScheme: 'dark' }).catch(() => {});
  await page.evaluate(() => {
    window.localStorage.setItem('theme', 'dark');
    window.localStorage.setItem('color-theme', 'dark');
    document.documentElement.classList.add('dark');
    document.documentElement.style.colorScheme = 'dark';
  });
  await page.waitForTimeout(700);
}

async function waitForRunDetails(page) {
  const loadingState = page.getByText('Loading run detail...').first();

  await page.waitForTimeout(700);
  await loadingState.waitFor({ state: 'hidden', timeout: 30_000 });
  await page.waitForTimeout(500);
}

async function collapseWorkflowSidebar(page) {
  const collapseSidebar = page.getByRole('button', { name: 'Collapse sidebar' }).first();

  if (await isVisible(collapseSidebar)) {
    await collapseSidebar.click();
    await page.waitForTimeout(500);
  }
}

async function expandWorkflowSidebarIfCollapsed(page) {
  const expandSidebar = page.getByRole('button', { name: 'Expand sidebar' }).first();

  if (await isVisible(expandSidebar)) {
    await expandSidebar.click();
    await page.waitForTimeout(500);
  }
}

async function exitFocusModeIfActive(page) {
  const exitFocusMode = page.getByRole('button', { name: 'Exit focus mode' }).first();

  if (await isVisible(exitFocusMode)) {
    await exitFocusMode.click();
    await page.waitForFunction(() => !document.body.classList.contains('fi-wf-focus-mode-active'));
  }
}

async function captureWidget(page, fileName) {
  await goto(page, '/#widget');

  const widgetSection = page.locator('#widget').first();
  await widgetSection.waitFor({ state: 'visible', timeout: 30_000 });
  await widgetSection.scrollIntoViewIfNeeded();

  const widgetRoot = page.locator('.frw-root').first();
  const widgetLauncher = page.locator('[data-frw-role="launcher"]').first();
  const widgetWindow = page.locator('.frw-root.frw-open [data-frw-role="window"]').first();

  const isOpen = await widgetRoot.evaluate((element) => element.classList.contains('frw-open')).catch(() => false);

  if (!isOpen) {
    if (await isVisible(widgetLauncher)) {
      await widgetLauncher.click();
    } else {
      await widgetRoot.evaluate((element) => element.classList.add('frw-open'));
    }
  }

  await widgetWindow.waitFor({ state: 'visible', timeout: 30_000 });
  await page.waitForFunction(() => !document.querySelector('.frw-root.frw-open [data-frw-role="form"]')?.classList.contains('frw-input-busy'), null, { timeout: 15_000 }).catch(() => {});
  await page.waitForTimeout(900);
  await blurActiveElement(page);
  await saveScreenshot(page, fileName, false);
}

async function captureMobileWidget(browser) {
  const context = await browser.newContext({
    viewport: { width: 430, height: 932 },
    isMobile: true,
    hasTouch: true,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  });

  const page = await context.newPage();

  try {
    await captureWidget(page, screenshots.widgetMobile);
  } finally {
    await context.close();
  }
}

async function openWidget(page) {
  await waitForUi(page);

  const widgetWindow = page.locator('[data-frw-role="window"]').first();
  const composer = page.locator('[data-frw-role="input"]').first();

  if (await isVisible(widgetWindow) && await isVisible(composer)) {
    return;
  }

  if (!await isVisible(widgetWindow)) {
    const launchers = [
      page.locator('[data-frw-role="launcher"]').first(),
      page.locator('[data-agentic-chatbot-widget] button').first(),
      page.getByRole('button', { name: /Open chat|Chat|Ask/i }).first(),
    ];

    for (const launcher of launchers) {
      if (await isVisible(launcher)) {
        await launcher.click();
        break;
      }
    }
  }

  await widgetWindow.waitFor({ state: 'visible', timeout: 30_000 });
  await composer.waitFor({ state: 'visible', timeout: 30_000 });
  await page.waitForTimeout(500);
}

async function fillWidgetPrompt(page, message) {
  const composer = page.locator('[data-frw-role="input"]').first();
  await composer.fill(message);
  await composer.press('Enter');
  await page.waitForTimeout(2000);
  await page.locator('[data-frw-role="window"]').first().waitFor({ state: 'visible', timeout: 30_000 });
}

async function activateControl(locator) {
  const target = locator.first();
  await target.waitFor({ state: 'visible', timeout: 30_000 });
  await target.click();
  await new Promise((resolve) => setTimeout(resolve, 350));
}

async function searchAdminTable(page, value) {
  const search = page.getByRole('searchbox', { name: 'Search', exact: true });

  if (await isVisible(search)) {
    await search.fill(value);
    await page.waitForTimeout(900);
  }
}

async function waitForFirstTableRow(page) {
  await page.locator('tbody tr').first().waitFor({ state: 'visible', timeout: 30_000 });
}

async function waitForRowText(page, text) {
  await page.locator('tbody tr').filter({ hasText: text }).first().waitFor({ state: 'visible', timeout: 30_000 });
}

async function waitForWorkflowCanvas(page) {
  await page.locator('.react-flow__node').first().waitFor({ state: 'visible', timeout: 30_000 });
}

async function fillFirstVisibleTextbox(page, name, value) {
  const textbox = page.getByRole('textbox', { name }).first();

  if (await isVisible(textbox)) {
    await textbox.fill(value);
    await page.waitForTimeout(250);
  }
}

async function fillFirstVisibleTextarea(page, name, value) {
  await fillFirstVisibleTextbox(page, name, value);
}

async function selectFilamentOption(page, fieldName, optionName) {
  const controls = [
    page.getByRole('combobox', { name: fieldName }).first(),
    page.getByLabel(fieldName).first(),
  ];

  for (const control of controls) {
    if (!(await isVisible(control))) {
      continue;
    }

    await control.click();
    await page.waitForTimeout(500);

    const option = page.getByRole('option', { name: optionName }).first();
    await option.waitFor({ state: 'visible', timeout: 5_000 }).catch(() => {});

    if (await isVisible(option)) {
      await option.click();
      await page.waitForTimeout(500);
      return;
    }

    await page.keyboard.press('Escape').catch(() => {});
  }
}

async function selectFilamentSelectByIndex(page, index, optionText) {
  const button = page.locator('.fi-select-input-btn').nth(index);

  if (!(await isVisible(button))) {
    return;
  }

  await button.click();
  await page.waitForTimeout(700);

  const option = page.getByText(optionText, { exact: true }).first();
  await option.waitFor({ state: 'visible', timeout: 10_000 }).catch(() => {});

  if (await isVisible(option)) {
    await option.click();
    await page.waitForTimeout(700);
  } else {
    await page.keyboard.press('Escape').catch(() => {});
  }
}

async function goto(page, targetPath) {
  const url = targetPath.startsWith('http') ? targetPath : `${BASE_URL}${targetPath}`;
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await waitForUi(page);
}

async function waitForUi(page, delay = 700) {
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.waitForTimeout(delay);
}

async function saveLocatorScreenshot(page, locator, fileName, options = {}) {
  await dismissVisibleNotifications(page);

  if (options.blur !== false) {
    await blurActiveElement(page);
  }

  await locator.waitFor({ state: 'visible', timeout: 30_000 });
  await locator.scrollIntoViewIfNeeded().catch(() => {});
  await page.waitForTimeout(300);

  const box = await locator.boundingBox();
  const viewport = page.viewportSize() || VIEWPORT;

  if (!box) {
    await saveScreenshot(page, fileName, false, options);
    return;
  }

  const padding = options.padding ?? 16;
  const x = Math.max(0, Math.floor(box.x - padding));
  const y = Math.max(0, Math.floor(box.y - padding));
  const maxWidth = Math.max(1, viewport.width - x);
  const maxHeight = Math.max(1, viewport.height - y);
  const width = Math.min(maxWidth, Math.ceil(box.width + padding * 2));
  const height = Math.min(maxHeight, Math.ceil(box.height + padding * 2));
  const filePath = path.join(OUT_DIR, fileName);

  await page.screenshot({
    path: filePath,
    animations: 'disabled',
    clip: { x, y, width, height },
  });
  console.log(`  saved ${fileName}`);
}

async function saveWorkflowSidebarScreenshot(page, fileName, options = {}) {
  await dismissVisibleNotifications(page);

  if (options.blur !== false) {
    await blurActiveElement(page);
  }

  const sidebar = page.locator('.fi-wf-sidebar').first();
  await sidebar.waitFor({ state: 'visible', timeout: 30_000 });

  const box = await sidebar.boundingBox();
  const viewport = page.viewportSize() || VIEWPORT;

  if (!box) {
    await saveScreenshot(page, fileName, false, options);
    return;
  }

  const filePath = path.join(OUT_DIR, fileName);
  await page.screenshot({
    path: filePath,
    animations: 'disabled',
    clip: {
      x: Math.max(0, Math.floor(box.x)),
      y: Math.max(0, Math.floor(box.y)),
      width: Math.min(viewport.width - Math.floor(box.x), Math.ceil(box.width) + 1),
      height: Math.min(viewport.height - Math.floor(box.y), Math.ceil(box.height)),
    },
  });
  console.log(`  saved ${fileName}`);
}

async function saveWorkflowCanvasTightScreenshot(page, fileName, options = {}) {
  await dismissVisibleNotifications(page);

  if (options.blur !== false) {
    await blurActiveElement(page);
  }

  await waitForWorkflowCanvas(page);
  const filePath = path.join(OUT_DIR, fileName);
  const viewport = page.viewportSize() || VIEWPORT;
  const clip = await page.evaluate((fallbackViewport) => {
    const root = document.querySelector('#workflow-editor-root');
    const nodes = Array.from(document.querySelectorAll('.react-flow__node'));

    if (!root || nodes.length === 0) {
      return null;
    }

    const rootBox = root.getBoundingClientRect();
    const nodeBoxes = nodes.map((node) => node.getBoundingClientRect());
    const left = Math.min(...nodeBoxes.map((box) => box.left));
    const right = Math.max(...nodeBoxes.map((box) => box.right));
    const top = Math.min(...nodeBoxes.map((box) => box.top));
    const bottom = Math.max(...nodeBoxes.map((box) => box.bottom));
    const centerX = (left + right) / 2;
    const targetWidth = Math.min(fallbackViewport.width - rootBox.left, 1120);
    const paddedHeight = Math.min(fallbackViewport.height - rootBox.top, Math.max(860, bottom - rootBox.top + 96));
    const x = Math.max(rootBox.left, Math.min(centerX - targetWidth / 2, fallbackViewport.width - targetWidth));
    const y = Math.max(0, rootBox.top);

    return {
      x: Math.floor(x),
      y: Math.floor(y),
      width: Math.floor(Math.min(targetWidth, fallbackViewport.width - x)),
      height: Math.floor(Math.min(paddedHeight, fallbackViewport.height - y)),
    };
  }, viewport);

  if (!clip) {
    await saveLocatorScreenshot(page, page.locator('#workflow-editor-root').first(), fileName, options);
    return;
  }

  await page.screenshot({
    path: filePath,
    animations: 'disabled',
    clip,
  });
  console.log(`  saved ${fileName}`);
}

async function saveScreenshot(page, fileName, fullPage, options = {}) {
  await dismissVisibleNotifications(page);

  if (options.blur !== false) {
    await blurActiveElement(page);
  }

  const filePath = path.join(OUT_DIR, fileName);
  await page.screenshot({ path: filePath, fullPage, animations: 'disabled' });
  console.log(`  saved ${fileName}`);
}

async function dismissVisibleNotifications(page) {
  const closeButtons = page.locator('.fi-no-notification-close-btn');
  const count = await closeButtons.count().catch(() => 0);

  for (let index = count - 1; index >= 0; index--) {
    await closeButtons.nth(index).click().catch(() => {});
  }

  if (count > 0) {
    await page.waitForTimeout(250);
  }
}

async function blurActiveElement(page) {
  await page.evaluate(() => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  }).catch(() => {});
  await page.waitForTimeout(150);
}

async function isVisible(locator) {
  return (await locator.count()) > 0 && await locator.first().isVisible().catch(() => false);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
