import { $, $$ } from '../utils/domHelper.js';

/**
 * Gallery Filter Component
 * Filters project portfolio items by service category with animated states.
 */
export class GalleryFilterComponent {
  /**
   * @param {Object} options
   * @param {string} [options.filterSelector]
   * @param {string} [options.itemSelector]
   */
  constructor({ filterSelector = '.gallery-filter-btn', itemSelector = '.gallery-item' } = {}) {
    this.filterSelector = filterSelector;
    this.itemSelector = itemSelector;
    this.filterButtons = $$(filterSelector);
    this.galleryItems = $$(itemSelector);

    if (this.filterButtons.length > 0) {
      this.init();
    }
  }

  init() {
    this.filterButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const category = btn.getAttribute('data-filter') || 'all';

        this.filterButtons.forEach((b) => b.classList.remove('is-active'));
        btn.classList.add('is-active');

        this.applyFilter(category);
      });
    });
  }

  applyFilter(category) {
    this.galleryItems = $$(this.itemSelector);
    this.galleryItems.forEach((item) => {
      const itemCategory = item.getAttribute('data-category') || '';
      if (category === 'all' || itemCategory.includes(category)) {
        item.classList.remove('is-hidden');
      } else {
        item.classList.add('is-hidden');
      }
    });
  }
}
