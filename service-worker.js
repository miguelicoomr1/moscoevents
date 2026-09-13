// Service worker de Mosco Events.
//
// La version anterior cacheaba TODO lo del dominio con estrategia
// cache-first, sin caducidad ni tope, y su CACHE_NAME nunca cambiaba. Dos
// consecuencias:
//
//   1. Las galerias (248 MB entre miniaturas, optimizadas y originales) se
//      iban acumulando en el movil de cada visitante y no se liberaban nunca,
//      porque el "activate" solo borra cachés con un nombre distinto al
//      vigente y ese nombre llevaba fijo desde el primer dia.
//   2. El modo sin conexion no funcionaba, pese a existir el service worker:
//      las navegaciones se resolvian contra la red y nunca se guardaban, y la
//      unica URL precargada era manifest.json, asi que el ultimo recurso
//      (caches.match("/index.html")) apuntaba a una entrada inexistente.
//
// Ahora hay dos cachés con cometidos separados y el numero de version del
// nombre se sube a mano cuando cambia lo que se precarga.

const VERSION = "v2";
const SHELL_CACHE = `mosco-shell-${VERSION}`;
const PAGES_CACHE = `mosco-pages-${VERSION}`;
const CACHES_PROPIAS = [SHELL_CACHE, PAGES_CACHE];

// Paginas que deben poder abrirse sin conexion. Se guardan al instalar y se
// refrescan en cada visita con conexion.
const PAGINAS_PRECARGADAS = [
    "/index.html",
    "/Proximos%20Eventos/proximos-eventos.html",
    "/registro.html",
    "/normas.html",
    "/contacto.html"
];

// Recursos comunes a todas las paginas. Llevan ?v= en el HTML, asi que cada
// version es una URL distinta y basta con cache-first.
const SHELL_PRECARGADO = [
    "/manifest.json",
    "/images/base%20web/logo-header.webp",
    "/images/base%20web/favicon-32x32.png"
];

// Cuantas paginas como maximo se guardan. Evita que la caché de navegacion
// crezca sin control en un sitio con una galeria por evento.
const MAX_PAGINAS = 25;

function esRecursoDelShell(url) {
    return /\.(css|js|woff2?)$/i.test(url.pathname)
        || url.pathname === "/manifest.json"
        || url.pathname.startsWith("/images/base%20web/")
        || url.pathname.startsWith("/images/base web/");
}

// Las fotos de galeria quedan FUERA del service worker a proposito: son
// cientos de megas y el cache HTTP del navegador ya las gestiona, liberando
// espacio cuando hace falta, cosa que la Cache API no hace por su cuenta.
function esImagenDeGaleria(url) {
    const p = decodeURIComponent(url.pathname);

    return p.startsWith("/images/")
        && !p.startsWith("/images/base web/")
        && /\.(jpe?g|png|webp|gif|avif)$/i.test(p);
}

async function limitarCache(nombre, maximo) {
    const cache = await caches.open(nombre);
    const claves = await cache.keys();

    // Se borran las mas antiguas primero: keys() devuelve en orden de insercion.
    for (let i = 0; i < claves.length - maximo; i += 1) {
        await cache.delete(claves[i]);
    }
}

self.addEventListener("install", (event) => {
    self.skipWaiting();
    event.waitUntil((async () => {
        const shell = await caches.open(SHELL_CACHE);
        const paginas = await caches.open(PAGES_CACHE);

        // addAll falla entero si un solo recurso falla, asi que se piden de
        // forma independiente: una pagina renombrada no debe impedir instalar.
        await Promise.all([
            ...SHELL_PRECARGADO.map((url) => shell.add(url).catch(() => {})),
            ...PAGINAS_PRECARGADAS.map((url) => paginas.add(url).catch(() => {}))
        ]);
    })());
});

self.addEventListener("activate", (event) => {
    event.waitUntil((async () => {
        // Al subir VERSION, esto borra tambien la caché "mosco-events-v1" de
        // la version anterior, liberando lo que ya se hubiera acumulado.
        const claves = await caches.keys();

        await Promise.all(
            claves.filter((clave) => !CACHES_PROPIAS.includes(clave))
                .map((clave) => caches.delete(clave))
        );

        await self.clients.claim();
    })());
});

self.addEventListener("fetch", (event) => {
    const { request } = event;

    if (request.method !== "GET") {
        return;
    }

    const url = new URL(request.url);

    if (url.origin !== self.location.origin) {
        return;
    }

    if (esImagenDeGaleria(url)) {
        return;
    }

    // Navegacion: primero la red, para que el contenido este siempre al dia,
    // y se guarda una copia para poder servirla sin conexion.
    if (request.mode === "navigate") {
        event.respondWith((async () => {
            try {
                const respuesta = await fetch(request);

                if (respuesta.ok) {
                    const cache = await caches.open(PAGES_CACHE);

                    await cache.put(request, respuesta.clone());
                    limitarCache(PAGES_CACHE, MAX_PAGINAS);
                }

                return respuesta;
            } catch (error) {
                const cache = await caches.open(PAGES_CACHE);

                return (await cache.match(request))
                    || (await cache.match("/index.html"))
                    || Response.error();
            }
        })());
        return;
    }

    if (!esRecursoDelShell(url)) {
        return;
    }

    // CSS, JS, fuentes e iconos: cache-first. El ?v= del HTML garantiza que
    // una version nueva es una URL nueva, asi que nunca se sirve algo obsoleto.
    event.respondWith((async () => {
        const cache = await caches.open(SHELL_CACHE);
        const guardado = await cache.match(request);

        if (guardado) {
            return guardado;
        }

        const respuesta = await fetch(request);

        if (respuesta.ok) {
            cache.put(request, respuesta.clone());
        }

        return respuesta;
    })());
});
