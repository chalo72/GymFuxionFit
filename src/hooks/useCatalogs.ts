import { useState, useEffect } from 'react';
import { EXERCISE_CATALOG, SUPPLEMENT_CATALOG, NUTRITION_CATALOG, FUNCTIONAL_WOD_CATALOG } from '../data/premiumCatalogs';

const STORAGE_KEY = 'nexus_premium_catalogs';

export function useCatalogs() {
  const [catalogs, setCatalogs] = useState({
    exercises: EXERCISE_CATALOG,
    supplements: SUPPLEMENT_CATALOG,
    nutrition: NUTRITION_CATALOG,
    functional: FUNCTIONAL_WOD_CATALOG
  });

  // Load from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setCatalogs(JSON.parse(saved));
      } catch (e) {
        console.error('Error loading catalogs', e);
      }
    } else {
      // Initialize if empty
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        exercises: EXERCISE_CATALOG,
        supplements: SUPPLEMENT_CATALOG,
        nutrition: NUTRITION_CATALOG,
        functional: FUNCTIONAL_WOD_CATALOG
      }));
    }
  }, []);

  // Save to local storage whenever it changes
  const saveCatalogs = (newCatalogs: typeof catalogs) => {
    setCatalogs(newCatalogs);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newCatalogs));
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
      [type]: catalogs[type].map(item => item.id === id ? { ...item, ...updatedData } : item)
    };
    saveCatalogs(newCatalogs);
  };

  const deleteCatalogItem = (type: 'exercises' | 'supplements' | 'nutrition' | 'functional', id: string) => {
    const newCatalogs = {
      ...catalogs,
      [type]: catalogs[type].filter(item => item.id !== id)
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
