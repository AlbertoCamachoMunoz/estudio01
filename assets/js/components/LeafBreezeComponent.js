/**
 * LeafBreezeComponent (Re-engineered as Tech-Creative Pixel & Neural Node Canvas)
 * Lightweight, hardware-accelerated canvas particle network for the Hero section.
 * Renders subtle glowing pixels and AI node connections that react to cursor movement.
 */
export class LeafBreezeComponent {
  /**
   * @param {Object} options
   * @param {string} [options.canvasSelector]
   * @param {string} [options.containerSelector]
   * @param {number} [options.leafCount]
   */
  constructor({
    canvasSelector = '#heroBreezeCanvas',
    containerSelector = '#hero',
    leafCount = 42,
  } = {}) {
    this.canvas = document.querySelector(canvasSelector);
    this.container = document.querySelector(containerSelector);

    if (!this.canvas || !this.container) return;

    this.ctx = this.canvas.getContext('2d');
    if (!this.ctx) return;

    this.nodeCount = leafCount;
    this.nodes = [];
    this.isRunning = false;
    this.animationId = null;

    this.mouse = {
      x: -1000,
      y: -1000,
      isHovered: false,
    };

    this.palette = [
      'rgba(99, 102, 241, 0.65)',  // Indigo
      'rgba(6, 182, 212, 0.65)',   // Cyan
      'rgba(16, 185, 129, 0.55)',  // Emerald
      'rgba(168, 85, 247, 0.55)',  // Purple
    ];

    this.init();
  }

  init() {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    this.resize();
    this.bindEvents();
    this.populateNodes();
    this.setupIntersectionObserver();
  }

  bindEvents() {
    window.addEventListener(
      'resize',
      () => {
        this.resize();
      },
      { passive: true }
    );

    this.container.addEventListener(
      'mousemove',
      (e) => {
        const rect = this.container.getBoundingClientRect();
        this.mouse.x = e.clientX - rect.left;
        this.mouse.y = e.clientY - rect.top;
        this.mouse.isHovered = true;
      },
      { passive: true }
    );

    this.container.addEventListener('mouseleave', () => {
      this.mouse.isHovered = false;
      this.mouse.x = -1000;
      this.mouse.y = -1000;
    });
  }

  resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.width = this.container.offsetWidth || window.innerWidth;
    this.height = this.container.offsetHeight || 600;
    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  populateNodes() {
    this.nodes = [];
    for (let i = 0; i < this.nodeCount; i++) {
      const isPixelSquare = i % 3 === 0;
      this.nodes.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        size: isPixelSquare ? 3.5 + Math.random() * 3 : 2 + Math.random() * 2.2,
        isPixelSquare,
        color: this.palette[i % this.palette.length],
      });
    }
  }

  setupIntersectionObserver() {
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              this.start();
            } else {
              this.stop();
            }
          });
        },
        { threshold: 0.05 }
      );
      observer.observe(this.container);
    } else {
      this.start();
    }
  }

  start() {
    if (!this.isRunning) {
      this.isRunning = true;
      this.animate();
    }
  }

  stop() {
    if (this.isRunning) {
      this.isRunning = false;
      if (this.animationId) {
        cancelAnimationFrame(this.animationId);
        this.animationId = null;
      }
    }
  }

  update() {
    for (let i = 0; i < this.nodes.length; i++) {
      const n = this.nodes[i];
      n.x += n.vx;
      n.y += n.vy;

      if (n.x < 0 || n.x > this.width) n.vx *= -1;
      if (n.y < 0 || n.y > this.height) n.vy *= -1;

      if (this.mouse.isHovered) {
        const dx = n.x - this.mouse.x;
        const dy = n.y - this.mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 130 && dist > 1) {
          n.x += (dx / dist) * 0.6;
          n.y += (dy / dist) * 0.6;
        }
      }
    }
  }

  draw() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    // Draw subtle neural links between nearby nodes
    for (let i = 0; i < this.nodes.length; i++) {
      for (let j = i + 1; j < this.nodes.length; j++) {
        const a = this.nodes[i];
        const b = this.nodes[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const distSq = dx * dx + dy * dy;
        if (distSq < 15000) {
          const alpha = (1 - distSq / 15000) * 0.16;
          this.ctx.strokeStyle = `rgba(148, 163, 184, ${alpha})`;
          this.ctx.lineWidth = 0.8;
          this.ctx.beginPath();
          this.ctx.moveTo(a.x, a.y);
          this.ctx.lineTo(b.x, b.y);
          this.ctx.stroke();
        }
      }
    }

    // Draw nodes (pixels & circles)
    for (const n of this.nodes) {
      this.ctx.fillStyle = n.color;
      if (n.isPixelSquare) {
        this.ctx.fillRect(n.x - n.size / 2, n.y - n.size / 2, n.size, n.size);
      } else {
        this.ctx.beginPath();
        this.ctx.arc(n.x, n.y, n.size, 0, Math.PI * 2);
        this.ctx.fill();
      }
    }
  }

  animate() {
    if (!this.isRunning) return;
    this.update();
    this.draw();
    this.animationId = requestAnimationFrame(() => this.animate());
  }
}
