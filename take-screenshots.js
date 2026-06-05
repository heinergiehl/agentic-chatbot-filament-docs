/**
 * Screenshot capture script for the Filament Agentic Chatbot public docs.
 *
 * Default target: the local sandbox started by the plugin repo.
 * Override with: AGENTIC_DOCS_BASE_URL=https://your-demo.example node take-screenshots.js
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE_URL = process.env.AGENTIC_DOCS_BASE_URL || 'http://127.0.0.1:8010';
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

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: VIEWPORT });
  const page = await context.newPage();

  try {
    await loginToAdmin(page);

    await captureAdminPage(page, '/admin/bots', screenshots.botList, /Bots/i, async () => {
      await waitForFirstTableRow(page);
    });

    await captureBotEditPage(page, screenshots.botEdit);

    await captureAdminPage(page, '/admin/knowledge-sources', screenshots.sourceList, /Knowledge Sources/i, async () => {
      await waitForFirstTableRow(page);
    });

    await captureNewSourcePage(page, screenshots.sourceCreate);

    await captureConversationReviewPage(page, screenshots.transcript);

    await captureAdminPage(page, '/admin/agent-workflows', screenshots.workflowList, /Workflows/i, async () => {
      await waitForFirstTableRow(page);
    });

    await captureWorkflowEditor(page, screenshots.workflowCanvas, async () => {
      await activateControl(page.locator('#mode-build'));
      await waitForWorkflowCanvas(page);
      const classifyNode = page.locator('.react-flow__node').filter({ hasText: /Classify|Route/i }).first();

      if (await isVisible(classifyNode)) {
        await classifyNode.click();
      }
    }, { zoomClicks: 7 });

    await captureWorkflowEditor(page, screenshots.workflowFocus, async () => {
      await activateControl(page.locator('#mode-build'));
      await waitForWorkflowCanvas(page);
      await page.getByRole('button', { name: focusModeAccessibleName }).first().click();
      await page.waitForFunction(() => document.body.classList.contains('fi-wf-focus-mode-active'));
      await page.waitForTimeout(700);
    }, { zoomClicks: 8 });

    await captureWorkflowEditor(page, screenshots.workflowQuality, async () => {
      await activateControl(page.locator('#mode-debug'));
      await activateControl(page.locator('#tab-quality'));
      await page.locator('#panel-quality').waitFor({ state: 'visible' });
      await page.getByText('Enterprise rollout answer stays grounded').first().waitFor({ state: 'visible' });
    }, { zoomClicks: 7 });

    await captureWorkflowEditor(page, screenshots.workflowGenerate, async () => {
      await activateControl(page.locator('#mode-generate'));
      const workflowBrief = page.getByRole('textbox', { name: 'Workflow brief' });
      await workflowBrief.waitFor({ state: 'visible' });
      await workflowBrief.fill('Build a buyer support workflow that retrieves docs, routes by intent, and enriches enterprise leads via a CRM connector before replying.');
    }, { zoomClicks: 7 });

    await captureWorkflowEditor(page, screenshots.workflowRuns, async () => {
      await activateControl(page.locator('#mode-debug'));
      await activateControl(page.locator('#tab-executions'));
      await page.locator('#panel-executions .fi-wf-run-card').first().waitFor({ state: 'visible' });
    }, { zoomClicks: 7 });

    await captureWorkflowEditor(page, screenshots.workflowRunTrace, async () => {
      await activateControl(page.locator('#mode-debug'));
      await activateControl(page.locator('#tab-executions'));
      const completedRun = page.locator('#panel-executions .fi-wf-run-card').filter({ hasText: 'COMPLETED' }).first();
      await completedRun.waitFor({ state: 'visible' });
      await completedRun.click();
      await waitForRunDetails(page);
      await collapseWorkflowSidebar(page);
      await waitForWorkflowCanvas(page);
    }, { zoomClicks: 7 });

    await captureAdminPage(page, '/admin/bot-quality-scenarios', screenshots.qualityLab, /Quality Scenarios/i, async () => {
      await searchAdminTable(page, 'Enterprise rollout');
      await waitForRowText(page, 'Enterprise rollout answer stays grou');
    });

    await captureAdminPage(page, '/admin/bot-handoff-requests', screenshots.handoffInbox, /Handoff Requests/i, async () => {
      await searchAdminTable(page, 'Buyer escalation');
      await waitForRowText(page, 'Buyer escalation needs operator');
    });

    await captureWorkflowEditor(page, screenshots.workflowReleases, async () => {
      await activateControl(page.locator('#mode-release'));
      await page.locator('#panel-releases').getByText('Live').first().waitFor({ state: 'visible' });
    }, { zoomClicks: 7 });

    await captureAdminPage(page, '/admin/api-connectors', screenshots.apiConnectors, /Api Connectors/i, async () => {
      await searchAdminTable(page, 'CRM Lead Qualification API');
      await waitForFirstTableRow(page);
    });

    await captureWorkflowEditor(page, screenshots.workflowToolbar, async () => {
      await activateControl(page.locator('#mode-build'));
      await waitForWorkflowCanvas(page);
      await closeSettingsSelection(page);
      await collapseSettingsPanel(page);
      await zoomWorkflowCanvas(page, 7);
      await dockWorkflowToolbarOnCanvasRight(page);
    }, { blur: false, zoomClicks: 0 });

    await captureWorkflowEditor(page, screenshots.workflowToolbarHeader, async () => {
      await activateControl(page.locator('#mode-build'));
      await waitForWorkflowCanvas(page);
      await closeSettingsSelection(page);
      await collapseSettingsPanel(page);
      await zoomWorkflowCanvas(page, 7);
      await dockWorkflowToolbarAboveCanvasRight(page);
    }, { blur: false, zoomClicks: 0 });

    await captureWorkflowEditor(page, screenshots.workflowDark, async () => {
      await forceDarkMode(page);
      await activateControl(page.locator('#mode-build'));
      await waitForWorkflowCanvas(page);
      await page.getByRole('button', { name: focusModeAccessibleName }).first().click();
      await page.waitForFunction(() => document.body.classList.contains('fi-wf-focus-mode-active'));
      await page.waitForTimeout(700);
    }, { zoomClicks: 8 });

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

  await saveScreenshot(page, fileName, options.fullPage ?? true);
}

async function captureNewSourcePage(page, fileName) {
  await goto(page, '/admin/knowledge-sources/create');
  await page.getByRole('heading', { level: 1, name: /New Source|Create Source|Create Knowledge Source|Sources/i }).first().waitFor({ state: 'visible', timeout: 30_000 });
  await page.getByText(/Source Name|Source Type|Bot/i).first().waitFor({ state: 'visible', timeout: 30_000 });

  const botField = page.locator('[wire\\:partial="schema-component::form.bot_id"]');

  if (await isVisible(botField)) {
    await botField.locator('button.fi-select-input-btn').click();
    await botField.getByText(/Plugin Public Assistant|Admin Copilot/i).first().click();
  }

  const sourceName = page.locator('#form\\.name');

  if (await isVisible(sourceName)) {
    await sourceName.fill('Public launch FAQ');
  }

  const nextButton = page.getByRole('button', { name: /^Next$/i }).first();

  if (await isVisible(nextButton)) {
    await nextButton.click();
  }

  const textContent = page.locator('#form\\.meta\\.content');
  await textContent.waitFor({ state: 'visible', timeout: 30_000 }).catch(() => {});

  if (await isVisible(textContent)) {
    await textContent.fill('Paste launch FAQs, product docs, support policies, or onboarding notes here. After creating the source, ingestion status, chunks, failures, and retry actions are visible in the Sources table.');
  }

  await page.waitForTimeout(900);
  await saveScreenshot(page, fileName, true);
}

async function captureBotEditPage(page, fileName) {
  await goto(page, '/admin/workflow-runs');
  await page.getByRole('heading', { level: 1, name: /Workflow Runs/i }).waitFor({ state: 'visible' });
  await searchAdminTable(page, 'Buyer Qualification');

  const row = page.locator('tbody tr').filter({ hasText: 'Buyer Qualification & Resolution' }).filter({ hasText: 'completed' }).first();

  if (await isVisible(row)) {
    await row.getByRole('link', { name: /Inspect/i }).first().click();
    await page.waitForURL(/\/admin\/workflow-runs\/\d+$/, { timeout: 30_000 });
    await page.getByRole('link', { name: /Open Bot/i }).first().click();
  } else {
    await goto(page, '/admin/bots');
    await waitForFirstTableRow(page);
    await page.locator('tbody tr').first().getByRole('link').first().click();
  }

  await page.waitForURL(/\/admin\/bots\/\d+\/edit$/, { timeout: 30_000 });
  const setupTab = page.getByRole('tab', { name: /AI Setup|Setup/i }).first();

  if (await isVisible(setupTab)) {
    await setupTab.click();
  }

  await page.getByRole('heading', { name: /Conversation Design|Chat Provider & Model|Identity & Model/i }).first().waitFor({ state: 'visible' });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(700);
  await saveScreenshot(page, fileName, true);
}

async function captureConversationReviewPage(page, fileName) {
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
  await saveScreenshot(page, fileName, true);
}

async function captureWorkflowEditor(page, fileName, beforeShot, options = {}) {
  await goto(page, '/admin/agent-workflows');
  await page.getByRole('heading', { level: 1, name: /Workflows/i }).waitFor({ state: 'visible' });
  await resetWorkflowToolbarPlacement(page);
  await searchAdminTable(page, 'Buyer Qualification');

  const workflowLink = page.getByRole('link', { name: /Buyer Qualification & Resolution/i }).first();

  if (await isVisible(workflowLink)) {
    await workflowLink.click();
  } else {
    await page.locator('tbody tr').first().getByRole('link').first().click();
  }

  await page.getByRole('heading', { level: 1, name: /Buyer Qualification|Workflow/i }).waitFor({ state: 'visible' });
  await page.locator('#workflow-editor-root').waitFor({ state: 'visible' });
  await page.waitForTimeout(1000);
  await exitFocusModeIfActive(page);
  await expandWorkflowSidebarIfCollapsed(page);

  if (beforeShot) {
    await beforeShot();
  }

  await zoomWorkflowCanvas(page, options.zoomClicks ?? 7);
  await page.waitForTimeout(500);
  await saveScreenshot(page, fileName, false, { blur: options.blur ?? true });
}

async function zoomWorkflowCanvas(page, clicks = 7) {
  const zoomIn = page.getByRole('button', { name: 'Zoom in' }).first();

  if (!(await isVisible(zoomIn))) {
    return;
  }

  for (let index = 0; index < clicks; index++) {
    await zoomIn.click();
    await page.waitForTimeout(120);
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
      await button.click();
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
  await goto(page, '/bot-public-test');
  await openWidget(page);
  await fillWidgetPrompt(page, 'hi');
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

  await page.locator('[data-frw-role="input"], textarea, input').first().waitFor({ state: 'visible', timeout: 30_000 });
  await page.waitForTimeout(500);
}

async function fillWidgetPrompt(page, message) {
  const composer = page.locator('[data-frw-role="input"], textarea, input').first();
  await composer.fill(message);
  await composer.press('Enter');
  await page.waitForTimeout(2000);
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

async function goto(page, targetPath) {
  const url = targetPath.startsWith('http') ? targetPath : `${BASE_URL}${targetPath}`;
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await waitForUi(page);
}

async function waitForUi(page, delay = 700) {
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.waitForTimeout(delay);
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
