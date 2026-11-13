const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function verifyHeader() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const viewports = [
    { name: 'desktop-1440', width: 1440, height: 900 },
    { name: 'desktop-1280', width: 1280, height: 800 },
    { name: 'desktop-1100', width: 1100, height: 750 }
  ];

  const outDir = path.join(__dirname, '..', 'tests', 'output');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  for (const vp of viewports) {
    const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
    await page.goto('http://localhost:5500', { waitUntil: 'networkidle' });

    await page.waitForTimeout(400);

    // Get measurements of logo, nav-links, nav-actions, container
    const layout = await page.evaluate(() => {
      const container = document.querySelector('.nav-container');
      const logo = document.querySelector('.brand-logo');
      const navLinks = document.querySelector('.nav-links');
      const navActions = document.querySelector('.nav-actions');

      const cRect = container.getBoundingClientRect();
      const lRect = logo.getBoundingClientRect();
      const nlRect = navLinks ? navLinks.getBoundingClientRect() : null;
      const naRect = navActions ? navActions.getBoundingClientRect() : null;

      const links = Array.from(document.querySelectorAll('.nav-links a')).map(a => ({
        text: a.innerText.trim(),
        width: a.getBoundingClientRect().width,
        height: a.getBoundingClientRect().height,
        whiteSpace: window.getComputedStyle(a).whiteSpace,
        fontSize: window.getComputedStyle(a).fontSize
      }));

      const buttons = Array.from(document.querySelectorAll('.nav-actions a')).map(b => ({
        text: b.innerText.trim(),
        width: b.getBoundingClientRect().width,
        height: b.getBoundingClientRect().height,
        whiteSpace: window.getComputedStyle(b).whiteSpace
      }));

      return {
        container: { left: cRect.left, right: cRect.right, width: cRect.width },
        logo: { left: lRect.left, right: lRect.right, width: lRect.width },
        navLinksRect: nlRect ? { left: nlRect.left, right: nlRect.right, width: nlRect.width } : null,
        navActionsRect: naRect ? { left: naRect.left, right: naRect.right, width: naRect.width } : null,
        gapLogoToLinks: nlRect ? nlRect.left - lRect.right : null,
        gapLinksToActions: (nlRect && naRect) ? naRect.left - nlRect.right : null,
        links,
        buttons
      };
    });

    console.log(`\n========================================`);
    console.log(`VIEWPORT: ${vp.name} (${vp.width}x${vp.height})`);
    console.log(`========================================`);
    console.log(`Container width: ${layout.container.width}px`);
    console.log(`Logo right edge: ${layout.logo.right}px (width: ${layout.logo.width}px)`);
    console.log(`Nav links: left=${layout.navLinksRect.left}px, right=${layout.navLinksRect.right}px, width=${layout.navLinksRect.width}px`);
    console.log(`Nav actions: left=${layout.navActionsRect.left}px, right=${layout.navActionsRect.right}px, width=${layout.navActionsRect.width}px`);
    console.log(`Gap Logo -> Links: ${layout.gapLogoToLinks.toFixed(1)}px`);
    console.log(`Gap Links -> Actions: ${layout.gapLinksToActions.toFixed(1)}px (~${(layout.gapLinksToActions / (96 / 2.54)).toFixed(2)} cm)`);
    console.log(`\nLinks:`);
    layout.links.forEach(l => console.log(`  - "${l.text}": w=${l.width.toFixed(1)}px, h=${l.height.toFixed(1)}px, nowrap=${l.whiteSpace}`));
    console.log(`Buttons:`);
    layout.buttons.forEach(b => console.log(`  - "${b.text}": w=${b.width.toFixed(1)}px, h=${b.height.toFixed(1)}px, nowrap=${b.whiteSpace}`));

    // Screenshot header
    const screenshotPath = path.join(outDir, `header-${vp.name}.png`);
    await page.screenshot({
      path: screenshotPath,
      clip: { x: 0, y: 0, width: vp.width, height: 110 }
    });
    console.log(`Captured screenshot: ${screenshotPath}`);

    if (vp.name === 'desktop-1440') {
      await page.screenshot({
        path: path.join(outDir, 'header-with-hero-1440.png'),
        clip: { x: 0, y: 0, width: vp.width, height: 500 }
      });
      console.log('Captured header-with-hero-1440.png');
    }

    await page.close();
  }

  await browser.close();
  console.log('\nVerification complete!');
}

verifyHeader().catch(err => {
  console.error(err);
  process.exit(1);
});
