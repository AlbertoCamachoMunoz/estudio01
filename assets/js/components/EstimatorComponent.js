import { $, $$, formatCurrency } from '../utils/domHelper.js';
import { EstimatorModel } from '../models/EstimatorModel.js';
import { WhatsAppService } from '../services/WhatsAppService.js';
import { DataLoaderService } from '../services/DataLoaderService.js';

/**
 * Estimator Component (MVC View & Controller)
 * Interactive digital project & ROI budget calculator with dynamic WhatsApp CTA.
 */
export class EstimatorComponent {
  /**
   * @param {Object} options
   * @param {string} [options.containerSelector]
   */
  constructor({ containerSelector = '#budgetEstimator' } = {}) {
    this.container = $(containerSelector);

    if (this.container) {
      this.init();
    }
  }

  init() {
    this.serviceSelect = $('#estimatorService', this.container);
    this.areaInput = $('#estimatorArea', this.container);
    this.areaValueDisplay = $('#estimatorAreaVal', this.container);
    this.minPriceEl = $('#estimatorMinPrice', this.container);
    this.maxPriceEl = $('#estimatorMaxPrice', this.container);
    this.unitPriceEl = $('#estimatorUnitPrice', this.container);
    this.minServicePriceEl = $('#estimatorMinServicePrice', this.container);
    this.resultUnitPriceEl = $('#estimatorResultUnitPrice', this.container);
    this.resultMinPriceEl = $('#estimatorResultMinPrice', this.container);
    this.whatsAppBtn = $('#estimatorWhatsAppBtn', this.container);
    this.extrasContainer = $('.estimator-extras-list', this.container);

    // Form synchronization elements
    this.leadServiceInput = $('#leadService', this.container);
    this.leadServiceSelect = $('#serviceSelect', this.container);
    this.leadAreaInput = $('#leadArea', this.container);
    this.leadExtrasInput = $('#leadExtras', this.container);
    this.leadBudgetInput = $('#leadEstimatedRange', this.container);
    this.nameInput = $('#name', this.container);
    this.companySectorInput = $('#companySector', this.container);

    if (this.nameInput) {
      this.nameInput.addEventListener('input', () => this.updateCalculation());
    }
    if (this.companySectorInput) {
      this.companySectorInput.addEventListener('input', () => this.updateCalculation());
    }

    this._hydrateServicesFromData();
    this._hydrateExtrasFromData();

    if (this.areaInput && this.areaValueDisplay) {
      this.areaInput.addEventListener('input', () => {
        const val = Number(this.areaInput.value);
        this.areaValueDisplay.textContent = `${val} ${val === 1 ? 'módulo / sección' : 'módulos / entregables'}`;
        this.updateCalculation();
      });
    }

    if (this.serviceSelect) {
      this.serviceSelect.addEventListener('change', () => {
        this.updateCalculation();
        if (this.leadServiceSelect) {
          const currentService = DataLoaderService.getServiceById(this.serviceSelect.value);
          if (currentService) {
            this.leadServiceSelect.value = currentService.name;
          }
        }
      });
    }

    this.updateCalculation();
  }

  _hydrateServicesFromData() {
    if (!this.serviceSelect) return;
    const services = DataLoaderService.getServices();
    if (services.length > 0) {
      this.serviceSelect.innerHTML = services
        .map((s) => `<option value="${s.id}">${s.name}</option>`)
        .join('');
    }
  }

  _hydrateExtrasFromData() {
    if (!this.extrasContainer) return;
    const extras = DataLoaderService.getExtras();
    const pricing = DataLoaderService.getPricing();
    const currencySymbol = pricing.currencySymbol || '€';
    if (extras.length > 0) {
      this.extrasContainer.innerHTML = extras
        .map((ex) => {
          const price = ex.flatPrice ?? ex.price ?? 0;
          return `
            <label class="estimator-checkbox-label">
              <input type="checkbox" name="estimatorExtra" value="${ex.id}">
              <span>${ex.name} (+${price} ${currencySymbol})</span>
            </label>
          `;
        })
        .join('');
    }

    this.extraCheckboxes = $$('input[name="estimatorExtra"]', this.container);
    this.extraCheckboxes.forEach((cb) => {
      cb.addEventListener('change', () => this.updateCalculation());
    });
  }

  updateCalculation() {
    const services = DataLoaderService.getServices();
    const defaultServiceId = services.length > 0 ? services[0].id : 'web_landing';
    const serviceId = this.serviceSelect && this.serviceSelect.value ? this.serviceSelect.value : defaultServiceId;
    const areaM2 = this.areaInput ? Number(this.areaInput.value) : 3;
    const selectedExtras = this.extraCheckboxes
      ? this.extraCheckboxes.filter((cb) => cb.checked).map((cb) => cb.value)
      : [];

    const model = new EstimatorModel({
      serviceId,
      areaM2,
      selectedExtras,
    });

    const estimate = model.calculate();

    if (this.minPriceEl) {
      this.minPriceEl.textContent = formatCurrency(estimate.minBudget);
    }
    if (this.maxPriceEl) {
      this.maxPriceEl.textContent = formatCurrency(estimate.maxBudget);
    }

    if (this.unitPriceEl) {
      this.unitPriceEl.textContent = `+${formatCurrency(estimate.unitPrice)}/módulo`;
    }
    if (this.minServicePriceEl) {
      this.minServicePriceEl.textContent = formatCurrency(estimate.minServicePrice);
    }
    if (this.resultUnitPriceEl) {
      this.resultUnitPriceEl.textContent = `+${formatCurrency(estimate.unitPrice)}/módulo`;
    }
    if (this.resultMinPriceEl) {
      this.resultMinPriceEl.textContent = formatCurrency(estimate.minServicePrice);
    }

    if (this.leadServiceInput) this.leadServiceInput.value = estimate.serviceName;
    if (this.leadAreaInput) this.leadAreaInput.value = `${estimate.areaM2} módulos/entregables`;
    if (this.leadExtrasInput) {
      const extrasNames = selectedExtras.map((id) => {
        const extra = DataLoaderService.getExtraById(id);
        return extra ? extra.name : id;
      });
      this.leadExtrasInput.value = extrasNames.length > 0 ? extrasNames.join(', ') : 'Ninguno';
    }
    if (this.leadBudgetInput) {
      this.leadBudgetInput.value = `${formatCurrency(estimate.minBudget)} - ${formatCurrency(estimate.maxBudget)}`;
    }

    if (this.whatsAppBtn) {
      const clientName = this.nameInput ? this.nameInput.value.trim() : '';
      const companySector = this.companySectorInput ? this.companySectorInput.value.trim() : '';
      this.whatsAppBtn.href = WhatsAppService.getEstimateLink({
        ...estimate,
        clientName,
        companySector,
      });
    }
  }
}
