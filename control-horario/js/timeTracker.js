/**
 * Time Tracker Module
 * Manages clock-in, pauses, clock-out, GPS geotagging, and live shift timer.
 */
export class TimeTracker {
  constructor(timeState, onUpdate) {
    this.state = timeState;
    this.onUpdate = onUpdate;
    this.timerInterval = null;

    if (this.state.status === 'working' || this.state.status === 'paused') {
      this.startTimerLoop();
    }
  }

  /**
   * Starts shift (Clock In)
   */
  async clockIn() {
    const now = new Date();
    this.state.status = 'working';
    this.state.clockInTime = this.formatTime(now);
    this.state.clockInTimestamp = now.getTime();
    this.state.pauses = [];
    this.state.activePauseStart = null;
    this.state.totalPauseMs = 0;
    this.state.clockOutTime = null;
    this.state.clockOutTimestamp = null;

    this.startTimerLoop();

    // Fetch GPS coordinates in background without blocking UI
    this.fetchGps().then((coords) => {
      if (coords) {
        this.state.clockInGps = coords;
        this.notifyUpdate();
      }
    });

    this.notifyUpdate();
  }

  /**
   * Pause shift (Lunch / Rest break)
   */
  pause() {
    if (this.state.status !== 'working') return;
    const now = Date.now();
    this.state.status = 'paused';
    this.state.activePauseStart = now;
    this.notifyUpdate();
  }

  /**
   * Resume shift
   */
  resume() {
    if (this.state.status !== 'paused') return;
    const now = Date.now();
    const pauseDuration = now - (this.state.activePauseStart || now);
    this.state.pauses.push({
      startTimestamp: this.state.activePauseStart,
      endTimestamp: now,
      durationMs: pauseDuration
    });
    this.state.totalPauseMs = (this.state.totalPauseMs || 0) + pauseDuration;
    this.state.activePauseStart = null;
    this.state.status = 'working';
    this.notifyUpdate();
  }

  /**
   * End shift (Clock Out)
   */
  async clockOut() {
    const now = new Date();
    // If was paused when clicking clockOut, close the pause
    if (this.state.status === 'paused' && this.state.activePauseStart) {
      const pauseDuration = now.getTime() - this.state.activePauseStart;
      this.state.pauses.push({
        startTimestamp: this.state.activePauseStart,
        endTimestamp: now.getTime(),
        durationMs: pauseDuration
      });
      this.state.totalPauseMs = (this.state.totalPauseMs || 0) + pauseDuration;
      this.state.activePauseStart = null;
    }

    this.state.status = 'completed';
    this.state.clockOutTime = this.formatTime(now);
    this.state.clockOutTimestamp = now.getTime();
    this.stopTimerLoop();

    this.fetchGps().then((coords) => {
      if (coords) {
        this.state.clockOutGps = coords;
        this.notifyUpdate();
      }
    });

    this.notifyUpdate();
  }

  /**
   * Computes effective working milliseconds (total elapsed minus pauses)
   */
  getEffectiveWorkingMs() {
    if (!this.state.clockInTimestamp) return 0;
    const endTime = this.state.clockOutTimestamp || Date.now();
    const grossMs = Math.max(0, endTime - this.state.clockInTimestamp);

    let currentPauseMs = this.state.totalPauseMs || 0;
    if (this.state.status === 'paused' && this.state.activePauseStart) {
      currentPauseMs += Math.max(0, Date.now() - this.state.activePauseStart);
    }

    return Math.max(0, grossMs - currentPauseMs);
  }

  startTimerLoop() {
    this.stopTimerLoop();
    this.timerInterval = setInterval(() => {
      if (this.onUpdate) {
        this.onUpdate(this.state, this.getFormattedDuration());
      }
    }, 1000);
  }

  stopTimerLoop() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  notifyUpdate() {
    if (this.onUpdate) {
      this.onUpdate(this.state, this.getFormattedDuration());
    }
  }

  /**
   * Formats effective working duration into "Xh Ym Zs"
   */
  getFormattedDuration() {
    const ms = this.getEffectiveWorkingMs();
    const totalSecs = Math.floor(ms / 1000);
    const hours = Math.floor(totalSecs / 3600);
    const minutes = Math.floor((totalSecs % 3600) / 60);
    const seconds = totalSecs % 60;

    const pad = (n) => String(n).padStart(2, '0');
    return `${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`;
  }

  /**
   * Formats effective working duration for reports ("7h 30m")
   */
  getSummaryDuration() {
    const ms = this.getEffectiveWorkingMs();
    const totalSecs = Math.floor(ms / 1000);
    const hours = Math.floor(totalSecs / 3600);
    const minutes = Math.floor((totalSecs % 3600) / 60);
    return `${hours}h ${minutes}min`;
  }

  formatTime(date) {
    const h = String(date.getHours()).padStart(2, '0');
    const m = String(date.getMinutes()).padStart(2, '0');
    const s = String(date.getSeconds()).padStart(2, '0');
    return `${h}:${m}:${s}`;
  }

  async fetchGps() {
    if (!navigator.geolocation) return null;
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          resolve({
            lat: Number(pos.coords.latitude.toFixed(5)),
            lng: Number(pos.coords.longitude.toFixed(5)),
            accuracy: Math.round(pos.coords.accuracy)
          });
        },
        () => resolve(null),
        { timeout: 8000, enableHighAccuracy: true }
      );
    });
  }
}
