/**
 * HeroPixelMatrixComponent
 * Hardware-accelerated interactive pixel cube matrix for the ENTIRE Hero Section.
 *
 * Implements the user's progression scale:
 * - Desktop: columns sized 35px, 30px, 25px, 20px, 15px, 10px, 5px (and 3px micro-pixels)
 * - Mobile: columns sized 30px, 20px, 10px, 3px
 *
 * Color spectrum: Electric Blue / Cyan (Left) -> Indigo / Violet (Center) -> Crimson Red (Right)
 * Real-time mouse physics: Repulsion, dynamic scaling, rotation, elastic spring-back & glow.
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
   * Builds the pixel cubes distribution across the entire Hero width:
   * - Checkered racing flag pattern ("bandera de carreras ondeándose").
   * - Derecha > Izquierda: Largest, heaviest cubes on the right (covering up to 35% of the page).
   * - Strictly decreasing sizes from right to left: NEVER 2 columns/rows of the same size.
   */
  generateMatrix() {
    this.cubes = [];
    const w = this.width;
    const h = this.height;
    if (w <= 0 || h <= 0) return;

    const isMobile = w < 768;

    // Progression of sizes strictly decreasing from RIGHT to LEFT (derecha > izquierda)
    // NEVER 2 columns of the same size.
    // Rightmost columns (spanning ~35% of page width) are large, solid, and heavy.
    const rightSizes = isMobile
      ? [58, 44, 34]
      : [96, 84, 74, 64, 55];
    const leftSizes = isMobile
      ? [24, 15, 8, 3.5]
      : [46, 38, 30, 22, 15, 9, 5.5, 3.2];

    // Right 35% zone: spans from x = w * 0.65 to x = w - 24px
    const rightStartX = w * 0.65;
    const rightEndX = w - (isMobile ? 12 : 24);

    // Left 65% zone: spans from x = 24px to x = w * 0.61
    const leftStartX = isMobile ? 12 : 24;
    const leftEndX = w * 0.61;

    // Compute column centers from right to left
    const cols = [];
    for (let i = 0; i < rightSizes.length; i++) {
      const t = i / Math.max(1, rightSizes.length - 1);
      const x = rightEndX - (rightEndX - rightStartX) * t;
      cols.push({ size: rightSizes[i], x: x, index: i });
    }
    for (let j = 0; j < leftSizes.length; j++) {
      const t = j / Math.max(1, leftSizes.length - 1);
      const x = leftEndX - (leftEndX - leftStartX) * t;
      cols.push({ size: leftSizes[j], x: x, index: rightSizes.length + j });
    }

    // Populate each column with racing flag checkered squares
    for (let c = 0; c < cols.length; c++) {
      const col = cols[c];
      const s = col.size;
      const progress = Math.max(0, Math.min(1, col.x / w));
      const color = this.getSpectrumColor(progress);

      // Tight gap for racing flag cloth continuity
      const gapY = Math.max(4, s * 0.08);
      const stepY = s + gapY;
      let rows = Math.floor((h - 16) / stepY);

      // Micro-pixels on far left are sampled for lightness & 60 FPS fluidity
      const stride = s < 6 ? 2 : 1;

      for (let r = 0; r <= rows; r += stride) {
        const cellY = 16 + r * stepY + s / 2;
        if (cellY + s / 2 > h + 20) continue;

        // Checkered racing flag alternating pattern
        const isChequered = (c + r) % 2 === 0;
        const baseAlpha = isChequered ? (s > 45 ? 0.44 : 0.36) : (s > 45 ? 0.14 : 0.10);
        const hasBorder = !isChequered;

        this.cubes.push({
          x0: col.x,
          y0: cellY,
          x: col.x,
          y: cellY,
          vx: 0,
          vy: 0,
          size0: s,
          size: s,
          radius: Math.min(6, Math.max(1, s * 0.12)),
          color: color,
          progress: progress,
          rotation: 0,
          rotation0: 0,
          baseAlpha: baseAlpha,
          alpha: baseAlpha,
          col: c,
          row: r,
          isChequered: isChequered,
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
    // Traveling wind wave speed & frequency for waving flag physics
    const windSpeed = time * 0.0028;
    const repulsionRadius = 150;
    const springConstant = 0.055;
    const damping = 0.82;

    for (let i = 0; i < this.cubes.length; i++) {
      const c = this.cubes[i];

      // Waving racing flag wave physics
      // Phase combines horizontal position (traveling wave across the flag) and row (for diagonal fabric fold)
      const wavePhase = (c.x0 / this.width) * 6.5 - windSpeed + c.row * 0.32;
      const waveSin = Math.sin(wavePhase);
      const waveCos = Math.cos(wavePhase);

      // Dynamic wave displacements (heavier on large blocks, fine on small ones)
      const waveY = waveSin * (c.size0 * 0.16 + 2.0);
      const waveX = waveCos * (c.size0 * 0.06);
      // Perspective wave depth
      const waveDepthScale = 1.0 + waveSin * 0.08;
      // Wave rotation along tangent
      const waveRot = waveCos * 0.08;
      // Wave light crest brightness boost
      const waveAlphaBoost = Math.max(0, waveSin * 0.12);

      const targetX = c.x0 + waveX;
      const targetY = c.y0 + waveY;

      // Mouse repulsion calculation
      const dx = c.x - this.mouse.x;
      const dy = c.y - this.mouse.y;
      const dist = Math.hypot(dx, dy);

      let targetScale = waveDepthScale;
      let targetAlpha = c.baseAlpha + waveAlphaBoost;

      if (dist < repulsionRadius && this.mouse.isHovered) {
        const factor = 1 - dist / repulsionRadius;
        // Large heavy blocks on the right move firmly with inertia
        const pushForce = Math.pow(factor, 1.25) * (c.size0 > 50 ? 5.0 : (c.size0 > 25 ? 8.0 : 13.0));
        const angle = Math.atan2(dy, dx);

        c.vx += Math.cos(angle) * pushForce;
        c.vy += Math.sin(angle) * pushForce;

        targetScale = waveDepthScale + factor * (c.size0 > 50 ? 0.18 : 0.40);
        targetAlpha = Math.min(0.96, c.baseAlpha + waveAlphaBoost + factor * 0.58);
        c.rotation += (factor * (c.size0 > 50 ? 0.03 : 0.09));
      }

      // Spring physics back to waving flag target position
      c.vx += (targetX - c.x) * springConstant;
      c.vy += (targetY - c.y) * springConstant;
      c.vx *= damping;
      c.vy *= damping;

      c.x += c.vx;
      c.y += c.vy;

      // Smooth interpolation for size, alpha, and rotation
      c.size += ((c.size0 * targetScale) - c.size) * 0.15;
      c.alpha += (targetAlpha - c.alpha) * 0.15;
      c.rotation += ((c.rotation0 + waveRot) - c.rotation) * 0.1;

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

    // Dynamic bloom glow when hovered or on wave crest
    if (c.alpha > 0.46) {
      this.ctx.shadowColor = `rgba(${c.color.r}, ${c.color.g}, ${c.color.b}, 0.85)`;
      this.ctx.shadowBlur = Math.min(18, c.size * 0.6);
    }

    this.ctx.fillStyle = `rgba(${c.color.r}, ${c.color.g}, ${c.color.b}, ${c.alpha.toFixed(2)})`;

    this.ctx.beginPath();
    if (this.ctx.roundRect) {
      this.ctx.roundRect(-half, -half, c.size, c.size, rad);
    } else {
      this.ctx.rect(-half, -half, c.size, c.size);
    }
    this.ctx.fill();

    // Chequered racing flag alternate square border (gives the unmistakable racing flag look)
    if (c.hasBorder) {
      this.ctx.strokeStyle = `rgba(${c.color.r}, ${c.color.g}, ${c.color.b}, ${Math.min(0.75, c.alpha * 2.2).toFixed(2)})`;
      this.ctx.lineWidth = Math.max(1, Math.min(1.6, c.size * 0.05));
      this.ctx.stroke();
    }

    // Specular inner reflection on larger cubes for 3D depth and sheen
    if (c.size > 20) {
      this.ctx.fillStyle = `rgba(255, 255, 255, ${(c.alpha * 0.28).toFixed(2)})`;
      this.ctx.beginPath();
      if (this.ctx.roundRect) {
        this.ctx.roundRect(-half + 3, -half + 3, c.size * 0.28, c.size * 0.28, rad * 0.6);
      } else {
        this.ctx.rect(-half + 3, -half + 3, c.size * 0.28, c.size * 0.28);
      }
      this.ctx.fill();
    }

    this.ctx.restore();
  }
}
