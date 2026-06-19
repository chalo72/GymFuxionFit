export default async function handler(request, response) {
  // Usamos las variables de entorno inyectadas por Vercel
  const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
  const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;
  
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return response.status(500).json({ error: 'Faltan variables de entorno' });
  }

  try {
    // Hacemos una consulta ligera solo para decirle a Supabase "Estoy vivo"
    const res = await fetch(`${SUPABASE_URL}/rest/v1/members?select=id&limit=1`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    });
    
    if (!res.ok) {
       throw new Error('Supabase respondio con error');
    }
    
    return response.status(200).json({ status: 'Supabase Awake!', time: new Date().toISOString() });
  } catch (error) {
    return response.status(500).json({ error: error.message });
  }
}
