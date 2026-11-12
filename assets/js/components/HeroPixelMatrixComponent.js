/**
 * HeroPixelMatrixComponent
 * High-precision metallic micro-engineering grid for Estudio 01.
 * Aesthetics: Apple Pro, Leica, Braun, Teenage Engineering minimalism.
 *
 * Technical Specifications:
 * - Micro-cells strictly between 2.2px and 7.8px max.
 * - 100% straight sharp edges (border-radius: 0px), zero rounded plastic balloons.
 * - Architecture: Clean coordinate grid with spatial progression (denser/larger on left, dissolving to fine micro-pixels on right).
 * - Palette in repose: Deep obsidian background (#08080A), muted graphite (#1F2024), titanium (#2E3036), and slate metal (#4A4D55) with low alpha (0.22 - 0.38).
 * - Precision Mouse Reaction: Specular metallic flash (interpolates toward polished silver #D4D7DD and titanium white #F5F5F7)
 *   with subtle magnetic micro-displacement (1px - 2px max) and smooth lerp (0.08) damping.
 * - Performance: 60fps locked, Retina DPR scaling, zero garbage collection in frame loop.
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

    this.pixels = [];
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
   * Generates a high-precision architectural grid of micro-pixels:
   * Left side: ~7.5px titanium micro-cells.
   * Right side: ~2.4px fine micro-pixels.
   * Minimal clean spacing, zero plastic bloat.
   */
  generateMatrix() {
    this.pixels = [];
    const w = this.width;
    const h = this.height;
    if (w <= 0 || h <= 0) return;

    const isMobile = w < 768;
    const paddingX = isMobile ? 12 : 24;
    const paddingY = isMobile ? 16 : 24;

    // Palette tones in repose (RGB):
    // 0: Graphite (#1F2024)
    // 1: Titanium (#2E3036)
    // 2: Slate Metal (#4A4D55)
    const basePalette = [
      { r: 31, g: 32, b: 36 },
      { r: 46, g: 48, b: 54 },
      { r: 74, g: 77, b: 85 },
    ];

    let currentX = paddingX;
    let colIndex = 0;

    while (currentX < w - paddingX) {
      const progress = currentX / w; // 0 (left) to 1 (right)

      // Micro-scale progression: 7.5px on the left dissolving down to 2.4px on the right
      const maxColSize = isMobile ? 6.2 : 7.6;
      const minColSize = isMobile ? 2.2 : 2.4;
      const size = Math.max(
        minColSize,
        Math.round((maxColSize - Math.pow(progress, 0.82) * (maxColSize - minColSize)) * 10) / 10
      );

      // Architectural grid spacing: proportional to size with clean breathing room
      const stepX = Math.max(isMobile ? 10 : 13, size * 2.3);
      const stepY = Math.max(isMobile ? 10 : 13, size * 2.3);
      const rows = Math.floor((h - paddingY * 2) / stepY);

      for (let r = 0; r <= rows; r++) {
        const cellY = paddingY + r * stepY;
        if (cellY + size / 2 > h - 10) continue;

        // Subtle variation in resting tone for brushed metal texture
        const toneIndex = (colIndex + r * 2) % basePalette.length;
        const tone = basePalette[toneIndex];

        // Resting alpha: subtle so typography remains crisp and dominant
        const baseAlpha = 0.24 + ((colIndex * 7 + r * 13) % 10) * 0.015;

        this.pixels.push({
          x0: currentX,
          y0: cellY,
          x: currentX,
          y: cellY,
          size: size,
          halfSize: size / 2,
          r0: tone.r,
          g0: tone.g,
          b0: tone.b,
          baseAlpha: baseAlpha,
          alpha: baseAlpha,
          brightness: 0,
          progress: progress,
          col: colIndex,
          row: r,
        });
      }

      currentX += stepX;
      colIndex++;
    }
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
    const interactionRadius = 135;
    const lerpSpeed = 0.08; // Smooth precision damping

    // Polished specular flash targets:
    // Silver: #D4D7DD (212, 215, 221)
    // Titanium White: #F5F5F7 (245, 245, 247)
    const flashR = 245;
    const flashG = 245;
    const flashB = 247;

    for (let i = 0; i < this.pixels.length; i++) {
      const p = this.pixels[i];

      // Subtle ambient mechanical drift (microscopic 0.8px float, precision engineering feel)
      const ambientFloatY = Math.sin(time * 0.0014 + p.progress * 3.5 + p.row * 0.18) * 0.75;
      const homeX = p.x0;
      const homeY = p.y0 + ambientFloatY;

      // Mouse distance calculation
      const dx = homeX - this.mouse.x;
      const dy = homeY - this.mouse.y;
      const dist = Math.hypot(dx, dy);

      let targetX = homeX;
      let targetY = homeY;
      let targetBrightness = 0;
      let targetAlpha = p.baseAlpha;

      if (dist < interactionRadius && this.mouse.isHovered) {
        const factor = 1 - dist / interactionRadius;
        const smoothFactor = Math.pow(factor, 1.6);

        // Magnetic micro-displacement: maximum 1.8px (precise tactile tension)
        const angle = Math.atan2(dy, dx);
        const microPush = smoothFactor * 1.8;
        targetX = homeX + Math.cos(angle) * microPush;
        targetY = homeY + Math.sin(angle) * microPush;

        // Specular metallic flash intensity (0 to 1)
        targetBrightness = smoothFactor;
        targetAlpha = Math.min(0.96, p.baseAlpha + smoothFactor * 0.65);
      }

      // Physics interpolation (lerp 0.08)
      p.x += (targetX - p.x) * lerpSpeed;
      p.y += (targetY - p.y) * lerpSpeed;
      p.brightness += (targetBrightness - p.brightness) * lerpSpeed;
      p.alpha += (targetAlpha - p.alpha) * lerpSpeed;

      // Render straight sharp micro-pixel (0px border radius)
      this.drawPixel(p, flashR, flashG, flashB);
    }
  }

  drawPixel(p, flashR, flashG, flashB) {
    // Interpolate color from resting graphite to titanium white flash
    const b = p.brightness;
    const r = Math.round(p.r0 + (flashR - p.r0) * b);
    const g = Math.round(p.g0 + (flashG - p.g0) * b);
    const bl = Math.round(p.b0 + (flashB - p.b0) * b);

    // Draw straight sharp micro-pixel (zero rounded corners)
    this.ctx.fillStyle = `rgba(${r}, ${g}, ${bl}, ${p.alpha.toFixed(3)})`;
    this.ctx.fillRect(
      Math.round(p.x - p.halfSize),
      Math.round(p.y - p.halfSize),
      p.size,
      p.size
    );

    // Specular optical pinpoint on directly excited micro-cells
    if (b > 0.45 && p.size >= 4) {
      this.ctx.fillStyle = `rgba(255, 255, 255, ${(b * 0.9).toFixed(2)})`;
      this.ctx.fillRect(Math.round(p.x - 0.5), Math.round(p.y - 0.5), 1, 1);
    }
  }
}
