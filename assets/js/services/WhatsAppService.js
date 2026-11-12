import { DataLoaderService } from './DataLoaderService.js';

/**
 * WhatsApp Service
 * Generates direct wa.me chat links with contextual pre-filled messages for Pixel & Web.
 */
export class WhatsAppService {
  /**
   * Generates wa.me URL
   * @param {string} [customText]
   * @returns {string}
   */
  static getLink(customText = '') {
    const company = DataLoaderService.getCompany();
    const phoneRaw = company.phoneRaw || company.whatsappNumber || '34635108640';
    const agencyName = company.name || 'Pixel & Web';

    const defaultMessage =
      company.defaultMessage ||
      `Hola ${agencyName}, contacto desde vuestra web para solicitar información y presupuesto de digitalización para mi negocio.`;

    const textToSend = customText.trim() || defaultMessage;
    const encodedText = encodeURIComponent(textToSend);
    return `https://wa.me/${phoneRaw}?text=${encodedText}`;
  }

  /**
   * Generates a link for a specific agency service enquiry
   * @param {string} serviceName
   * @returns {string}
   */
  static getServiceInquiryLink(serviceName) {
    const company = DataLoaderService.getCompany();
    const agencyName = company.name || 'Pixel & Web';

    const message = `Hola ${agencyName}, he visto vuestra web y me gustaría recibir información y presupuesto sobre: ${serviceName}.`;
    return this.getLink(message);
  }

  /**
   * Generates a link with calculator estimate details
   * @param {Object} estimate
   * @param {string} estimate.serviceName
   * @param {number} estimate.areaM2
   * @param {number} estimate.minBudget
   * @param {number} estimate.maxBudget
   * @param {string} [estimate.clientName]
   * @param {string} [estimate.companySector]
   * @returns {string}
   */
  static getEstimateLink({ serviceName, areaM2, minBudget, maxBudget, clientName = '', companySector = '' }) {
    const company = DataLoaderService.getCompany();
    const agencyName = company.name || 'Pixel & Web';
    const introName = clientName ? ` Soy ${clientName}` : '';
    const introSector = companySector ? ` (${companySector})` : '';

    const message = `Hola ${agencyName}.${introName}${introSector}. He calculado una estimación en vuestra web para ${serviceName} (alcance: ${areaM2} módulos/entregables): aprox. ${minBudget} € - ${maxBudget} €. Me gustaría comentarlo con vosotros para recibir una propuesta a medida.`;

    return this.getLink(message);
  }
}
