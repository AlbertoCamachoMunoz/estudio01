import { DataLoaderService } from './DataLoaderService.js';

/**
 * Email Service
 * Handles direct lead submission to the agency endpoint via FormSubmit AJAX.
 * Zero registration, zero server, zero configuration required.
 */
export class EmailService {
  /**
   * Submits lead data via fetch API
   * @param {Object} payload - Serialized lead data
   * @param {string} [customActionUrl] - Optional action override
   * @returns {Promise<{ success: boolean, message: string }>}
   */
  static async sendLead(payload, customActionUrl = '') {
    const company = DataLoaderService.getCompany();
    const targetUrl =
      customActionUrl && customActionUrl !== '#'
        ? customActionUrl
        : company.formEndpoint || `https://formsubmit.co/ajax/${company.email || 'c4max0@gmail.com'}`;

    const isValidEmail = payload.email && typeof payload.email === 'string' && payload.email.includes('@');
    const rawPhone = (payload.phone || '').replace(/\D/g, '');
    const formattedPhone =
      rawPhone.length === 9
        ? `${rawPhone.slice(0, 3)} ${rawPhone.slice(3, 5)} ${rawPhone.slice(5, 7)} ${rawPhone.slice(7, 9)}`
        : payload.phone;

    const agencyName = company.name || 'Estudio 01';

    const bodyData = {
      Cliente: payload.name,
      Empresa_Sector: payload.companySector || 'No especificado',
      Telefono_WhatsApp: formattedPhone,
      Email: isValidEmail ? payload.email : 'No indicado',
      Servicio_Interes: payload.service || 'General',
      Alcance_Modulos: payload.area || 'Estándar',
      Extras_Seleccionados: payload.extras || 'Ninguno',
      Inversion_Estimada: payload.estimatedRange || 'Consultar',
      Mensaje_Reto: payload.message || 'Sin observaciones adicionales',
      Zona_Agencia: company.region || 'Motril, Granada, Málaga y Almería',
      Fecha: new Date().toLocaleString('es-ES', { timeZone: 'Europe/Madrid' }),
      _subject: `${company.isDevelopment ? '⚡ [DEV-TEST] ' : '⚡ '}[${agencyName}] Nuevo Lead: ${payload.service || 'Digitalización'} - ${payload.name}`,
      _replyto: isValidEmail ? payload.email : company.email || 'c4max0@gmail.com',
      _template: 'table',
      _captcha: 'false',
    };

    try {
      const response = await fetch(targetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(bodyData),
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok && data.success !== false && data.success !== 'false') {
        return {
          success: true,
          message:
            '¡Solicitud recibida! Nuestro equipo técnico revisará tu caso y te contactará por WhatsApp o teléfono en menos de 24 horas.',
        };
      }

      return {
        success: false,
        message:
          data.message ||
          'No se pudo procesar el envío automático. Puedes enviarnos tu consulta directamente por WhatsApp con un clic.',
      };
    } catch (error) {
      return {
        success: false,
        message:
          'Hubo un error de conexión con el servidor de correo. Pulsa el botón inferior para enviarnos tu solicitud directamente por WhatsApp.',
      };
    }
  }

  /**
   * Fallback mailto generator
   * @param {Object} payload
   * @returns {string}
   */
  static getMailtoUrl(payload) {
    const company = DataLoaderService.getCompany();
    const subject = encodeURIComponent(`Propuesta Digital ${company.name || 'Estudio 01'} - ${payload.name}`);
    const body = encodeURIComponent(
      `Nombre: ${payload.name}\nEmpresa/Sector: ${payload.companySector}\nTeléfono/WhatsApp: ${payload.phone}\nEmail: ${payload.email}\nServicio: ${payload.service}\n\nMensaje:\n${payload.message}`
    );
    return `mailto:${company.email || 'c4max0@gmail.com'}?subject=${subject}&body=${body}`;
  }
}
