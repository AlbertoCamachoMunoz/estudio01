# Sexigarden — Project Handoff & Technical Documentation

**Generated / Last Updated:** 2026-11-10 (Commit: `3131931`)  
**Repository:** `https://github.com/AlbertoCamachoMunoz/sexy_garden.git` (also aliased as `sexi_garden.git`)  
**Active Development Branch:** `develop` (Up to date with `origin/develop`)  
**Production Deployment Branch:** `main` (Up to date with `origin/main`)  
**Deployment Platform:** Vercel (Production CI/CD auto-deploy on push to `main` y preview en `develop`)  
**Local Development Server:** Port 5500 (`node dev-server.js` -> `http://localhost:5500`)

---

## 1. Executive Summary & Current State

**Sexigarden** (junto con su división de piscinas **Sexipool**) es una landing comercial de alto rendimiento, orientada a la captación directa de clientes para servicios de jardinería profesional en la Costa Tropical (Almuñécar, La Herradura, Salobreña, Motril) y provincias de Granada, Málaga y Almería.

### Especialidades Principales:
1. Poda de Palmeras y Tratamientos homologados contra el Picudo Rojo.
2. Poda en Altura y Tala Controlada de Árboles de gran porte (trepa y camión cesta/pluma).
3. Mantenimiento integral de jardines, fincas y comunidades de propietarios.
4. Paisajismo, xerojardinería y césped artificial.
5. Mantenimiento y puesta a punto de piscinas (**Sexipool**).

### Arquitectura Técnica & Principios Inviolables:
- **100% Pure Static Architecture:** HTML5 semántico, CSS modular moderno (`assets/css/style.css`), JavaScript ES6+ modular sin dependencias externas ni frameworks pesados (React/Vue/Angular).
- **Single Source of Truth (SSOT):** Toda la información de negocio, contacto, servicios, reseñas, redes sociales y textos multilingües vive en ficheros JSON desacoplados en `assets/data/`.
- **Cero Compromisos Horarios Rígidos:** Prohibido prometer "24 horas" o plazos cerrados. Se utiliza redacción educada («te atenderemos lo antes posible»).
- **Regla de Git:** **PROHIBIDO hacer commit o push sin permiso explícito del usuario.**

---

## 2. Datos Oficiales de la Empresa (`assets/data/company.json`)

| Campo | Valor Actual en Producción | Notas |
|---|---|---|
| **Nombre Comercial** | `Sexigarden` (logo: `Sexi` verde `#254639` + `garden` ocre `#c48238` sin separación) | Una sola palabra unificada |
| **División Piscinas** | `Sexipool` | Destacada en servicios y galería |
| **Teléfono Móvil / WhatsApp** | `+34 673 71 48 66` (Kevin) | Integrado con enlaces `wa.me` directos |
| **Teléfono Fijo** | `+34 958 88 03 52` | Mostrado en cabecera/contacto |
| **Email Corporativo / Leads** | `Kevinpau99@hotmail.com` | Receptor de formularios vía FormSubmit |
| **Ubicación Base** | Almuñécar, Granada, España | Desplazamientos en Granada, Málaga y Almería |
| **Mapa Google Maps** | `https://maps.google.com/maps?q=Almu%C3%B1%C3%A9car%2C+Granada%2C+Espa%C3%B1a&t=&z=13&ie=UTF8&iwloc=&output=embed` | Centrado en casco urbano y bahía de Almuñécar |
| **Ficha Google Business** | `Place ID: ChIJp_rBKtQzBYER3GVP-2dUFrY` | 37 reseñas reales (5.0 estrellas) |
| **Instagram Oficial** | `https://www.instagram.com/_sexigarden_?mdxt=MWI5M3phOWQ3a2ZrZw%3D%3D` | Fichero `assets/data/social.json` |

---

## 3. Reseñas Reales Verificadas de Google (`assets/data/reviews.json`)

Se integraron 3 reseñas literales y comprobables extraídas de la ficha oficial de Sexigarden en Google Maps, cada una con el logo de Google (`assets/images/icons/google_small_icon.png`) y enlace directo a la reseña concreta:

1. **Manuel Lopez Barrientos** (hace 2 semanas - 5 estrellas):
   - *Texto:* «Servicio excepcional de Kevin y su equipo!!! Nos han realizado una poda en altura magnifica y con un precio muy bueno. Y lo han dejado todo perfecto y muy recogido. Confiaremos todos nuestro proximos trabajos en esta gran empresa!!!»
   - *URL directa:* `https://www.google.com/maps/reviews/data=!4m8!14m7!1m6!2m5!1sCi9DQUlRQUNvZENodHljRjlvT2xCemFEVjFTV2xFY1ZKSlVFdE9hRk5uY2s5R1lXYxAB!2m1!1s0x0:0xb6165467fb4f65dc!3m1!1s2@1:Ci9DQUlRQUNvZENodHljRjlvT2xCemFEVjFTV2xFY1ZKSlVFdE9hRk5uY2s5R1lXYxAB?hl=es`
2. **Annette Svensson** (hace 5 meses - 5 estrellas):
   - *Texto:* «Contratamos a Sexigarden para limpiar y podar 5 palmeras altas. Hicieron un trabajo excelente, rápido, limpiaron y se llevaron todos los restos de las palmeras. Estamos muy satisfechos con su trabajo y su trato amable. Los recomendamos ampliamente. /Annette»
3. **Jose Antonio Garcia** (hace 6 meses - 5 estrellas):
   - *Texto:* «Kevin y Michael nos han realizado la poda en altura de nuestro palmito. Súper amables, serios, rápidos y eficientes, como deben ser las cosas. ¡Muy recomendables!»

Además, bajo las reseñas se ubican dos botones de acción:
- **"Ver las 37 reseñas en Google Maps ↗"** (enlaza a la ficha completa).
- **"Dejar una reseña en Google ✍️"** (enlace directo a `writereview?placeid=ChIJp_rBKtQzBYER3GVP-2dUFrY`).

---

## 4. GUÍA MAESTRA DE PRECIOS: DÓNDE Y CÓMO ACTUALIZARLOS MAÑANA

Esta sección es la **referencia definitiva** para cuando el usuario entregue las tarifas rellenadas por el CEO de Sexigarden.

### 4.1. Ficheros que controlan los precios en el proyecto

```text
assets/data/
├── services.json       <--- [1] Catálogo de Servicios (Cards en web y listado)
├── pricing.json        <--- [2] Tarifas Base y Factores de Mano de Obra para la Calculadora
└── extras.json         <--- [3] Mejoras opcionales (Checkboxes de la Calculadora)
```

Adicionalmente, el modelo que procesa los cálculos matemáticos es:
- `assets/js/models/EstimatorModel.js` (algoritmo de cálculo de presupuestos).
- `assets/js/components/EstimatorComponent.js` (controlador del DOM de la calculadora).

---

### 4.2. Mapeo Exacto de Servicios e IDs del Sistema

| # | ID del Sistema (`id`) | Nombre del Servicio | Archivos a Modificar | Campos Clave | Precio Actual (Placeholder) |
|---|---|---|---|---|---|
| **1** | `poda_palmeras` | **Poda de Palmeras y Tratamiento Picudo** | `services.json`<br>`pricing.json` | `unitPricePerM2`<br>`minPrice` | 45 €/unidad-m²<br>Mínimo: 90 € |
| **2** | `poda_altura` | **Poda en Altura y Tala Controlada** | `services.json`<br>`pricing.json` | `unitPricePerM2`<br>`minPrice` | 60 €/unidad-m²<br>Mínimo: 150 € |
| **3** | `mantenimiento_jardines`| **Mantenimiento de Jardines y Fincas** | `services.json`<br>`pricing.json` | `unitPricePerM2`<br>`minPrice` | 25 €/m²<br>Mínimo: 200 € |
| **4** | `comunidades` | **Mantenimiento de Comunidades** | `services.json`<br>`pricing.json` | `unitPricePerM2`<br>`minPrice` | 30 €/m²<br>Mínimo: 350 € |
| **5** | `diseno_jardines` | **Diseño de Jardines y Césped Artificial**| `services.json`<br>`pricing.json` | `unitPricePerM2`<br>`minPrice` | 35 €/m²<br>Mínimo: 500 € |
| **6** | `piscinas` | **Mantenimiento de Piscinas (Sexipool)**| `services.json`<br>`pricing.json` | `unitPricePerM2`<br>`minPrice` | 20 €/m²<br>Mínimo: 150 € |

---

### 4.3. Mapeo Exacto de Extras de la Calculadora

| # | ID del Sistema (`id`) | Nombre del Extra | Archivos a Modificar | Campo Clave | Precio Actual (Placeholder) |
|---|---|---|---|---|---|
| **A** | `riego` | **Riego automático inteligente** (Programador WiFi + electroválvulas) | `extras.json`<br>`pricing.json` | `flatPrice` | 450 € fijo |
| **B** | `iluminacion` | **Iluminación decorativa LED** (Focos IP68 y tiras) | `extras.json`<br>`pricing.json` | `flatPrice` | 350 € fijo |
| **C** | `desescombro` | **Retirada y gestión de residuos ecológicos** (Punto limpio) | `extras.json`<br>`pricing.json` | `flatPrice` | 250 € fijo |

---

### 4.4. Cómo Interpretar las Respuestas del CEO y Aplicarlas

Cuando el CEO devuelva la plantilla, aplicaremos las siguientes reglas según la modalidad de cobro que elija:

#### Caso A: Precios basados en Metros Cuadrados / Superficie
* **Ficheros:** Modificar directamente en `assets/data/services.json` y `assets/data/pricing.json`:
  ```json
  {
    "id": "diseno_jardines",
    "name": "Diseño de Jardines y Césped Artificial",
    "unitPricePerM2": NUEVO_PRECIO_M2,
    "minPrice": NUEVO_PRECIO_MINIMO
  }
  ```
* La calculadora multiplicará `NUEVO_PRECIO_M2 * metros` y garantizará que nunca baje de `NUEVO_PRECIO_MINIMO`.

#### Caso B: Precios por Unidad (ej. X € por palmera, o por árbol)
* En servicios como poda (`poda_palmeras`, `poda_altura`), si el CEO indica un precio por palmera (ej. 50 €/palmera) o por árbol:
  1. Actualizar `unitPricePerM2` con ese importe base y `minPrice` con la salida mínima de la cuadrilla (ej. 100 €).
  2. En `assets/data/services.json`, actualizar la descripción o badge para que el usuario sepa que el cálculo orientativo parte de ese precio unitario.
  3. En `EstimatorComponent.js`, el slider de superficie (ej. 40 m²) se puede etiquetar como unidades o mantener como factor de escala con el precio unitario base.

#### Caso C: Precios por Cuota Mensual Fija (ej. Comunidades o Piscinas)
* Si el CEO dice: «Piscinas cobramos 120 €/mes en invierno y 180 €/mes en verano»:
  1. Asignar `minPrice: 120` y `unitPricePerM2` proporcional en `services.json` y `pricing.json`.
  2. Indicar en `shortDesc` del servicio: «Mantenimiento mensual desde 120 €/mes».

---

### 4.5. Plantilla Literal que se le entregó al Usuario

```text
========================================================================
     PLANTILLA DE TARIFAS Y PRECIOS - SEXIGARDEN (ALMUÑÉCAR)
========================================================================
1. Poda de Palmeras y Tratamiento Picudo (ID: poda_palmeras)
   - Precio base / unidad (ej: X € por palmera o por m²): [        ]
   - Salida mínima / presupuesto mínimo de intervención: [        ]
   - Observaciones (altura, retirada de ramas incluida): [        ]

2. Poda en Altura y Tala Controlada (ID: poda_altura)
   - Precio base (por árbol o por hora de trepa/pluma): [        ]
   - Salida mínima / intervención mínima: [        ]
   - Observaciones: [        ]

3. Mantenimiento de Jardines y Fincas (ID: mantenimiento_jardines)
   - Precio por m² O cuota mensual de mantenimiento: [        ]
   - Salida mínima / visita puntual mínima: [        ]
   - Frecuencia habitual (semanal / quincenal / mensual): [        ]

4. Mantenimiento de Comunidades (ID: comunidades)
   - Cuota mensual base orientativa para comunidades: [        ]
   - Observaciones: [        ]

5. Diseño de Jardines y Césped Artificial (ID: diseno_jardines)
   - Precio por m² instalado (césped artificial / paisajismo): [        ]
   - Presupuesto mínimo de proyecto/obra: [        ]
   - Observaciones: [        ]

6. Mantenimiento de Piscinas - Sexipool (ID: piscinas)
   - Cuota mensual de mantenimiento (temporada / todo el año): [        ]
   - Puesta a punto puntual / desinfección de choque: [        ]
   - Observaciones: [        ]

7. EXTRAS DE CALCULADORA:
   A) Riego Automático Inteligente (ID: riego): [        ] € fijo
   B) Iluminación Decorativa LED (ID: iluminacion): [        ] € fijo
   C) Retirada y Gestión de Residuos (ID: desescombro): [        ] € fijo
========================================================================
```

---

## 5. Protocolo de Verificación Post-Actualización de Precios

Cada vez que se modifiquen los ficheros de precios, **ejecutar obligatoriamente**:

```bash
# 1. Verificar integridad del SSOT JSON
node tests/test-all-json-databases.js

# 2. Comprobar que dev-server sigue activo en http://localhost:5500
# Abrir y verificar el funcionamiento de la calculadora en #calculator

# 3. Tras confirmación del usuario:
git add assets/data/services.json assets/data/pricing.json assets/data/extras.json handoff.md
git commit -m "feat(pricing): update official service rates and calculator extras from CEO"
git checkout main
git merge develop
git push origin main
git checkout develop
```

---

## 6. Estado de los Componentes Clave

1. **Selector de Idiomas (Banderas)**:
   - Los vectores SVG (`es.svg`, `en.svg`, `de.svg`, `fr.svg`) están en máxima saturación cromática.
   - Eliminado el velo grisáceo (`rgba(0,0,0,0.28)`).
   - Sustituido por brillo esmaltado (`linear-gradient`) y bordes blancos de 2px.
   - Textos "ES/EN/DE/FR" ocultos para mostrar las banderas limpias.
2. **Botón Flotante de WhatsApp**:
   - Oculto en el Hero para no duplicar el CTA verde (`setupHeroScrollObserver`).
   - Tooltip desactivado en móviles (`<=768px`).
   - SVG oficial vectorizado en verde corporativo WhatsApp.
3. **Sección FAQ**:
   - Eliminada totalmente a petición del usuario.
4. **Calculadora**:
   - Conectada reactivamente a `services.json` y `extras.json`.
   - Botón CTA que genera enlace `wa.me` con el presupuesto desglosado pre-rellenado.

---

## 7. Registro de Cambios Recientes (Refactor SSOT & Galería)

1. **Precios a Fuego Eliminados al 100% (SSOT Total)**:
   - Saneado `index.html`: se eliminó todo rastro de markup estático heredado en `.services-grid`, `#estimatorService`, `.estimator-extras-list` y `.reviews-grid`.
   - Ahora `index.html` es idéntico a las plantillas (`en.html`, `de.html`, `fr.html`): contenedores dinámicos hidratados al 100% desde `assets/data/pricing.json` y los diccionarios de traducción en `assets/data/translations/`.
   - Eliminados los valores estáticos `1.260 € - 1.610 €` del HTML inicial; se renderizan dinámicamente mediante `EstimatorComponent` y `EstimatorModel`.
   - `EstimatorModel.js` y `EstimatorComponent.js` actualizados con fallback a `poda_palmeras` (eliminando referencias obsoletas a `cesped`) y símbolo de moneda dinámico desde `pricing.json`.

2. **Galería de Proyectos (Histórico y Activación)**:
   - Inicialmente comentada para evitar fotos falsas de stock.
   - Reactivada con las 5 fotografías reales oficiales del portfolio del CEO en Google Maps (descargadas en local en `assets/images/gallery/trabajo-1.jpg` a `trabajo-5.jpg`).

3. **Arquitectura Multilingüe (Evaluación Senior & Implementación Opción C)**:
   - Evaluadas las alternativas: Single HTML Shell (SPA i18n) vs Static Multi-page vs Static Site Generation (SSG).
   - **Opción C implementada con éxito**:
     - Plantilla única maestra en `src/template.html`.
     - Textos de interfaz unificados en la clave `ui` de `assets/data/translations/{es,en,de,fr}.json`.
     - Script compilador SSG nativo en `scripts/build.js` (ejecutable con `npm run build`).
     - `vercel.json` configurado con `"buildCommand": "npm run build"` y `"outputDirectory": "."` para despliegue automatizado.
     - Cero duplicidad de código HTML: el desarrollador solo edita `src/template.html` y los JSONs; los archivos estáticos de distribución (`index.html`, `en.html`, `de.html`, `fr.html`) se compilan automáticamente con 100% SEO, 100% fidelidad de previsualizaciones en WhatsApp y 0 ms de retraso de renderizado.

4. **Visualización Dinámica de Tarifas Unitarias y Mínimos en la Calculadora**:
   - Añadida la visualización elegante y reactiva de `unitPricePerM2` y `minPrice` para cada servicio seleccionado.
   - Presente de forma sutil bajo el selector de servicios (`.estimator-service-rates`) y en el desglose del cuadro de resultados (`.estimator-result-rates`).
   - 100% data-driven desde `pricing.json` (SSOT) e internacionalizado en los 4 idiomas (`es`, `en`, `de`, `fr`).
   - Cero alteraciones en las funcionalidades previas; validado mediante pruebas automatizadas end-to-end.

5. **Galería de Trabajos Reales Oficial**:
   - Suministradas 5 imágenes reales desde Google Maps (`maps.app.goo.gl/...`) de trabajos ejecutados por Sexigarden.
   - Descargadas y optimizadas en local en `assets/images/gallery/` (`trabajo-1.jpg` a `trabajo-5.jpg`).
   - Configurado `assets/data/gallery.json` con metadatos reales y categorías cruzadas (`poda`, `cesped`, `jardineria`, `piscinas`).
   - Reactivada la sección `<section class="gallery" id="gallery">` en `src/template.html` y todos los enlaces de navegación (cabecera, móvil, pie y páginas legales).
   - Filtros dinámicos actualizados con la categoría reina `filterPoda` ("Poda de Palmeras") y soporte completo multilingüe (ES, EN, DE, FR).


6. **Unificación del Calculador y Renovación del Hub de Contacto (Opción A)**:
   - **Problema resuelto**: Se eliminó la redundancia entre el calculador (#estimator) y el formulario inferior de contacto (#contact). Se corrigió la redacción engañosa de "Confirmar precio por WhatsApp", sustituyéndola por «Solicitar visita técnica por WhatsApp» (no vinculante).
   - **Calculador Unificado**:
     - Integra el formulario formal de captación por Email vía FormSubmit (`Kevinpau99@hotmail.com`) junto al canal directo de WhatsApp.
     - Sincroniza dinámicamente los campos ocultos de servicio, metros cuadrados, extras y horquilla estimada.
     - Saludo personalizado en WhatsApp si el usuario introduce su nombre en el campo correspondiente.
   - **Sección de Contacto Renovada (Hub de Atención y Ubicación)**:
     - 4 Tarjetas de Acción Directa:
       1. *Teléfonos Directos*: Móvil (+34 673 71 48 66) y fijo (+34 958 88 03 52) renderizados como **texto plano seleccionable**, sin enlaces `tel:` intrusivos que abran aplicaciones sin desearlo.
       2. *WhatsApp Inmediato*: Logo oficial vectorizado SVG de WhatsApp (verde `#25D366`), botón en 1 sola línea «Abrir WhatsApp» con `white-space: nowrap`.
       3. *Correo Electrónico*: Enlace directo `mailto:Kevinpau99@hotmail.com` sin compromisos de tiempo rígidos (**prohibido terminantemente mencionar plazos de "24h"**).
       4. *Horario y Cobertura*: Detalle de disponibilidad horaria y cobertura territorial (Almuñécar, La Herradura, Salobreña, Motril, Granada, Málaga y Almería).
     - *Base Operativa en Almuñécar*: Tarjeta con mapa embebido de Google Maps, botón para abrir en Google Maps, acceso directo a la calculadora y fila con los 6 iconos oficiales de redes sociales (Instagram, Facebook, TikTok, YouTube, X, Pinterest) con diseño contrastado y hover interactivo.
   - **Soporte Multilingüe y Tests**:
     - Diccionarios `es.json`, `en.json`, `de.json` y `fr.json` actualizados y alineados.
     - 100% de tests automatizados superados (`test-all-json-databases.js`, `test-estimator-rates-dynamic.js`, `test-extras-pricing-all-langs.js`, `test-multilingual-all-templates.js`, `test-legal-compliance.js`, `test-unified-calculator-and-contact-hub.js`).

7. **Diferenciación Dinámica de Entornos (Email Dev vs Prod)**:
   - **Objetivo**: Permitir al desarrollador probar envíos reales de presupuestos hacia `c4max0@gmail.com` en entorno local sin modificar archivos ni comprometer la dirección oficial de producción (`Kevinpau99@hotmail.com`).
   - **Configuración SSOT (`assets/data/company.json`)**:
     - `email`: `Kevinpau99@hotmail.com` (Producción).
     - `emailDev`: `c4max0@gmail.com` (Desarrollo).
     - `formEndpoint`: `https://formsubmit.co/ajax/Kevinpau99@hotmail.com`.
     - `formEndpointDev`: `https://formsubmit.co/ajax/c4max0@gmail.com`.
   - **Detección Automática (`DataLoaderService.isDevelopment()`)**:
     - Detecta `localhost`, `127.0.0.1`, loopbacks IPv6, IPs privadas LAN (192.168.x.x, 10.x.x.x) y protocolo `file:`.
     - Permite sobreescritura manual mediante query parameters: `?env=dev` o `?test_email=1` (fuerza dev); `?env=prod` (fuerza prod en local).
   - **Etiquetado de Asuntos (`EmailService.js`)**:
     - En desarrollo añade prefijo `[DEV-TEST]` para distinguir presupuestos de prueba en la bandeja de entrada.

8. **Solución al Despliegue en Vercel (`outputDirectory: "."`)**:
   - **Incidencia**: La build en la preview de Vercel falló en el commit `9ae1e5f` con: `No Output Directory named "public" found after the Build completed.`
   - **Causa**: Al ejecutar `npm run build`, los archivos estáticos generados (`index.html`, `en.html`, `de.html`, `fr.html`) se depositan en el directorio raíz (`.`), pero Vercel esperaba por defecto una carpeta `public`.
   - **Corrección**: Se ajustó `vercel.json` estableciendo `"outputDirectory": "."` para indicar a Vercel que sirva los activos directamente desde la raíz del proyecto.
   - **Resultado**: Builds exitosas tanto en preview de `develop` como en producción en `main`.

9. **Restauración y Blindaje del Favicon Oficial de Sexigarden**:
   - **Incidencia**: El usuario detectó que el favicon en producción mostraba un icono genérico de un árbol en un cuadrado verde en lugar del imagotipo corporativo de Sexigarden (la gota de agua con el árbol interior estilizado).
   - **Causa**: Durante la implantación del compilador SSG (commit `76464fa8`), la cabecera en `src/template.html` se vinculó a `assets/images/logo/favicon.svg` (placeholder temprano) en lugar del logo oficial existente en `assets/images/logo/favicon.png` y `apple-touch-icon.png`.
   - **Corrección (Cero impacto colateral / Cambio estrictamente mínimo)**:
     - En `src/template.html`:
       ```html
       <!-- Favicon -->
       <link rel="icon" type="image/png" href="assets/images/logo/favicon.png">
       <link rel="apple-touch-icon" href="assets/images/logo/apple-touch-icon.png">
       ```
     - En `dev-server.js`: Se actualizó la ruta de `/favicon.ico` para servir `assets/images/logo/favicon.png`.
     - Recompilación SSG (`npm run build`) para sincronizar `index.html`, `en.html`, `de.html` y `fr.html`.
   - **Estado en Git**: Rama `develop` y `main` sincronizadas con commit `3131931`.

---

## 8. Resumen Operativo para la Próxima Sesión (Checklist Inmediato)

Al retomar el trabajo en la siguiente sesión, tener en cuenta:

1. **Estado del Repositorio**:
   - Rama activa: `develop` (limpia y al día con `origin/develop`).
   - Rama de producción: `main` (al día con `origin/main`).
   - Último commit de código: `3131931` (`fix(brand): restore official company logo as favicon`).

2. **Pendientes Principales**:
   - **Tarifas y Precios Reales**: Cuando el CEO entregue la plantilla de tarifas (ver Sección 4 de este documento), actualizar `assets/data/services.json` y `assets/data/pricing.json`, ejecutar `npm run build` y correr la suite de tests (`npm test`).
   - **Pruebas de Envío de Email en Dev**: El endpoint de FormSubmit en desarrollo apunta a `c4max0@gmail.com`. Se puede probar el envío del formulario de presupuesto desde `http://localhost:5500` para comprobar la recepción del correo formateado con los datos calculados.

3. **Recordatorios Inviolables de Comportamiento**:
   - **MÍNIMO CAMBIO POSIBLE**: Prohibido alterar estilos, componentes o archivos no solicitados por el usuario.
   - **NO COMMIT NI PUSH SIN AUTORIZACIÓN**: Siempre mostrar el diff o resumen y esperar el «OK» expreso del usuario antes de tocar git.
   - **CERO PROMESAS DE TIEMPO (24H PROHIBIDO)**: Mantener siempre redacciones de atención diligente sin compromisos horarios fijos.
   - **TELÉFONOS COMO TEXTO PLANO**: En el hub de contacto, los teléfonos deben ser texto seleccionable, no enlaces que fuercen apertura de apps.
