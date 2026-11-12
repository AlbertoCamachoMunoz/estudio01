import { $ } from '../utils/domHelper.js';
import { LeadModel } from '../models/LeadModel.js';
import { EmailService } from '../services/EmailService.js';
import { WhatsAppService } from '../services/WhatsAppService.js';

/**
 * Lead Form Component (MVC View & Controller)
 * Manages agency lead form interactions, validation feedback, and sending leads via EmailService.
 */
export class LeadFormComponent {
  /**
   * @param {Object} options
   * @param {string} [options.formSelector]
   * @param {string} [options.statusSelector]
   * @param {import('./NotificationComponent.js').NotificationComponent} options.notification
   */
  constructor({ formSelector = '#contactForm', statusSelector = '#formStatus', notification } = {}) {
    this.form = $(formSelector);
    this.statusEl = $(statusSelector);
    this.notification = notification;

    if (this.form) {
      this.init();
    }
  }

  init() {
    this.submitBtn = this.form.querySelector('button[type="submit"]');
    this.originalBtnText = this.submitBtn ? this.submitBtn.textContent : 'Solicitar Propuesta por Email';

    this.form.addEventListener('submit', (e) => this.handleSubmit(e));

    this.form.querySelectorAll('input, textarea, select').forEach((field) => {
      const eventName = field.type === 'checkbox' ? 'change' : 'input';
      field.addEventListener(eventName, () => {
        field.classList.remove('is-invalid');
        const errSpan = this.form.querySelector(`#error-${field.name}`);
        if (errSpan) errSpan.textContent = '';
      });
    });
  }

  async handleSubmit(e) {
    e.preventDefault();

    const formData = new FormData(this.form);
    const privacyCheckbox = this.form.querySelector('#privacyPolicy');
    const isPrivacyChecked = privacyCheckbox ? privacyCheckbox.checked : formData.get('privacy') === 'on';

    const selectedService =
      formData.get('serviceSelect') || formData.get('service') || 'Asesoramiento Digital Integral';

    const lead = new LeadModel({
      name: formData.get('name'),
      companySector: formData.get('companySector'),
      phone: formData.get('phone'),
      email: formData.get('email'),
      service: selectedService,
      area: formData.get('area'),
      extras: formData.get('extras'),
      estimatedRange: formData.get('estimatedRange'),
      message: formData.get('message'),
      privacy: isPrivacyChecked,
    });

    const validation = lead.validate();

    if (!validation.isValid) {
      this._renderErrors(validation.errors);
      this.notification?.show('Por favor, revisa los campos marcados en el formulario.', 'error');
      return;
    }

    this._setLoading(true);

    const actionUrl = this.form.getAttribute('action');
    const result = await EmailService.sendLead(lead.toPayload(), actionUrl);

    this._setLoading(false);

    if (result.success) {
      this.form.reset();
      this.notification?.show(result.message, 'success', 7000);
      this._setStatus(result.message, 'success');
    } else {
      this.notification?.show(result.message, 'error', 8000);
      this._setStatus(result.message, 'error', lead);
    }
  }

  _renderErrors(errors) {
    Object.entries(errors).forEach(([field, msg]) => {
      const input = this.form.querySelector(`[name="${field}"]`);
      if (input) {
        input.classList.add('is-invalid');
        let errSpan = this.form.querySelector(`#error-${field}`);
        if (!errSpan) {
          errSpan = document.createElement('span');
          errSpan.id = `error-${field}`;
          errSpan.className = 'field-error-text';
          const container = input.closest('.form-group') || input.parentNode;
          container.appendChild(errSpan);
        }
        errSpan.textContent = msg;
      }
    });
  }

  _setLoading(isLoading) {
    if (!this.submitBtn) return;
    this.submitBtn.disabled = isLoading;
    this.submitBtn.textContent = isLoading ? 'Enviando solicitud...' : this.originalBtnText;
  }

  _setStatus(message, type, leadData = null) {
    if (!this.statusEl) return;
    this.statusEl.style.display = 'block';
    this.statusEl.className = `form-status status-${type}`;

    if (type === 'error' && leadData) {
      const waUrl = WhatsAppService.getLink(
        `Hola Estudio 01, soy ${leadData.name} (${leadData.companySector || 'Pyme'} - ${leadData.phone}). Solicito propuesta para: ${leadData.service}.`
      );
      this.statusEl.innerHTML = `
        <div class="form-status-header">
          <p class="form-status-msg">${message}</p>
          <button type="button" class="form-status-close" aria-label="Cerrar aviso">&times;</button>
        </div>
        <a href="${waUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-whatsapp" style="margin-top: 0.75rem; display: inline-flex;">
          <svg class="btn-whatsapp__icon" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="currentColor" d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.91-7.01A9.87 9.87 0 0 0 12.04 2zm0 1.67c2.2 0 4.26.86 5.82 2.42 1.55 1.56 2.41 3.63 2.41 5.83 0 4.54-3.69 8.23-8.24 8.23-1.48 0-2.93-.39-4.19-1.14l-.3-.18-3.12.82.83-3.04-.2-.32a8.14 8.14 0 0 1-1.26-4.38c.01-4.54 3.7-8.24 8.25-8.24zm-3.52 3.66c-.16 0-.43.06-.66.31-.22.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.57.13.16 1.72 2.62 4.17 3.68.58.25 1.04.41 1.39.52.59.19 1.13.16 1.55.1.48-.07 1.46-.59 1.67-1.17.2-.58.2-1.07.14-1.17-.06-.11-.23-.17-.48-.29s-1.23-.6-1.46-.68c-.22-.09-.39-.13-.55.12-.17.25-.64.81-.79.98-.14.17-.29.19-.54.07-.24-.13-1.04-.39-1.98-1.23-.74-.65-1.23-1.46-1.38-1.71-.14-.24-.02-.38.11-.5.11-.11.25-.29.38-.44.13-.15.17-.26.25-.42.08-.16.04-.3-.02-.42-.06-.13-.53-1.28-.73-1.76-.19-.47-.39-.4-.54-.41h-.47z"/></svg>
          <span>Enviar solicitud directa por WhatsApp</span>
        </a>
      `;
    } else {
      this.statusEl.innerHTML = `
        <div class="form-status-header">
          <p class="form-status-msg">${message}</p>
          <button type="button" class="form-status-close" aria-label="Cerrar aviso">&times;</button>
        </div>
      `;
    }

    const closeBtn = this.statusEl.querySelector('.form-status-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        this.statusEl.style.display = 'none';
        this.statusEl.innerHTML = '';
      });
    }
  }
}
