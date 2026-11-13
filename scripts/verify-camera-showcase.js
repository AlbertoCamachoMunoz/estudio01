const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function verify() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', err => errors.push(err.message));

  console.log('Navigating to http://localhost:2552...');
  await page.goto('http://localhost:2552', { waitUntil: 'networkidle' });

  console.log('Errors on load:', errors);

  const section = await page.$('#audiovisual-lab');
  if (!section) {
    console.error('Section #audiovisual-lab not found!');
    await browser.close();
    return;
  }

  const box = await section.boundingBox();
  console.log('Section bounding box (should NOT be 320vh):', box);

  const outDir = path.join(__dirname, '..', 'tests', 'output');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  // Scroll section into view
  await page.evaluate(() => {
    const el = document.querySelector('#audiovisual-lab');
    el.scrollIntoView({ behavior: 'instant', block: 'center' });
  });
  await page.waitForTimeout(500);

  // Screenshot initial state (slider at 0)
  await page.screenshot({ path: path.join(outDir, 'slider-stage-1.png') });
  console.log('Captured slider-stage-1.png (Initial)');

  // Test clicking Step 3 Tab (Cristales ED)
  console.log('Clicking Step 3 Tab...');
  await page.click('button[data-frame="42"]');
  await page.waitForTimeout(600);

  const hudStep3 = await page.evaluate(() => {
    return {
      label: document.querySelector('#hudComponentLabel').textContent,
      step: document.querySelector('#hudStepCounter').textContent,
      sliderVal: document.querySelector('#cameraScrubberSlider').value
    };
  });
  console.log('HUD after clicking Step 3:', hudStep3);
  await page.screenshot({ path: path.join(outDir, 'slider-stage-3.png') });

  // Test slider dragging/input to 59 (Sensor 10-bit)
  console.log('Moving slider to 59...');
  await page.evaluate(() => {
    const slider = document.querySelector('#cameraScrubberSlider');
    slider.value = '59';
    slider.dispatchEvent(new Event('input', { bubbles: true }));
  });
  await page.waitForTimeout(300);

  const hudStep4 = await page.evaluate(() => {
    return {
      label: document.querySelector('#hudComponentLabel').textContent,
      step: document.querySelector('#hudStepCounter').textContent,
      sliderVal: document.querySelector('#cameraScrubberSlider').value
    };
  });
  console.log('HUD after slider input 59:', hudStep4);
  await page.screenshot({ path: path.join(outDir, 'slider-stage-4.png') });

  // Test internal mouse wheel on canvas wrap
  console.log('Testing internal mouse wheel on canvas wrap...');
  const canvasWrap = await page.$('.camera-showcase__canvas-wrap');
  const canvasBox = await canvasWrap.boundingBox();

  // Move mouse over canvas and roll wheel up
  await page.mouse.move(canvasBox.x + canvasBox.width / 2, canvasBox.y + canvasBox.height / 2);
  await page.mouse.wheel(0, -500); // wheel up should reduce frame
  await page.waitForTimeout(400);

  const hudWheel = await page.evaluate(() => {
    return {
      sliderVal: document.querySelector('#cameraScrubberSlider').value,
      label: document.querySelector('#hudComponentLabel').textContent
    };
  });
  console.log('HUD after internal mouse wheel up:', hudWheel);

  await browser.close();
  console.log('Done verifying slider & internal scroll!');
}

verify().catch(console.error);
