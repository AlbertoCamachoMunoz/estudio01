/**
 * CursorTrailComponent
 * High-performance, hardware-accelerated cursor trail & gradient ribbon for Pixel Digital.
 * Renders an organic glowing stream that transitions smoothly from Electric Blue to Crimson Red,
 * accompanied by floating micro-pixel dust that dissipates as the cursor moves.
 */
export class CursorTrailComponent {
  constructor({ maxPoints = 28, maxTrailAge = 350 } = {}) {
    this.maxPoints = maxPoints;
    this.maxTrailAge = maxTrailAge; // milliseconds
    this.points = [];
    this.particles = [];
    this.canvas = null;
    this.ctx = null;
    this.animationFrame = null;
    this.isSleeping = true;
    this.lastMoveTime = 0;

    this.mouse = {
      x: -1000,
      y: -1000,
      targetX: -1000,
      targetY: -1000,
      vx: 0,
      vy: 0,
      isDown: false
    };

    this.init();
  }

  init() {
    // Respect accessibility
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    this.createCanvas();
    this.bindEvents();
  }

  createCanvas() {
    let canvas = document.getElementById('cursorTrailCanvas');
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.id = 'cursorTrailCanvas';
      canvas.className = 'cursor-trail-canvas';
      document.body.appendChild(canvas);
    }

    this.canvas = canvas;
    this.ctx = this.canvas.getContext('2d');
    this.resize();
  }

  resize() {
    if (!this.canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = window.innerWidth * dpr;
    this.canvas.height = window.innerHeight * dpr;
    this.canvas.style.width = `${window.innerWidth}px`;
    this.canvas.style.height = `${window.innerHeight}px`;
    this.ctx.scale(dpr, dpr);
  }

  bindEvents() {
    window.addEventListener('resize', () => this.resize(), { passive: true });

    const onPointerMove = (e) => {
      const x = e.clientX;
      const y = e.clientY;

      this.mouse.vx = x - this.mouse.targetX;
      this.mouse.vy = y - this.mouse.targetY;
      this.mouse.targetX = x;
      this.mouse.targetY = y;
      this.lastMoveTime = performance.now();

      // If sleeping, wake up the render loop
      if (this.isSleeping) {
        this.mouse.x = x;
        this.mouse.y = y;
        this.isSleeping = false;
        this.renderLoop();
      }

      this.addPoint(x, y);

      // Spawn subtle pixel sparks if moving fast
      const speed = Math.hypot(this.mouse.vx, this.mouse.vy);
      if (speed > 4 && this.particles.length < 24) {
        this.spawnPixelParticle(x, y, speed);
      }
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });

    window.addEventListener('pointerleave', () => {
      this.mouse.targetX = -1000;
      this.mouse.targetY = -1000;
    }, { passive: true });
  }

  addPoint(x, y) {
    const now = performance.now();
    this.points.unshift({
      x,
      y,
      time: now,
      age: 0
    });

    if (this.points.length > this.maxPoints) {
      this.points.pop();
    }
  }

  spawnPixelParticle(x, y, speed) {
    const angle = Math.random() * Math.PI * 2;
    const velocity = (Math.random() * 1.5 + 0.5) * (speed * 0.08);
    const size = Math.random() > 0.5 ? 3 : 2;

    this.particles.push({
      x: x + (Math.random() - 0.5) * 8,
      y: y + (Math.random() - 0.5) * 8,
      vx: Math.cos(angle) * velocity,
      vy: Math.sin(angle) * velocity,
      size,
      alpha: 1,
      colorRatio: Math.random() // 0 = blue, 1 = red
    });
  }

  renderLoop() {
    const now = performance.now();

    // Smooth lerp mouse position
    this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.35;
    this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.35;

    // Filter out aged points
    this.points = this.points.filter((pt) => {
      pt.age = now - pt.time;
      return pt.age < this.maxTrailAge;
    });

    // Clear canvas
    this.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    // Render trail ribbon
    if (this.points.length > 2) {
      this.drawRibbon();
    }

    // Render micro pixel sparks
    if (this.particles.length > 0) {
      this.drawParticles();
    }

    // If no points and no particles left, sleep the loop to save 100% CPU
    if (this.points.length === 0 && this.particles.length === 0 && now - this.lastMoveTime > 400) {
      this.isSleeping = true;
      this.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      return;
    }

    this.animationFrame = requestAnimationFrame(() => this.renderLoop());
  }

  /**
   * Draws a smooth continuous ribbon with a gradient from Electric Blue to Crimson Red
   */
  drawRibbon() {
    const pts = this.points;
    const len = pts.length;
    if (len < 2) return;

    this.ctx.save();
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';

    for (let i = 0; i < len - 1; i++) {
      const p1 = pts[i];
      const p2 = pts[i + 1];

      // Normalized ratio from 0 (head at cursor) to 1 (tail end)
      const ratio1 = i / len;
      const ratio2 = (i + 1) / len;

      // Color interpolation: Blue/Cyan (#06b6d4) -> Indigo/Violet (#8b5cf6) -> Crimson Red (#ef4444)
      const color1 = this.getGradientColor(ratio1, 1 - (p1.age / this.maxTrailAge));
      const color2 = this.getGradientColor(ratio2, 1 - (p2.age / this.maxTrailAge));

      const grad = this.ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
      grad.addColorStop(0, color1);
      grad.addColorStop(1, color2);

      // Width tapers smoothly from 7px at head to 1.5px at tail
      const width = Math.max(1, (1 - ratio1) * 7.5);

      this.ctx.beginPath();
      this.ctx.strokeStyle = grad;
      this.ctx.lineWidth = width;
      this.ctx.moveTo(p1.x, p1.y);
      this.ctx.lineTo(p2.x, p2.y);
      this.ctx.stroke();
    }

    // Draw glowing head dot at cursor
    if (this.mouse.x > 0 && this.mouse.y > 0) {
      const headGlow = this.ctx.createRadialGradient(
        this.mouse.x, this.mouse.y, 0,
        this.mouse.x, this.mouse.y, 14
      );
      headGlow.addColorStop(0, 'rgba(56, 189, 248, 0.9)');
      headGlow.addColorStop(0.5, 'rgba(139, 92, 246, 0.4)');
      headGlow.addColorStop(1, 'rgba(239, 68, 68, 0)');

      this.ctx.fillStyle = headGlow;
      this.ctx.beginPath();
      this.ctx.arc(this.mouse.x, this.mouse.y, 14, 0, Math.PI * 2);
      this.ctx.fill();
    }

    this.ctx.restore();
  }

  drawParticles() {
    this.ctx.save();
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.96;
      p.vy *= 0.96;
      p.alpha -= 0.035;

      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      // Color from blue to crimson based on p.colorRatio
      const color = this.getGradientColor(p.colorRatio, p.alpha);
      this.ctx.fillStyle = color;
      this.ctx.fillRect(p.x, p.y, p.size, p.size);
    }
    this.ctx.restore();
  }

  /**
   * Helper: Calculates RGB color from Electric Blue -> Violet -> Crimson Red
   * @param {number} t Ratio between 0 (head) and 1 (tail)
   * @param {number} alpha Opacity between 0 and 1
   */
  getGradientColor(t, alpha = 1) {
    const clampedAlpha = Math.max(0, Math.min(1, alpha));

    // Color 0 (t = 0.0): Electric Cyan/Blue [6, 182, 212] (#06b6d4)
    // Color 1 (t = 0.5): Deep Indigo/Violet [139, 92, 246] (#8b5cf6)
    // Color 2 (t = 1.0): Crimson / Ruby Red [239, 68, 68] (#ef4444)
    let r, g, b;

    if (t < 0.5) {
      const localT = t / 0.5;
      r = Math.round(6 + (139 - 6) * localT);
      g = Math.round(182 + (92 - 182) * localT);
      b = Math.round(212 + (246 - 212) * localT);
    } else {
      const localT = (t - 0.5) / 0.5;
      r = Math.round(139 + (239 - 139) * localT);
      g = Math.round(92 + (68 - 92) * localT);
      b = Math.round(246 + (68 - 246) * localT);
    }

    return `rgba(${r}, ${g}, ${b}, ${clampedAlpha.toFixed(2)})`;
  }
}
