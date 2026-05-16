/**
 * 💾 BACKUP SERVICE — GymFuxionFit
 * Guarda snapshots de todos los datos en IndexedDB.
 * Mantiene los últimos MAX_BACKUPS backups automáticamente.
 * Se activa cada vez que se agrega o elimina información.
 */

const DB_NAME = 'fuxion_backups';
const STORE   = 'snapshots';
const MAX_BACKUPS = 5;

export interface BackupData {
  members:      any[];
  products:     any[];
  transactions: any[];
  goals:        any[];
  obligations:  any[];
  staff:        any[];
  assets:       any[];
}

export interface BackupSnapshot {
  id:        string;
  timestamp: string;
  label:     string;
  trigger:   string; // qué operación lo generó
  data:      BackupData;
}

export type BackupMeta = Omit<BackupSnapshot, 'data'>;

class BackupService {
  private db: IDBDatabase | null = null;

  private async getDB(): Promise<IDBDatabase> {
    if (this.db) return this.db;
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = (e) => {
        const db = (e.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE)) {
          const store = db.createObjectStore(STORE, { keyPath: 'id' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
      req.onsuccess = (e) => {
        this.db = (e.target as IDBOpenDBRequest).result;
        resolve(this.db);
      };
      req.onerror = () => reject(req.error);
    });
  }

  async createBackup(data: BackupData, trigger = 'manual'): Promise<string> {
    const db = await this.getDB();
    const now = new Date();
    const id = crypto.randomUUID();
    const snapshot: BackupSnapshot = {
      id,
      timestamp: now.toISOString(),
      label: now.toLocaleString('es-CO', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      }),
      trigger,
      data
    };

    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).add(snapshot);
      tx.oncomplete = () => resolve();
      tx.onerror   = () => reject(tx.error);
    });

    await this.pruneOldBackups(db);
    console.log(`💾 [BACKUP]: Snapshot "${trigger}" guardado (${snapshot.label})`);
    return id;
  }

  async listBackups(): Promise<BackupMeta[]> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx  = db.transaction(STORE, 'readonly');
      const req = tx.objectStore(STORE).index('timestamp').getAll();
      req.onsuccess = () => {
        const metas: BackupMeta[] = (req.result as BackupSnapshot[])
          .map(({ id, timestamp, label, trigger }) => ({ id, timestamp, label, trigger }))
          .reverse(); // más reciente primero
        resolve(metas);
      };
      req.onerror = () => reject(req.error);
    });
  }

  async getBackup(id: string): Promise<BackupSnapshot | null> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx  = db.transaction(STORE, 'readonly');
      const req = tx.objectStore(STORE).get(id);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror   = () => reject(req.error);
    });
  }

  /** Descarga el backup como archivo JSON */
  async downloadBackup(id?: string): Promise<void> {
    let snap: BackupSnapshot | null = null;

    if (id) {
      snap = await this.getBackup(id);
    } else {
      const list = await this.listBackups();
      if (list.length === 0) { alert('No hay backups disponibles.'); return; }
      snap = await this.getBackup(list[0].id);
    }

    if (!snap) { alert('Backup no encontrado.'); return; }

    const total =
      snap.data.members.length +
      snap.data.products.length +
      snap.data.transactions.length +
      snap.data.goals.length +
      snap.data.obligations.length +
      snap.data.staff.length +
      snap.data.assets.length;

    const blob = new Blob(
      [JSON.stringify(snap, null, 2)],
      { type: 'application/json' }
    );
    const url = URL.createObjectURL(blob);
    const a   = document.createElement('a');
    a.href     = url;
    a.download = `gymfuxion-backup-${snap.timestamp.replace(/[:.]/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    console.log(`📥 [BACKUP]: Descargado — ${total} registros (${snap.label})`);
  }

  private async pruneOldBackups(db: IDBDatabase): Promise<void> {
    const all: BackupSnapshot[] = await new Promise((resolve, reject) => {
      const tx  = db.transaction(STORE, 'readonly');
      const req = tx.objectStore(STORE).index('timestamp').getAll();
      req.onsuccess = () => resolve(req.result);
      req.onerror   = () => reject(req.error);
    });

    if (all.length <= MAX_BACKUPS) return;

    const sorted   = all.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
    const toDelete = sorted.slice(0, all.length - MAX_BACKUPS);

    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite');
      toDelete.forEach(s => tx.objectStore(STORE).delete(s.id));
      tx.oncomplete = () => resolve();
      tx.onerror    = () => reject(tx.error);
    });

    console.log(`🗑️ [BACKUP]: ${toDelete.length} backup(s) antiguo(s) eliminado(s). Se mantienen los últimos ${MAX_BACKUPS}.`);
  }
}

export const backupService = new BackupService();
