import { Client, Databases, ID, Query } from 'appwrite';
import { DatabaseAdapter } from './dbAdapter';

/**
 * 🖋️ APPWRITE ADAPTER
 * Implementación de la interfaz usando Appwrite (Open Source Freedom).
 */
export class AppwriteAdapter implements DatabaseAdapter {
  private sdk: Databases;
  private client: Client;
  private databaseId: string;

  constructor(endpoint: string, projectId: string, databaseId: string) {
    this.client = new Client()
      .setEndpoint(endpoint)
      .setProject(projectId);
    this.sdk = new Databases(this.client);
    this.databaseId = databaseId;
  }

  async init(): Promise<void> {
    console.log("🖋️ Appwrite Adapter Initialized");
  }

  private normalizeName(name: string): string {
    const map: Record<string, string> = {
      'products': 'Productos',
      'members': 'members',
      'transactions': 'transactions',
      'staff': 'staff',
      'goals': 'goals'
    };
    const finalId = map[name.toLowerCase()] || name;
    console.log(`[APPWRITE-ADAPTER]: Mapping '${name}' -> '${finalId}'`);
    return finalId;
  }

  async getCollection<T>(name: string): Promise<T[]> {
    const colName = this.normalizeName(name);
    const res = await this.sdk.listDocuments(this.databaseId, colName);
    return res.documents.map(d => ({ ...d, id: d.$id })) as T[];
  }

  async getDocument<T>(name: string, id: string): Promise<T | null> {
    try {
      const colName = this.normalizeName(name);
      const doc = await this.sdk.getDocument(this.databaseId, colName, id);
      return { ...doc, id: doc.$id } as T;
    } catch {
      return null;
    }
  }

  private scrubData(data: any): any {
    const scrubbed = { ...data };
    const keysToRemove = [
      '$id', '$collectionId', '$databaseId', '$createdAt', '$updatedAt', 
      '$permissions', 'id', 'ID', '$collection', '$database'
    ];
    keysToRemove.forEach(key => delete scrubbed[key]);
    return scrubbed;
  }

  async setDocument<T>(name: string, id: string, data: T): Promise<void> {
    const colName = this.normalizeName(name);
    const cleanData = this.scrubData(data);
    
    try {
      await this.sdk.updateDocument(this.databaseId, colName, id, cleanData);
    } catch (err: any) {
      if (err.code === 404) {
        await this.sdk.createDocument(this.databaseId, colName, id, cleanData);
      } else {
        console.error(`❌ [APPWRITE] Error en setDocument (${name}/${id}):`, err);
        throw err;
      }
    }
  }

  async deleteDocument(name: string, id: string): Promise<void> {
    const colName = this.normalizeName(name);
    await this.sdk.deleteDocument(this.databaseId, colName, id);
  }

  subscribe<T>(name: string, callback: (data: T[]) => void): () => void {
    const colName = this.normalizeName(name);
    // Para Appwrite Realtime, usamos el cliente almacenado
    try {
      this.client.subscribe(`databases.${this.databaseId}.collections.${colName}.documents`, () => {
        // Al recibir un cambio, podríamos refrescar la colección completa o disparar el callback
        this.getCollection<T>(name).then(callback);
      });
    } catch (e) {
      console.warn("Appwrite Realtime subscription failed:", e);
    }
    return () => {};
  }
}
