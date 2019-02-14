importScripts("/precache-manifest.b8413a481bd52ea6c8d5c6054052fdc6.js", "https://storage.googleapis.com/workbox-cdn/releases/3.6.3/workbox-sw.js");


if (workbox) {
	workbox.setConfig({
		debug: true,
	  });
    console.log(`Workbox is loaded`);

	workbox.core.setCacheNameDetails({
		prefix: 'sw-tools',
		suffix: 'v1',
		precache: 'precache',
		runtime: 'runtime-cache',
	})
	
	workbox.skipWaiting()
	workbox.clientsClaim()
	
	workbox.precaching.precacheAndRoute(self.__precacheManifest)
	
	/* workbox.routing.registerRoute(
		/.*api.*details/g,
		workbox.strategies.cacheFirst({
			cacheName: 'details-cache',
			plugins: [
				new workbox.expiration.Plugin({
					maxAgeSeconds: 30 * 24 * 60 * 60,
				}),
			],
		}),
	) */
	
	self.addEventListener('fetch', function(event) {
		console.log(event.request.headers.get("version"))
		event.respondWith(() => {
			return fetch(event.request);
		})
	  });
	  
	
	workbox.routing.registerRoute(
		/^https:\/\/fonts\.googleapis\.com/,
		workbox.strategies.staleWhileRevalidate({
			cacheName: 'google-fonts-stylesheets',
		})
	)
	
	// Cache the underlying font files with a cache-first strategy for 1 year.
	workbox.routing.registerRoute(
		/^https:\/\/fonts\.gstatic\.com/,
		workbox.strategies.cacheFirst({
			cacheName: 'google-fonts-webfonts',
			plugins: [
				new workbox.cacheableResponse.Plugin({
					statuses: [0, 200],
				}),
				new workbox.expiration.Plugin({
					maxAgeSeconds: 60 * 60 * 24 * 365,
					maxEntries: 30,
				}),
			],
		})
	)
} 
else {
    console.log(`Workbox didn't load`);
}
