import { CompanyDataBinder } from './services/CompanyDataBinder.js';

// Auto-bind company data as soon as DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => CompanyDataBinder.bindAll());
} else {
  CompanyDataBinder.bindAll();
}
