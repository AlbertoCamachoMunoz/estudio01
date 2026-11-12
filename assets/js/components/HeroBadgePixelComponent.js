/**
 * HeroBadgePixelComponent
 * Interactive pixel cube matrix background for the Hero Badge:
 * "⚡ Ingeniería de Software + Producción Audiovisual In Situ"
 *
 * Recreates the logo's pixel cube gradient (large cubes on the left transitioning
 * to small dispersed cubes on the right, from Electric Blue to Crimson Red)
 * with real-time mouse repulsion, spring physics, dynamic scale, and glow.
 */
export class HeroBadgePixelComponent {
  /**
   * @param {Object} options
   * @param {string} [options.badgeSelector]
   * @param {string} [options.canvasSelector]
   */
  constructor({
    badgeSelector = '#heroBadge',
    canvasSelector = '#heroBadgeCanvas',
  } = {}) {
    this.badge = document.querySelector(badgeSelector);
    this.canvas = document.querySelector(canvasSelector);

    if (!this.badge || !this.canvas) return;

    this.ctx = this.canvas.getContext('2d');
    if (!this.ctx) return;

    this.cubes = [];
    this.particles = [];
    this.width = 0;
    this.height = 0;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);

    this.mouse = {
      x: -1000,
      y: -1000,
      isHovered: false,
    };

    this.animationId = null;
    this.init();
  }

  init() {
    this.resize();
    this.generateCubes();
    this.bindEvents();
    this.startAnimation();
  }

  resize() {
    if (!this.badge || !this.canvas) return;
    const rect = this.badge.getBoundingClientRect();
    this.width = rect.width;
    this.height = rect.height;

    this.canvas.width = Math.round(this.width * this.dpr);
    this.canvas.height = Math.round(this.height * this.dpr);
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;

    this.ctx.scale(this.dpr, this.dpr);
  }

  /**
   * Generates cubes layout following the logo logic:
   * Left: larger cubes (14px - 18px)
   * Center: medium cubes (8px - 12px)
   * Right: small dispersed cubes (3px - 7px)
   */
  generateCubes() {
    this.cubes = [];
    const w = this.width;
    const h = this.height;
    if (w <= 0 || h <= 0) return;

    // Density based on width
    const columnCount = Math.max(12, Math.floor(w / 28));

    for (let c = 0; c < columnCount; c++) {
      const colProgress = c / (columnCount - 1); // 0 (left) to 1 (right)

      // Base size decreases from left (16px) to right (4px)
      const baseSize = 16 - colProgress * 12; // 16 down to 4
      const rowsPerCol = Math.floor(h / (baseSize + 6)) + 1;

      for (let r = 0; r < rowsPerCol; r++) {
        // Stagger / disperse with randomness increasing towards the right
        const scatterX = (Math.random() - 0.5) * (colProgress * 18);
        const scatterY = (Math.random() - 0.5) * (colProgress * 14);

        const x = (colProgress * (w - 30)) + 15 + scatterX;
        const y = (r / Math.max(1, rowsPerCol - 1)) * (h - 16) + 8 + scatterY;

        // Size with slight variation
        const size = Math.max(3, baseSize + (Math.random() - 0.5) * 3);

        // Color interpolation matching logo:
        // 0.0: Electric Cyan (#06b6d4)
        // 0.35: Royal Blue (#3b82f6)
        // 0.65: Violet / Purple (#8b5cf6)
        // 0.85: Hot Pink (#ec4899)
        // 1.0: Crimson Red (#ef4444)
        const color = this.getGradientColor(colProgress);

        this.cubes.push({
          x0: x,
          y0: y,
          x: x,
          y: y,
          vx: 0,
          vy: 0,
          size0: size,
          size: size,
          radius: Math.max(1, size * 0.22),
          color: color,
          colProgress: colProgress,
          rotation: (Math.random() - 0.5) * 0.2,
          rotation0: (Math.random() - 0.5) * 0.2,
          baseAlpha: 0.35 + (1 - colProgress) * 0.25, // solid on left, subtle on right
          alpha: 0.35 + (1 - colProgress) * 0.25,
          phase: Math.random() * Math.PI * 2,
        });
      }
    }
  }

  getGradientColor(t) {
    let r, g, b;
    if (t < 0.3) {
      const k = t / 0.3;
      r = Math.round(6 + (59 - 6) * k);
      g = Math.round(182 + (130 - 182) * k);
      b = Math.round(212 + (246 - 212) * k);
    } else if (t < 0.65) {
      const k = (t - 0.3) / 0.35;
      r = Math.round(59 + (139 - 59) * k);
      g = Math.round(130 + (92 - 130) * k);
      b = Math.round(246 + (246 - 246) * k);
    } else if (t < 0.85) {
      const k = (t - 0.65) / 0.2;
      r = Math.round(139 + (236 - 139) * k);
      g = Math.round(92 + (72 - 92) * k);
      b = Math.round(246 + (153 - 246) * k);
    } else {
      const k = (t - 0.85) / 0.15;
      r = Math.round(236 + (239 - 236) * k);
      g = Math.round(72 + (68 - 72) * k);
      b = Math.round(153 + (68 - 153) * k);
    }
    return { r, g, b };
  }

  bindEvents() {
    this.badge.addEventListener('mousemove', (e) => {
      const rect = this.badge.getBoundingClientRect();
      this.mouse.x = e.clientX - rect.left;
      this.mouse.y = e.clientY - rect.top;
      this.mouse.isHovered = true;
    });

    this.badge.addEventListener('mouseleave', () => {
      this.mouse.x = -1000;
      this.mouse.y = -1000;
      this.mouse.isHovered = false;
    });

    window.addEventListener('resize', () => {
      this.resize();
      this.generateCubes();
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
    const repulsionRadius = 65;
    const springConstant = 0.08;
    const damping = 0.78;

    for (let i = 0; i < this.cubes.length; i++) {
      const c = this.cubes[i];

      // Subtle ambient float (breathing)
      const floatY = Math.sin(time * 0.002 + c.phase) * 1.5;
      const floatRot = Math.sin(time * 0.0015 + c.phase) * 0.06;

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
        const pushForce = factor * 22;
        const angle = Math.atan2(dy, dx);

        c.vx += Math.cos(angle) * pushForce;
        c.vy += Math.sin(angle) * pushForce;

        targetScale = 1.35 + factor * 0.35;
        targetAlpha = Math.min(1.0, c.baseAlpha + factor * 0.6);
        c.rotation += (factor * 0.3);
      }

      // Spring physics back to base position
      c.vx += (targetX - c.x) * springConstant;
      c.vy += (targetY - c.y) * springConstant;
      c.vx *= damping;
      c.vy *= damping;

      c.x += c.vx;
      c.y += c.vy;

      // Smooth scale and alpha interpolation
      c.size += ((c.size0 * targetScale) - c.size) * 0.15;
      c.alpha += (targetAlpha - c.alpha) * 0.15;
      c.rotation += ((c.rotation0 + floatRot) - c.rotation) * 0.1;

      // Draw cube
      this.drawCube(c);
    }
  }

  drawCube(c) {
    this.ctx.save();
    this.ctx.translate(c.x, c.y);
    this.ctx.rotate(c.rotation);

    const half = c.size / 2;
    const rad = Math.min(c.radius, half);

    // Glowing border if hovered/excited
    if (c.alpha > 0.65) {
      this.ctx.shadowColor = `rgba(${c.color.r}, ${c.color.g}, ${c.color.b}, 0.8)`;
      this.ctx.shadowBlur = 8;
    }

    this.ctx.fillStyle = `rgba(${c.color.r}, ${c.color.g}, ${c.color.b}, ${c.alpha.toFixed(2)})`;

    this.ctx.beginPath();
    if (this.ctx.roundRect) {
      this.ctx.roundRect(-half, -half, c.size, c.size, rad);
    } else {
      this.ctx.rect(-half, -half, c.size, c.size);
    }
    this.ctx.fill();

    // Subtle inner specular highlight on top-left of cube
    if (c.size > 8) {
      this.ctx.fillStyle = `rgba(255, 255, 255, ${(c.alpha * 0.3).toFixed(2)})`;
      this.ctx.beginPath();
      if (this.ctx.roundRect) {
        this.ctx.roundRect(-half + 1.5, -half + 1.5, c.size * 0.35, c.size * 0.35, rad * 0.5);
      } else {
        this.ctx.rect(-half + 1.5, -half + 1.5, c.size * 0.35, c.size * 0.35);
      }
      this.ctx.fill();
    }

    this.ctx.restore();
  }
}
