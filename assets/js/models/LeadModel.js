/**
 * Lead Model
 * Handles agency B2B lead data representation and validation rules.
 */
export class LeadModel {
  /**
   * @param {Object} params
   * @param {string} params.name
   * @param {string} [params.companySector]
   * @param {string} params.phone
   * @param {string} [params.email]
   * @param {string} [params.service]
   * @param {string} [params.area]
   * @param {string} [params.extras]
   * @param {string} [params.estimatedRange]
   * @param {string} [params.message]
   * @param {boolean} [params.privacy]
   */
  constructor({
    name = '',
    companySector = '',
    phone = '',
    email = '',
    service = '',
    area = '',
    extras = '',
    estimatedRange = '',
    message = '',
    privacy = false,
  } = {}) {
    this.name = (name || '').trim();
    this.companySector = (companySector || '').trim();
    this.phone = (phone || '').trim().replace(/\s+/g, '');
    this.email = (email || '').trim();
    this.service = (service || '').trim();
    this.area = (area || '').trim();
    this.extras = (extras || '').trim();
    this.estimatedRange = (estimatedRange || '').trim();
    this.message = (message || '').trim();
    this.privacy = Boolean(privacy);
    this.createdAt = new Date().toISOString();
  }

  /**
   * Validates lead data
   * @returns {{ isValid: boolean, errors: Record<string, string> }}
   */
  validate() {
    const errors = {};

    if (!this.name || this.name.length < 2) {
      errors.name = 'Por favor, introduce tu nombre (mínimo 2 caracteres).';
    }

    const phoneRegex = /^(\+34|0034)?[6789]\d{8}$/;
    if (!this.phone) {
      errors.phone = 'El teléfono o WhatsApp es obligatorio para poder contactarte.';
    } else if (!phoneRegex.test(this.phone)) {
      errors.phone = 'Introduce un número de teléfono válido de 9 dígitos (ej. 635108640).';
    }

    if (this.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(this.email)) {
        errors.email = 'El formato del correo electrónico no es válido.';
      }
    }

    if (!this.privacy) {
      errors.privacy = 'Debes aceptar la política de privacidad para enviar la solicitud.';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }

  /**
   * Converts lead data to plain object suitable for API submission
   * @returns {Record<string, string>}
   */
  toPayload() {
    return {
      name: this.name,
      companySector: this.companySector || 'No especificado',
      phone: this.phone,
      email: this.email || 'No proporcionado',
      service: this.service || 'Pack Completo / Asesoramiento General',
      area: this.area || 'Estándar',
      extras: this.extras || 'Ninguno',
      estimatedRange: this.estimatedRange || 'Consultar a medida',
      message: this.message || 'Sin mensaje adicional',
      submitted_at: this.createdAt,
    };
  }
}
