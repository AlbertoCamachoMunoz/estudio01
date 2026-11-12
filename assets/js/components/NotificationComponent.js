import { escapeHtml } from '../utils/domHelper.js';

/**
 * Notification Component
 * Displays non-intrusive, accessible toast feedback messages.
 */
export class NotificationComponent {
  constructor() {
    this.container = this._getOrCreateContainer();
  }

  _getOrCreateContainer() {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      container.setAttribute('aria-live', 'polite');
      container.setAttribute('aria-atomic', 'true');
      document.body.appendChild(container);
    }
    return container;
  }

  /**
   * Shows a toast notification
   * @param {string} message
   * @param {'success'|'error'|'info'} [type]
   * @param {number} [duration]
   */
  show(message, type = 'info', duration = 5000) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.setAttribute('role', 'alert');

    const icons = {
      success: '✔',
      error: '✖',
      info: 'ℹ',
    };

    toast.innerHTML = `
      <span class="toast-icon">${icons[type] || 'ℹ'}</span>
      <span class="toast-message">${escapeHtml(message)}</span>
      <button type="button" class="toast-close" aria-label="Cerrar notificación">&times;</button>
    `;

    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      this._dismiss(toast);
    });

    this.container.appendChild(toast);

    // Auto dismiss
    if (duration > 0) {
      toast._dismissTimer = setTimeout(() => this._dismiss(toast), duration);
    }
  }

  _dismiss(toast) {
    if (!toast || toast.dataset.dismissing === 'true') return;
    toast.dataset.dismissing = 'true';

    if (toast._dismissTimer) {
      clearTimeout(toast._dismissTimer);
      toast._dismissTimer = null;
    }

    toast.classList.add('toast-fadeout');

    let removed = false;
    const removeElement = () => {
      if (removed) return;
      removed = true;
      if (toast.parentElement) {
        toast.parentElement.removeChild(toast);
      }
    };

    toast.addEventListener('transitionend', removeElement, { once: true });
    // Guaranteed fallback removal if transitionend does not fire
    setTimeout(removeElement, 250);
  }
}
