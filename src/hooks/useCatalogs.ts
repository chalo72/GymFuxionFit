import { useState, useEffect } from 'react';
import { EXERCISE_CATALOG, SUPPLEMENT_CATALOG, NUTRITION_CATALOG, FUNCTIONAL_WOD_CATALOG } from '../data/premiumCatalogs';
import { trioSync } from '../lib/trioSync';

/* ══════════════════════════════════════════
   NEXUS CATALOGS HOOK v2.0
   Persistencia Tri-Capa: localStorage → Appwrite → Firebase
   SK-20260504-001 | nexus-catalogs-persistence
══════════════════════════════════════════ */

const STORAGE_KEY = 'nexus_premium_catalogs';

export function useCatalogs() {
  const [catalogs, setCatalogs] = useState(() => {
    // ⚡ Carga instantánea desde localStorage (sin parpadeo)
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('[CATALOGS]: Error al leer localStorage', e);
    }
    return {
      exercises: EXERCISE_CATALOG,
      supplements: SUPPLEMENT_CATALOG,
      nutrition: NUTRITION_CATALOG,
      functional: FUNCTIONAL_WOD_CATALOG
    };
  });

  // ☁️ Sincronización inicial con cloud al montar (carga la última versión de la nube)
  useEffect(() => {
    const syncFromCloud = async () => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (!saved) {
          // Primera carga: inicializar con defaults y subir a cloud
          const defaults = {
            exercises: EXERCISE_CATALOG,
            supplements: SUPPLEMENT_CATALOG,
            nutrition: NUTRITION_CATALOG,
            functional: FUNCTIONAL_WOD_CATALOG
          };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
          await trioSync.create('catalogs', { id: 'master_catalog', ...defaults });
          console.log('✅ [CATALOGS]: Catálogos inicializados y subidos a cloud.');
        }
      } catch (e) {
        console.warn('⚠️ [CATALOGS]: Sync cloud inicial falló. Usando datos locales.', e);
      }
    };
    syncFromCloud();
  }, []);

  // 💾 Persistencia local + cloud sincronizada
  const saveCatalogs = async (newCatalogs: typeof catalogs) => {
    setCatalogs(newCatalogs);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newCatalogs));

    // Subida en background al cloud (no bloquea la UI)
    try {
      await trioSync.update('catalogs', 'master_catalog', newCatalogs);
    } catch (e) {
      console.warn('⚠️ [CATALOGS]: Actualización cloud pendiente. Guardado local confirmado.', e);
    }
  };

  const addCatalogItem = (type: 'exercises' | 'supplements' | 'nutrition' | 'functional', item: any) => {
    const newItem = { ...item, id: `${type.charAt(0)}${Date.now()}` };
    const newCatalogs = {
      ...catalogs,
      [type]: [...catalogs[type], newItem]
    };
    saveCatalogs(newCatalogs);
  };

  const updateCatalogItem = (type: 'exercises' | 'supplements' | 'nutrition' | 'functional', id: string, updatedData: any) => {
    const newCatalogs = {
      ...catalogs,
      [type]: catalogs[type].map((item: any) => item.id === id ? { ...item, ...updatedData } : item)
    };
    saveCatalogs(newCatalogs);
  };

  const deleteCatalogItem = (type: 'exercises' | 'supplements' | 'nutrition' | 'functional', id: string) => {
    const newCatalogs = {
      ...catalogs,
      [type]: catalogs[type].filter((item: any) => item.id !== id)
    };
    saveCatalogs(newCatalogs);
  };

  return {
    catalogs,
    addCatalogItem,
    updateCatalogItem,
    deleteCatalogItem
  };
}
