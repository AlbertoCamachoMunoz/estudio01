# Estudio 01 (`web_estudio_01`) — Project Handoff & Technical Documentation

**Last Updated:** 2026-11-13  
**Active Branch:** `develop` (HEAD: `6756e39` + local uncommitted refinements in `index.html`, `pricing.json`, `es.json`, `scripts/verify-lab-and-icons.js`)  
**Deployment Platform:** Vercel / Cloudflare Pages (100% static build, zero server costs)  
**Local Development Server:** `node dev-server.js` -> `http://localhost:5500`

---

## 1. Executive Summary & Architecture

**Estudio 01** es una landing page comercial de alto rendimiento orientada a la captación de clientes para dos pilares principales:
1. **Ingeniería & Software:** Webs Corporativas y aplicaciones móviles sin tienda (**App partes de trabajo** / PWAs operativas).
2. **Imagen & Producción Audiovisual:** Fotografía corporativa in situ, vídeo vertical (Reels/TikTok), reportajes de boda y gestión de **Redes Sociales** y Google Business Profile.

### Principios de Arquitectura
- **Pure Static Stack:** HTML5 semántico, CSS3 modular (`assets/css/style.css`) y JavaScript ES6+ modular (`assets/js/`), **sin frameworks pesados** (React/Vue/Angular).
- **Single Source of Truth (SSOT):** Todos los datos de empresa, servicios, tarifas, textos, galería y redes sociales residen en `assets/data/` y se cargan dinámicamente vía `DataLoaderService.js`.
- **Vinculación SSOT en DOM (`bindServiceReferences`):** Cualquier bloque fuera de `.services-grid` que represente un servicio (por ejemplo, las dos tarjetas de **Tech Lab** `#lab`) usa `data-service-id="<id>"` y `data-service-field="<campo>"` para leer directamente el icono y los textos del JSON sin duplicar contenido en HTML.

---

## 2. Datos Oficiales de la Empresa (`assets/data/company.json`)

| Campo | Valor Actual |
|---|---|
| **Nombre Comercial** | `Estudio 01` |
| **Teléfono / WhatsApp** | `+34 635 10 86 40` (`34635108640`) |
| **Email / FormSubmit** | `c4max0@gmail.com` |
| **Base Operativa** | Motril (Granada) |
| **Zona de Cobertura** | Motril, Costa Tropical, Provincia de Granada, Málaga y Provincia, y Almería |
| **Horario** | Lunes a Viernes de 9:00 a 19:00 |

---

## 3. Catálogo Canónico de Servicios (`pricing.json` + `translations/es.json`)

| # | ID (`id`) | Nombre Canónico (`es.json`) | Pilar (`pricing.json`) | Icono |
|---|---|---|---|---|
| 1 | `web_landing` | **Webs Corporativas** | `Pilar 1 · Web & Software` | SVG Globo Web |
| 2 | `pwa_partes_cuadrillas` | **App partes de trabajo** | `PWA & Software Operativo` | SVG `< >` Programación |
| 3 | `pwa_informes_comunidades` | **Generador Automático de Informes Mensuales en PDF para Comunidades** | `PWA & Software Operativo` | SVG Documento PDF |
| 4 | `audiovisual_reels` | **Fotografía In Situ y Vídeo Vertical (Reels / TikTok)** | `Pilar 2 · Foto, Vídeo & Redes Sociales` | SVG Fotograma Cine |
| 5 | `social_gbp` | **Redes Sociales y Google Business Profile** | `Pilar 2 · Foto, Vídeo & Redes Sociales` | SVG Instagram |
| 6 | `audiovisual_bodas` | **Reportajes de Boda (Fotografía & Cine Nupcial)** | `Pilar 2 · Foto, Vídeo & Redes Sociales` | SVG Cámara Fotos |
| 7 | `pwa_maquinaria_qr` | **Sistema de Control y Mantenimiento de Maquinaria con Pegatinas QR** | `PWA & Software Operativo` | SVG Código QR |
| 8 | `pack_integral` | **Pack Digitalización Integral (Web + Audiovisual + PWA)** | `Solución Llave en Mano 360º` | SVG Capas 3D |

---

## 4. Sistema Visual, Diseño y Coherencia de Copy

### Paleta de Iconos & Estilo
- **Paleta Tecnológica (`.service-icon`, `.contact-hub-card-icon`):** Trazo vectorial SVG uniforme (`stroke-width: 2`) en azul cian tecnológico **`#00F0FF`** sobre fondo `rgba(0, 240, 255, 0.06)` y borde `rgba(0, 240, 255, 0.22)` (en sintonía con `.slider-step-btn.is-active`).
- **Excepciones Intactas:** Botones/tarjetas/widget de **WhatsApp** conservan su verde oficial (`#25D366`); iconos de redes sociales conservan su estilo original; icono de seguridad RGPD (`🔒`) intacto.
- **Sin emojis decorativos sueltos:** Eliminados emojis de rayo (`⚡`), etiqueta (`🏷️`), trofeos, cohetes y adornos fuera de las secciones permitidas.

### Reglas de Cabecera (`<header>`)
- Contenedor alineado a `1200px` igual que las secciones inferiores.
- Bloque `.nav-links` desplazado ~2 cm hacia el logo (`margin-right: 4.75rem`) manteniendo intacto el ancho y espaciado interno entre enlaces (`gap: 1.25rem`, `white-space: nowrap`).
- Botón WhatsApp en cabecera sin número de teléfono visible (`<span>WhatsApp</span>`).

### Reglas de Copywriting (Tono Sobrio)
- **Tono directo y profesional (estilo Apple / estudio técnico):** Prohibidas frases defensivas o de tipo "vendehumo" (ej. *"no vendemos humo"*, *"sin letras pequeñas"*, *"ultrarrápidas"*).
- **Nomenclatura estricta:**
  - Usar siempre **`Webs Corporativas`** (sin precios en la tarjeta ni adjetivos de velocidad).
  - Usar siempre **`App partes de trabajo`** (evitar mezclar con "Cuadrillas" en títulos visibles).
  - Usar siempre **`Redes Sociales`** en lugar de "Redes" a secas (para evitar confusión con redes de telecomunicaciones).

---

## 5. Secciones Interactivas Clave

- **Tech Lab (`#lab`):** Dos tarjetas vinculadas vía `data-service-id="pwa_partes_cuadrillas"` (simulador interactivo PWA + ventajas operativas) bebiendo icono `< >`, título y descripción directamente del JSON.
- **Scrollytelling Cámara (`#audiovisual-lab`):** Secuencia fotorrealista de 60 frames (`assets/images/camera-sequence/`) controlada por slider horizontal (`#cameraScrubberSlider`) y scroll interno con la rueda del ratón (`CameraTeardownComponent.js`), independiente del scroll global de la página.
- **Calculadora de Presupuestos (`#estimator`):** Lee dinámicamente servicios y extras de `pricing.json` (`EstimatorModel.js` + `EstimatorComponent.js`) y sincroniza el formulario de contacto (`LeadFormComponent.js`).

---

## 6. Scripts de Verificación (Playwright)

| Script | Qué valida | Capturas generadas (`tests/output/`) |
|---|---|---|
| `node scripts/verify-header.js` | Cabecera en 1440px, 1280px, 1100px, distancias y nowrap | `header-desktop-*.png`, `header-with-hero-1440.png` |
| `node scripts/verify-services.js` | Tarjetas de servicios, SVGs y textos desde JSON | `services-grid-desktop.png`, `service-card-*.png` |
| `node scripts/verify-lab-and-icons.js` | Tech Lab SSOT, Portfolio spotlight y Contact Hub | `tech-lab-section.png`, `portfolio-spotlight-clean.png`, `contact-hub-cyan.png` |
| `node scripts/verify-no-icons.js` | Ausencia de iconos rayo/etiqueta en PWA y calculadora | `pwa-mockup-clean.png`, `estimator-rates-clean.png` |

---

## 7. Protocolo Obligatorio para la Siguiente Sesión

1. **Git:** **NUNCA** ejecutar `git commit` ni `git push` sin permiso explícito del usuario. (Actualmente hay cambios pendientes sin commitear listos para revisión).
2. **Verificación Visual:** Tras cualquier cambio visual o de UI, ejecutar los scripts de Playwright correspondientes e **inspeccionar los PNG resultantes con `read_file`** antes de responder al usuario.
3. **Pendiente / Siguientes pasos sugeridos:**
   - Revisar si el usuario aprueba hacer `git commit` y `git push` de los cambios actuales en `develop`.
   - Si se activa soporte multiidioma en el futuro, sincronizar `assets/data/translations/{en,de,fr}.json` y `{en,de,fr}.html` con los nuevos servicios de Estudio 01 (actualmente conservan contenido heredado).
