const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const TEMPLATE_PATH = path.join(ROOT_DIR, 'src', 'template.html');
const TRANSLATIONS_DIR = path.join(ROOT_DIR, 'assets', 'data', 'translations');
const COMPANY_PATH = path.join(ROOT_DIR, 'assets', 'data', 'company.json');

const LANG_CONFIGS = [
  { code: 'es', file: 'index.html', name: 'Español' },
  { code: 'en', file: 'en.html', name: 'English' },
  { code: 'de', file: 'de.html', name: 'Deutsch' },
  { code: 'fr', file: 'fr.html', name: 'Français' },
];

function generateDesktopCoins(activeCode) {
  return LANG_CONFIGS.map((l) => {
    const isActive = l.code === activeCode ? ' is-active' : '';
    return `            <a href="${l.file}" class="lang-flag-coin${isActive}" data-lang="${l.code}" title="${l.name}">
              <img src="assets/images/flags/${l.code}.svg" alt="${l.name}">
              <span class="coin-overlay"></span>
              <span class="coin-code">${l.code.toUpperCase()}</span>
            </a>`;
  }).join('\n');
}

function generateMobileCoins(activeCode) {
  return LANG_CONFIGS.map((l) => {
    const isActive = l.code === activeCode ? ' is-active' : '';
    return `        <a href="${l.file}" class="lang-flag-coin${isActive}" data-lang="${l.code}" title="${l.name}">
          <img src="assets/images/flags/${l.code}.svg" alt="${l.name}">
          <span class="coin-overlay"></span>
          <span class="coin-code">${l.code.toUpperCase()}</span>
        </a>`;
  }).join('\n');
}

function resolveNested(obj, keyPath) {
  const parts = keyPath.split('.');
  let curr = obj;
  for (const part of parts) {
    if (curr == null) return '';
    curr = curr[part];
  }
  return curr != null ? curr : '';
}

function build() {
  console.log('🚀 Running SSG Build: Compiling master template to static pages...');

  const template = fs.readFileSync(TEMPLATE_PATH, 'utf-8');
  const companyData = JSON.parse(fs.readFileSync(COMPANY_PATH, 'utf-8'));

  for (const cfg of LANG_CONFIGS) {
    const transPath = path.join(TRANSLATIONS_DIR, `${cfg.code}.json`);
    const translation = JSON.parse(fs.readFileSync(transPath, 'utf-8'));

    // Context for template interpolation
    const context = {
      lang: cfg.code,
      langUpper: cfg.code.toUpperCase(),
      currentLangName: cfg.name,
      activeLangFile: cfg.file,
      brandLogoHref: cfg.code === 'es' ? 'index.html' : cfg.file,
      desktopLangCoins: generateDesktopCoins(cfg.code),
      mobileLangCoins: generateMobileCoins(cfg.code),
      company: {
        ...companyData,
        ...(translation.company || {}),
      },
      ui: translation.ui || {},
    };

    // Replace {{{raw_html}}} first
    let rendered = template.replace(/\{\{\{([\w.]+)\}\}\}/g, (match, keyPath) => {
      const val = resolveNested(context, keyPath);
      return val != null ? String(val) : '';
    });

    // Replace {{regular_tokens}}
    rendered = rendered.replace(/\{\{([\w.]+)\}\}/g, (match, keyPath) => {
      const val = resolveNested(context, keyPath);
      return val != null ? String(val) : '';
    });

    const outputPath = path.join(ROOT_DIR, cfg.file);
    fs.writeFileSync(outputPath, rendered, 'utf-8');
    console.log(`   ✅ Generated ${cfg.file} (lang: ${cfg.code})`);
  }

  console.log('✨ SSG Build Complete! All static HTML pages compiled from Single Source of Truth.');
}

if (require.main === module) {
  build();
}

module.exports = { build };
