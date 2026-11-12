import { DataLoaderService } from '../services/DataLoaderService.js';

/**
 * Language Selector Component
 * Controls desktop dropdown and mobile language switcher.
 * Manages active states and user preference persistence in localStorage.
 */
export class LanguageSelectorComponent {
  constructor() {
    this.currentLang = DataLoaderService.getCurrentLang();
    this.dropdowns = document.querySelectorAll('.lang-selector');
    this.mobileSelectors = document.querySelectorAll('.mobile-lang-selector');

    this.init();
  }

  init() {
    // 1. Mark active language in UI
    this.syncActiveStates();

    // 2. Bind desktop dropdowns
    this.dropdowns.forEach((wrapper) => {
      const btn = wrapper.querySelector('.lang-selector__trigger, .lang-selector__btn');
      const menu = wrapper.querySelector('.lang-bocadillo, .lang-selector__dropdown');

      if (btn && menu) {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const isExpanded = btn.getAttribute('aria-expanded') === 'true';
          this.closeAll();
          if (!isExpanded) {
            btn.setAttribute('aria-expanded', 'true');
            menu.classList.add('is-open');
          }
        });
      }
    });

    // 3. Close on outside click
    document.addEventListener('click', () => this.closeAll());

    // 4. Save preference when user chooses a language link
    document.querySelectorAll('.lang-flag-coin, .lang-option, .mobile-lang-btn').forEach((link) => {
      link.addEventListener('click', () => {
        const targetLang = link.getAttribute('data-lang');
        if (targetLang) {
          try {
            localStorage.setItem('sexygarden_lang', targetLang);
          } catch (_) {}
        }
      });
    });

    // 5. Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.closeAll();
    });
  }

  closeAll() {
    this.dropdowns.forEach((wrapper) => {
      const btn = wrapper.querySelector('.lang-selector__trigger, .lang-selector__btn');
      const menu = wrapper.querySelector('.lang-bocadillo, .lang-selector__dropdown');
      if (btn) btn.setAttribute('aria-expanded', 'false');
      if (menu) menu.classList.remove('is-open');
    });
  }

  syncActiveStates() {
    const lang = this.currentLang;

    // Update desktop button display if it exists
    const flagMap = {
      es: 'assets/images/flags/es.svg',
      en: 'assets/images/flags/en.svg',
      de: 'assets/images/flags/de.svg',
      fr: 'assets/images/flags/fr.svg',
    };
    const codeMap = { es: 'ES', en: 'EN', de: 'DE', fr: 'FR' };

    document.querySelectorAll('.lang-selector__trigger, .lang-selector__btn').forEach((btn) => {
      const flagImg = btn.querySelector('img, .lang-flag-img');
      const codeEl = btn.querySelector('.coin-code, .lang-code');
      if (flagImg && flagMap[lang]) {
        flagImg.src = flagMap[lang];
        flagImg.alt = codeMap[lang] || 'ES';
      }
      if (codeEl) codeEl.textContent = codeMap[lang] || 'ES';
    });

    // Update active class on options
    document.querySelectorAll('.lang-flag-coin, .lang-option, .mobile-lang-btn').forEach((el) => {
      const itemLang = el.getAttribute('data-lang');
      if (itemLang === lang) {
        el.classList.add('is-active');
        el.setAttribute('aria-current', 'true');
      } else {
        el.classList.remove('is-active');
        el.removeAttribute('aria-current');
      }
    });
  }
}
