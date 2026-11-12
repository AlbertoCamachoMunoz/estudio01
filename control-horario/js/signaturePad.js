/**
 * Signature Pad Module
 * Smooth touch & mouse canvas signature capture for mobile workers.
 */
export class SignaturePad {
  constructor(canvasElement, onChange = null) {
    this.canvas = canvasElement;
    this.ctx = this.canvas.getContext('2d');
    this.onChange = onChange;
    this.isDrawing = false;
    this.hasDrawn = false;
    this.lastX = 0;
    this.lastY = 0;

    this.init();
  }

  init() {
    this.ctx.lineWidth = 2.5;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    this.ctx.strokeStyle = '#0f172a';

    // Touch events
    this.canvas.addEventListener('touchstart', (e) => this.handleStart(e), { passive: false });
    this.canvas.addEventListener('touchmove', (e) => this.handleMove(e), { passive: false });
    this.canvas.addEventListener('touchend', (e) => this.handleEnd(e), { passive: false });

    // Mouse events
    this.canvas.addEventListener('mousedown', (e) => this.handleStart(e));
    this.canvas.addEventListener('mousemove', (e) => this.handleMove(e));
    this.canvas.addEventListener('mouseup', (e) => this.handleEnd(e));
    this.canvas.addEventListener('mouseleave', (e) => this.handleEnd(e));
  }

  getCoords(e) {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;

    let clientX, clientY;
    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  }

  handleStart(e) {
    if (e.type === 'touchstart') e.preventDefault();
    this.isDrawing = true;
    const coords = this.getCoords(e);
    this.lastX = coords.x;
    this.lastY = coords.y;
    this.ctx.beginPath();
    this.ctx.moveTo(this.lastX, this.lastY);
  }

  handleMove(e) {
    if (!this.isDrawing) return;
    if (e.type === 'touchmove') e.preventDefault();
    const coords = this.getCoords(e);
    this.ctx.lineTo(coords.x, coords.y);
    this.ctx.stroke();
    this.lastX = coords.x;
    this.lastY = coords.y;
    this.hasDrawn = true;
  }

  handleEnd(e) {
    if (!this.isDrawing) return;
    if (e && e.type === 'touchend') e.preventDefault();
    this.isDrawing = false;
    this.ctx.closePath();
    if (this.onChange && this.hasDrawn) {
      this.onChange(this.toDataURL());
    }
  }

  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.hasDrawn = false;
    if (this.onChange) {
      this.onChange(null);
    }
  }

  loadDataUrl(dataUrl) {
    if (!dataUrl) {
      this.clear();
      return;
    }
    const img = new Image();
    img.onload = () => {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.drawImage(img, 0, 0, this.canvas.width, this.canvas.height);
      this.hasDrawn = true;
    };
    img.src = dataUrl;
  }

  toDataURL() {
    return this.hasDrawn ? this.canvas.toDataURL('image/png') : null;
  }

  isEmpty() {
    return !this.hasDrawn;
  }
}
