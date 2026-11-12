# ⚡ Pixel Digital — Agencia Digital y Producción Audiovisual para Pymes

Repositorio oficial de la plataforma web corporativa, escaparate tecnológico (**Tech Lab**) y aplicaciones operativas (**PWA de Control Horario & Trabajo**) de **Pixel Digital** (nombre configurable vía constantes centrales).

Diseñada como una **arquitectura 100% estática de ultra-alto rendimiento (Zero-Bloat)** que combina nuestros 2 pilares de negocio:
1. **Web & Software a Medida** (Landing pages de alta conversión, PWAs operativas de trabajo en calle y control de cuadrillas sin cuotas abusivas de servidor).
2. **Producción Audiovisual & Social Media** (Fotografía *in situ*, Reels/TikTok/YouTube y posicionamiento en Google Business Profile).

---

## 🚀 Arquitectura y Stack Tecnológico

- **Core Stack:** HTML5 semántico, CSS3 moderno con variables nativas (estética *Dark/Light Tech-Creative Studio*, 100% Mobile-First) y **Vanilla JavaScript (ES6+ Modules)** bajo patrón MVC ligero.
- **Zero-Bloat Policy:** Cero frameworks pesados en cliente (sin React, Vue ni Angular), garantizando tiempos de carga instantáneos, **Lighthouse > 95** en las 4 categorías y **mantenimiento transparente de 50 €/año (servidor + dominio incluidos)**.
- **Módulos y Aplicaciones Integradas:**
  - **PWA de Control Horario y Partes de Trabajo (`/control-horario`):** Aplicación móvil completa e instalable (offline-first con Service Worker) para fichaje de jornada con GPS, checklist de tareas del día, fotos antes/después y exportación instantánea por WhatsApp.
  - **WhatsApp Click-to-Chat (`wa.me`) + Widget Flotante Interactivo:** Componente propio (`WhatsAppWidgetComponent.js` y `WhatsAppService.js`) con notificación, burbuja de saludo y mensajes contextuales según el servicio o presupuesto consultado.
  - **Formulario Asíncrono (Form-to-Email):** Envío JSON sin recarga de página (`EmailService.js` + `LeadFormComponent.js`) compatible con **FormSubmit AJAX**, **Web3Forms** o **Formspree**, con conmutación automática entre entorno de desarrollo (`localhost`) y producción, y botón de respaldo directo a WhatsApp en caso de error de red.
  - **Portfolio de Casos de Éxito Reales:** Incluye **Sexigarden** como Caso de Éxito #1 documentado (Web multidioma, calculadora interactiva, SEO local y producción visual) y aplicaciones PWAs de campo.
  - **Tech Lab:** Cotizador interactivo de proyectos digitales y acceso a las PWAs de cuadrillas.

---

## 📁 Estructura del Repositorio

```text
.
├── index.html                      # Landing page principal de la Agencia (es-ES)
├── aviso-legal.html                # Aviso legal corporativo
├── politica-privacidad.html        # Política de privacidad y RGPD
├── politica-cookies.html           # Política de cookies
├── vercel.json                     # Configuración de despliegue estático en Vercel
├── dev-server.js                   # Servidor local ligero para desarrollo y pruebas
├── assets/
│   ├── css/
│   │   └── style.css               # Design System "Tech-Creative Studio" (Mobile-First)
│   ├── js/
│   │   ├── main.js                 # Bootstrap + Constante maestra CONFIG
│   │   ├── components/             # Componentes UI (Nav, LeadForm, Estimator, WhatsAppWidget)
│   │   ├── services/               # DataLoaderService, CompanyDataBinder, EmailService, WhatsAppService
│   │   ├── models/                 # LeadModel (validación de leads B2B)
│   │   └── utils/                  # domHelper.js
│   ├── data/
│   │   ├── company.json            # Fuente Única de Verdad (SSOT) de datos de contacto y endpoints
│   │   ├── pricing.json            # Tarifas y servicios para la calculadora interactiva
│   │   ├── gallery.json            # Casos de Éxito del Portfolio (Sexigarden, PWAs, Audiovisual)
│   │   ├── social.json             # Perfiles de redes sociales de la agencia
│   │   └── translations/           # Diccionarios de contenido (es.json)
│   └── images/
│       ├── logo/                   # Logotipos e iconos de marca
│       ├── portfolio/              # Recursos visuales de Casos de Éxito
│       └── icons/                  # Iconos vectoriales y de interfaz
├── AGENTS.md                       # Manifiesto maestro para agentes de IA (SSOT)
├── GEMINI.md                       # Manifiesto sincronizado para Gemini / Antigravity
├── CLAUDE.md                       # Manifiesto sincronizado para Claude Code
├── OPENAI.md                       # Manifiesto sincronizado para OpenAI / Codex
└── README.md                       # Documentación general del proyecto
```

---

## ⚙️ Dónde Cambiar las Variables de Contacto y Configuración (SSOT)

Siguiendo el **Central Configuration Pattern**, ningún teléfono, correo ni endpoint está disperso en el HTML. Para actualizar los datos de la agencia tienes dos puntos sincronizados:

1. **Archivo Maestro de Datos (`assets/data/company.json`):**
   Contiene las propiedades globales que `CompanyDataBinder.js` inyecta automáticamente en todos los elementos del DOM marcados con `data-company`, `data-company-href` y `data-company-form`:
   - `name`: Nombre comercial de la agencia (ej. `"Pixel Digital"`).
   - `phone` / `phoneRaw` / `phoneFormatted`: Teléfono móvil y número internacional para enlaces `https://wa.me/`.
   - `email` / `emailDev`: Correo de recepción de leads en producción y correo de pruebas en entorno local (`localhost`).
   - `formEndpoint` / `formEndpointDev`: URL del servicio Form-to-Email (FormSubmit AJAX / Web3Forms / Formspree).
   - `city` / `region` / `coverageArea`: Zona geográfica principal de servicio.
2. **Constante `CONFIG` al inicio de `assets/js/main.js`:**
   Define las constantes por defecto (`CONFIG.whatsappNumber`, `CONFIG.defaultMessage`, `CONFIG.agencyName`, `CONFIG.formEndpoint`) utilizadas como respaldo determinista por los servicios JS.

---

## 🌐 Flujo de Despliegue en Vercel y Entorno Local

### Desarrollo Local
```bash
# Iniciar el servidor local de desarrollo (detecta automáticamente modo DEV para pruebas de formulario)
node dev-server.js
# O bien con cualquier servidor estático:
npx serve .
```

### Despliegue Continuo en Vercel (Coste 0 €)
1. Conecta el repositorio de GitHub en [Vercel](https://vercel.com).
2. **Framework Preset:** `Other` (100% estático, sin paso de compilación pesado).
3. **Root Directory:** `./` (configurado automáticamente mediante `vercel.json`).
4. Cada `git push` a la rama principal publica instantáneamente en la CDN global con certificados SSL automáticos.

---

© 2026 Pixel Digital — Ingeniería de Software, IA y Producción Audiovisual. Todos los derechos reservados.
