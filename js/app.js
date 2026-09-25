/**
 * SunLog - Main Application Controller
 * Handles UI interactions, modal controls, Sun Mode toggle,
 * offline logging workflow, and sync event handling.
 */

// Demo base64 sample photo for quick testing
const SAMPLE_PHOTO_DATA = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='360' viewBox='0 0 600 360'%3E%3Crect width='600' height='360' fill='%231f2937'/%3E%3Cpath d='M0 0l600 360M600 0L0 360' stroke='%23374151' stroke-width='2'/%3E%3Cpolygon points='300,70 370,220 230,220' fill='%23ffb703' stroke='%23000' stroke-width='8' stroke-linejoin='round'/%3E%3Ctext x='300' y='180' font-family='sans-serif' font-size='42' font-weight='bold' text-anchor='middle' fill='%23000'%3E!%3C/text%3E%3Crect x='100' y='260' width='400' height='50' rx='8' fill='%23111827' stroke='%234b5563' stroke-width='2'/%3E%3Ctext x='300' y='292' font-family='sans-serif' font-size='18' font-weight='bold' text-anchor='middle' fill='%23ffffff'%3EFIELD PHOTO: HAZARD CONE DEPLOYED%3C/text%3E%3C/svg%3E";

const SAMPLE_FORKLIFT_PHOTO = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='360' viewBox='0 0 600 360'%3E%3Crect width='600' height='360' fill='%23111827'/%3E%3Crect x='80' y='60' width='440' height='240' rx='12' fill='%231e293b' stroke='%23ffb703' stroke-width='4'/%3E%3Ctext x='300' y='160' font-family='sans-serif' font-size='48' text-anchor='middle' fill='%23ffb703'%3E⚙️%3C/text%3E%3Ctext x='300' y='210' font-family='sans-serif' font-size='20' font-weight='bold' text-anchor='middle' fill='%23ffffff'%3EEQUIPMENT TAG #FL-402%3C/text%3E%3Ctext x='300' y='245' font-family='sans-serif' font-size='15' text-anchor='middle' fill='%2394a3b8'%3EHYDRAULIC VALVE PRESSURE DROP%3C/text%3E%3C/svg%3E";

class SunLogApp {
  constructor() {
    this.currentCategory = {
      id: 'safety',
      label: 'Safety Issue',
      icon: '⚠️',
      color: '#ffb703'
    };
    this.currentPhotoData = null;
    this.audioContext = null;

    this.initDOM();
    this.bindEvents();
    this.initTheme();
    this.registerServiceWorker();
    this.seedInitialDataIfEmpty();
  }

  initDOM() {
    // Buttons & Toggles
    this.btnSunMode = document.getElementById('btn-sun-mode');
    this.sunModeIcon = document.getElementById('sun-mode-icon');
    this.sunModeText = document.getElementById('sun-mode-text');
    this.btnToggleOfflineSim = document.getElementById('btn-toggle-offline-sim');
    this.simToggleText = document.getElementById('sim-toggle-text');
    this.btnOpenLogModal = document.getElementById('btn-open-log-modal');
    this.btnCloseModal = document.getElementById('btn-close-modal');
    this.btnManualSync = document.getElementById('btn-manual-sync');
    this.btnSubmitEntry = document.getElementById('btn-submit-entry');
    this.btnGps = document.getElementById('btn-gps');
    this.btnSamplePhoto = document.getElementById('btn-sample-photo');
    this.btnRemovePhoto = document.getElementById('btn-remove-photo');

    // Indicators & Counters
    this.netStatusDot = document.getElementById('network-status-dot');
    this.netStatusText = document.getElementById('network-status-text');
    this.statQueued = document.getElementById('stat-queued');
    this.statSynced = document.getElementById('stat-synced');
    this.statTotal = document.getElementById('stat-total');
    this.feedFilterCount = document.getElementById('feed-filter-count');

    // Modal & Form Elements
    this.modalOverlay = document.getElementById('log-modal-overlay');
    this.logForm = document.getElementById('log-entry-form');
    this.categoryTiles = document.querySelectorAll('.category-tile');
    this.logNotes = document.getElementById('log-notes');
    this.logLocation = document.getElementById('log-location');
    this.cameraFileInput = document.getElementById('camera-file-input');
    this.photoPreviewWrap = document.getElementById('photo-preview-container');
    this.photoPreviewImg = document.getElementById('photo-preview-img');

    // Feed & Lightbox
    this.entriesList = document.getElementById('entries-list');
    this.lightboxModal = document.getElementById('lightbox-modal');
    this.lightboxImg = document.getElementById('lightbox-img');
    this.toastContainer = document.getElementById('toast-container');
  }

  bindEvents() {
    // Sun Mode Toggle
    this.btnSunMode.addEventListener('click', () => this.toggleSunMode());

    // Offline Simulation Toggle
    this.btnToggleOfflineSim.addEventListener('click', () => {
      const isSim = window.sunLogSync.toggleOfflineSimulation();
      this.playTactileSound(isSim ? 300 : 700);
      this.showToast(isSim ? '🔴 Simulated Offline Mode Active' : '🟢 Back Online - Resuming Auto-Sync');
    });

    // Modal Sheet Open / Close
    this.btnOpenLogModal.addEventListener('click', () => this.openModal());
    this.btnCloseModal.addEventListener('click', () => this.closeModal());
    this.modalOverlay.addEventListener('click', (e) => {
      if (e.target === this.modalOverlay) this.closeModal();
    });

    // Category Grid Selection
    this.categoryTiles.forEach(tile => {
      tile.addEventListener('click', () => {
        this.categoryTiles.forEach(t => {
          t.classList.remove('selected');
          t.setAttribute('aria-checked', 'false');
        });
        tile.classList.add('selected');
        tile.setAttribute('aria-checked', 'true');
        
        this.currentCategory = {
          id: tile.dataset.category,
          label: tile.dataset.label,
          icon: tile.dataset.icon,
          color: tile.dataset.color
        };
        this.playTactileSound(550);
      });
    });

    // Quick Note Chips
    document.querySelectorAll('.quick-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const text = chip.dataset.text;
        if (this.logNotes.value.trim().length > 0) {
          this.logNotes.value += '. ' + text;
        } else {
          this.logNotes.value = text;
        }
        this.logNotes.focus();
        this.playTactileSound(600);
      });
    });

    // Location / GPS Auto-detect
    this.btnGps.addEventListener('click', () => this.detectLocation());

    // Photo input
    this.cameraFileInput.addEventListener('change', (e) => this.handlePhotoSelected(e));
    this.btnSamplePhoto.addEventListener('click', () => {
      this.setPhotoPreview(SAMPLE_PHOTO_DATA);
      this.playTactileSound(650);
    });
    this.btnRemovePhoto.addEventListener('click', () => {
      this.clearPhotoPreview();
    });

    // Save Entry Submission
    this.btnSubmitEntry.addEventListener('click', () => this.submitLogEntry());

    // Manual Sync Button
    this.btnManualSync.addEventListener('click', () => {
      if (!window.sunLogSync.isOnline()) {
        this.showToast('⚠️ Cannot sync: App is currently Offline');
        return;
      }
      this.btnManualSync.classList.add('syncing-spin');
      this.showToast('🔄 Syncing queued logs...');
      window.sunLogSync.processQueue();
    });

    // Listen to Sync Engine events
    window.sunLogSync.onStatusChange((status) => this.updateNetworkUI(status));

    window.addEventListener('sunlog:entry-updated', (e) => {
      this.updateEntryCardState(e.detail);
      this.updateStats();
    });

    window.addEventListener('sunlog:entry-synced', (e) => {
      this.updateEntryCardState(e.detail, true);
      this.updateStats();
      this.playTactileSound(880);
    });

    window.addEventListener('sunlog:sync-complete', () => {
      this.btnManualSync.classList.remove('syncing-spin');
      this.updateStats();
    });
  }

  /* ========================================================================
     THEMING & SUN MODE
     ======================================================================== */
  initTheme() {
    const savedTheme = localStorage.getItem('sunlog_theme');
    if (savedTheme === 'sun-mode') {
      document.body.classList.add('sun-mode');
      this.updateSunModeButtonText(true);
    } else {
      this.updateSunModeButtonText(false);
    }
  }

  toggleSunMode() {
    const isSun = document.body.classList.toggle('sun-mode');
    localStorage.setItem('sunlog_theme', isSun ? 'sun-mode' : 'standard');
    this.updateSunModeButtonText(isSun);
    this.playTactileSound(isSun ? 750 : 450);
    this.showToast(isSun ? '☀️ Sun Mode Enabled (High Contrast)' : '🌙 Standard Mode Enabled');
  }

  updateSunModeButtonText(isSun) {
    if (isSun) {
      this.sunModeIcon.textContent = '🌙';
      this.sunModeText.textContent = 'NORMAL MODE';
    } else {
      this.sunModeIcon.textContent = '☀️';
      this.sunModeText.textContent = 'SUN MODE';
    }
  }

  /* ========================================================================
     NETWORK & SYNC STATUS UI
     ======================================================================== */
  updateNetworkUI(status) {
    if (status.isOnline) {
      this.netStatusDot.className = 'status-dot';
      this.netStatusText.textContent = status.isSyncing ? 'SYNCING QUEUE...' : 'ONLINE';
    } else {
      this.netStatusDot.className = 'status-dot offline';
      this.netStatusText.textContent = status.isSimulated ? 'OFFLINE (Simulated)' : 'OFFLINE (No Network)';
    }

    if (status.isSimulated) {
      this.btnToggleOfflineSim.classList.add('is-simulating');
      this.simToggleText.textContent = 'Go Online';
    } else {
      this.btnToggleOfflineSim.classList.remove('is-simulating');
      this.simToggleText.textContent = 'Simulate Offline';
    }
  }

  /* ========================================================================
     INITIAL SEED DATA
     ======================================================================== */
  async seedInitialDataIfEmpty() {
    const logs = await window.sunLogDB.getAllLogs();
    if (logs.length === 0) {
      const now = Date.now();
      const sample1 = {
        id: 'seed-1-' + now,
        category: 'safety',
        categoryLabel: 'Safety Issue',
        categoryIcon: '⚠️',
        categoryColor: '#ffb703',
        notes: 'Emergency exit corridor in Sector 4 blocked with pallet crates. Cleared pathway and flagged.',
        location: 'Sector 4 - Exit B',
        photo: SAMPLE_PHOTO_DATA,
        timestamp: now - (1000 * 60 * 25), // 25 mins ago
        createdAtFormatted: new Date(now - (1000 * 60 * 25)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        syncStatus: 'synced',
        syncedAt: now - (1000 * 60 * 24)
      };

      const sample2 = {
        id: 'seed-2-' + now,
        category: 'equipment',
        categoryLabel: 'Equipment Fault',
        categoryIcon: '⚙️',
        categoryColor: '#fb8500',
        notes: 'Forklift #FL-402 showing intermittent hydraulic pressure drop during lift cycle. Tagged out of service.',
        location: 'Warehouse Bay 3',
        photo: SAMPLE_FORKLIFT_PHOTO,
        timestamp: now - (1000 * 60 * 5), // 5 mins ago
        createdAtFormatted: new Date(now - (1000 * 60 * 5)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        syncStatus: 'queued',
        syncedAt: null
      };

      await window.sunLogDB.addLog(sample1);
      await window.sunLogDB.addLog(sample2);
    }
    
    await this.renderFeed();
    this.updateNetworkUI({
      isOnline: window.sunLogSync.isOnline(),
      isSimulated: window.sunLogSync.isSimulatedOffline,
      isSyncing: false
    });
  }

  /* ========================================================================
     MODAL CONTROLS & LOG SUBMISSION
     ======================================================================== */
  openModal() {
    this.modalOverlay.classList.add('open');
    this.logNotes.value = '';
    this.clearPhotoPreview();
    // Default location
    this.logLocation.value = 'Zone B - Active Site';
    setTimeout(() => this.logNotes.focus(), 150);
    this.playTactileSound(500);
  }

  closeModal() {
    this.modalOverlay.classList.remove('open');
  }

  detectLocation() {
    if ('geolocation' in navigator) {
      this.btnGps.textContent = '⏳ Locating...';
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude.toFixed(4);
          const lng = pos.coords.longitude.toFixed(4);
          this.logLocation.value = `Site GPS (${lat}, ${lng})`;
          this.btnGps.innerHTML = '<span>📍</span> GPS';
          this.showToast('📍 GPS Coordinates Attached');
        },
        (err) => {
          // Fallback zone
          const zones = ['Zone A - East Gate', 'Zone B - Staging', 'Dock 3 - Loading', 'Zone C - Perimeter'];
          const rand = zones[Math.floor(Math.random() * zones.length)];
          this.logLocation.value = rand;
          this.btnGps.innerHTML = '<span>📍</span> GPS';
          this.showToast(`📍 Set Location: ${rand}`);
        },
        { timeout: 4000 }
      );
    } else {
      this.logLocation.value = 'Zone B - Staging Area';
    }
  }

  handlePhotoSelected(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      this.setPhotoPreview(e.target.result);
    };
    reader.readAsDataURL(file);
  }

  setPhotoPreview(dataUrl) {
    this.currentPhotoData = dataUrl;
    this.photoPreviewImg.src = dataUrl;
    this.photoPreviewWrap.classList.add('has-photo');
  }

  clearPhotoPreview() {
    this.currentPhotoData = null;
    this.photoPreviewImg.src = '';
    this.photoPreviewWrap.classList.remove('has-photo');
    this.cameraFileInput.value = '';
  }

  async submitLogEntry() {
    const notes = this.logNotes.value.trim();
    if (!notes) {
      this.showToast('⚠️ Please enter observation notes');
      this.logNotes.focus();
      return;
    }

    const now = Date.now();
    const entry = {
      id: 'log-' + now + '-' + Math.random().toString(36).substr(2, 4),
      category: this.currentCategory.id,
      categoryLabel: this.currentCategory.label,
      categoryIcon: this.currentCategory.icon,
      categoryColor: this.currentCategory.color,
      notes: notes,
      location: this.logLocation.value.trim() || 'Site Area',
      photo: this.currentPhotoData,
      timestamp: now,
      createdAtFormatted: new Date(now).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      syncStatus: 'queued', // Always saved offline first!
      syncedAt: null
    };

    // Instant Save to IndexedDB
    await window.sunLogDB.addLog(entry);

    // Haptic & Sound Feedback
    if ('vibrate' in navigator) {
      navigator.vibrate([40, 30, 40]);
    }
    this.playTactileSound(600);

    // Close Modal
    this.closeModal();
    this.showToast('📋 Log saved to device (Queued)');

    // Refresh Feed immediately
    await this.renderFeed();

    // Trigger sync engine if online
    if (window.sunLogSync.isOnline()) {
      window.sunLogSync.processQueue();
    }
  }

  /* ========================================================================
     FEED RENDERING & CARD STATE UPDATES
     ======================================================================== */
  async renderFeed() {
    const logs = await window.sunLogDB.getAllLogs();
    
    if (!logs || logs.length === 0) {
      this.entriesList.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">📋</div>
          <h3 class="empty-title">No Field Logs Yet</h3>
          <p class="empty-sub">Tap "NEW LOG ENTRY" below to record your first on-site log.</p>
        </div>
      `;
      this.updateStats(0, 0, 0);
      return;
    }

    let queuedCount = 0;
    let syncedCount = 0;

    const cardsHtml = logs.map(entry => {
      if (entry.syncStatus === 'synced') syncedCount++;
      else queuedCount++;

      return this.generateEntryCardHtml(entry);
    }).join('');

    this.entriesList.innerHTML = cardsHtml;
    this.updateStats(queuedCount, syncedCount, logs.length);
    this.bindCardInteractions();
  }

  generateEntryCardHtml(entry) {
    let syncBadgeHtml = '';
    if (entry.syncStatus === 'synced') {
      syncBadgeHtml = `<span class="sync-badge badge-synced" id="badge-${entry.id}">Synced ✅</span>`;
    } else if (entry.syncStatus === 'syncing') {
      syncBadgeHtml = `<span class="sync-badge badge-syncing" id="badge-${entry.id}">Syncing... 🔄</span>`;
    } else {
      syncBadgeHtml = `<span class="sync-badge badge-queued" id="badge-${entry.id}">Queued — will sync ⏳</span>`;
    }

    const photoHtml = entry.photo ? `
      <div class="entry-photo-preview" data-photo="${entry.id}">
        <img src="${entry.photo}" alt="Attached Evidence Photo" loading="lazy">
      </div>
    ` : '';

    return `
      <article class="entry-card" id="card-${entry.id}">
        <div class="entry-card-header">
          <div class="entry-category-badge">
            <span>${entry.categoryIcon}</span>
            <span>${entry.categoryLabel}</span>
          </div>
          ${syncBadgeHtml}
        </div>

        <div class="entry-notes">${this.escapeHtml(entry.notes)}</div>

        ${photoHtml}

        <footer class="entry-card-footer">
          <div class="entry-time">
            <span>🕒</span> ${entry.createdAtFormatted}
          </div>
          <div class="entry-location">
            <span>📍</span> ${this.escapeHtml(entry.location)}
          </div>
        </footer>
      </article>
    `;
  }

  updateEntryCardState(entry, isNowSynced = false) {
    const badge = document.getElementById(`badge-${entry.id}`);
    const card = document.getElementById(`card-${entry.id}`);

    if (badge) {
      if (entry.syncStatus === 'synced') {
        badge.className = 'sync-badge badge-synced';
        badge.textContent = 'Synced ✅';
      } else if (entry.syncStatus === 'syncing') {
        badge.className = 'sync-badge badge-syncing';
        badge.textContent = 'Syncing... 🔄';
      } else {
        badge.className = 'sync-badge badge-queued';
        badge.textContent = 'Queued — will sync ⏳';
      }
    }

    if (card && isNowSynced) {
      card.classList.add('sync-just-completed');
      setTimeout(() => card.classList.remove('sync-just-completed'), 1300);
    }
  }

  bindCardInteractions() {
    // Click on attached photo opens lightbox
    document.querySelectorAll('.entry-photo-preview').forEach(el => {
      el.addEventListener('click', (e) => {
        const img = el.querySelector('img');
        if (img) {
          this.lightboxImg.src = img.src;
          this.lightboxModal.classList.add('open');
        }
      });
    });
  }

  async updateStats(queued = null, synced = null, total = null) {
    if (queued === null) {
      const logs = await window.sunLogDB.getAllLogs();
      queued = logs.filter(l => l.syncStatus !== 'synced').length;
      synced = logs.filter(l => l.syncStatus === 'synced').length;
      total = logs.length;
    }

    this.statQueued.textContent = queued;
    this.statSynced.textContent = synced;
    this.statTotal.textContent = total;
  }

  /* ========================================================================
     TOAST & AUDIO/HAPTIC HELPERS
     ======================================================================== */
  showToast(message, duration = 3000) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    this.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-10px)';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  playTactileSound(freq = 600) {
    try {
      if (!this.audioContext) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) this.audioContext = new AudioCtx();
      }
      if (this.audioContext && this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }
      if (this.audioContext) {
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.audioContext.currentTime);
        gain.gain.setValueAtTime(0.08, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.08);
        osc.connect(gain);
        gain.connect(this.audioContext.destination);
        osc.start();
        osc.stop(this.audioContext.currentTime + 0.08);
      }
    } catch (e) {
      // Audio not supported or blocked, graceful ignore
    }
  }

  escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
          .then(reg => console.log('SunLog ServiceWorker active:', reg.scope))
          .catch(err => console.log('ServiceWorker registration skipped:', err));
      });
    }
  }
}

// Bootstrap Application on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  window.sunLogApp = new SunLogApp();
});
