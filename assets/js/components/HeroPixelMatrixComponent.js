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
   * - Left: Extra-large cubes forming an architectural chessboard grid (tight gaps, alternating tiles).
   * - Center & Right: Progressively smaller cubes and wider separation into digital dust.
   */
  generateMatrix() {
    this.cubes = [];
    const w = this.width;
    const h = this.height;
    if (w <= 0 || h <= 0) return;

    const isMobile = w < 768;

    // --- 1. LEFT CHESSBOARD ZONE ---
    // Large square blocks packed with tight gap (4-6px), strictly aligned in orthogonal grid
    const chessSize = isMobile
      ? Math.round(Math.min(62, Math.max(48, w * 0.135)))
      : Math.round(Math.min(94, Math.max(74, w * 0.058)));
    const chessGap = isMobile ? 4 : 6;
    const chessStep = chessSize + chessGap;

    // Number of columns forming the chessboard on the left
    const chessCols = isMobile ? 2 : Math.min(3, Math.max(2, Math.floor((w * 0.23) / chessStep)));
    const chessStartX = isMobile ? 10 : 20;
    const chessStartY = 14;
    const chessRows = Math.floor((h - chessStartY * 2) / chessStep);

    for (let c = 0; c < chessCols; c++) {
      const colX = chessStartX + c * chessStep + chessSize / 2;
      const progress = Math.max(0, (colX - chessStartX) / w);
      const color = this.getSpectrumColor(progress);

      for (let r = 0; r <= chessRows; r++) {
        const cellY = chessStartY + r * chessStep + chessSize / 2;
        if (cellY + chessSize / 2 > h + 15) continue;

        // Chessboard alternating pattern
        const isChessAccent = (c + r) % 2 === 0;
        const baseAlpha = isChessAccent ? 0.38 : 0.14;
        const hasBorder = !isChessAccent;

        this.cubes.push({
          x0: colX,
          y0: cellY,
          x: colX,
          y: cellY,
          vx: 0,
          vy: 0,
          size0: chessSize,
          size: chessSize,
          radius: Math.min(6, chessSize * 0.12),
          color: color,
          progress: progress,
          rotation: 0,
          rotation0: 0,
          baseAlpha: baseAlpha,
          alpha: baseAlpha,
          phase: c * 0.7 + r * 0.5,
          isChessTile: true,
          hasBorder: hasBorder,
        });
      }
    }

    // --- 2. TRANSITION & RIGHT DISSOLUTION ZONE ---
    // From after the chessboard to the right edge: pixels get MUCH SMALLER and MUCH MORE SEPARATED
    const transStartX = chessStartX + chessCols * chessStep + (isMobile ? 12 : 24);
    const transEndX = w - (isMobile ? 12 : 28);
    const remainingW = transEndX - transStartX;

    if (remainingW > 50) {
      const transCols = isMobile ? 4 : 7;

      for (let k = 0; k < transCols; k++) {
        const t = (k + 1) / transCols; // 0.14 to 1.0
        // Horizontal position with expanding column intervals towards the right
        const colProgress = Math.pow(k / Math.max(1, transCols - 1), 1.15);
        const colX = transStartX + remainingW * colProgress;
        const globalProgress = Math.min(1, colX / w);
        const color = this.getSpectrumColor(globalProgress);

        // Size decreases dramatically: from ~65% of chessSize down to 3.5px
        const size = Math.max(3.5, chessSize * Math.pow(1 - t * 0.95, 1.75));

        // Separation (vertical gap) increases significantly: from 16px up to 75px
        // "y hacia la derecha mucho mas pequeños y algo mas separados"
        const vertGap = isMobile
          ? Math.max(14, 12 + t * 40)
          : Math.max(18, 14 + t * 68);
        const rowStep = size + vertGap;
        const rows = Math.floor((h - 30) / rowStep);

        // Subtle organic scatter increases towards the right edge
        const scatterMultiplier = Math.pow(t, 1.35);

        for (let r = 0; r <= rows; r++) {
          const jitterX = (Math.random() - 0.5) * (18 * scatterMultiplier);
          const jitterY = (Math.random() - 0.5) * (vertGap * 0.35 * scatterMultiplier);

          const cellY = 18 + r * rowStep + size / 2 + jitterY;
          if (cellY > h - 10) continue;

          // Sparser presence towards the far right (some omitted to accentuate separation)
          if (t > 0.6 && Math.random() < (t - 0.5) * 0.35) {
            continue;
          }

          const baseAlpha = t > 0.7 ? 0.44 : (0.24 + (1 - t) * 0.12);

          this.cubes.push({
            x0: colX + jitterX,
            y0: cellY,
            x: colX + jitterX,
            y: cellY,
            vx: 0,
            vy: 0,
            size0: size,
            size: size,
            radius: Math.max(1, size * 0.22),
            color: color,
            progress: globalProgress,
            rotation: (Math.random() - 0.5) * 0.2 * scatterMultiplier,
            rotation0: (Math.random() - 0.5) * 0.2 * scatterMultiplier,
            baseAlpha: baseAlpha,
            alpha: baseAlpha,
            phase: Math.random() * Math.PI * 2,
            isChessTile: false,
            hasBorder: false,
          });
        }
      }

      // --- 3. EXTRA FLOATING MICRO-PIXELS ON THE RIGHT (DIGITAL PARTICLES) ---
      const extraCount = isMobile ? 8 : 18;
      for (let m = 0; m < extraCount; m++) {
        const pxX = transStartX + remainingW * (0.45 + Math.random() * 0.55);
        const pxY = 20 + Math.random() * (h - 40);
        const pxSize = Math.random() * 3 + 2;
        const globalProgress = Math.min(1, pxX / w);
        const color = this.getSpectrumColor(globalProgress);

        this.cubes.push({
          x0: pxX,
          y0: pxY,
          x: pxX,
          y: pxY,
          vx: 0,
          vy: 0,
          size0: pxSize,
          size: pxSize,
          radius: 1,
          color: color,
          progress: globalProgress,
          rotation: 0,
          rotation0: 0,
          baseAlpha: 0.30 + Math.random() * 0.25,
          alpha: 0.30,
          phase: Math.random() * Math.PI * 2,
          isChessTile: false,
          hasBorder: false,
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
        // Push force calibrated: large chess tiles move solidly, tiny pixels disperse dynamically
        const pushForce = Math.pow(factor, 1.25) * (c.size0 > 45 ? 5.5 : (c.size0 > 20 ? 8.5 : 13.5));
        const angle = Math.atan2(dy, dx);

        c.vx += Math.cos(angle) * pushForce;
        c.vy += Math.sin(angle) * pushForce;

        targetScale = 1.0 + factor * (c.size0 > 45 ? 0.16 : 0.42);
        targetAlpha = Math.min(0.95, c.baseAlpha + factor * 0.62);
        c.rotation += (factor * (c.size0 > 45 ? 0.025 : 0.08));
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
    if (c.alpha > 0.5) {
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

    // Subtle 1.2px border for alternating chessboard squares
    if (c.hasBorder) {
      this.ctx.strokeStyle = `rgba(${c.color.r}, ${c.color.g}, ${c.color.b}, ${Math.min(0.70, c.alpha * 2.4).toFixed(2)})`;
      this.ctx.lineWidth = 1.2;
      this.ctx.stroke();
    }

    // Specular inner reflection on larger cubes for 3D depth
    if (c.size > 22) {
      this.ctx.fillStyle = `rgba(255, 255, 255, ${(c.alpha * 0.30).toFixed(2)})`;
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
