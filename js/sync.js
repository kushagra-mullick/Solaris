/**
 * SunLog - Sync Engine & Connectivity Monitor
 * Manages network status, mock offline simulation, and sync dispatch.
 */

class SunLogSync {
  constructor() {
    this.isSimulatedOffline = false;
    this.isSyncing = false;
    this.listeners = [];
    this.lastSyncTime = null;

    // Real browser network events
    window.addEventListener('online', () => this.handleNetworkChange());
    window.addEventListener('offline', () => this.handleNetworkChange());

    // Auto-check periodically
    setInterval(() => {
      if (this.isOnline() && !this.isSyncing) {
        this.processQueue();
      }
    }, 4000);
  }

  isOnline() {
    if (this.isSimulatedOffline) return false;
    return navigator.onLine;
  }

  setSimulatedOffline(status) {
    this.isSimulatedOffline = status;
    this.notifyStatusChange();
    if (this.isOnline()) {
      this.processQueue();
    }
  }

  toggleOfflineSimulation() {
    this.setSimulatedOffline(!this.isSimulatedOffline);
    return this.isSimulatedOffline;
  }

  onStatusChange(callback) {
    this.listeners.push(callback);
  }

  notifyStatusChange() {
    const status = {
      isOnline: this.isOnline(),
      isSimulated: this.isSimulatedOffline,
      isSyncing: this.isSyncing,
      lastSyncTime: this.lastSyncTime
    };
    this.listeners.forEach(cb => {
      try { cb(status); } catch (e) { console.error(e); }
    });
  }

  handleNetworkChange() {
    this.notifyStatusChange();
    if (this.isOnline()) {
      this.processQueue();
    }
  }

  async processQueue(onEntryUpdated = null) {
    if (this.isSyncing) return;
    if (!this.isOnline()) return;

    const queuedLogs = await window.sunLogDB.getQueuedLogs();
    if (!queuedLogs || queuedLogs.length === 0) {
      return;
    }

    this.isSyncing = true;
    this.notifyStatusChange();

    try {
      // Process queued logs sequentially for realistic sync feedback
      for (const entry of queuedLogs) {
        if (!this.isOnline()) {
          // Went offline mid-sync
          break;
        }

        // Set status to syncing
        entry.syncStatus = 'syncing';
        await window.sunLogDB.updateLog(entry);
        if (onEntryUpdated) onEntryUpdated(entry);
        window.dispatchEvent(new CustomEvent('sunlog:entry-updated', { detail: entry }));

        // Simulated network transmission latency (650ms - 900ms)
        await new Promise(r => setTimeout(r, 750));

        // Mark as synced
        entry.syncStatus = 'synced';
        entry.syncedAt = Date.now();
        await window.sunLogDB.updateLog(entry);
        
        if (onEntryUpdated) onEntryUpdated(entry);
        window.dispatchEvent(new CustomEvent('sunlog:entry-synced', { detail: entry }));
      }
      this.lastSyncTime = Date.now();
    } catch (err) {
      console.error('Sync processing error:', err);
    } finally {
      this.isSyncing = false;
      this.notifyStatusChange();
      window.dispatchEvent(new CustomEvent('sunlog:sync-complete'));
    }
  }
}

window.sunLogSync = new SunLogSync();
