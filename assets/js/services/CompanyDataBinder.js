import { DataLoaderService } from './DataLoaderService.js';

/**
 * CompanyDataBinder Service
 * Binds company details dynamically from assets/data/company.json & CONFIG
 * to DOM elements across the application (index.html, legal pages, etc.).
 * Eliminates hardcoded company values (emails, phones, endpoints) from HTML markup.
 */
export class CompanyDataBinder {
  /**
   * Automatically scans the DOM and populates company attributes and text
   * @param {Object} [customData]
   * @returns {Promise<void>}
   */
  static async bindAll(customData = null) {
    let company = customData;

    if (!company || !company.email) {
      company = DataLoaderService.getCompany();
    }

    if (!company || !company.email) {
      try {
        const res = await fetch('assets/data/company.json');
        if (res.ok) {
          const raw = await res.json();
          const isDev = DataLoaderService.isDevelopment();
          company = {
            ...raw,
            email: isDev && raw.emailDev ? raw.emailDev : raw.email,
            formEndpoint: isDev && raw.formEndpointDev ? raw.formEndpointDev : raw.formEndpoint,
            isDevelopment: isDev,
          };
        }
      } catch (err) {
        console.warn('CompanyDataBinder: Could not load assets/data/company.json', err);
      }
    }

    if (!company) return;

    // 1. Text elements: [data-company="field"]
    document.querySelectorAll('[data-company]').forEach((el) => {
      const field = el.dataset.company;
      if (company[field] !== undefined) {
        el.textContent = company[field];
      }
    });

    const defaultWaText =
      company.defaultMessage ||
      `Hola ${company.name || 'Pixel & Web'}, me gustaría solicitar presupuesto para digitalizar mi negocio.`;

    // 2. Link Hrefs: [data-company-href]
    document.querySelectorAll('[data-company-href]').forEach((el) => {
      const type = el.dataset.companyHref;
      if (type === 'email' && company.email) {
        el.href = `mailto:${company.email}`;
      } else if (type === 'emailSubject' && company.email) {
        const subject = el.dataset.companySubject || `Consulta de Proyecto Digital - ${company.name || 'Pixel & Web'}`;
        el.href = `mailto:${company.email}?subject=${encodeURIComponent(subject)}`;
      } else if (type === 'whatsapp' && company.phoneRaw) {
        const text = el.dataset.waText || defaultWaText;
        el.href = `https://wa.me/${company.phoneRaw}?text=${encodeURIComponent(text)}`;
      } else if (type === 'tel' && company.phoneRaw) {
        el.href = `tel:+${company.phoneRaw}`;
      } else if (type === 'googleReviews' && company.googleReviewsUrl) {
        el.href = company.googleReviewsUrl;
      } else if (type === 'googleWriteReview' && company.googleWriteReviewUrl) {
        el.href = company.googleWriteReviewUrl;
      }
    });

    // 3. Form endpoints: [data-company-form="endpoint"]
    document.querySelectorAll('[data-company-form="endpoint"]').forEach((form) => {
      const endpoint = company.formEndpoint || (company.email ? `https://formsubmit.co/ajax/${company.email}` : '');
      if (endpoint) {
        form.action = endpoint;
      }
    });

    // 4. Map Embed Iframe binding: [data-company-map="embed"]
    document.querySelectorAll('[data-company-map="embed"]').forEach((iframe) => {
      if (company.mapEmbedUrl) {
        iframe.src = company.mapEmbedUrl;
      }
    });

    // 5. Year bindings
    const year = new Date().getFullYear();
    document.querySelectorAll('[data-company-year], #currentYear').forEach((el) => {
      el.textContent = year;
    });
  }
}
