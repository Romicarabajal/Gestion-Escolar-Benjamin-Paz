const VERSION = "v5"; // Versión de los archivos guardados.
const NOMBRE_CACHE = "escuela-benjamin-paz-" + VERSION; // Caché exclusiva de esta aplicación.
const ARCHIVOS = [ // Recursos locales disponibles sin conexión.
  "./", // Inicio del sitio.
  "./index.html", // Estructura de la página.
  "./styles.css", // Diseño de la aplicación.
  "./app.js", // Funciones de gestión escolar.
  "./manifest.json", // Configuración para instalar la app.
  "./icono-192.png", // Ícono pequeño; coincide con el manifiesto.
  "./icono-512.png" // Ícono grande; coincide con el manifiesto.
]; // Fin de los recursos.
self.addEventListener("install", function (evento) { // Prepara la versión nueva.
  evento.waitUntil( // Espera hasta guardar todos los archivos.
    caches.open(NOMBRE_CACHE).then(function (cache) { // Abre la caché actual.
      return cache.addAll(ARCHIVOS); // Descarga y almacena los recursos.
    }) // Finaliza la preparación.
  ); // Mantiene el evento activo mientras trabaja.
}); // Fin de la instalación.
self.addEventListener("activate", function (evento) { // Activa la versión instalada.
  evento.waitUntil( // Espera a terminar la limpieza.
    caches.keys().then(function (nombres) { // Consulta las cachés existentes.
      return Promise.all(nombres.map(function (nombre) { // Revisa cada caché.
        if (nombre.startsWith("escuela-benjamin-paz-") && nombre !== NOMBRE_CACHE) { // Identifica versiones anteriores propias.
          return caches.delete(nombre); // Elimina los archivos antiguos.
        } // Conserva las cachés ajenas y la actual.
        return Promise.resolve(); // Continúa sin eliminar.
      })); // Espera todas las operaciones.
    }).then(function () { return self.clients.claim(); }) // Controla las páginas abiertas dentro del alcance.
  ); // Completa la activación.
}); // Fin de la activación.
self.addEventListener("fetch", function (evento) { // Atiende solicitudes del navegador.
  if (evento.request.method !== "GET") return; // Solo procesa lecturas.
  if (new URL(evento.request.url).origin !== self.location.origin) return; // Las fuentes externas quedan a cargo del navegador.
  evento.respondWith( // Responde con la estrategia primero la caché.
    caches.open(NOMBRE_CACHE).then(function (cache) { // Abre los recursos de esta versión.
      return cache.match(evento.request); // Busca la copia local.
    }).then(function (respuesta) { // Revisa si encontró el recurso.
      return respuesta || fetch(evento.request); // Devuelve la copia o busca en internet.
    }) // Sin copia y sin conexión, la solicitud falla.
  ); // Entrega el resultado.
}); // Fin del evento de lectura.
