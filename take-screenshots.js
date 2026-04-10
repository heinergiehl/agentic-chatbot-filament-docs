/**
 * Screenshot capture script for Filament Agentic Chatbot documentation.
 * Run: node take-screenshots.js
 */

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const BASE_URL = 'https://filament-agentic-chatbot.heinerdevelops.tech';
const OUT_DIR = path.join(__dirname, 'images', 'agentic-chatbot');

const VIEWPORT = { width: 1440, height: 900 };

async function screenshot(page, name, description) {
  const dest = path.join(OUT_DIR, name);
  await page.screenshot({ path: dest, fullPage: false });
  console.log(`  ✓ ${name}  – ${description}`);
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: VIEWPORT });
  const page = await context.newPage();

  // -- Login ----------------------------------------------------------------
  console.log('Logging in...');
  await page.goto(`${BASE_URL}/admin/login`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(800);
  await page.click('button:has-text("Enter Demo")');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);
  console.log('Logged in. Starting screenshots...\n');

  // -- 01: Bot list ---------------------------------------------------------
  await page.goto(`${BASE_URL}/admin/rag-bots`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1200);
  await screenshot(page, '01-bot-list.png', 'Bot list with sidebar');

  // -- 02: Bot edit ---------------------------------------------------------
  await page.goto(`${BASE_URL}/admin/rag-bots`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(800);
  const firstBotLink = page.locator('table tbody tr:first-child td:first-child a, .fi-resource-table tbody tr:first-child a').first();
  if (await firstBotLink.count() === 0) {
    // try clicking the first row
    await page.locator('tr:has(td)').first().click();
  } else {
    await firstBotLink.click();
  }
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);
  // Scroll to show configuration sections
  await page.evaluate(() => window.scrollTo(0, 0));
  await screenshot(page, '02-bot-edit.png', 'Bot edit page with analytics');

  // -- 03: Source ingestion -------------------------------------------------
  await page.goto(`${BASE_URL}/admin/rag-sources`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1200);
  await screenshot(page, '03-source-ingestion-table.png', 'Knowledge sources table');

  // -- 04: Conversations ----------------------------------------------------
  await page.goto(`${BASE_URL}/admin/rag-conversations`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1200);
  // Try to open first conversation
  const firstConvo = page.locator('table tbody tr:first-child td:first-child a, tr:has(td) td:first-child').first();
  if (await firstConvo.count() > 0) {
    await firstConvo.click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await screenshot(page, '04-conversation-transcript.png', 'Conversation transcript');

  // -- 07: Workflow list ----------------------------------------------------
  await page.goto(`${BASE_URL}/admin/agent-workflows`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1200);
  await screenshot(page, '07-workflow-list.png', 'Workflow list');

  // -- 08: Workflow editor — canvas + node config panel --------------------
  // Use Plugin Feedback Collector (ID 10) which has a 24-node, multi-branch canvas
  await page.goto(`${BASE_URL}/admin/agent-workflows/10/edit`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3500); // Vue canvas needs time to render
  await page.evaluate(() => window.scrollTo(0, 0));
  await screenshot(page, '08-workflow-editor-canvas.png', 'Workflow editor Nodes canvas');

  // Click an AI Agent node to reveal its CONFIG panel (Provider / Model / System prompt)
  const aiAgentNode = page.locator('.fi-wf-node').filter({ hasText: 'AI Agent' }).first();
  if (await aiAgentNode.count() > 0) {
    await aiAgentNode.scrollIntoViewIfNeeded();
    await aiAgentNode.click();
    await page.waitForTimeout(2500); // wait for CONFIG panel to settle
    // Dismiss any "Publish" modal that may appear
    const publishModal = page.locator('[role="dialog"]').filter({ hasText: 'Publish' }).first();
    if (await publishModal.isVisible().catch(() => false)) {
      await page.keyboard.press('Escape');
      await page.waitForTimeout(800);
      await aiAgentNode.click();
      await page.waitForTimeout(2500);
    }
    await screenshot(page, '08b-workflow-node-config.png', 'Workflow node config panel open');
  }

  // Navigate to AI Draft tab — close any open modal first
  await page.keyboard.press('Escape');
  await page.waitForTimeout(600);
  const generateTab = page.locator('.fi-wf-sidebar-tab:has-text("AI Draft")').first();
  if (await generateTab.count() > 0) {
    await generateTab.click();
    await page.waitForTimeout(1500);
    await screenshot(page, '09-workflow-generate-tab.png', 'Workflow AI Draft generate tab');
  }

  // -- 10: Workflow runs with real trace data (Buyer Concierge — ID 2) ------
  // This workflow has HALTED + COMPLETED runs with full step traces
  await page.goto(`${BASE_URL}/admin/agent-workflows/2/edit`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);
  await page.click('.fi-wf-sidebar-tab:has-text("Runs")');
  await page.waitForTimeout(1500);
  await screenshot(page, '10-workflow-runs-tab.png', 'Workflow runs list with run status badges');

  // Click on Run #3 (HALTED — has full variable trace) to expand it
  const run3 = page.locator('text=Run #3').first();
  if (await run3.count() > 0) {
    await run3.click();
    await page.waitForTimeout(1200);
    await screenshot(page, '10b-workflow-run-trace.png', 'Workflow run trace with step details and variables');
  }

  // Navigate to Releases tab (still on workflow 2)
  const releasesTab = page.locator('.fi-wf-sidebar-tab:has-text("Releases")').first();
  if (await releasesTab.count() > 0) {
    await releasesTab.click();
    await page.waitForTimeout(1000);
    await screenshot(page, '11-workflow-releases-tab.png', 'Workflow releases tab');
  }

  // Back to workflow 10 for the generate tab (it has a richer AI Draft panel)
  await page.goto(`${BASE_URL}/admin/agent-workflows/10/edit`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);
  const generateTab2 = page.locator('.fi-wf-sidebar-tab:has-text("AI Draft")').first();
  if (await generateTab2.count() > 0) {
    await generateTab2.click();
    await page.waitForTimeout(1500);
    await screenshot(page, '09-workflow-generate-tab.png', 'Workflow AI Draft generate tab with system prompt');
  }

  // -- 12: API Connectors ---------------------------------------------------
  await page.goto(`${BASE_URL}/admin/api-connectors`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1200);
  await screenshot(page, '12-api-connectors-list.png', 'API connectors list');

  // -- 05: Widget desktop ---------------------------------------------------
  // Use the bot test page for a live widget screenshot
  await page.goto(`${BASE_URL}/admin/rag-bots`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(800);
  // Click the first bot's "Embed Snippet" or test page
  const firstBotTestLink = page.locator('table tbody tr:first-child td:first-child a').first();
  if (await firstBotTestLink.count() > 0) {
    await firstBotTestLink.click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
    // Click Embed Snippet or go to test page with widget
    const testWidgetBtn = page.locator('button:has-text("Test Widget"), a:has-text("Test Widget")').first();
    if (await testWidgetBtn.count() > 0) {
      await testWidgetBtn.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
    }
  }
  // Open the chat launcher if visible
  const launcher = page.locator('[data-testid="chat-launcher"], .fi-chat-launcher, button[aria-label*="chat"]').first();
  if (await launcher.count() > 0) {
    await launcher.click();
    await page.waitForTimeout(1500);
  }
  await screenshot(page, '05-widget-desktop.png', 'Widget desktop view');

  // -- 06: Widget mobile ----------------------------------------------------
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(800);
  const launcher2 = page.locator('[data-testid="chat-launcher"], .fi-chat-launcher, button[aria-label*="chat"]').first();
  if (await launcher2.count() > 0) {
    await launcher2.click();
    await page.waitForTimeout(1500);
  }
  await screenshot(page, '06-widget-mobile.png', 'Widget mobile view');
  await page.setViewportSize(VIEWPORT); // Reset

  await browser.close();
  console.log('\nAll screenshots saved to:', OUT_DIR);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
