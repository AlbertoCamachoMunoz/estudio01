import { DataLoaderService } from '../services/DataLoaderService.js';

/**
 * Estimator Model
 * Computes estimated digital project budget ranges dynamically from pricing.json.
 */
export class EstimatorModel {
  /**
   * @param {Object} params
   * @param {string} [params.serviceId]
   * @param {number} [params.areaM2] - Number of project modules / deliverables (1 to 10)
   * @param {string[]} [params.selectedExtras]
   */
  constructor({ serviceId = 'web_landing', areaM2 = 3, selectedExtras = [] } = {}) {
    this.serviceId = serviceId;
    this.areaM2 = Math.max(1, Math.min(20, Number(areaM2) || 3));
    this.selectedExtras = Array.isArray(selectedExtras) ? selectedExtras : [];
  }

  /**
   * Calculates estimated budget range using loaded JSON rates
   * @returns {{ serviceName: string, unitPrice: number, minServicePrice: number, areaM2: number, minBudget: number, maxBudget: number, extrasTotal: number }}
   */
  calculate() {
    const service = DataLoaderService.getServiceById(this.serviceId);
    const unitPrice = service ? service.unitPricePerM2 : 120;
    const minServicePrice = service ? service.minPrice : 390;
    const serviceName = service ? service.name : 'Proyecto Digital';

    const baseEstimate = minServicePrice + Math.max(0, this.areaM2 - 1) * unitPrice;
    const effectiveBase = Math.max(minServicePrice, baseEstimate);

    let extrasTotal = 0;
    this.selectedExtras.forEach((extraId) => {
      const extra = DataLoaderService.getExtraById(extraId);
      if (extra) {
        extrasTotal += extra.flatPrice ?? extra.price ?? 0;
      }
    });

    const subtotal = effectiveBase + extrasTotal;
    const minBudget = Math.round(subtotal * 0.92);
    const maxBudget = Math.round(subtotal * 1.12);

    return {
      serviceName,
      unitPrice,
      minServicePrice,
      areaM2: this.areaM2,
      minBudget,
      maxBudget,
      extrasTotal,
    };
  }
}
