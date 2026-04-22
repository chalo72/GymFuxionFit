import { useEffect } from 'react';
import versionData from '../../version.json';

export const useAutoUpdate = () => {
  useEffect(() => {
    const checkVersion = async () => {
      try {
        // Cache-busting fetch para obtener el archivo REAL del servidor
        const response = await fetch(`/version.json?t=${Date.now()}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });
        const serverVersion = await response.json();

        if (serverVersion.version !== versionData.version) {
          console.log(`🚀 Nueva versión detectada: ${serverVersion.version}. Actualizando...`);
          // Limpiamos caché y recargamos
          if ('caches' in window) {
            const names = await caches.keys();
            await Promise.all(names.map(name => caches.delete(name)));
          }
          window.location.reload();
        }
      } catch (error) {
        console.error('Error al verificar versión:', error);
      }
    };

    // Verificar al cargar y luego cada 5 minutos
    checkVersion();
    const interval = setInterval(checkVersion, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);
};
