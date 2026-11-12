import { StorageService } from './storageService.js';
import { TimeTracker } from './timeTracker.js';
import { TaskChecklist } from './taskChecklist.js';
import { SignaturePad } from './signaturePad.js';

/**
 * Main Application Controller for Control Horario & Partes de Trabajo PWA
 */
class App {
  constructor() {
    this.draft = StorageService.getActiveDraft();
    this.settings = StorageService.getSettings();
    this.draft.tasks = TaskChecklist.ensureTasks(this.draft.tasks);

    this.timeTracker = new TimeTracker(this.draft.timeState, (state, formattedDuration) => {
      this.updateTimeUI(state, formattedDuration);
      this.saveDraft();
    });

    this.signaturePad = null;
    this.initDOM();
    this.registerServiceWorker();
  }

  initDOM() {
    // Top Date & Clock
    this.clockEl = document.getElementById('liveClock');
    this.dateEl = document.getElementById('liveDate');
    this.startClock();

    // Inputs
    this.operatorInput = document.getElementById('operatorName');
    this.workplaceInput = document.getElementById('workplace');
    this.notesInput = document.getElementById('workNotes');

    if (this.operatorInput) {
      this.operatorInput.value = this.draft.operatorName || '';
      this.operatorInput.addEventListener('input', () => {
        this.draft.operatorName = this.operatorInput.value;
        this.saveDraft();
      });
    }

    if (this.workplaceInput) {
      this.workplaceInput.value = this.draft.workplace || '';
      this.workplaceInput.addEventListener('input', () => {
        this.draft.workplace = this.workplaceInput.value;
        this.saveDraft();
      });
    }

    if (this.notesInput) {
      this.notesInput.value = this.draft.notes || '';
      this.notesInput.addEventListener('input', () => {
        this.draft.notes = this.notesInput.value;
        this.saveDraft();
      });
    }

    // Quick Workplace Buttons
    document.querySelectorAll('[data-quick-workplace]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const val = btn.getAttribute('data-quick-workplace');
        if (this.workplaceInput) {
          this.workplaceInput.value = val;
          this.draft.workplace = val;
          this.saveDraft();
        }
      });
    });

    // Time Control Buttons
    this.btnClockIn = document.getElementById('btnClockIn');
    this.btnPause = document.getElementById('btnPause');
    this.btnResume = document.getElementById('btnResume');
    this.btnClockOut = document.getElementById('btnClockOut');
    this.timerDisplay = document.getElementById('shiftTimerDisplay');
    this.shiftStatusBadge = document.getElementById('shiftStatusBadge');
    this.timeAuditLog = document.getElementById('timeAuditLog');

    this.btnClockIn?.addEventListener('click', () => this.timeTracker.clockIn());
    this.btnPause?.addEventListener('click', () => this.timeTracker.pause());
    this.btnResume?.addEventListener('click', () => this.timeTracker.resume());
    this.btnClockOut?.addEventListener('click', () => {
      if (confirm('¿Confirmas que deseas fichar la salida y finalizar la jornada?')) {
        this.timeTracker.clockOut();
      }
    });

    // Signature Canvas
    const canvas = document.getElementById('signatureCanvas');
    if (canvas) {
      this.signaturePad = new SignaturePad(canvas, (dataUrl) => {
        this.draft.signature = dataUrl;
        this.saveDraft();
      });
      if (this.draft.signature) {
        this.signaturePad.loadDataUrl(this.draft.signature);
      }
    }

    document.getElementById('btnClearSignature')?.addEventListener('click', () => {
      this.signaturePad?.clear();
      this.draft.signature = null;
      this.saveDraft();
    });

    // Materials Elements
    this.materialNameInput = document.getElementById('materialName');
    this.materialQtyInput = document.getElementById('materialQty');
    this.btnAddMaterial = document.getElementById('btnAddMaterial');
    this.materialsList = document.getElementById('materialsList');

    this.btnAddMaterial?.addEventListener('click', () => this.addMaterial());

    // Photos Elements
    this.photoInput = document.getElementById('photoInput');
    this.photoTypeSelect = document.getElementById('photoType');
    this.photosGallery = document.getElementById('photosGallery');

    this.photoInput?.addEventListener('change', (e) => this.handlePhotoUpload(e));

    // Custom Task Elements
    this.customTaskInput = document.getElementById('customTaskText');
    this.btnAddCustomTask = document.getElementById('btnAddCustomTask');
    this.btnAddCustomTask?.addEventListener('click', () => this.addCustomTask());

    // Action Buttons
    document.getElementById('btnShareWhatsApp')?.addEventListener('click', () => this.shareWhatsApp());
    document.getElementById('btnPrintReport')?.addEventListener('click', () => window.print());
    document.getElementById('btnArchiveDay')?.addEventListener('click', () => this.archiveDay());
    document.getElementById('btnOpenHistory')?.addEventListener('click', () => this.openHistoryModal());
    document.getElementById('btnCloseHistory')?.addEventListener('click', () => this.closeHistoryModal());
    document.getElementById('btnOpenSettings')?.addEventListener('click', () => this.openSettingsModal());
    document.getElementById('btnCloseSettings')?.addEventListener('click', () => this.closeSettingsModal());
    document.getElementById('btnSaveSettings')?.addEventListener('click', () => this.saveSettingsFromModal());

    // Render components
    this.renderTasks();
    this.renderMaterials();
    this.renderPhotos();
    this.updateTimeUI(this.draft.timeState, this.timeTracker.getFormattedDuration());
  }

  startClock() {
    const update = () => {
      const now = new Date();
      if (this.clockEl) {
        this.clockEl.textContent = now.toLocaleTimeString('es-ES', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        });
      }
      if (this.dateEl) {
        this.dateEl.textContent = now.toLocaleDateString('es-ES', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        });
      }
    };
    update();
    setInterval(update, 1000);
  }

  saveDraft() {
    StorageService.saveActiveDraft(this.draft);
  }

  updateTimeUI(state, formattedDuration) {
    if (this.timerDisplay) {
      this.timerDisplay.textContent = formattedDuration || '00h 00m 00s';
    }

    if (this.shiftStatusBadge) {
      this.shiftStatusBadge.className = 'status-pill';
      switch (state.status) {
        case 'working':
          this.shiftStatusBadge.textContent = '● Trabajando';
          this.shiftStatusBadge.classList.add('status-pill--working');
          break;
        case 'paused':
          this.shiftStatusBadge.textContent = '⏸ En Pausa / Descanso';
          this.shiftStatusBadge.classList.add('status-pill--paused');
          break;
        case 'completed':
          this.shiftStatusBadge.textContent = '✔ Jornada Finalizada';
          this.shiftStatusBadge.classList.add('status-pill--completed');
          break;
        default:
          this.shiftStatusBadge.textContent = '○ Sin Iniciar';
          this.shiftStatusBadge.classList.add('status-pill--idle');
      }
    }

    // Controls visibility
    if (this.btnClockIn) this.btnClockIn.style.display = state.status === 'idle' ? 'flex' : 'none';
    if (this.btnPause) this.btnPause.style.display = state.status === 'working' ? 'flex' : 'none';
    if (this.btnResume) this.btnResume.style.display = state.status === 'paused' ? 'flex' : 'none';
    if (this.btnClockOut) this.btnClockOut.style.display = (state.status === 'working' || state.status === 'paused') ? 'flex' : 'none';

    // Audit list
    if (this.timeAuditLog) {
      const items = [];
      if (state.clockInTime) {
        const gps = state.clockInGps ? `(GPS ±${state.clockInGps.accuracy}m)` : '';
        items.push(`<li><strong>Entrada:</strong> ${state.clockInTime} <span class="gps-tag">${gps}</span></li>`);
      }
      if (state.pauses && state.pauses.length > 0) {
        state.pauses.forEach((p, idx) => {
          const start = new Date(p.startTimestamp).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
          const end = new Date(p.endTimestamp).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
          const min = Math.round(p.durationMs / 60000);
          items.push(`<li><strong>Pausa #${idx + 1}:</strong> ${start} a ${end} (${min} min)</li>`);
        });
      }
      if (state.clockOutTime) {
        const gps = state.clockOutGps ? `(GPS ±${state.clockOutGps.accuracy}m)` : '';
        items.push(`<li><strong>Salida:</strong> ${state.clockOutTime} <span class="gps-tag">${gps}</span></li>`);
      }
      this.timeAuditLog.innerHTML = items.length > 0 ? items.join('') : '<li class="empty-state">No hay registros de fichaje para hoy.</li>';
    }
  }

  renderTasks() {
    const container = document.getElementById('tasksCategoryList');
    const progressEl = document.getElementById('tasksProgressSummary');
    if (!container) return;

    // Group tasks by category
    const categoriesMap = {};
    let completedCount = 0;

    this.draft.tasks.forEach((task) => {
      if (!categoriesMap[task.category]) {
        categoriesMap[task.category] = [];
      }
      categoriesMap[task.category].push(task);
      if (task.completed) completedCount++;
    });

    if (progressEl) {
      const total = this.draft.tasks.length;
      progressEl.textContent = `${completedCount} de ${total} completadas (${total > 0 ? Math.round((completedCount / total) * 100) : 0}%)`;
    }

    container.innerHTML = Object.entries(categoriesMap)
      .map(([categoryName, tasks]) => {
        const taskItems = tasks
          .map(
            (t) => `
          <label class="task-checkbox-item ${t.completed ? 'is-completed' : ''}" data-task-id="${t.id}">
            <input type="checkbox" ${t.completed ? 'checked' : ''}>
            <span class="task-checkbox-custom"></span>
            <span class="task-text">${t.text}</span>
          </label>
        `
          )
          .join('');

        return `
        <div class="task-category-group">
          <h4 class="task-category-title">${categoryName}</h4>
          <div class="task-category-items">
            ${taskItems}
          </div>
        </div>
      `;
      })
      .join('');

    // Attach checkbox events
    container.querySelectorAll('.task-checkbox-item input').forEach((checkbox) => {
      checkbox.addEventListener('change', (e) => {
        const parent = e.target.closest('.task-checkbox-item');
        const taskId = parent.getAttribute('data-task-id');
        const task = this.draft.tasks.find((t) => t.id === taskId);
        if (task) {
          task.completed = e.target.checked;
          parent.classList.toggle('is-completed', task.completed);
          this.saveDraft();
          // Update progress text
          const total = this.draft.tasks.length;
          const completed = this.draft.tasks.filter((t) => t.completed).length;
          if (progressEl) {
            progressEl.textContent = `${completed} de ${total} completadas (${Math.round((completed / total) * 100)}%)`;
          }
        }
      });
    });
  }

  addCustomTask() {
    if (!this.customTaskInput) return;
    const text = this.customTaskInput.value.trim();
    if (!text) return;

    this.draft.tasks.push({
      id: 'task_custom_' + Date.now(),
      category: '⭐ Tareas Específicas / Adicionales',
      text: text,
      completed: true
    });

    this.customTaskInput.value = '';
    this.saveDraft();
    this.renderTasks();
  }

  addMaterial() {
    const name = this.materialNameInput?.value.trim();
    const qty = this.materialQtyInput?.value.trim();
    if (!name) return;

    this.draft.materials.push({
      id: 'mat_' + Date.now(),
      name: name,
      qty: qty || '1 ud'
    });

    if (this.materialNameInput) this.materialNameInput.value = '';
    if (this.materialQtyInput) this.materialQtyInput.value = '';
    this.saveDraft();
    this.renderMaterials();
  }

  renderMaterials() {
    if (!this.materialsList) return;
    if (this.draft.materials.length === 0) {
      this.materialsList.innerHTML = '<p class="empty-state">Ningún material o pieza añadido hoy.</p>';
      return;
    }

    this.materialsList.innerHTML = this.draft.materials
      .map(
        (m) => `
      <div class="material-chip">
        <span class="material-chip__name">${m.name}</span>
        <span class="material-chip__qty">${m.qty}</span>
        <button type="button" class="material-chip__delete" data-material-id="${m.id}" aria-label="Eliminar material">&times;</button>
      </div>
    `
      )
      .join('');

    this.materialsList.querySelectorAll('.material-chip__delete').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-material-id');
        this.draft.materials = this.draft.materials.filter((m) => m.id !== id);
        this.saveDraft();
        this.renderMaterials();
      });
    });
  }

  async handlePhotoUpload(e) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const type = this.photoTypeSelect ? this.photoTypeSelect.value : 'after';
    const statusMsg = document.getElementById('photoUploadStatus');
    if (statusMsg) statusMsg.textContent = 'Procesando y optimizando imagen...';

    try {
      for (const file of files) {
        const compressedDataUrl = await TaskChecklist.compressImage(file);
        this.draft.photos.push({
          id: 'photo_' + Date.now(),
          type: type,
          dataUrl: compressedDataUrl,
          createdAt: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
        });
      }
      this.saveDraft();
      this.renderPhotos();
      if (statusMsg) statusMsg.textContent = '¡Foto añadida con éxito!';
      setTimeout(() => {
        if (statusMsg) statusMsg.textContent = '';
      }, 3000);
    } catch (err) {
      console.error(err);
      if (statusMsg) statusMsg.textContent = 'Error al procesar la foto.';
    } finally {
      e.target.value = '';
    }
  }

  renderPhotos() {
    if (!this.photosGallery) return;
    if (this.draft.photos.length === 0) {
      this.photosGallery.innerHTML = '<p class="empty-state">Sin fotos adjuntas hoy.</p>';
      return;
    }

    this.photosGallery.innerHTML = this.draft.photos
      .map(
        (p) => `
      <div class="photo-card" data-photo-id="${p.id}">
        <img src="${p.dataUrl}" alt="Evidencia de trabajo" loading="lazy">
        <span class="photo-badge ${p.type === 'before' ? 'photo-badge--before' : 'photo-badge--after'}">
          ${p.type === 'before' ? '📸 Antes' : '✨ Después'}
        </span>
        <button type="button" class="photo-delete-btn" data-delete-photo="${p.id}" aria-label="Eliminar foto">&times;</button>
      </div>
    `
      )
      .join('');

    this.photosGallery.querySelectorAll('[data-delete-photo]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-delete-photo');
        this.draft.photos = this.draft.photos.filter((p) => p.id !== id);
        this.saveDraft();
        this.renderPhotos();
      });
    });
  }

  generateWhatsAppReportText() {
    const operator = this.draft.operatorName || 'Operario No Especificado';
    const workplace = this.draft.workplace || 'Centro / Obra No Especificado';
    const date = new Date(this.draft.date).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

    const timeState = this.draft.timeState;
    const duration = this.timeTracker.getSummaryDuration();
    const inTime = timeState.clockInTime || 'No registrado';
    const outTime = timeState.clockOutTime || (timeState.status === 'working' ? 'En curso' : 'Pendiente');
    const pausesCount = timeState.pauses ? timeState.pauses.length : 0;
    const totalPauseMin = Math.round((timeState.totalPauseMs || 0) / 60000);

    const completedTasks = this.draft.tasks.filter((t) => t.completed);

    let text = `📋 *PARTE DE TRABAJO Y CONTROL HORARIO*\n`;
    text += `🏢 *${this.settings.companyName || 'Estudio 01'}*\n`;
    text += `👤 *Operario:* ${operator}\n`;
    text += `📍 *Lugar / Cliente:* ${workplace}\n`;
    text += `📅 *Fecha:* ${date}\n\n`;

    text += `⏱️ *REGISTRO DE HORAS:*\n`;
    text += `• Entrada: ${inTime}\n`;
    text += `• Salida: ${outTime}\n`;
    if (pausesCount > 0) {
      text += `• Pausas: ${pausesCount} (${totalPauseMin} min total)\n`;
    }
    text += `• *Tiempo Efectivo:* ${duration}\n\n`;

    text += `✅ *TAREAS COMPLETADAS (${completedTasks.length}/${this.draft.tasks.length}):*\n`;
    if (completedTasks.length > 0) {
      completedTasks.forEach((t) => {
        text += `• ${t.text}\n`;
      });
    } else {
      text += `• (Ninguna tarea marcada)\n`;
    }
    text += `\n`;

    if (this.draft.materials.length > 0) {
      text += `📦 *MATERIALES CONSUMIDOS:*\n`;
      this.draft.materials.forEach((m) => {
        text += `• ${m.name} (${m.qty})\n`;
      });
      text += `\n`;
    }

    if (this.draft.photos.length > 0) {
      text += `📸 *FOTOS ADJUNTAS:* ${this.draft.photos.length} fotos guardadas en el parte oficial.\n\n`;
    }

    if (this.draft.notes) {
      text += `📝 *OBSERVACIONES / INCIDENCIAS:*\n${this.draft.notes}\n\n`;
    }

    text += `✍️ *Firma:* ${this.draft.signature ? 'Registrada digitalmente en pantalla' : 'Pendiente'}\n`;
    text += `_Generado vía PWA Control Horario_`;

    return text;
  }

  shareWhatsApp() {
    const text = this.generateWhatsAppReportText();
    const phone = this.settings.supervisorPhone || '34635108640';
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  }

  archiveDay() {
    if (!confirm('¿Deseas guardar este parte en el historial y comenzar un nuevo día en blanco?')) {
      return;
    }
    // Calculate final duration
    const archived = StorageService.archiveLog({
      ...this.draft,
      effectiveDuration: this.timeTracker.getSummaryDuration()
    });

    if (archived) {
      alert('¡Parte archivado correctamente en el historial!');
      this.draft = StorageService.resetActiveDraft();
      this.draft.tasks = TaskChecklist.ensureTasks(this.draft.tasks);
      this.timeTracker = new TimeTracker(this.draft.timeState, (state, formattedDuration) => {
        this.updateTimeUI(state, formattedDuration);
        this.saveDraft();
      });
      if (this.operatorInput) this.operatorInput.value = '';
      if (this.workplaceInput) this.workplaceInput.value = '';
      if (this.notesInput) this.notesInput.value = '';
      this.signaturePad?.clear();
      this.renderTasks();
      this.renderMaterials();
      this.renderPhotos();
      this.updateTimeUI(this.draft.timeState, this.timeTracker.getFormattedDuration());
    }
  }

  openHistoryModal() {
    const modal = document.getElementById('historyModal');
    const list = document.getElementById('historyLogsList');
    if (!modal || !list) return;

    const history = StorageService.getHistory();
    if (history.length === 0) {
      list.innerHTML = '<p class="empty-state">No hay partes archivados todavía.</p>';
    } else {
      list.innerHTML = history
        .map(
          (item) => `
        <div class="history-card" data-history-id="${item.id}">
          <div class="history-card-header">
            <strong>${item.date} · ${item.workplace || 'Sin lugar'}</strong>
            <span class="history-duration">${item.effectiveDuration || 'Jornada'}</span>
          </div>
          <div class="history-card-body">
            <p><strong>Operario:</strong> ${item.operatorName || 'No indicado'}</p>
            <p><strong>Tareas completadas:</strong> ${item.tasks ? item.tasks.filter((t) => t.completed).length : 0} tareas</p>
            <p><strong>Fichaje:</strong> ${item.timeState?.clockInTime || '--'} a ${item.timeState?.clockOutTime || '--'}</p>
          </div>
          <div class="history-card-actions">
            <button type="button" class="btn btn-sm btn-outline btn-delete-history" data-id="${item.id}">Eliminar</button>
          </div>
        </div>
      `
        )
        .join('');

      list.querySelectorAll('.btn-delete-history').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const id = btn.getAttribute('data-id');
          if (confirm('¿Eliminar este parte del historial?')) {
            StorageService.deleteFromHistory(id);
            this.openHistoryModal();
          }
        });
      });
    }

    modal.classList.add('is-open');
  }

  closeHistoryModal() {
    document.getElementById('historyModal')?.classList.remove('is-open');
  }

  openSettingsModal() {
    const modal = document.getElementById('settingsModal');
    if (!modal) return;
    const phoneInput = document.getElementById('settingsSupervisorPhone');
    const companyInput = document.getElementById('settingsCompanyName');
    if (phoneInput) phoneInput.value = this.settings.supervisorPhone || '';
    if (companyInput) companyInput.value = this.settings.companyName || '';
    modal.classList.add('is-open');
  }

  closeSettingsModal() {
    document.getElementById('settingsModal')?.classList.remove('is-open');
  }

  saveSettingsFromModal() {
    const phone = document.getElementById('settingsSupervisorPhone')?.value.trim();
    const company = document.getElementById('settingsCompanyName')?.value.trim();
    this.settings.supervisorPhone = phone ? phone.replace(/\D/g, '') : '34635108640';
    this.settings.companyName = company || 'Estudio 01';
    StorageService.saveSettings(this.settings);
    this.closeSettingsModal();
    alert('Configuración guardada correctamente.');
  }

  registerServiceWorker() {
    if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
      navigator.serviceWorker
        .register('./sw.js')
        .then(() => console.info('Control Horario PWA: Service Worker registrado con éxito'))
        .catch((err) => console.warn('Service Worker registration skipped/failed', err));
    }
  }
}

// Bootstrap
window.addEventListener('DOMContentLoaded', () => {
  new App();
});
