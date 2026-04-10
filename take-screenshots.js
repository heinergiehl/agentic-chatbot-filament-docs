/**
 * Screenshot capture script for Filament Agentic Chatbot documentation.
 * Run: node take-screenshots.js
 */

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const BASE_URL = process.env.AGENTIC_DOCS_BASE_URL || 'http://filament-agentic-chatbot.localhost:8000';
const OUT_DIR = path.join(__dirname, 'images', 'agentic-chatbot');

const VIEWPORT = { width: 1600, height: 1040 };
const WORKFLOW_EDITOR_URL = `${BASE_URL}/admin/agent-workflows/8/edit`;
const WORKFLOW_RUNS_URL = `${BASE_URL}/admin/agent-workflows/9/edit`;

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

async function waitForWorkflow(page) {
  await page.waitForLoadState('networkidle');
  await page.waitForSelector('.fi-wf-node');
  await page.waitForTimeout(2800);
}

async function scrollWorkflowIntoView(page, y = 220) {
  await page.evaluate((offset) => window.scrollTo(0, offset), y);
  await page.waitForTimeout(500);
}

async function clickIfPresent(locator) {
  if ((await locator.count()) > 0) {
    await locator.first().click();
    return true;
  }

  return false;
}

async function fitWorkflowIntoView(page) {
  await clickIfPresent(page.locator('button[title="Dismiss run overlay"]'));
  await clickIfPresent(page.locator('button[title="Fit all nodes in view"]'));
  await page.waitForTimeout(700);
}

async function zoomWorkflow(page, count = 1) {
  const zoomInButton = page.locator('button[title="Zoom in"]');

  for (let index = 0; index < count; index += 1) {
    if (!(await clickIfPresent(zoomInButton))) {
      break;
    }

    await page.waitForTimeout(250);
  }
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
  await goto(page, `${BASE_URL}/admin/rag-bots`, 800);
  const firstBotLink = page.locator('table tbody tr:first-child td:first-child a, .fi-resource-table tbody tr:first-child a').first();
  if (await firstBotLink.count() === 0) {
    // try clicking the first row
    await page.locator('tr:has(td)').first().click();
  } else {
    await firstBotLink.click();
  }
  await waitForUi(page, 1500);
  // Scroll to show configuration sections
  await page.evaluate(() => window.scrollTo(0, 0));
  await screenshot(page, '02-bot-edit.png', 'Bot edit page with analytics', { fullPage: false });

  // -- 03: Source ingestion -------------------------------------------------
  await goto(page, `${BASE_URL}/admin/rag-sources`);
  await screenshot(page, '03-source-ingestion-table.png', 'Knowledge sources table', { fullPage: false });

  // -- 04: Conversations ----------------------------------------------------
  await goto(page, `${BASE_URL}/admin/rag-conversations`);
  // Try to open first conversation
  const firstConvo = page.locator('table tbody tr:first-child td:first-child a, tr:has(td) td:first-child').first();
  if (await firstConvo.count() > 0) {
    await firstConvo.click();
    await waitForUi(page, 1500);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await screenshot(page, '04-conversation-transcript.png', 'Conversation transcript', { fullPage: false });

  // -- 05: Widget desktop ---------------------------------------------------
  await goto(page, `${BASE_URL}/?demo=feature-showcase#widget-demo`, 1800);
  const widgetSection = page.locator('#widget-demo').first();
  await widgetSection.waitFor();
  await widgetSection.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1800);
  await screenshot(
    widgetSection,
    '05-widget-desktop.png',
    'Landing-page widget demo with light and dark themes'
  );

  // -- 07: Workflow list ----------------------------------------------------
  await goto(page, `${BASE_URL}/admin/agent-workflows`);
  await screenshot(page, '07-workflow-list.png', 'Workflow list', { fullPage: false });

  // -- 08: Workflow editor — cleaner branching workflow ---------------------
  await goto(page, WORKFLOW_EDITOR_URL, 1500);
  await waitForWorkflow(page);
  await page.getByRole('tab', { name: 'Nodes' }).click();
  await page.waitForTimeout(1200);
  await fitWorkflowIntoView(page);
  await zoomWorkflow(page, 2);
  await page.evaluate(() => window.scrollTo(0, 40));
  await page.waitForTimeout(400);
  await screenshot(
    page,
    '08-workflow-editor-canvas.png',
    'Workflow editor canvas with retrieval, AI, branching, and actions',
    {
      clip: {
        x: 250,
        y: 90,
        width: 1310,
        height: 520,
      },
    }
  );

  // Click an AI Agent node to reveal its config panel.
  const aiAgentNode = page.locator('.fi-wf-node').filter({ hasText: 'Generate Answer' }).first();
  if (await aiAgentNode.count() > 0) {
    await aiAgentNode.scrollIntoViewIfNeeded();
    await aiAgentNode.click();
    await page.waitForTimeout(1800);
    await screenshot(page, '08b-workflow-node-config.png', 'Workflow node config panel open', { fullPage: false });
  }

  // Navigate to AI Draft tab.
  await page.keyboard.press('Escape');
  await page.waitForTimeout(600);
  await page.getByRole('tab', { name: 'AI Draft' }).click();
  await page.waitForTimeout(1500);
  await page.evaluate(() => window.scrollTo(0, 120));
  await screenshot(page, '09-workflow-generate-tab.png', 'Workflow AI Draft generate tab', { fullPage: false });

  // -- 10: Workflow runs with completed path highlighting -------------------
  await goto(page, WORKFLOW_RUNS_URL, 1500);
  await waitForWorkflow(page);
  await page.getByRole('tab', { name: 'Runs' }).click();
  await page.waitForTimeout(1200);
  const completedRun = page.getByRole('button', { name: /Test Completed #20/i }).first();
  if (await completedRun.count() > 0) {
    await completedRun.click();
    await page.waitForTimeout(900);
  }
  await waitForRunDetails(page);
  await fitWorkflowIntoView(page);
  await zoomWorkflow(page, 1);
  await page.evaluate(() => window.scrollTo(0, 0));
  await screenshot(page, '10-workflow-runs-tab.png', 'Workflow runs list with completed execution state', { fullPage: false });

  await scrollWorkflowIntoView(page, 240);
  await waitForRunDetails(page);
  await screenshot(page, '10b-workflow-run-trace.png', 'Workflow run trace with executed path highlighted on the canvas', { fullPage: false });

  // Navigate to Versions tab (still on workflow 9)
  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.getByRole('tab', { name: 'Versions' }).click();
  await page.waitForTimeout(1000);
  await fitWorkflowIntoView(page);
  await zoomWorkflow(page, 1);
  await scrollWorkflowIntoView(page, 160);
  await screenshot(page, '11-workflow-releases-tab.png', 'Workflow versions tab', { fullPage: false });

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
