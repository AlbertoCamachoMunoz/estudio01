/**
 * Data Loader Service
 * Implements Single Source of Truth (SSOT) architecture for Pixel & Web.
 * Master business rates & company data are maintained in:
 * - company.json (SSOT for contact info, WhatsApp, form endpoints, coverage area)
 * - pricing.json (SSOT for agency service packages and optional add-ons)
 * - gallery.json (SSOT for portfolio case studies, including Sexi-Garden)
 * Translations and UI copy are decoupled in assets/data/translations/${lang}.json
 */
export class DataLoaderService {
  static _company = null;
  static _services = null;
  static _extras = null;
  static _gallery = null;
  static _reviews = null;
  static _faqs = null;
  static _pricing = null;
  static _social = null;
  static _currentLang = 'es';

  /**
   * Detects active language from <html lang="..."> attribute
   * @returns {'es' | 'en' | 'de' | 'fr'}
   */
  static getCurrentLang() {
    const htmlLang = (document.documentElement && document.documentElement.getAttribute('lang')) || 'es';
    const langCode = htmlLang.slice(0, 2).toLowerCase();
    const supported = ['es', 'en', 'de', 'fr'];
    return supported.includes(langCode) ? langCode : 'es';
  }

  /**
   * Evaluates if the current execution context is development
   * @returns {boolean}
   */
  static isDevelopment() {
    if (typeof window === 'undefined' || !window.location) {
      return typeof process !== 'undefined' && process.env && process.env.NODE_ENV !== 'production';
    }

    const { hostname, protocol, search } = window.location;

    if (search) {
      const params = new URLSearchParams(search);
      if (params.get('env') === 'dev' || params.get('test_email') === '1' || params.get('dev') === 'true') {
        return true;
      }
      if (params.get('env') === 'prod' || params.get('dev') === 'false') {
        return false;
      }
    }

    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1' || hostname === '[::1]') {
      return true;
    }

    if (protocol === 'file:') {
      return true;
    }

    if (/^(192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.)/.test(hostname)) {
      return true;
    }

    return false;
  }

  /**
   * Initializes and preloads SSOT business data merged with active language translations
   * @param {string} [lang]
   * @param {Object} [fallbackConfig]
   * @returns {Promise<void>}
   */
  static async loadAll(lang = null, fallbackConfig = {}) {
    const activeLang = lang || this.getCurrentLang();
    this._currentLang = activeLang;

    try {
      const [companyMaster, pricingMaster, galleryMaster, socialMaster, translations] = await Promise.all([
        this._fetchJson('assets/data/company.json'),
        this._fetchJson('assets/data/pricing.json'),
        this._fetchJson('assets/data/gallery.json'),
        this._fetchJson('assets/data/social.json').catch(() => []),
        this._fetchJson(`assets/data/translations/${activeLang}.json`).catch(() =>
          this._fetchJson('assets/data/translations/es.json')
        ),
      ]);

      this._pricing = pricingMaster;
      this._social = socialMaster || [];

      const isDev = this.isDevelopment();
      const activeEmail = isDev && companyMaster.emailDev ? companyMaster.emailDev : companyMaster.email;
      const activeFormEndpoint = isDev && companyMaster.formEndpointDev ? companyMaster.formEndpointDev : companyMaster.formEndpoint;

      if (isDev && typeof console !== 'undefined' && console.info) {
        console.info(`%c⚡ [Pixel & Web] MODO DESARROLLO ACTIVO%c — Solicitudes dirigidas a: ${activeEmail}`, 'color: #4f46e5; font-weight: bold;', 'color: inherit;');
      }

      this._company = {
        ...fallbackConfig,
        ...companyMaster,
        email: activeEmail,
        formEndpoint: activeFormEndpoint,
        isDevelopment: isDev,
        ...(translations.company || {}),
      };

      const serviceTranslations = translations.services || {};
      this._services = (pricingMaster.services || [])
        .filter((service) => service.active !== false && !service.commented)
        .map((service) => {
          const t = serviceTranslations[service.id] || {};
          return {
            ...service,
            name: t.name || service.id,
            shortDesc: t.shortDesc || '',
          };
        });

      const extraTranslations = translations.extras || {};
      this._extras = (pricingMaster.extras || [])
        .filter((extra) => extra.active !== false && !extra.commented)
        .map((extra) => {
          const t = extraTranslations[extra.id] || {};
          return {
            ...extra,
            name: t.name || extra.id,
            description: t.description || '',
            price: extra.flatPrice,
          };
        });

      const galleryTranslations = translations.gallery || {};
      this._gallery = (galleryMaster || [])
        .filter((item) => item.active !== false && !item.commented)
        .map((item) => {
          const t = galleryTranslations[item.id] || {};
          return {
            ...item,
            title: t.title || item.title || '',
            location: t.location || item.location || '',
          };
        });

      this._reviews = translations.reviews || [];
      this._faqs = translations.faqs || [];
    } catch (err) {
      console.warn('DataLoaderService: Using fallback CONFIG due to load error', err);
      this._company = { ...fallbackConfig };
    }
  }

  static async _fetchJson(path) {
    const res = await fetch(path, { cache: 'no-cache' });
    if (!res.ok) throw new Error(`Failed to load ${path}: ${res.statusText}`);
    return await res.json();
  }

  static getCompany() {
    return this._company || {
      name: 'Pixel & Web',
      phone: '635108640',
      phoneFormatted: '+34 635 10 86 40',
      phoneRaw: '34635108640',
      email: 'c4max0@gmail.com',
      city: 'Motril',
      region: 'Motril, Provincia de Granada, Málaga y Almería',
      defaultMessage: 'Hola Pixel & Web, contacto desde vuestra web para solicitar información y presupuesto de digitalización para mi empresa.',
      formEndpoint: 'https://formsubmit.co/ajax/c4max0@gmail.com',
    };
  }

  static getPricing() {
    return this._pricing || { currency: 'EUR', currencySymbol: '€', unitLabel: 'módulos' };
  }

  static getServices() {
    return this._services || [];
  }

  static getServiceById(id) {
    const services = this.getServices();
    return services.find((s) => s.id === id) || services[0];
  }

  static getExtras() {
    return this._extras || [];
  }

  static getExtraById(id) {
    const extras = this.getExtras();
    return extras.find((e) => e.id === id);
  }

  static getGallery() {
    return this._gallery || [];
  }

  static getReviews() {
    return this._reviews || [];
  }

  static getFaqs() {
    return this._faqs || [];
  }

  static getSocial() {
    return this._social || [];
  }
}
