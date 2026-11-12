/**
 * Application Global Configuration
 * Note: Company data is loaded dynamically from assets/data/company.json
 */
export const APP_CONFIG = Object.freeze({
  endpoints: {
    web3forms: 'https://api.web3forms.com/submit',
  },
  services: [
    {
      id: 'jardineria',
      name: 'Diseño de Jardín y Paisajismo',
      unitPricePerM2: 25,
      minPrice: 500,
    },
    {
      id: 'cesped',
      name: 'Césped Artificial de Alta Gama',
      unitPricePerM2: 35,
      minPrice: 600,
    },
    {
      id: 'piscina',
      name: 'Reforma y Coronación de Piscina',
      unitPricePerM2: 85,
      minPrice: 1500,
    },
    {
      id: 'pergolas',
      name: 'Pérgolas, Porches y Tarimas',
      unitPricePerM2: 95,
      minPrice: 1200,
    },
    {
      id: 'integral',
      name: 'Reforma Exterior Integral',
      unitPricePerM2: 120,
      minPrice: 2500,
    },
  ],
  extras: [
    {
      id: 'riego',
      name: 'Sistema de Riego Automático Inteligente',
      flatPrice: 450,
    },
    {
      id: 'iluminacion',
      name: 'Iluminación LED Exterior Decorativa',
      flatPrice: 350,
    },
    {
      id: 'desescombro',
      name: 'Retirada y Gestión Ecológica de Residuos',
      flatPrice: 250,
    },
  ],
});
