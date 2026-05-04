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
      'transactions': 'transactions'
    };
    return map[name.toLowerCase()] || name;
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

  async setDocument<T>(name: string, id: string, data: T): Promise<void> {
    const colName = this.normalizeName(name);
    try {
      // Intentamos actualizar primero
      await this.sdk.updateDocument(this.databaseId, colName, id, data as any);
    } catch (err: any) {
      // Si no existe, lo creamos
      if (err.code === 404) {
        await this.sdk.createDocument(this.databaseId, colName, id, data as any);
      } else {
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
