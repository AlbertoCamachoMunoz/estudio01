/**
 * HeroPixelMatrixComponent
 * Hardware-accelerated interactive chessboard grid ("cuadrícula o tablero de ajedrez").
 *
 * Requirements:
 * - Izquierda > Derecha: Columns on the LEFT are VERY LARGE, progressively shrinking to the right.
 * - Minimal padding between squares ("padding entre cuadrados mínimo", 2.5px grout line).
 * - Authentic chessboard alternating pattern (solid filled squares vs translucent framed squares).
 * - Full width coverage with zero empty gaps between columns.
 * - Color spectrum: Electric Cyan/Blue (Left) -> Indigo/Violet (Center) -> Crimson Red (Right).
 * - Real-time physics: Subtle breathing float, elastic mouse repulsion & glowing bloom.
 */
export class HeroPixelMatrixComponent {
  /**
   * @param {Object} options
   * @param {string} [options.canvasSelector]
   * @param {string} [options.containerSelector]
   */
  constructor({
    canvasSelector = '#heroBreezeCanvas',
    containerSelector = '#hero',
  } = {}) {
    this.canvas = document.querySelector(canvasSelector);
    this.container = document.querySelector(containerSelector);

    if (!this.canvas || !this.container) return;

    this.ctx = this.canvas.getContext('2d');
    if (!this.ctx) return;

    this.cubes = [];
    this.width = 0;
    this.height = 0;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);

    this.mouse = {
      x: -2000,
      y: -2000,
      isHovered: false,
    };

    this.animationId = null;
    this.init();
  }

  init() {
    this.resize();
    this.generateMatrix();
    this.bindEvents();
    this.startAnimation();
  }

  resize() {
    if (!this.container || !this.canvas) return;
    const rect = this.container.getBoundingClientRect();
    this.width = rect.width;
    this.height = rect.height;

    this.canvas.width = Math.round(this.width * this.dpr);
    this.canvas.height = Math.round(this.height * this.dpr);
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;

    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
  }

  /**
   * Generates a seamless chessboard grid across the full Hero width and height:
   * - Minimal padding between squares (2.5px).
   * - Merges:
   *   1) Junta las 2 primeras columnas en 1 (Col 0 + Col 1).
   *   2) Junta la columna 3 con la 4 (Col 2 + Col 3).
   *   3) Junta la columna 5 con la 6 (Col 4 + Col 5).
   *   4) Resto tal cual está (Col 6 en adelante con -7% progresivo).
   * - Seamlessly fills the width with no gaps between columns.
   */
  generateMatrix() {
    this.cubes = [];
    const w = this.width;
    const h = this.height;
    if (w <= 0 || h <= 0) return;

    const isMobile = w < 768;
    const gap = 2.5; // Minimal padding between squares

    // 1. Calculate original progression:
    // Col 0: base size (175.8px desktop / 85.8px mobile)
    // Col 1: 5% smaller
    // Col 2: 5% smaller
    // Col 3+: 7% smaller each step
    const s0 = isMobile ? 85.8 : 175.8;
    const rawSizes = [s0];
    rawSizes.push(Math.round(s0 * 0.95 * 10) / 10); // Col 1 (2ª)
    rawSizes.push(Math.round(rawSizes[1] * 0.95 * 10) / 10); // Col 2 (3ª)
    for (let i = 3; i < 24; i++) {
      rawSizes.push(Math.round(rawSizes[i - 1] * 0.93 * 10) / 10);
    }

    // 2. Merge column pairs as requested:
    // - Junta las 2 primeras columnas en 1:
    const c0 = Math.round((rawSizes[0] + gap + rawSizes[1]) * 10) / 10;
    // - Junta la columna 3 con la 4:
    const c1 = Math.round((rawSizes[2] + gap + rawSizes[3]) * 10) / 10;
    // - Junta la columna 5 con la 6:
    const c2 = Math.round((rawSizes[4] + gap + rawSizes[5]) * 10) / 10;
    // - Resto déjalo tal cual está:
    const rest = rawSizes.slice(6);

    const finalColumnSizes = [c0, c1, c2, ...rest];

    // 3. Position merged columns seamlessly from left to right:
    let currentX = 0;
    const columns = [];
    for (let i = 0; i < finalColumnSizes.length; i++) {
      const s = finalColumnSizes[i];
      columns.push({
        colIndex: i,
        size: s,
        x: currentX + s / 2,
        left: currentX,
        right: currentX + s,
      });
      currentX += s + gap;
      if (currentX >= w) break;
    }

    // 4. Populate each column with chessboard squares from top to bottom
    for (let c = 0; c < columns.length; c++) {
      const col = columns[c];
      const s = col.size;
      const progress = Math.max(0, Math.min(1, col.x / w));
      const color = this.getSpectrumColor(progress);

      const stepY = s + gap;
      const rows = Math.ceil(h / stepY);

      for (let r = 0; r < rows; r++) {
        const cellY = 4 + r * stepY + s / 2;

        // Chessboard alternating pattern: dark/accent vs light/framed
        const isChessDark = (c + r) % 2 === 0;
        const baseAlpha = isChessDark ? (s > 45 ? 0.40 : 0.34) : (s > 45 ? 0.12 : 0.09);
        const hasBorder = !isChessDark;

        this.cubes.push({
          x0: col.x,
          y0: cellY,
          x: col.x,
          y: cellY,
          vx: 0,
          vy: 0,
          size0: s,
          size: s,
          radius: Math.min(6, Math.max(1, s * 0.03)), // Subtle modern corner rounding
          color: color,
          progress: progress,
          rotation: 0,
          rotation0: 0,
          baseAlpha: baseAlpha,
          alpha: baseAlpha,
          col: c,
          row: r,
          isChessDark: isChessDark,
          hasBorder: hasBorder,
        });
      }
    }
  }

  /**
   * Color spectrum:
   * 0.0 - 0.25: Electric Cyan & Sky Blue (#06b6d4 -> #38bdf8)
   * 0.25 - 0.55: Royal Blue & Indigo (#3b82f6 -> #6366f1)
   * 0.55 - 0.75: Violet & Purple (#8b5cf6 -> #a855f7)
   * 0.75 - 0.90: Hot Pink & Rose (#ec4899 -> #f43f5e)
   * 0.90 - 1.00: Crimson & Ruby Red (#ef4444 -> #dc2626)
   */
  getSpectrumColor(t) {
    let r, g, b;

    if (t < 0.25) {
      const k = t / 0.25;
      r = Math.round(6 + (56 - 6) * k);
      g = Math.round(182 + (189 - 182) * k);
      b = Math.round(212 + (248 - 212) * k);
    } else if (t < 0.55) {
      const k = (t - 0.25) / 0.3;
      r = Math.round(56 + (99 - 56) * k);
      g = Math.round(189 + (102 - 189) * k);
      b = Math.round(248 + (241 - 248) * k);
    } else if (t < 0.75) {
      const k = (t - 0.55) / 0.2;
      r = Math.round(99 + (168 - 99) * k);
      g = Math.round(102 + (85 - 102) * k);
      b = Math.round(241 + (247 - 241) * k);
    } else if (t < 0.9) {
      const k = (t - 0.75) / 0.15;
      r = Math.round(168 + (236 - 168) * k);
      g = Math.round(85 + (72 - 85) * k);
      b = Math.round(247 + (153 - 247) * k);
    } else {
      const k = (t - 0.9) / 0.1;
      r = Math.round(236 + (239 - 236) * k);
      g = Math.round(72 + (68 - 72) * k);
      b = Math.round(153 + (68 - 153) * k);
    }

    return { r, g, b };
  }

  bindEvents() {
    const updatePointer = (e) => {
      const rect = this.container.getBoundingClientRect();
      this.mouse.x = e.clientX - rect.left;
      this.mouse.y = e.clientY - rect.top;
      this.mouse.isHovered = true;
    };

    this.container.addEventListener('pointermove', updatePointer, { passive: true });
    this.container.addEventListener('pointerdown', updatePointer, { passive: true });

    this.container.addEventListener('pointerleave', () => {
      this.mouse.x = -2000;
      this.mouse.y = -2000;
      this.mouse.isHovered = false;
    }, { passive: true });

    window.addEventListener('resize', () => {
      this.resize();
      this.generateMatrix();
    }, { passive: true });
  }

  startAnimation() {
    const loop = (timestamp) => {
      this.render(timestamp);
      this.animationId = requestAnimationFrame(loop);
    };
    this.animationId = requestAnimationFrame(loop);
  }

  render(timestamp) {
    this.ctx.clearRect(0, 0, this.width, this.height);

    const time = timestamp || performance.now();
    const repulsionRadius = 140;
    const springConstant = 0.06;
    const damping = 0.82;

    for (let i = 0; i < this.cubes.length; i++) {
      const c = this.cubes[i];

      // Subtle ambient breathing float (sinusoidal wave across chessboard)
      const wave = Math.sin(time * 0.0018 + c.progress * 4.0 + c.row * 0.25);
      const floatY = wave * (c.size0 > 45 ? 2.5 : 1.2);
      const floatRot = Math.cos(time * 0.0012 + c.progress * 3.0) * 0.015;

      const targetX = c.x0;
      const targetY = c.y0 + floatY;

      // Mouse repulsion calculation
      const dx = c.x - this.mouse.x;
      const dy = c.y - this.mouse.y;
      const dist = Math.hypot(dx, dy);

      let targetScale = 1.0;
      let targetAlpha = c.baseAlpha;

      if (dist < repulsionRadius && this.mouse.isHovered) {
        const factor = 1 - dist / repulsionRadius;
        // Large chess tiles move with solid mass; smaller squares move briskly
        const pushForce = Math.pow(factor, 1.25) * (c.size0 > 200 ? 3.8 : (c.size0 > 100 ? 5.5 : 8.5));
        const angle = Math.atan2(dy, dx);

        c.vx += Math.cos(angle) * pushForce;
        c.vy += Math.sin(angle) * pushForce;

        targetScale = 1.0 + factor * (c.size0 > 200 ? 0.08 : (c.size0 > 100 ? 0.14 : 0.28));
        targetAlpha = Math.min(0.95, c.baseAlpha + factor * 0.60);
        c.rotation += (factor * (c.size0 > 100 ? 0.015 : 0.06));
      }

      // Spring physics back to base position
      c.vx += (targetX - c.x) * springConstant;
      c.vy += (targetY - c.y) * springConstant;
      c.vx *= damping;
      c.vy *= damping;

      c.x += c.vx;
      c.y += c.vy;

      // Smooth interpolation for size, alpha, and rotation
      c.size += ((c.size0 * targetScale) - c.size) * 0.15;
      c.alpha += (targetAlpha - c.alpha) * 0.15;
      c.rotation += ((c.rotation0 + floatRot) - c.rotation) * 0.1;

      // Draw the cube
      this.drawCube(c);
    }
  }

  drawCube(c) {
    this.ctx.save();
    this.ctx.translate(c.x, c.y);
    this.ctx.rotate(c.rotation);

    const half = c.size / 2;
    const rad = Math.min(c.radius, half);

    // Dynamic bloom glow when hovered or excited
    if (c.alpha > 0.48) {
      this.ctx.shadowColor = `rgba(${c.color.r}, ${c.color.g}, ${c.color.b}, 0.85)`;
      this.ctx.shadowBlur = Math.min(22, c.size * 0.4);
    }

    this.ctx.fillStyle = `rgba(${c.color.r}, ${c.color.g}, ${c.color.b}, ${c.alpha.toFixed(2)})`;

    this.ctx.beginPath();
    if (this.ctx.roundRect) {
      this.ctx.roundRect(-half, -half, c.size, c.size, rad);
    } else {
      this.ctx.rect(-half, -half, c.size, c.size);
    }
    this.ctx.fill();

    // Subtle 1.2px border for alternating chessboard squares
    if (c.hasBorder) {
      this.ctx.strokeStyle = `rgba(${c.color.r}, ${c.color.g}, ${c.color.b}, ${Math.min(0.70, c.alpha * 2.2).toFixed(2)})`;
      this.ctx.lineWidth = Math.max(1, Math.min(1.4, c.size * 0.04));
      this.ctx.stroke();
    }

    // Specular inner reflection on larger cubes for 3D depth
    if (c.size > 22) {
      const specOffset = Math.min(8, Math.max(3, c.size * 0.025));
      const specSize = Math.min(48, c.size * 0.22);
      this.ctx.fillStyle = `rgba(255, 255, 255, ${(c.alpha * 0.28).toFixed(2)})`;
      this.ctx.beginPath();
      if (this.ctx.roundRect) {
        this.ctx.roundRect(-half + specOffset, -half + specOffset, specSize, specSize, rad * 0.6);
      } else {
        this.ctx.rect(-half + specOffset, -half + specOffset, specSize, specSize);
      }
      this.ctx.fill();
    }

    this.ctx.restore();
  }
}
