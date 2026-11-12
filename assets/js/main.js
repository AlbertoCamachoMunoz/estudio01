/**
 * Pixel & Web — Digital & AI Agency Entry Point
 * Modern modular JavaScript (ES Modules, MVC architecture).
 */

import { DataLoaderService } from './services/DataLoaderService.js';
import { CompanyDataBinder } from './services/CompanyDataBinder.js';
import { $$, $ } from './utils/domHelper.js';
import { WhatsAppService } from './services/WhatsAppService.js';
import { NotificationComponent } from './components/NotificationComponent.js';
import { NavigationComponent } from './components/NavigationComponent.js';
import { LeadFormComponent } from './components/LeadFormComponent.js';
import { EstimatorComponent } from './components/EstimatorComponent.js';
import { GalleryFilterComponent } from './components/GalleryFilterComponent.js';
import { AccordionComponent } from './components/AccordionComponent.js';
import { WhatsAppWidgetComponent } from './components/WhatsAppWidgetComponent.js';
import { LeafBreezeComponent } from './components/LeafBreezeComponent.js';
import { CursorTrailComponent } from './components/CursorTrailComponent.js';

/**
 * Master Central Configuration (SSOT Fallback & Global Constants)
 * Synchronized with assets/data/company.json
 */
export const CONFIG = Object.freeze({
  name: 'Pixel Digital',
  agencyName: 'Pixel Digital',
  phone: '635108640',
  phoneFormatted: '+34 635 10 86 40',
  phoneRaw: '34635108640',
  whatsappNumber: '34635108640',
  defaultMessage:
    'Hola Pixel Digital, contacto desde vuestra web para solicitar información y presupuesto de digitalización para mi negocio.',
  email: 'c4max0@gmail.com',
  contactEmail: 'c4max0@gmail.com',
  formEndpoint: 'https://formsubmit.co/ajax/c4max0@gmail.com',
  city: 'Motril',
  province: 'Granada',
  region: 'Motril, Provincia de Granada, Málaga y Almería',
  serviceArea: 'Motril y provincia de Granada, Málaga y provincia, y Almería',
});

class AppController {
  constructor() {
    this.notification = new NotificationComponent();
  }

  async bootstrap() {
    // 1. Preload JSON Database merged with central CONFIG
    await DataLoaderService.loadAll(null, CONFIG);

    // 2. Render dynamic content directly from flat-file JSON databases
    this.renderDynamicDatabaseContent();

    // 3. Bind company details dynamically to DOM (zero hardcoded emails/phones)
    await CompanyDataBinder.bindAll();

    // 4. Initialize Navigation
    this.navigation = new NavigationComponent();

    // 5. Initialize Lead Contact Form
    this.leadForm = new LeadFormComponent({
      notification: this.notification,
    });

    // 6. Initialize Interactive Digital Project & ROI Calculator
    this.estimator = new EstimatorComponent();

    // 7. Initialize Portfolio / Case Studies Filter
    this.galleryFilter = new GalleryFilterComponent();

    // 8. Initialize FAQ Accordion
    this.faqAccordion = new AccordionComponent();

    // 9. Bind contextual service cards & Tech Lab interactive demos to WhatsApp
    this.bindServiceInquiryActions();
    this.initTechLabDemos();

    // 10. Initialize Footer dynamic year
    this.updateFooterYear();

    // 11. Initialize Interactive WhatsApp Widget
    this.whatsAppWidget = new WhatsAppWidgetComponent();

    // 12. Initialize Interactive Hero Tech-Creative Pixel & Neural Canvas
    this.leafBreeze = new LeafBreezeComponent({
      canvasSelector: '#heroBreezeCanvas',
      containerSelector: '#hero',
    });

    // 13. Initialize Interactive Cursor Trail (Electric Blue to Crimson Red Ribbon)
    this.cursorTrail = new CursorTrailComponent();
  }

  renderDynamicDatabaseContent() {
    this.renderServices();
    this.renderGallery();
    this.renderReviews();
    this.renderFaqs();
    this.renderSocialLinks();
  }

  renderServices() {
    const services = DataLoaderService.getServices();
    const grid = $('.services-grid');
    if (grid && services && services.length > 0) {
      grid.innerHTML = services
        .map(
          (s) => `
        <article class="service-card">
          <div class="service-card-top">
            <div class="service-icon">${s.icon || '⚡'}</div>
            ${s.pillar ? `<span class="service-pillar-badge">${s.pillar}</span>` : ''}
          </div>
          <h3 class="service-title">${s.name}</h3>
          <p class="service-desc">${s.shortDesc}</p>
          <button class="btn btn-secondary btn-sm service-card-action" data-service-name="${s.name}">
            Consultar este servicio por WhatsApp →
          </button>
        </article>
      `
        )
        .join('');
    }
  }

  renderGallery() {
    const gallery = DataLoaderService.getGallery();
    const grid = $('.gallery-grid');
    if (grid && gallery && gallery.length > 0) {
      grid.innerHTML = gallery
        .map(
          (item) => `
        <article class="gallery-item" data-category="${item.category}">
          <img src="${item.imageUrl}" alt="${item.title}" width="600" height="450" loading="lazy">
          <div class="gallery-caption">
            ${item.client ? `<span class="gallery-client-tag">${item.client}</span>` : ''}
            <h3 class="gallery-item-title">${item.title}</h3>
            ${item.metrics ? `<p class="gallery-item-metrics">✔ ${item.metrics}</p>` : ''}
            <span class="gallery-item-location">📍 ${item.location}</span>
          </div>
        </article>
      `
        )
        .join('');
    }
  }

  renderReviews() {
    const reviews = DataLoaderService.getReviews();
    const grid = $('.reviews-grid');
    if (grid && reviews && reviews.length > 0) {
      grid.innerHTML = reviews
        .map(
          (r) => `
        <article class="review-card">
          <div class="review-card__top">
            <div class="review-stars-wrap">
              <div class="review-stars">${'★'.repeat(r.stars || 5)}</div>
              <span class="review-verified-badge">
                <svg viewBox="0 0 24 24" width="13" height="13" fill="#10b981" aria-hidden="true"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                ${r.source || 'Caso Verificado'}
              </span>
            </div>
          </div>
          <p class="review-text">"${r.text}"</p>
          <div class="review-card__footer">
            <div class="review-author-wrap">
              <div class="review-avatar-container">
                <div class="review-author-avatar review-author-avatar--initial">${r.author ? r.author.charAt(0).toUpperCase() : 'P'}</div>
              </div>
              <div>
                <div class="review-author">${r.author}</div>
                <div class="review-date">${r.date || 'Pyme Local'}</div>
              </div>
            </div>
            <a href="${r.url || '#portfolio'}" class="review-verify-btn">
              Ver caso ↗
            </a>
          </div>
        </article>
      `
        )
        .join('');
    }
  }

  renderFaqs() {
    const faqs = DataLoaderService.getFaqs();
    const container = $('.faq-accordion');
    if (container && faqs && faqs.length > 0) {
      container.innerHTML = faqs
        .map(
          (f) => `
        <div class="faq-item">
          <button class="faq-question" aria-expanded="false">
            ${f.question}
          </button>
          <div class="faq-answer">
            ${f.answer}
          </div>
        </div>
      `
        )
        .join('');
    }
  }

  renderSocialLinks() {
    const socials = DataLoaderService.getSocial();
    if (!socials || socials.length === 0) return;

    const html = socials
      .map((s) => {
        const isPlaceholder = !s.url || s.url === '#' || s.url.startsWith('#');
        const href = s.url || '#';
        const targetAttr = isPlaceholder ? '' : 'target="_blank" rel="noopener noreferrer"';
        const title = isPlaceholder
          ? `${s.name} (Próximamente)`
          : `${s.name}${s.handle ? ' (' + s.handle + ')' : ''}`;

        return `
        <a href="${href}" 
           class="social-link social-link--${s.id}" 
           ${targetAttr}
           aria-label="${s.name}" 
           title="${title}">
          <svg class="social-icon" viewBox="${s.viewBox || '0 0 24 24'}" width="20" height="20" aria-hidden="true">
            <path fill="currentColor" d="${s.svgPath}"/>
          </svg>
        </a>
      `;
      })
      .join('');

    $$('[data-social-links]').forEach((container) => {
      container.innerHTML = html;
    });

    $$('.social-link').forEach((link) => {
      const href = link.getAttribute('href');
      if (!href || href === '#' || href.startsWith('#')) {
        link.addEventListener('click', (e) => {
          e.preventDefault();
        });
      }
    });
  }

  bindServiceInquiryActions() {
    $$('.service-card-action').forEach((btn) => {
      btn.addEventListener('click', () => {
        const serviceName = btn.getAttribute('data-service-name') || 'Digitalización Integral';
        window.open(WhatsAppService.getServiceInquiryLink(serviceName), '_blank', 'noopener,noreferrer');
      });
    });
  }

  /**
   * Initializes interactive controls inside the #lab (Tech Lab & AI/PWA Showcase) section
   */
  initTechLabDemos() {
    // 1. Interactive AI Agent Demo Prompt Buttons
    const aiChatLog = $('#aiDemoChatLog');
    $$('[data-ai-prompt]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const userQuestion = btn.getAttribute('data-ai-prompt');
        const aiAnswer = btn.getAttribute('data-ai-reply');
        if (!aiChatLog || !userQuestion || !aiAnswer) return;

        $$('[data-ai-prompt]').forEach((b) => b.classList.remove('is-active'));
        btn.classList.add('is-active');

        aiChatLog.innerHTML = `
          <div class="ai-chat-msg ai-chat-msg--user">
            <span class="ai-chat-sender">Cliente (22:15h)</span>
            <p>${userQuestion}</p>
          </div>
          <div class="ai-chat-msg ai-chat-msg--bot">
            <span class="ai-chat-sender">🤖 Agente IA Pixel & Web (22:15h · Respuesta en 2s)</span>
            <p>${aiAnswer}</p>
          </div>
        `;
      });
    });

    // 2. Interactive PWA Work-Order Simulator Button
    const pwaDemoBtn = $('#pwaSimulateBtn');
    const pwaStatusBadge = $('#pwaDemoStatus');
    if (pwaDemoBtn && pwaStatusBadge) {
      pwaDemoBtn.addEventListener('click', () => {
        pwaStatusBadge.textContent = '✔ Parte #204 firmado y enviado a oficina en 0.8s';
        pwaStatusBadge.classList.add('is-success');
        this.notification?.show(
          'Simulación PWA: Parte de trabajo firmado en móvil, geolocalizado y sincronizado al instante.',
          'success',
          4500
        );
      });
    }
  }

  updateFooterYear() {
    const yearEl = $('#currentYear');
    if (yearEl) {
      yearEl.textContent = new Date().getFullYear();
    }
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  const app = new AppController();
  await app.bootstrap();
});
