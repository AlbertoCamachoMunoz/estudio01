import { $$ } from '../utils/domHelper.js';

/**
 * Accordion Component
 * Accessible collapsible FAQ accordion.
 */
export class AccordionComponent {
  /**
   * @param {Object} options
   * @param {string} [options.itemSelector]
   */
  constructor({ itemSelector = '.faq-item' } = {}) {
    this.items = $$(itemSelector);

    if (this.items.length > 0) {
      this.init();
    }
  }

  init() {
    this.items.forEach((item) => {
      const trigger = item.querySelector('.faq-question');
      const content = item.querySelector('.faq-answer');

      if (trigger && content) {
        trigger.addEventListener('click', () => {
          const isExpanded = trigger.getAttribute('aria-expanded') === 'true';

          // Close other accordion items
          this.items.forEach((other) => {
            const otherTrigger = other.querySelector('.faq-question');
            const otherContent = other.querySelector('.faq-answer');
            if (otherTrigger && otherContent) {
              otherTrigger.setAttribute('aria-expanded', 'false');
              otherContent.classList.remove('is-open');
            }
          });

          // Toggle current
          if (!isExpanded) {
            trigger.setAttribute('aria-expanded', 'true');
            content.classList.add('is-open');
          }
        });
      }
    });
  }
}
