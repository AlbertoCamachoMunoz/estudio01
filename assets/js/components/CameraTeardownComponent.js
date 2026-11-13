import { $ } from '../utils/domHelper.js';

/**
 * Camera Teardown Component
 * High-performance interactive exploded view sequence of a professional cine camera.
 * Controlled seamlessly via an internal horizontal slider, touch/pointer scrub,
 * and mouse wheel scroll directly on the camera viewport (free from main page scroll hijacking).
 */
export class CameraTeardownComponent {
  /**
   * @param {Object} options
   * @param {string} [options.sectionSelector]
   * @param {string} [options.canvasSelector]
   * @param {string} [options.basePath]
   * @param {number} [options.totalFrames]
   */
  constructor({
    sectionSelector = '#audiovisual-lab',
    canvasSelector = '#cameraTeardownCanvas',
    basePath = 'assets/images/camera-sequence/',
    totalFrames = 60,
  } = {}) {
    this.section = $(sectionSelector);
    this.canvas = $(canvasSelector);
    this.basePath = basePath;
    this.totalFrames = totalFrames;

    if (!this.section || !this.canvas) return;

    this.ctx = this.canvas.getContext('2d');
    this.frames = [];
    this.loadedCount = 0;
    this.currentFrameIndex = 0;
    this.animId = null;
    this.hasRenderedInitial = false;

    // Viewport & Interactive Elements
    this.canvasWrap = $('.camera-showcase__canvas-wrap', this.section);
    this.slider = $('#cameraScrubberSlider', this.section);
    this.stepButtons = Array.from(this.section.querySelectorAll('.slider-step-btn'));

    // Telemetry HUD Elements
    this.hudLabel = $('#hudComponentLabel', this.section);
    this.hudStep = $('#hudStepCounter', this.section);
    this.hudBar = $('#hudProgressBar', this.section);
    this.hotspots = [
      $('#hotspot-stage-1', this.section),
      $('#hotspot-stage-2', this.section),
      $('#hotspot-stage-3', this.section),
      $('#hotspot-stage-4', this.section),
    ];

    this.stages = [
      {
        threshold: [0.0, 0.24],
        step: '01 / 04',
        label: 'SISTEMA MONTADO · 35MM F/1.4 CINE',
        index: 0,
      },
      {
        threshold: [0.24, 0.52],
        step: '02 / 04',
        label: 'DESACOPLE ÓPTICO · APERTURA F/1.4',
        index: 1,
      },
      {
        threshold: [0.52, 0.78],
        step: '03 / 04',
        label: 'ELEMENTOS ASFÉRICOS ED · CERO DISTORSIÓN',
        index: 2,
      },
      {
        threshold: [0.78, 1.0],
        step: '04 / 04',
        label: 'SENSOR FULL-FRAME 10-BIT · COLOR REAL',
        index: 3,
      },
    ];

    this.init();
  }

  init() {
    this._preloadFrames();
    this._bindEvents();
    this.goToFrame(0);
  }

  _preloadFrames() {
    for (let i = 0; i < this.totalFrames; i++) {
      const img = new Image();
      const frameNum = String(i).padStart(3, '0');
      img.src = `${this.basePath}frame_${frameNum}.webp`;

      img.onload = () => {
        this.loadedCount++;
        if (i === this.currentFrameIndex) {
          this._drawFrame(this.currentFrameIndex);
        }
      };

      this.frames.push(img);
    }
  }

  _bindEvents() {
    // 1. Horizontal Slider Input
    if (this.slider) {
      this.slider.addEventListener('input', (e) => {
        const val = parseInt(e.target.value, 10);
        this.goToFrame(val);
      });
    }

    // 2. Step Selector Buttons
    this.stepButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const target = parseInt(btn.dataset.frame, 10);
        this.animateToFrame(target);
      });
    });

    // 3. Internal Mouse Wheel on Canvas Viewport
    if (this.canvasWrap) {
      this.canvasWrap.addEventListener(
        'wheel',
        (e) => this._handleInternalWheel(e),
        { passive: false }
      );

      // 4. Pointer / Touch Scrubbing on Canvas
      let isDragging = false;
      let startX = 0;
      let startFrame = 0;

      const startDrag = (x) => {
        isDragging = true;
        startX = x;
        startFrame = this.currentFrameIndex;
      };

      const moveDrag = (x) => {
        if (!isDragging) return;
        const dx = x - startX;
        // 8px horizontal delta = 1 frame change
        const frameDiff = Math.round(dx / 8);
        const target = Math.max(0, Math.min(this.totalFrames - 1, startFrame + frameDiff));
        this.goToFrame(target);
      };

      const endDrag = () => {
        isDragging = false;
      };

      this.canvasWrap.addEventListener('mousedown', (e) => {
        startDrag(e.clientX);
      });

      window.addEventListener('mousemove', (e) => {
        if (isDragging) moveDrag(e.clientX);
      });

      window.addEventListener('mouseup', endDrag);

      this.canvasWrap.addEventListener(
        'touchstart',
        (e) => {
          if (e.touches.length === 1) {
            startDrag(e.touches[0].clientX);
          }
        },
        { passive: true }
      );

      window.addEventListener(
        'touchmove',
        (e) => {
          if (isDragging && e.touches.length === 1) {
            moveDrag(e.touches[0].clientX);
          }
        },
        { passive: true }
      );

      window.addEventListener('touchend', endDrag);
    }

    // 5. Canvas resize handling
    window.addEventListener('resize', () => {
      this._drawFrame(this.currentFrameIndex);
    });
  }

  _handleInternalWheel(e) {
    const delta = e.deltaY;
    if (Math.abs(delta) < 2) return;

    const dir = Math.sign(delta);
    // 2 frames per notch for smooth, responsive feedback
    const nextFrame = this.currentFrameIndex + dir * 2;
    const clamped = Math.max(0, Math.min(this.totalFrames - 1, nextFrame));

    // If within bounds, intercept wheel and advance teardown without moving page
    if (clamped !== this.currentFrameIndex) {
      e.preventDefault();
      this.goToFrame(clamped);
    }
    // When reached 0 (scrolling up) or 59 (scrolling down), do NOT preventDefault:
    // User can naturally continue scrolling past the section!
  }

  goToFrame(frameIndex) {
    frameIndex = Math.max(0, Math.min(this.totalFrames - 1, Math.round(frameIndex)));
    this.currentFrameIndex = frameIndex;

    this._drawFrame(this.currentFrameIndex);

    const progress = this.currentFrameIndex / (this.totalFrames - 1);

    // Update Slider
    if (this.slider && parseInt(this.slider.value, 10) !== this.currentFrameIndex) {
      this.slider.value = String(this.currentFrameIndex);
    }
    if (this.slider) {
      const pct = (progress * 100).toFixed(1);
      this.slider.style.setProperty('--slider-pct', `${pct}%`);
    }

    // Update HUD & Tabs
    this._updateHUD(progress);
    this._updateStepButtons();
  }

  animateToFrame(targetFrame) {
    if (this.animId) cancelAnimationFrame(this.animId);
    const start = this.currentFrameIndex;
    const diff = targetFrame - start;
    if (diff === 0) return;

    const duration = 350; // ms
    const startTime = performance.now();

    const tick = (now) => {
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / duration);
      // Cubic ease-out curve
      const ease = 1 - Math.pow(1 - t, 3);
      const frame = Math.round(start + diff * ease);
      this.goToFrame(frame);

      if (t < 1) {
        this.animId = requestAnimationFrame(tick);
      }
    };

    this.animId = requestAnimationFrame(tick);
  }

  _drawFrame(index) {
    const img = this.frames[index];
    if (!img || !img.complete || img.naturalWidth === 0) return;

    const cw = this.canvas.width;
    const ch = this.canvas.height;

    this.ctx.clearRect(0, 0, cw, ch);

    const hRatio = cw / img.naturalWidth;
    const vRatio = ch / img.naturalHeight;
    const ratio = Math.min(hRatio, vRatio);

    const centerShiftX = (cw - img.naturalWidth * ratio) / 2;
    const centerShiftY = (ch - img.naturalHeight * ratio) / 2;

    this.ctx.drawImage(
      img,
      0,
      0,
      img.naturalWidth,
      img.naturalHeight,
      centerShiftX,
      centerShiftY,
      img.naturalWidth * ratio,
      img.naturalHeight * ratio
    );
  }

  _updateHUD(progress) {
    if (this.hudBar) {
      this.hudBar.style.width = `${Math.round(progress * 100)}%`;
    }

    const currentStage =
      this.stages.find(
        (s) => progress >= s.threshold[0] && progress <= s.threshold[1]
      ) || this.stages[0];

    if (this.hudStep && this.hudStep.textContent !== currentStage.step) {
      this.hudStep.textContent = currentStage.step;
    }

    if (this.hudLabel && this.hudLabel.textContent !== currentStage.label) {
      this.hudLabel.textContent = currentStage.label;
    }

    // Safely update hotspots if active in DOM
    this.hotspots.forEach((card, idx) => {
      if (!card) return;
      if (idx === currentStage.index) {
        card.classList.add('is-active');
      } else {
        card.classList.remove('is-active');
      }
    });
  }

  _updateStepButtons() {
    let closestBtn = null;
    let minDiff = Infinity;

    this.stepButtons.forEach((btn) => {
      const f = parseInt(btn.dataset.frame, 10);
      const d = Math.abs(f - this.currentFrameIndex);
      if (d < minDiff) {
        minDiff = d;
        closestBtn = btn;
      }
    });

    this.stepButtons.forEach((btn) => {
      btn.classList.toggle('is-active', btn === closestBtn);
    });
  }
}
