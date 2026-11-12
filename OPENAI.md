# Project Manifest & Architecture Guardrails: Pixel Digital (Digital & AI Agency)

> **Single Source of Truth (SSOT) for AI Agents.** Every architectural decision, code modification, and content update in this repository must strictly adhere to the specifications defined below.

---

## 1. Business Context & Value Proposition

- **Identidad Corporativa:** Agencia Digital Integral para Pymes y Negocios Locales (nombre provisional configurable: `Pixel Digital`), nacida de la convergencia entre **Ingeniería de Software e Inteligencia Artificial** y **Producción Audiovisual y Redes Sociales**.
- **Los 3 Pilares de Servicio (Core Offerings):**
  1. **Web & Software a Medida:**
     - Landing pages comerciales de ultra-alta conversión y velocidad extrema (100% estáticas/jamstack, cero cuotas de servidor abusivas).
     - Aplicaciones Web Progresivas (**PWAs**) operativas para trabajadores en calle y equipos técnicos (partes de trabajo digitales, control horario/fichajes, calculadoras y cotizadores interactivos).
     - Portales B2B y áreas de cliente a medida.
  2. **Producción Audiovisual & Social Media:**
     - Fotografía corporativa y de producto *in situ* (desplazamiento al negocio o proyectos del cliente).
     - Grabación y edición de vídeo profesional en formato vertical y horizontal (Instagram Reels, TikTok, YouTube Shorts y vídeos corporativos).
     - Gestión integral de redes sociales y optimización de perfil de empresa en **Google Business Profile** (SEO Local y reputación).
  3. **IA Agéntica & Automatización:**
     - Agentes de IA conversacionales 24/7 integrados en WhatsApp y Web para atención inmediata, cualificación automática de leads y agendamiento de citas.
     - Automatización de flujos de trabajo internos (facturación, avisos, CRM, sincronización de formularios y presupuestos).
- **Target Audience & Copywriting Guidelines:**
  - **Público objetivo:** Propietarios y gerentes de pymes y negocios locales (reformas, construcción, clínicas, jardinería, talleres mecánicos, inmobiliarias, hostelería y servicios técnicos).
  - **Tono y lenguaje:** Español de España (`es-ES`), claro, directo, cercano y orientado a resultados tangibles (**retorno de inversión, ahorro de horas de gestión y captación real de clientes**).
  - **Cero jerga innecesaria:** Prohibido abrumar al cliente en el copy público con tecnicismos abstractos; se vende el beneficio empresarial respaldado por solvencia técnica demostrable.

---

## 2. Technical Stack & Zero-Bloat Guardrails

- **Core Stack:**
  - **HTML5 Semántico:** Estructura accesible (`aria-*`, roles semánticos, jerarquía estricta de encabezados `h1`-`h3`).
  - **CSS Moderno (Vanilla CSS3):** Variables nativas (`:root`), CSS Grid, Flexbox, diseño fluido y animaciones aceleradas por hardware (`assets/css/style.css`).
  - **Vanilla JavaScript (ES6+ Modular):** Arquitectura limpia basada en ES Modules (`assets/js/main.js`, `components/`, `services/`, `models/`, `utils/`) y datos desacoplados en JSON (`assets/data/`).
- **Hosting & Deployment:**
  - Despliegue 100% estático en **Vercel** o **Cloudflare Pages** (`vercel.json` en raíz, coste de servidor **0 €/mes**).
- **Prohibiciones Estrictas (Zero-Bloat Policy):**
  - **ZERO frameworks JS pesados:** Prohibido instalar o migrar a React, Vue, Angular, Next.js, Astro o añadir dependencias de compilación en `node_modules` para el frontend sin instrucción explícita del arquitecto principal.
  - **ZERO bases de datos o servidores Node.js en producción para el MVP estático:** Toda la persistencia de configuración reside en JSON estáticos y servicios HTTP sin servidor. La arquitectura queda preparada para conectarse en el futuro a **Supabase (BaaS)** o **Edge Functions / Webhooks** mediante llamadas `fetch` limpias y desacopladas.
- **Performance & Local SEO:**
  - **Lighthouse > 95** obligatorio en las 4 métricas (Performance, Accessibility, Best Practices, SEO).
  - Imágenes optimizadas en formatos de última generación (`webp` / `avif`), dimensiones explícitas (`width`/`height`) para evitar CLS, y `loading="lazy"` en todo recurso fuera del viewport inicial (*above the fold*).
  - Metadatos **OpenGraph / Twitter Cards** completos y marcado estructurado **Schema.org (`JSON-LD`)** combinando `ProfessionalService` y `LocalBusiness`.

---

## 3. Legacy Code Reuse & Migration Map (De "Sexi-Garden" a "Agencia")

El repositorio parte de la base tecnológica desarrollada para el cliente *Sexigarden*. En la Fase 2 de refactorización se aplicará el siguiente mapa de migración:

- **[KEEP & PARAMETERIZE] Módulo WhatsApp (`wa.me`):**
  - Se conservan `WhatsAppService.js`, `WhatsAppWidgetComponent.js` (widget flotante interactivo estilo JoinChat con badge, tooltip y ventana de chat) y el enlace dinámico de botones mediante atributos `data-company-href="whatsapp"` y `data-wa-text`.
  - Se centraliza toda la configuración en un objeto/constante maestra (`CONFIG.whatsappNumber`, `CONFIG.defaultMessage`) sincronizado con `assets/data/company.json` para que cualquier cambio de teléfono o mensaje predefinido se realice en un único punto.
- **[KEEP & PARAMETERIZE] Módulo Formulario (Form-to-Email):**
  - Se conserva la arquitectura asíncrona sin recarga de página (`LeadFormComponent.js`, `LeadModel.js`, `EmailService.js` vía `fetch` JSON hacia FormSubmit / Web3Forms / Formspree, con detección automática de entorno `dev` vs `prod` y fallback directo a WhatsApp en caso de fallo de red).
  - Se adaptan los campos del `<form id="contactForm">` y del modelo `LeadModel` al embudo de conversión de agencia digital:
    1. **Nombre completo** (`name`).
    2. **Empresa / Sector** (`companySector`).
    3. **Teléfono / WhatsApp** (`phone`) y **Email opcional/corporativo** (`email`).
    4. **Servicio de interés** (`service`): *Web / App a Medida*, *Foto / Vídeo / Redes Sociales*, *IA / Automatización*, *Pack Completo Digitalización*.
    5. **Detalles del proyecto / reto actual** (`message`).
- **[KEEP & ADAPT] Módulo Prueba Social / Reseñas:**
  - Se conserva el motor de renderizado de tarjetas de reseñas verificadas (`renderReviews()` y estilos `.review-card`), adaptando el contenido a testimonios B2B de clientes de la agencia (destacando el impacto en captación de leads, velocidad web y producción audiovisual).
- **[REPLACE & SHOWCASE] De Galería de Jardines a "Casos de Éxito (Portfolio)":**
  - Se elimina cualquier referencia a poda de palmeras, jardinería o piscinas como actividad propia de nuestra empresa (incluyendo el canvas de hojas `LeafBreezeComponent` en el Hero, que será reemplazado o reconvertido a una estética tecnológica).
  - **"Sexi-Garden" pasa a ser el Caso de Éxito #1 Real del Portfolio (`#portfolio` / `#casos-exito`):** Se exhibirá como proyecto insignia real mostrando métricas e hitos entregados por nuestra agencia (Arquitectura Web Estática Multidioma ES/EN/DE/FR, Calculadora Interactiva de Presupuestos en tiempo real, SEO Local en Costa Tropical, Fotografía/Vídeo y captación directa por WhatsApp).
- **[NEW SECTION] Lab / Demo de IA & Software (`#lab` / `#demos`):**
  - Se transforma o complementa la sección de calculadora interactiva para crear un **escaparate tecnológico interactivo (Tech Lab)** donde el dueño de una pyme pueda:
    1. Probar en vivo un **Cotizador / Calculadora de ROI y Presupuesto Digital**.
    2. Visualizar demos interactivas de **PWAs operativas** (partes de trabajo en móvil, gestión de avisos en calle).
    3. Interactuar con un punto de entrada de **Agente de IA Conversacional 24/7** para comprobar cómo cualifica clientes automáticamente.

---

## 4. Directory Layout & Code Standards

### Estructura del Árbol de Directorios
```text
.
├── index.html                      # Landing page principal de la Agencia Digital & IA (es-ES)
├── aviso-legal.html                # Textos legales adaptados a la agencia
├── politica-privacidad.html        # Política RGPD adaptada a la agencia
├── politica-cookies.html           # Política de cookies técnica
├── vercel.json                     # Configuración de cabeceras y despliegue estático
├── assets/
│   ├── css/
│   │   └── style.css               # Design System "Tech-Creative Studio", Mobile-First
│   ├── js/
│   │   ├── main.js                 # Punto de entrada (CONFIG central + AppController)
│   │   ├── components/             # Componentes UI modulares (Nav, Form, Estimator, WhatsAppWidget)
│   │   ├── services/               # Servicios de datos, binding DOM, Email y WhatsApp
│   │   ├── models/                 # Validación de datos y modelos de dominio (LeadModel)
│   │   └── utils/                  # Utilidades DOM (domHelper.js)
│   ├── data/
│   │   ├── company.json            # SSOT de datos de contacto, endpoints y redes
│   │   ├── pricing.json            # SSOT de tarifas/packs digitales para el cotizador
│   │   ├── gallery.json            # SSOT de Casos de Éxito / Portfolio (incl. Sexi-Garden)
│   │   ├── social.json             # Perfiles sociales de la agencia
│   │   └── translations/           # Textos estructurados (es.json como base)
│   └── images/
│       ├── logo/                   # Identidad visual de Pixel Digital
│       ├── portfolio/              # Capturas y vídeos de Casos de Éxito (Sexi-Garden, PWAs, Reels)
│       └── icons/                  # Iconografía SVG/PNG optimizada
├── AGENTS.md                       # Fuente Única de Verdad (SSOT) para agentes IA
├── GEMINI.md                       # Espejo exacto de AGENTS.md
├── CLAUDE.md                       # Espejo exacto de AGENTS.md
├── OPENAI.md                       # Espejo exacto de AGENTS.md
└── README.md                       # Documentación técnica y operativa del repositorio
```

### Estándares de Código y Diseño
- **Naming Conventions:**
  - **Inglés estricto** para nombres de archivos, clases CSS (`kebab-case`), IDs, variables, constantes (`UPPER_SNAKE_CASE`), funciones y métodos JS (`camelCase`) y clases ES6 (`PascalCase`).
  - **Español de España (`es-ES`)** para todo el texto visible por el usuario final, mensajes de validación y metadatos SEO.
- **Design System ("Dark/Light Tech-Creative Studio"):**
  - Estética dual que combina la **precisión de la ingeniería de software e IA** (fondos oscuros profundos tipo `#0B0F19` / `#111827` en Hero y Tech Lab, acentos en azul eléctrico/indigo `#4F46E5` o cian/esmeralda tecnológico, bordes sutiles con *glassmorphism*) con la **claridad editorial de un estudio creativo** (secciones luminosas `#F8FAFC` / `#FFFFFF` con alto contraste tipográfico para lectura rápida en móvil).
  - Diseño **100% Mobile-First** verificado desde `360px` hasta monitores `4K`.

---

## 5. Central Configuration Pattern

Queda **terminantemente prohibido** dispersar datos mutables de la agencia (nombre comercial, teléfono de WhatsApp, correo electrónico, endpoint del formulario, ciudad/zona de cobertura o enlaces a redes sociales) hardcodeados en múltiples lugares del HTML o en distintos módulos JS.

1. **Constante Maestra `CONFIG` en `assets/js/main.js` y `assets/data/company.json`:**
   - Todo dato mutable debe residir en un objeto central `CONFIG` exportado/inicializado al comienzo de `assets/js/main.js` (sincronizado con `assets/data/company.json`), incluyendo:
     - `agencyName` (ej. `"Pixel Digital"`)
     - `whatsappNumber` (formato internacional sin `+`, ej. `"34600000000"`)
     - `phoneFormatted` (ej. `"+34 600 00 00 00"`)
     - `defaultMessage` (mensaje predefinido para `wa.me`)
     - `contactEmail` y `formEndpoint` (producción y desarrollo)
     - `serviceArea` / `city`
     - `socialLinks`
2. **Inyección Declarativa en el DOM (`CompanyDataBinder`):**
   - El HTML utilizará exclusivamente atributos declarativos (`data-company="..."`, `data-company-href="whatsapp|email|tel"`, `data-company-form="endpoint"`) para que `CompanyDataBinder.bindAll()` hidrate automáticamente todos los nodos al cargar la página.

---

## 6. Agent Execution Protocol

1. **Modificaciones Incrementales, Atómicas y Verificables:**
   - No sobrescribir múltiples subsistemas a ciegas sin validar cada paso.
   - Informar siempre de la ruta completa del archivo antes de realizar o presentar modificaciones.
2. **Integridad Total del Código (Cero Truncamiento):**
   - Prohibido utilizar comentarios perezosos como `// ... rest of code` o `<!-- resto del HTML -->` que mutilen bloques funcionales en ediciones de archivos.
3. **Preservación de Módulos Críticos de Conversión:**
   - Antes de alterar `EmailService.js`, `LeadFormComponent.js`, `WhatsAppService.js` o `WhatsAppWidgetComponent.js`, verificar que la parametrización mantiene intactos los flujos de envío asíncrono, la validación de campos y la apertura de enlaces `wa.me` en móvil y escritorio.
4. **Sincronización de Manifiestos:**
   - Cualquier cambio arquitectónico futuro aprobado en `AGENTS.md` deberá replicarse de forma idéntica en `GEMINI.md`, `CLAUDE.md` y `OPENAI.md`.
