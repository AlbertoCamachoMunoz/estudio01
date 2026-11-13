# Project Context: Static Commercial Landing Page

## 1. Project Goal & Architecture Scope
- Build a lightweight, high-performance commercial landing page for local construction/renovation services.
- Pure static architecture: HTML5 semantic markup, modern CSS (or Tailwind via CDN), and vanilla JavaScript.
- Target deployment platform: Vercel / Cloudflare Pages (static build, zero ongoing server costs).
- Form handling: External Form-to-Email service (Web3Forms / Formspree) or Vercel serverless function (no DB required for MVP).
- WhatsApp direct click-to-chat integration using `wa.me` schema.
- Embedded Google Maps / Business reviews widget integration.

## 2. Technical Guardrails & Constraints
- ZERO unnecessary dependencies: Do not introduce heavy frontend frameworks (React/Vue/Angular) unless strictly instructed.
- Clean separation of concerns: HTML (structure), CSS (presentation), JS (behavior).
- Mobile-first, fully responsive design adapted to all viewport breakpoints.
- Performance priority: Keep asset sizes minimal, lazy-load non-critical images, and maintain high Lighthouse metrics.
- Code style:
  - English naming for files, classes, IDs, functions, and variables.
  - User-facing text in European Spanish (es-ES).
  - Explicit and self-documenting code; avoid redundant or verbose comments.

## 3. Directory Layout
```text
.
├── index.html
├── assets/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   └── main.js
│   └── images/
│       ├── logo/
│       └── gallery/
├── README.md
└── AGENTS.md
```

## 4. Execution Protocol for Agents
Minimal and strictly necessary modifications only.

Step-by-step implementation: do not generate or overwrite multiple files at once without validation.

Always supply full file paths before presenting file contents.

When editing existing files, respect legacy code and structure strictly.

NEVER run `git commit` or `git push` without explicit permission from the user.

ALWAYS verify UI and visual changes using Playwright AND visually inspect the resulting screenshot images (`read_file` on the captured PNGs) before presenting results to the user.
