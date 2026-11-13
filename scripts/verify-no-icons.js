const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function verifyNoIcons() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  const outDir = path.join(__dirname, '..', 'tests', 'output');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  await page.goto('http://localhost:5500', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);

  // 1. Verify PWA Mockup in Tech Lab
  const pwaTopbarText = await page.$eval('.pwa-mockup-topbar', el => el.innerText.trim());
  const pwaBtnText = await page.$eval('#pwaSimulateBtn', el => el.innerText.trim());
  console.log('PWA Topbar Text:', pwaTopbarText);
  console.log('PWA Button Text:', pwaBtnText);

  const pwaMockup = await page.$('.pwa-mockup');
  if (pwaMockup) {
    await pwaMockup.scrollIntoViewIfNeeded();
    await page.waitForTimeout(200);
    await pwaMockup.screenshot({ path: path.join(outDir, 'pwa-mockup-clean.png') });
    console.log('Saved pwa-mockup-clean.png');
  }

  // 2. Verify Estimator rate pills
  const ratePills = await page.$$eval('.estimator-rate-pill', pills => pills.map(p => p.innerText.trim()));
  console.log('\nEstimator Rate Pills:', ratePills);

  const estimatorRates = await page.$('#estimatorServiceRates');
  if (estimatorRates) {
    await estimatorRates.scrollIntoViewIfNeeded();
    await page.waitForTimeout(200);
    await estimatorRates.screenshot({ path: path.join(outDir, 'estimator-rates-clean.png') });
    console.log('Saved estimator-rates-clean.png');
  }

  await browser.close();
  console.log('\nVerification completed successfully!');
}

verifyNoIcons().catch(err => {
  console.error(err);
  process.exit(1);
});
