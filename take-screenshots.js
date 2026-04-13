/**
 * Screenshot capture script for Filament Agentic Chatbot documentation.
 * Run: node take-screenshots.js
 */

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const BASE_URL = process.env.AGENTIC_DOCS_BASE_URL || 'http://filament-agentic-chatbot.localhost:8000';
const OUT_DIR = path.join(__dirname, 'images', 'agentic-chatbot');

const VIEWPORT = { width: 1600, height: 1200 };
const BOT_EDIT_URL = `${BASE_URL}/admin/rag-bots/1/edit`;
const WORKFLOW_EDITOR_URL = `${BASE_URL}/admin/agent-workflows/9/edit`;
const WORKFLOW_RUNS_URL = `${BASE_URL}/admin/agent-workflows/2/edit`;

async function screenshot(target, name, description, options = {}) {
  const dest = path.join(OUT_DIR, name);
  await target.screenshot({ path: dest, animations: 'disabled', ...options });
  console.log(`  ✓ ${name}  – ${description}`);
}

async function waitForUi(page, delay = 1200) {
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(delay);
}

async function goto(page, url, delay = 1200) {
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await waitForUi(page, delay);
}

async function scrollPage(page, y = 0, delay = 600) {
  await page.evaluate((offset) => window.scrollTo(0, offset), y);
  await page.waitForTimeout(delay);
}

async function waitForBotEdit(page) {
  await page.getByRole('tab', { name: 'Setup' }).waitFor({ state: 'attached' });
  await page.getByRole('heading', { name: 'Identity & Model' }).waitFor({ state: 'attached' });
  await page.getByRole('textbox', { name: 'Name*' }).waitFor({ state: 'visible' });
  await page.getByRole('textbox', { name: 'System Prompt' }).waitFor({ state: 'visible' });
  await page.waitForTimeout(1800);
}

async function waitForWorkflow(page) {
  await page.waitForLoadState('networkidle');
  await page.waitForSelector('.fi-wf-node');
  await page.waitForTimeout(2800);
}

async function scrollWorkflowIntoView(page, y = 220) {
  await page.evaluate((offset) => window.scrollTo(0, offset), y);
  await page.waitForTimeout(500);
}

async function openConversationWithMessages(page) {
  await goto(page, `${BASE_URL}/admin/rag-conversations`, 1200);

  const href = await page.locator('table tbody tr').evaluateAll((rows) => {
    for (const row of rows) {
      const cells = Array.from(row.querySelectorAll('td'));
      const rawMessages = (cells[3]?.textContent || '').replace(/[^\d]/g, '');
      const messages = Number.parseInt(rawMessages, 10);
      const link = row.querySelector('a[href]');

      if (link && Number.isFinite(messages) && messages > 0) {
        return link.href;
      }
    }

    return rows[0]?.querySelector('a[href]')?.href || null;
  });

  if (!href) {
    throw new Error('Could not find a conversation row to capture.');
  }

  await goto(page, href, 1500);
  await page.locator('.fi-convo-transcript, .fi-convo-bubble-bot, .fi-convo-bubble-user').first().waitFor();
  await page.waitForTimeout(1500);
}

async function dismissAnalyticsPrompt(page) {
  const buttons = [
    page.getByRole('button', { name: 'Essential only' }),
    page.getByRole('button', { name: 'Accept analytics' }),
  ];

  for (const button of buttons) {
    if ((await button.count()) > 0 && await button.first().isVisible().catch(() => false)) {
      await button.first().click();
      await page.waitForTimeout(700);
      return;
    }
  }
}

async function captureWidgetCloseUp(page, name, description) {
  const selectors = [
    '#widget-demo [data-agentic-chatbot-widget]',
    '#widget-demo .fi-acb-window',
    '#widget-demo .fi-acb-widget',
    '#widget-demo .fi-chat-widget',
    '#widget-demo iframe',
  ];

  for (const selector of selectors) {
    const locator = page.locator(selector).first();

    if ((await locator.count()) > 0) {
      await locator.scrollIntoViewIfNeeded().catch(() => {});
      await page.waitForTimeout(700);
      await screenshot(locator, name, description);
      return;
    }
  }

  const widgetSection = page.locator('#widget-demo').first();
  await widgetSection.waitFor();
  await widgetSection.scrollIntoViewIfNeeded();
  await page.waitForTimeout(700);
  await screenshot(widgetSection, name, description);
}

async function captureWorkflowSidebar(page, name, description) {
  const sidebar = page.locator('.fi-wf-panel-sidebar').first();
  await sidebar.waitFor();
  await page.waitForTimeout(900);
  await screenshot(sidebar, name, description);
}

async function waitForRunDetails(page) {
  const loadingState = page.getByText('Loading run detail...').first();

  if ((await loadingState.count()) > 0) {
    await loadingState.waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});
  }

  await page.waitForTimeout(700);
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: VIEWPORT });
  const page = await context.newPage();

  // -- Login ----------------------------------------------------------------
  console.log('Logging in...');
  await goto(page, `${BASE_URL}/admin/login`, 800);
  await waitForUi(page, 800);
  await Promise.all([
    page.waitForURL(/\/admin(?:\/)?$/),
    page.getByRole('button', { name: 'Enter Demo' }).click(),
  ]);
  await waitForUi(page, 1500);
  console.log('Logged in. Starting screenshots...\n');

  // -- 01: Bot list ---------------------------------------------------------
  await goto(page, `${BASE_URL}/admin/rag-bots`);
  await screenshot(page, '01-bot-list.png', 'Bot list with sidebar', { fullPage: false });

  // -- 02: Bot edit ---------------------------------------------------------
  await goto(page, BOT_EDIT_URL, 1500);
  await waitForBotEdit(page);
  await page.getByRole('tab', { name: 'Widget' }).click();
  await page.getByText('Live Preview').first().waitFor({ state: 'visible' });
  await page.waitForTimeout(1500);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(500);
  await screenshot(page, '02-bot-edit.png', 'Bot widget customization with live preview', { fullPage: true });

  // -- 03: Source ingestion -------------------------------------------------
  await goto(page, `${BASE_URL}/admin/rag-sources`);
  await screenshot(page, '03-source-ingestion-table.png', 'Knowledge sources table', { fullPage: false });

  // -- 04: Conversations ----------------------------------------------------
  await openConversationWithMessages(page);
  await scrollPage(page, 120, 500);
  await screenshot(page, '04-conversation-transcript.png', 'Conversation transcript', { fullPage: false });

  // -- 05: Widget desktop ---------------------------------------------------
  await goto(page, `${BASE_URL}/?demo=feature-showcase#widget-demo`, 1800);
  await dismissAnalyticsPrompt(page);
  await page.waitForTimeout(1200);
  await captureWidgetCloseUp(
    page,
    '05-widget-desktop.png',
    'Conversation-focused widget close-up'
  );

  // -- 07: Workflow list ----------------------------------------------------
  await goto(page, `${BASE_URL}/admin/agent-workflows`);
  await screenshot(page, '07-workflow-list.png', 'Workflow list', { fullPage: false });

  // -- 08: Workflow editor — plugin feedback collector ----------------------
  await goto(page, WORKFLOW_EDITOR_URL, 1500);
  await waitForWorkflow(page);
  await page.getByRole('tab', { name: 'Nodes' }).click();
  await page.waitForTimeout(1200);
  const sendMessageNode = page.locator('.fi-wf-node').filter({ hasText: 'Set Expectations' }).first();
  if (await sendMessageNode.count() > 0) {
    await sendMessageNode.scrollIntoViewIfNeeded();
    await sendMessageNode.click();
    await page.waitForTimeout(1500);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(700);
  await screenshot(page, '08-workflow-editor-canvas.png', 'Workflow editor with node library and settings panel', { fullPage: false });

  // Navigate to AI Draft tab.
  await page.keyboard.press('Escape');
  await page.waitForTimeout(600);
  await page.getByRole('tab', { name: 'AI Draft' }).click();
  await page.waitForTimeout(1500);
  await captureWorkflowSidebar(page, '09-workflow-generate-tab.png', 'Workflow AI Draft sidebar');

  // -- 10: Workflow runs with completed path highlighting -------------------
  await goto(page, WORKFLOW_RUNS_URL, 1500);
  await waitForWorkflow(page);
  await page.getByRole('tab', { name: 'Runs' }).click();
  await page.waitForTimeout(1200);
  await waitForRunDetails(page);
  await captureWorkflowSidebar(page, '10-workflow-runs-tab.png', 'Workflow runs sidebar with completed execution state');

  await scrollWorkflowIntoView(page, 240);
  await waitForRunDetails(page);
  await screenshot(page, '10b-workflow-run-trace.png', 'Workflow run trace with executed path highlighted on the canvas', { fullPage: false });

  // Navigate to Versions tab on the workflow with run history.
  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.getByRole('tab', { name: 'Versions' }).click();
  await page.waitForTimeout(1000);
  await captureWorkflowSidebar(page, '11-workflow-releases-tab.png', 'Workflow versions sidebar');

  // -- 12: API Connectors ---------------------------------------------------
  await goto(page, `${BASE_URL}/admin/api-connectors`);
  await screenshot(page, '12-api-connectors-list.png', 'API connectors list', { fullPage: false });

  await browser.close();
  console.log('\nAll screenshots saved to:', OUT_DIR);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
