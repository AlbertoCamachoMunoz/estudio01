import { $, $$ } from '../utils/domHelper.js';

/**
 * Navigation Component
 * Controls header state, mobile drawer menu, and smooth in-page navigation.
 */
export class NavigationComponent {
  /**
   * @param {Object} options
   * @param {string} [options.toggleSelector]
   * @param {string} [options.menuSelector]
   * @param {string} [options.headerSelector]
   */
  constructor({
    toggleSelector = '#navToggle',
    menuSelector = '#mobileNav',
    headerSelector = '.header',
  } = {}) {
    this.toggleBtn = $(toggleSelector);
    this.mobileMenu = $(menuSelector);
    this.header = $(headerSelector);

    this.init();
  }

  init() {
    if (this.toggleBtn && this.mobileMenu) {
      this.toggleBtn.addEventListener('click', () => this.toggle());

      // Close menu upon navigation link click
      $$('a', this.mobileMenu).forEach((link) => {
        link.addEventListener('click', () => this.close());
      });

      // Close when clicking outside
      document.addEventListener('click', (e) => {
        if (
          this.isOpen() &&
          !this.mobileMenu.contains(e.target) &&
          !this.toggleBtn.contains(e.target)
        ) {
          this.close();
        }
      });
    }

    // Scroll effect on sticky header
    if (this.header) {
      window.addEventListener('scroll', () => {
        if (window.scrollY > 20) {
          this.header.classList.add('header-scrolled');
        } else {
          this.header.classList.remove('header-scrolled');
        }
      }, { passive: true });
    }
  }

  isOpen() {
    return this.mobileMenu?.classList.contains('is-open');
  }

  toggle() {
    if (this.isOpen()) {
      this.close();
    } else {
      this.open();
    }
  }

  open() {
    this.mobileMenu?.classList.add('is-open');
    this.toggleBtn?.setAttribute('aria-expanded', 'true');
  }

  close() {
    this.mobileMenu?.classList.remove('is-open');
    this.toggleBtn?.setAttribute('aria-expanded', 'false');
  }
}
