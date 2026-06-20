export interface FoodProduct {
  id: string;
  name: string;
  brand: string;
  image_url?: string;
  macros: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
  ingredients?: string;
}

const OFF_API_BASE = 'https://world.openfoodfacts.org/cgi/search.pl';

/**
 * Busca alimentos usando la API pública de Open Food Facts.
 */
export const searchFoodOFF = async (query: string): Promise<FoodProduct[]> => {
  if (!query.trim()) return [];

  const url = `${OFF_API_BASE}?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=10`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Error al conectar con Open Food Facts');
    
    const data = await response.json();
    
    if (!data.products) return [];

    return data.products.map((p: any) => ({
      id: p.id || p.code || Math.random().toString(),
      name: p.product_name || p.product_name_es || 'Alimento desconocido',
      brand: p.brands || 'Genérico',
      image_url: p.image_front_small_url || p.image_url || 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&q=80&w=200',
      macros: {
        calories: p.nutriments?.['energy-kcal_100g'] || p.nutriments?.['energy-kcal'] || 0,
        protein: p.nutriments?.proteins_100g || p.nutriments?.proteins || 0,
        carbs: p.nutriments?.carbohydrates_100g || p.nutriments?.carbohydrates || 0,
        fats: p.nutriments?.fat_100g || p.nutriments?.fat || 0
      },
      ingredients: p.ingredients_text_es || p.ingredients_text || ''
    }));
  } catch (error) {
    console.error('Error fetching food data:', error);
    return [];
  }
};
