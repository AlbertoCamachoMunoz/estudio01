import { DataLoaderService } from '../services/DataLoaderService.js';
import { WhatsAppService } from '../services/WhatsAppService.js';

/**
 * WhatsApp Widget Component (Floating interactive chat widget for Pixel & Web)
 * Pure vanilla JavaScript floating widget with notification badge,
 * delayed tooltip bubble, and interactive WhatsApp chatbox modal.
 */
export class WhatsAppWidgetComponent {
  /**
   * @param {Object} [options]
   * @param {number} [options.buttonDelay] - Delay in ms to show badge
   * @param {number} [options.bubbleDelay] - Delay in ms to pop up preview bubble
   */
  constructor({ buttonDelay = 2500, bubbleDelay = 4000 } = {}) {
    this.buttonDelay = buttonDelay;
    this.bubbleDelay = bubbleDelay;
    this.isOpen = false;
    this.hasInteracted = false;

    this.init();
  }

  init() {
    this.company = DataLoaderService.getCompany();
    this.render();
    this.bindEvents();
    this.setupHeroScrollObserver();
    this.scheduleDelays();
  }

  render() {
    const legacyBtn = document.querySelector('.whatsapp-float');
    if (legacyBtn) {
      legacyBtn.remove();
    }

    const existingWidget = document.getElementById('whatsappWidget');
    if (existingWidget) {
      existingWidget.remove();
    }

    const agencyName = (this.company && this.company.name) || 'Pixel & Web';

    const t = {
      tooltip: `⚡ ¿Hablamos sobre tu Web, Vídeo o IA?`,
      bubble: `Hola 👋 Somos <strong>${agencyName}</strong>.<br>¿Quieres digitalizar tu negocio, grabar Reels profesionales o probar un Agente de IA en tu WhatsApp?`,
      btnText: 'Hablar por WhatsApp',
      btnAria: 'Abrir chat de WhatsApp con Pixel & Web',
      closeAria: 'Cerrar ventana de chat',
    };

    const widget = document.createElement('div');
    widget.id = 'whatsappWidget';
    widget.className = 'joinchat joinchat--right';
    widget.setAttribute('aria-live', 'polite');

    widget.innerHTML = `
      <!-- Tooltip Preview Bubble -->
      <div class="joinchat__tooltip" id="joinchatTooltip" role="tooltip">
        <div>${t.tooltip}</div>
      </div>

      <!-- Notification Badge -->
      <div class="joinchat__badge" id="joinchatBadge">1</div>

      <!-- Floating Circle Button -->
      <div class="joinchat__button" id="joinchatBtn" role="button" tabindex="0" aria-label="${t.btnAria}" aria-haspopup="dialog" aria-expanded="false">
        <div class="joinchat__button__ico">
          <svg viewBox="0 0 24 24" width="36" height="36" aria-hidden="true">
            <path fill="#ffffff" d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.91-7.01A9.87 9.87 0 0 0 12.04 2zm0 1.67c2.2 0 4.26.86 5.82 2.42 1.55 1.56 2.41 3.63 2.41 5.83 0 4.54-3.69 8.23-8.24 8.23-1.48 0-2.93-.39-4.19-1.14l-.3-.18-3.12.82.83-3.04-.2-.32a8.14 8.14 0 0 1-1.26-4.38c.01-4.54 3.7-8.24 8.25-8.24zm-3.52 3.66c-.16 0-.43.06-.66.31-.22.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.57.13.16 1.72 2.62 4.17 3.68.58.25 1.04.41 1.39.52.59.19 1.13.16 1.55.1.48-.07 1.46-.59 1.67-1.17.2-.58.2-1.07.14-1.17-.06-.11-.23-.17-.48-.29s-1.23-.6-1.46-.68c-.22-.09-.39-.13-.55.12-.17.25-.64.81-.79.98-.14.17-.29.19-.54.07-.24-.13-1.04-.39-1.98-1.23-.74-.65-1.23-1.46-1.38-1.71-.14-.24-.02-.38.11-.5.11-.11.25-.29.38-.44.13-.15.17-.26.25-.42.08-.16.04-.3-.02-.42-.06-.13-.53-1.28-.73-1.76-.19-.47-.39-.4-.54-.41h-.47z"/>
          </svg>
        </div>
      </div>

      <!-- Chatbox Modal Dialog -->
      <div class="joinchat__chatbox" id="joinchatChatbox" role="dialog" aria-labelledby="joinchatLabel" aria-modal="true" hidden>
        <div class="joinchat__header">
          <div id="joinchatLabel">
            <svg class="joinchat__wa" width="120" height="28" viewBox="0 0 120 28" aria-label="WhatsApp">
              <title>WhatsApp</title>
              <path fill="#ffffff" d="M117.2 17c0 .4-.2.7-.4 1-.1.3-.4.5-.7.7l-1 .2c-.5 0-.9 0-1.2-.2l-.7-.7a3 3 0 0 1-.4-1 5.4 5.4 0 0 1 0-2.3c0-.4.2-.7.4-1l.7-.7a2 2 0 0 1 1.1-.3 2 2 0 0 1 1.8 1l.4 1a5.3 5.3 0 0 1 0 2.3m2.5-3c-.1-.7-.4-1.3-.8-1.7a4 4 0 0 0-1.3-1.2c-.6-.3-1.3-.4-2-.4-.6 0-1.2.1-1.7.4a3 3 0 0 0-1.2 1.1V11H110v13h2.7v-4.5c.4.4.8.8 1.3 1 .5.3 1 .4 1.6.4a4 4 0 0 0 3.2-1.5c.4-.5.7-1 .8-1.6.2-.6.3-1.2.3-1.9s0-1.3-.3-2zm-13.1 3c0 .4-.2.7-.4 1l-.7.7-1.1.2c-.4 0-.8 0-1-.2-.4-.2-.6-.4-.8-.7a3 3 0 0 1-.4-1 5.4 5.4 0 0 1 0-2.3c0-.4.2-.7.4-1 .1-.3.4-.5.7-.7a2 2 0 0 1 1-.3 2 2 0 0 1 1.9 1l.4 1a5.4 5.4 0 0 1 0 2.3m1.7-4.7a4 4 0 0 0-3.3-1.6c-.6 0-1.2.1-1.7.4a3 3 0 0 0-1.2 1.1V11h-2.6v13h2.7v-4.5c.3.4.7.8 1.2 1 .6.3 1.1.4 1.7.4a4 4 0 0 0 3.2-1.5c.4-.5.6-1 .8-1.6s.3-1.2.3-1.9-.1-1.3-.3-2c-.2-.6-.4-1.2-.8-1.6m-17.5 3.2 1.7-5 1.7 5zm.2-8.2-5 13.4h3l1-3h5l1 3h3L94 7.3zm-5.3 9.1-.6-.8-1-.5a11.6 11.6 0 0 0-2.3-.5l-1-.3a2 2 0 0 1-.6-.3.7.7 0 0 1-.3-.6c0-.2 0-.4.2-.5l.3-.3h.5l.5-.1c.5 0 .9 0 1.2.3.4.1.6.5.6 1h2.5c0-.6-.2-1.1-.4-1.5a3 3 0 0 0-1-1 4 4 0 0 0-1.3-.5 7.7 7.7 0 0 0-3 0c-.6.1-1 .3-1.4.5l-1 1a3 3 0 0 0-.4 1.5 2 2 0 0 0 1 1.8l1 .5 1.1.3 2.2.6c.6.2.8.5.8 1l-.1.5-.4.4a2 2 0 0 1-.6.2 2.8 2.8 0 0 1-1.4 0 2 2 0 0 1-.6-.3l-.5-.5-.2-.8H77c0 .7.2 1.2.5 1.6.2.5.6.8 1 1 .4.3.9.5 1.4.6a8 8 0 0 0 3.3 0c.5 0 1-.2 1.4-.5a3 3 0 0 0 1-1c.3-.5.4-1 .4-1.6 0-.5 0-.9-.3-1.2M74.7 8h-2.6v3h-1.7v1.7h1.7v5.8c0 .5 0 .9.2 1.2l.7.7 1 .3a7.8 7.8 0 0 0 2 0h.7v-2.1a3.4 3.4 0 0 1-.8 0l-1-.1-.2-1v-4.8h2V11h-2zm-7.6 9v.5l-.3.8-.7.6c-.2.2-.7.2-1.2.2h-.6l-.5-.2a1 1 0 0 1-.4-.4l-.1-.6.1-.6.4-.4.5-.3a4.8 4.8 0 0 1 1.2-.2 8 8 0 0 0 1.2-.2l.4-.3v1zm2.6 1.5v-5c0-.6 0-1.1-.3-1.5l-1-.8-1.4-.4a10.9 10.9 0 0 0-3.1 0l-1.5.6c-.4.2-.7.6-1 1a3 3 0 0 0-.5 1.5h2.7c0-.5.2-.9.5-1a2 2 0 0 1 1.3-.4h.6l.6.2.3.4.2.7c0 .3 0 .5-.3.6-.1.2-.4.3-.7.4l-1 .1a22 22 0 0 0-2.4.4l-1 .5c-.3.2-.6.5-.8.9-.2.3-.3.8-.3 1.3s.1 1 .3 1.3c.1.4.4.7.7 1l1 .4c.4.2.9.2 1.3.2a6 6 0 0 0 1.8-.2c.6-.2 1-.5 1.5-1a4 4 0 0 0 .2 1H70l-.3-1zm-11-6.7c-.2-.4-.6-.6-1-.8-.5-.2-1-.3-1.8-.3-.5 0-1 .1-1.5.4a3 3 0 0 0-1.3 1.2v-5h-2.7v13.4H53v-5.1c0-1 .2-1.7.5-2.2.3-.4.9-.6 1.6-.6.6 0 1 .2 1.3.6s.4 1 .4 1.8v5.5h2.7v-6c0-.6 0-1.2-.2-1.6 0-.5-.3-1-.5-1.3zm-14 4.7-2.3-9.2h-2.8l-2.3 9-2.2-9h-3l3.6 13.4h3l2.2-9.2 2.3 9.2h3l3.6-13.4h-3zm-24.5.2L18 15.6c-.3-.1-.6-.2-.8.2A20 20 0 0 1 16 17c-.2.2-.4.3-.7.1-.4-.2-1.5-.5-2.8-1.7-1-1-1.7-2-2-2.4-.1-.4 0-.5.2-.7l.5-.6.4-.6v-.6L10.4 8c-.3-.6-.6-.5-.8-.6H9c-.2 0-.6.1-.9.5C7.8 8.2 7 9 7 10.7s1.3 3.4 1.4 3.6c.2.3 2.5 3.7 6 5.2l1.9.8c.8.2 1.6.2 2.2.1s2-.8 2.3-1.6c.3-.9.3-1.5.2-1.7l-.7-.4zM14 25.3c-2 0-4-.5-5.8-1.6l-.4-.2-4.4 1.1 1.2-4.2-.3-.5A11.5 11.5 0 0 1 22.1 5.7 11.5 11.5 0 0 1 14 25.3M14 0A13.8 13.8 0 0 0 2 20.7L0 28l7.3-2A13.8 13.8 0 1 0 14 0"/>
            </svg>
          </div>
          <div class="joinchat__close" id="joinchatClose" role="button" tabindex="0" aria-label="${t.closeAria}"></div>
        </div>

        <div class="joinchat__scroll">
          <div class="joinchat__content">
            <div class="joinchat__chat">
              <div class="joinchat__bubble">
                ${t.bubble}
              </div>
            </div>

            <div class="joinchat__open" id="joinchatOpenAction" role="button" tabindex="0" aria-label="${t.btnAria}">
              <div class="joinchat__open__text">${t.btnText}</div>
              <svg class="joinchat__open__icon" width="60" height="60" viewBox="0 0 400 400" aria-hidden="true">
                <path class="joinchat__pa" d="M168.83 200.504H79.218L33.04 44.284a1 1 0 0 1 1.386-1.188L365.083 199.04a1 1 0 0 1 .003 1.808L34.432 357.903a1 1 0 0 1-1.388-1.187l29.42-99.427"></path>
                <path class="joinchat__pb" d="M318.087 318.087c-52.982 52.982-132.708 62.922-195.725 29.82l-80.449 10.18 10.358-80.112C18.956 214.905 28.836 134.99 81.913 81.913c65.218-65.217 170.956-65.217 236.174 0 42.661 42.661 57.416 102.661 44.265 157.316"></path>
              </svg>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(widget);

    this.widgetEl = widget;
    this.btnEl = widget.querySelector('#joinchatBtn');
    this.badgeEl = widget.querySelector('#joinchatBadge');
    this.tooltipEl = widget.querySelector('#joinchatTooltip');
    this.chatboxEl = widget.querySelector('#joinchatChatbox');
    this.closeBtn = widget.querySelector('#joinchatClose');
    this.openActionBtn = widget.querySelector('#joinchatOpenAction');
  }

  bindEvents() {
    this.btnEl.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggle();
    });

    this.btnEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.toggle();
      }
    });

    this.tooltipEl.addEventListener('click', (e) => {
      e.stopPropagation();
      this.openChat();
    });

    this.closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.closeChat();
    });

    this.closeBtn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.closeChat();
      }
    });

    this.openActionBtn.addEventListener('click', () => {
      this.launchWhatsApp();
    });

    this.openActionBtn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.launchWhatsApp();
      }
    });

    document.addEventListener('click', (e) => {
      if (this.isOpen && !this.chatboxEl.contains(e.target) && !this.btnEl.contains(e.target)) {
        this.closeChat();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.closeChat();
      }
    });
  }

  setupHeroScrollObserver() {
    const heroActions = document.querySelector('.hero-actions') || document.getElementById('hero');
    if (!heroActions) return;

    const checkHeroVisibility = () => {
      if (this.isOpen) return;
      const rect = heroActions.getBoundingClientRect();
      const inHeroActions = rect.bottom > 80;
      if (inHeroActions) {
        this.widgetEl.classList.add('joinchat--in-hero');
      } else {
        this.widgetEl.classList.remove('joinchat--in-hero');
      }
    };

    checkHeroVisibility();
    window.addEventListener('scroll', checkHeroVisibility, { passive: true });
    window.addEventListener('resize', checkHeroVisibility, { passive: true });
  }

  scheduleDelays() {
    setTimeout(() => {
      if (!this.hasInteracted && this.badgeEl) {
        this.badgeEl.classList.add('is-visible');
      }
    }, this.buttonDelay);

    setTimeout(() => {
      const isMobile = window.innerWidth <= 768;
      if (!this.hasInteracted && !this.isOpen && this.tooltipEl && !isMobile) {
        this.tooltipEl.classList.add('is-visible');
      }
    }, this.bubbleDelay);
  }

  toggle() {
    if (this.isOpen) {
      this.closeChat();
    } else {
      this.openChat();
    }
  }

  openChat() {
    this.isOpen = true;
    this.hasInteracted = true;
    this.hideTooltip();
    this.hideBadge();

    this.widgetEl.classList.add('joinchat--chatbox');
    this.chatboxEl.hidden = false;
    this.btnEl.setAttribute('aria-expanded', 'true');
  }

  closeChat() {
    this.isOpen = false;
    this.widgetEl.classList.remove('joinchat--chatbox');
    this.chatboxEl.hidden = true;
    this.btnEl.setAttribute('aria-expanded', 'false');
  }

  hideTooltip() {
    if (this.tooltipEl) {
      this.tooltipEl.classList.remove('is-visible');
    }
  }

  hideBadge() {
    if (this.badgeEl) {
      this.badgeEl.classList.remove('is-visible');
    }
  }

  launchWhatsApp() {
    const defaultText =
      (this.company && this.company.defaultMessage) ||
      `Hola Pixel & Web, contacto desde vuestra web para solicitar información y presupuesto de digitalización para mi negocio.`;
    const targetUrl = WhatsAppService.getLink(defaultText);
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
    this.closeChat();
  }
}
