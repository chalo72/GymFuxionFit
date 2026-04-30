import { useEffect } from 'react';
// 🧠 Importamos los datos locales de versión generados durante el build. 
// ⚖️ Esto sirve como "línea base" para comparar lo que el cliente tiene instalado actualmente.
import versionData from '../../version.json';

/**
 * 🎓 NEXUS AUTO-UPDATE HOOK
 * 🧠 Misión: Evitar que el usuario use código viejo debido a la caché agresiva de las PWA.
 * ⚖️ Arquitectura: Estrategia de "Cache-Busting" + "Hard-Reload".
 */
export const useAutoUpdate = () => {
  useEffect(() => {
    // 🧠 Definimos la lógica de verificación como una función asíncrona interna.
    const checkVersion = async () => {
      try {
        // 🚀 CACHE-BUSTING FETCH: Obtenemos el archivo REAL del servidor.
        // 🧠 Usamos ?t=${Date.now()} para que cada petición sea única y la red no nos devuelva una respuesta guardada.
        const response = await fetch(`/version.json?t=${Date.now()}`, {
          cache: 'no-store', // 🧠 Indica al navegador que ignore su caché interna.
          headers: {
            'Cache-Control': 'no-cache', // ⚖️ Asegura que incluso proxies intermedios nos den el dato fresco.
            'Pragma': 'no-cache'
          }
        });
        const serverVersion = await response.json();

        // 🧠 Analizamos la URL actual para ver si ya venimos de un refresco forzado reciente.
        const urlParams = new URLSearchParams(window.location.search);
        const currentVParam = urlParams.get('v');

        // ⚖️ LA GRAN COMPARACIÓN:
        // Si la versión del servidor es distinta a la local Y no estamos ya en la URL de esa versión...
        if (serverVersion.version !== versionData.version && currentVParam !== serverVersion.version) {
          console.log(`🚀 Nueva versión detectada: ${serverVersion.version}. Forzando sincronización única...`);
          
          // 🛡️ PASO 1: PURGA DE STORAGE (Caches API)
          // 🧠 Los Service Workers guardan el código en 'caches'. Aquí las buscamos y borramos todas.
          if ('caches' in window) {
            const names = await caches.keys();
            // ⚖️ Borramos CADA caché para asegurar que el navegador se vea obligado a pedir archivos nuevos.
            await Promise.all(names.map(name => caches.delete(name)));
          }

          // 🛡️ PASO 2: REDIRECCIÓN ATÓMICA
          // 🧠 Creamos una nueva URL inyectando el parámetro 'v' (version identifier).
          const newUrl = new URL(window.location.href);
          newUrl.searchParams.set('v', serverVersion.version);
          // ⚖️ Redirigimos: window.location.href limpia el estado de React y recarga el index.html desde el servidor.
          window.location.href = newUrl.toString();
        }
      } catch (error) {
        // 🧠 Si algo falla (ej: modo offline), fallamos silenciosamente para no interrumpir la experiencia.
        console.error('Error al verificar versión:', error);
      }
    };

    // 🏁 EJECUCIÓN AL INICIO: Verificamos la versión en cuanto la app se monta en el navegador.
    checkVersion();

    // ⏲️ MONITOR CONTINUO: Verificamos cada 5 minutos (300,000 milisegundos).
    // ⚖️ Balance entre seguridad de actualización y uso de recursos/batería.
    const interval = setInterval(checkVersion, 5 * 60 * 1000);

    // 🧹 GARBAGE COLLECTION: Si el usuario sale de la app o el componente se desmonta, limpiamos el intervalo.
    // ⚖️ Esto evita fugas de memoria (memory leaks) y procesos fantasma en segundo plano.
    return () => clearInterval(interval);
  }, []); // ⚖️ El array vacío asegura que este efecto solo se inicie UNA VEZ por sesión.
};
