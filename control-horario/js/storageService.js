/**
 * Storage Service
 * Handles persistence for active day draft and past work logs using localStorage.
 */
export class StorageService {
  static DRAFT_KEY = 'pwa_horario_active_draft';
  static HISTORY_KEY = 'pwa_horario_history_logs';
  static SETTINGS_KEY = 'pwa_horario_settings';

  /**
   * Loads the current day draft, or creates a fresh initial state
   */
  static getActiveDraft() {
    try {
      const raw = localStorage.getItem(this.DRAFT_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.warn('StorageService: Error loading draft', e);
    }
    return this.createEmptyDraft();
  }

  /**
   * Persists the current day draft
   */
  static saveActiveDraft(draft) {
    try {
      localStorage.setItem(this.DRAFT_KEY, JSON.stringify(draft));
    } catch (e) {
      console.warn('StorageService: Error saving draft', e);
    }
  }

  /**
   * Creates an empty draft structure
   */
  static createEmptyDraft() {
    const today = new Date().toISOString().split('T')[0];
    return {
      date: today,
      operatorName: '',
      workplace: '',
      timeState: {
        status: 'idle', // 'idle' | 'working' | 'paused' | 'completed'
        clockInTime: null,
        clockInTimestamp: null,
        clockInGps: null,
        clockOutTime: null,
        clockOutTimestamp: null,
        clockOutGps: null,
        pauses: [], // [{ startTimestamp, endTimestamp, durationMs }]
        activePauseStart: null,
        totalPauseMs: 0
      },
      tasks: [], // [{ id, text, category, completed }]
      materials: [], // [{ id, name, qty }]
      photos: [], // [{ id, type: 'before'|'after', dataUrl, caption }]
      notes: '',
      signature: null
    };
  }

  /**
   * Resets the active draft
   */
  static resetActiveDraft() {
    const fresh = this.createEmptyDraft();
    this.saveActiveDraft(fresh);
    return fresh;
  }

  /**
   * Retrieves past saved logs
   */
  static getHistory() {
    try {
      const raw = localStorage.getItem(this.HISTORY_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.warn('StorageService: Error loading history', e);
    }
    return [];
  }

  /**
   * Saves a completed daily work log to history
   */
  static archiveLog(log) {
    try {
      const history = this.getHistory();
      const entry = {
        ...log,
        id: 'log_' + Date.now(),
        archivedAt: new Date().toISOString()
      };
      history.unshift(entry);
      // Keep last 60 records
      const trimmed = history.slice(0, 60);
      localStorage.setItem(this.HISTORY_KEY, JSON.stringify(trimmed));
      return entry;
    } catch (e) {
      console.warn('StorageService: Error archiving log', e);
      return null;
    }
  }

  /**
   * Deletes a record from history
   */
  static deleteFromHistory(id) {
    try {
      const history = this.getHistory().filter((item) => item.id !== id);
      localStorage.setItem(this.HISTORY_KEY, JSON.stringify(history));
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Loads general app settings (supervisor phone, company name)
   */
  static getSettings() {
    try {
      const raw = localStorage.getItem(this.SETTINGS_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return {
      companyName: 'Pixel Digital',
      supervisorPhone: '34635108640',
      supervisorName: 'Oficina / Encargado'
    };
  }

  static saveSettings(settings) {
    try {
      localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {}
  }
}
