const CACHE_NAME = 'qr-pix-v8';

const ASSETS_TO_CACHE = [
    "./",
    "./index.html",
    "./manifest.json",
    "./icon.svg",
    "./icon-512.png"
];

/* =========================================================
   INSTALAÇÃO
   ========================================================= */

self.addEventListener("install", function(event) {

    event.waitUntil(

        caches.open(CACHE_NAME)
            .then(function(cache) {

                return cache.addAll(
                    ASSETS_TO_CACHE
                );

            })

    );

    self.skipWaiting();
});


/* =========================================================
   ATIVAÇÃO
   ========================================================= */

self.addEventListener("activate", function(event) {

    event.waitUntil(

        caches.keys()
            .then(function(cacheNames) {

                return Promise.all(

                    cacheNames.map(function(cacheName) {

                        if (
                            cacheName !== CACHE_NAME
                        ) {

                            return caches.delete(
                                cacheName
                            );

                        }

                    })

                );

            })

            .then(function() {

                return self.clients.claim();

            })

    );

});


/* =========================================================
   REQUISIÇÕES
   ========================================================= */

self.addEventListener("fetch", function(event) {

    /*
       Apenas requisições GET podem
       ser armazenadas no cache.
    */

    if (event.request.method !== "GET") {
        return;
    }


    event.respondWith(

        caches.match(event.request)
            .then(function(cachedResponse) {

                if (cachedResponse) {
                    return cachedResponse;
                }


                return fetch(event.request)
                    .then(function(networkResponse) {

                        /*
                           Salva no cache apenas
                           respostas válidas.
                        */

                        if (
                            networkResponse &&
                            networkResponse.status === 200 &&
                            networkResponse.type !== "opaque"
                        ) {

                            const responseClone =
                                networkResponse.clone();

                            caches.open(CACHE_NAME)
                                .then(function(cache) {

                                    cache.put(
                                        event.request,
                                        responseClone
                                    );

                                });

                        }

                        return networkResponse;

                    })
                    .catch(function() {

                        /*
                           Se estiver offline e o arquivo
                           não estiver no cache, deixa o
                           navegador tratar o erro.
                        */

                        return new Response(
                            "QrPix: conteúdo indisponível offline.",
                            {
                                status: 503,
                                headers: {
                                    "Content-Type":
                                        "text/plain; charset=utf-8"
                                }
                            }
                        );

                    });

            })

    );

});
