const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function verifyServices() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1200 } });

  const outDir = path.join(__dirname, '..', 'tests', 'output');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  await page.goto('http://localhost:5500', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);

  // Scroll so .services-grid is cleanly below the header (header is 72px high)
  await page.evaluate(() => {
    const grid = document.querySelector('.services-grid');
    if (grid) {
      const top = grid.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top, behavior: 'instant' });
    }
  });
  await page.waitForTimeout(400);

  // Extract services cards details
  const cardsData = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('.services-grid .service-card'));
    return cards.map((c, i) => {
      const icon = c.querySelector('.service-icon');
      const title = c.querySelector('.service-title');
      const desc = c.querySelector('.service-desc');
      const pillar = c.querySelector('.service-pillar-badge');
      const svg = icon ? icon.querySelector('svg') : null;

      return {
        index: i,
        title: title ? title.innerText.trim() : '',
        desc: desc ? desc.innerText.trim() : '',
        pillar: pillar ? pillar.innerText.trim() : '',
        hasSvg: !!svg,
        iconContent: icon ? icon.innerHTML.trim() : ''
      };
    });
  });

  console.log('\n--- Rendered Services Cards ---');
  cardsData.forEach(card => {
    console.log(`\nCard #${card.index + 1}: [${card.pillar}]`);
    console.log(`  Title: ${card.title}`);
    console.log(`  Desc: ${card.desc}`);
    console.log(`  Has SVG icon: ${card.hasSvg}`);
  });

  // Take screenshot of the entire services grid (temporarily hide sticky header for clean capture)
  await page.evaluate(() => {
    const h = document.querySelector('.header');
    if (h) h.style.display = 'none';
  });
  await page.waitForTimeout(100);

  const grid = await page.$('.services-grid');
  if (grid) {
    await grid.screenshot({ path: path.join(outDir, 'services-grid-desktop.png') });
    console.log('\nSaved services-grid-desktop.png');
  }

  // Take screenshots of each individual card
  const cardElements = await page.$$('.services-grid .service-card');
  for (let i = 0; i < cardElements.length; i++) {
    await page.evaluate((el) => {
      const top = el.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top, behavior: 'instant' });
    }, cardElements[i]);
    await page.waitForTimeout(100);
    await cardElements[i].screenshot({ path: path.join(outDir, `service-card-${i + 1}.png`) });
    console.log(`Saved service-card-${i + 1}.png`);
  }

  await browser.close();
  console.log('\nVerification complete!');
}

verifyServices().catch(err => {
  console.error(err);
  process.exit(1);
});
