const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function verifyLabAndIcons() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });

  const outDir = path.join(__dirname, '..', 'tests', 'output');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  await page.goto('http://localhost:5500', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);

  // Check Tech Lab Card 1 SSOT binding
  const labInfo = await page.evaluate(() => {
    const card1 = document.querySelector('#lab [data-service-id="pwa_partes_cuadrillas"]');
    const title1 = card1 ? card1.querySelector('[data-service-field="name"]')?.innerText.trim() : null;
    const iconSvg = card1 ? !!card1.querySelector('[data-service-field="icon"] svg') : false;
    const card2Title = document.querySelectorAll('#lab .lab-card-title')[1]?.innerText.trim() || null;
    return { title1, iconSvg, card2Title };
  });

  console.log('Tech Lab SSOT Info:', labInfo);

  // Hide sticky header for clean section captures
  await page.evaluate(() => {
    const h = document.querySelector('.header');
    if (h) h.style.display = 'none';
  });

  // Capture #lab
  const labSection = await page.$('#lab .lab-grid');
  if (labSection) {
    await labSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(200);
    await labSection.screenshot({ path: path.join(outDir, 'tech-lab-section.png') });
    console.log('Saved tech-lab-section.png');
  }

  // Capture spotlight in #portfolio
  const spotlight = await page.$('.case-study-spotlight');
  if (spotlight) {
    await spotlight.scrollIntoViewIfNeeded();
    await page.waitForTimeout(200);
    await spotlight.screenshot({ path: path.join(outDir, 'portfolio-spotlight-clean.png') });
    console.log('Saved portfolio-spotlight-clean.png');
  }

  await browser.close();
  console.log('Verification complete!');
}

verifyLabAndIcons().catch(err => {
  console.error(err);
  process.exit(1);
});
