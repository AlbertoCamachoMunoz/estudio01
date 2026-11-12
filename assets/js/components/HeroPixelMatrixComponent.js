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

    this.ctx.scale(this.dpr, this.dpr);
  }

  /**
   * Builds the pixel cubes distribution across the entire Hero width:
   * Left: Large cubes (35px, 30px) -> Center: (25px, 20px, 15px) -> Right: (10px, 5px, 3px)
   */
  generateMatrix() {
    this.cubes = [];
    const w = this.width;
    const h = this.height;
    if (w <= 0 || h <= 0) return;

    const isMobile = w < 768;

    // Define column steps: sizes from left (big) to right (small)
    const scaleSteps = isMobile
      ? [30, 20, 10, 4]
      : [35, 30, 25, 20, 15, 10, 5, 3.5];

    const columnCount = scaleSteps.length;
    const colWidth = w / columnCount;

    for (let c = 0; c < columnCount; c++) {
      const colBaseSize = scaleSteps[c];
      const progress = c / (columnCount - 1); // 0 (left) to 1 (right)

      // Spacing: large cubes have generous margin, small pixels have tighter density
      const verticalGap = Math.max(colBaseSize * 1.55, 14);
      const rows = Math.floor(h / verticalGap);

      // Dispersal factor increases towards the right (digital dissipation)
      const scatterMultiplier = 0.4 + progress * 1.4;

      for (let r = 0; r <= rows; r++) {
        // Base coordinate with jitter
        const jitterX = (Math.random() - 0.5) * (colWidth * 0.45 * scatterMultiplier);
        const jitterY = (Math.random() - 0.5) * (verticalGap * 0.45);

        const x = c * colWidth + colWidth * 0.5 + jitterX;
        const y = (r / Math.max(1, rows)) * (h - 30) + 15 + jitterY;

        // Size with slight organic variation
        const size = Math.max(2.5, colBaseSize + (Math.random() - 0.5) * (colBaseSize * 0.22));

        // Corner radius proportional to size
        const radius = Math.max(1, size * 0.22);

        // Color interpolation matching logo spectrum:
        // Left: Cyan/Blue (#06b6d4 / #3b82f6)
        // Center: Violet / Purple (#8b5cf6)
        // Right: Magenta, Rose & Crimson Red (#ec4899 / #ef4444)
        const color = this.getSpectrumColor(progress);

        // Base opacity: subtle on big blocks, crisp on micro-pixels
        const baseAlpha = progress > 0.65 ? 0.38 : (0.24 + (1 - progress) * 0.14);

        this.cubes.push({
          x0: x,
          y0: y,
          x: x,
          y: y,
          vx: 0,
          vy: 0,
          size0: size,
          size: size,
          radius: radius,
          color: color,
          progress: progress,
          rotation: (Math.random() - 0.5) * 0.25,
          rotation0: (Math.random() - 0.5) * 0.25,
          baseAlpha: baseAlpha,
          alpha: baseAlpha,
          phase: Math.random() * Math.PI * 2,
        });
      }

      // Add extra dispersed micro-pixels on the right edge
      if (progress > 0.55) {
        const extraCount = Math.floor(5 + progress * 10);
        for (let k = 0; k < extraCount; k++) {
          const exX = c * colWidth + Math.random() * colWidth;
          const exY = Math.random() * h;
          const exSize = Math.random() * 3 + 2;
          const color = this.getSpectrumColor(progress);

          this.cubes.push({
            x0: exX,
            y0: exY,
            x: exX,
            y: exY,
            vx: 0,
            vy: 0,
            size0: exSize,
            size: exSize,
            radius: 1,
            color: color,
            progress: progress,
            rotation: 0,
            rotation0: 0,
            baseAlpha: 0.32 + Math.random() * 0.22,
            alpha: 0.32,
            phase: Math.random() * Math.PI * 2,
          });
        }
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
    const repulsionRadius = 140; // Broad tactile radius
    const springConstant = 0.055;
    const damping = 0.82;

    for (let i = 0; i < this.cubes.length; i++) {
      const c = this.cubes[i];

      // Subtle ambient float (gentle sinusoidal breathing)
      const floatY = Math.sin(time * 0.0018 + c.phase) * (c.size0 > 20 ? 2.5 : 1.5);
      const floatRot = Math.sin(time * 0.0012 + c.phase) * 0.05;

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
        // Push force calibrated for fluid magnetic repulsion
        const pushForce = Math.pow(factor, 1.3) * (c.size0 > 20 ? 7 : 12);
        const angle = Math.atan2(dy, dx);

        c.vx += Math.cos(angle) * pushForce;
        c.vy += Math.sin(angle) * pushForce;

        targetScale = 1.0 + factor * 0.42;
        targetAlpha = Math.min(0.95, c.baseAlpha + factor * 0.58);
        c.rotation += (factor * 0.08);
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
    if (c.alpha > 0.6) {
      this.ctx.shadowColor = `rgba(${c.color.r}, ${c.color.g}, ${c.color.b}, 0.85)`;
      this.ctx.shadowBlur = Math.min(16, c.size * 0.7);
    }

    this.ctx.fillStyle = `rgba(${c.color.r}, ${c.color.g}, ${c.color.b}, ${c.alpha.toFixed(2)})`;

    this.ctx.beginPath();
    if (this.ctx.roundRect) {
      this.ctx.roundRect(-half, -half, c.size, c.size, rad);
    } else {
      this.ctx.rect(-half, -half, c.size, c.size);
    }
    this.ctx.fill();

    // Specular inner reflection on larger cubes for 3D depth
    if (c.size > 14) {
      this.ctx.fillStyle = `rgba(255, 255, 255, ${(c.alpha * 0.35).toFixed(2)})`;
      this.ctx.beginPath();
      if (this.ctx.roundRect) {
        this.ctx.roundRect(-half + 2, -half + 2, c.size * 0.35, c.size * 0.35, rad * 0.6);
      } else {
        this.ctx.rect(-half + 2, -half + 2, c.size * 0.35, c.size * 0.35);
      }
      this.ctx.fill();
    }

    this.ctx.restore();
  }
}
