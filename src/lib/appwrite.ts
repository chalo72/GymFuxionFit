import { Client, Databases, Account } from 'appwrite';

/* ══════════════════════════════════════════
   APPWRITE CORE (EL CAPITÁN)
   Persistence Layer
══════════════════════════════════════════ */

const endpoint = import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1';
const projectId = import.meta.env.VITE_APPWRITE_PROJECT_ID;

if (!projectId) {
  console.warn("⚠️ Appwrite Project ID no encontrado en .env");
}

export const appwriteClient = new Client();
appwriteClient
    .setEndpoint(endpoint)
    .setProject(projectId);

export const appwriteDatabases = new Databases(appwriteClient);
export const appwriteAccount = new Account(appwriteClient);

// Helpers para colecciones
export const getDatabaseId = () => import.meta.env.VITE_APPWRITE_DATABASE_ID || '';

export const hasAppwrite = () => !!projectId;
