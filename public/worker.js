let geoWorkerPort;

self.addEventListener("install", function(event) {
  self.skipWaiting();
});
self.addEventListener("activate", function(event) {
  console.log("hello");
});

self.addEventListener("message", function(event) {
  geoWorkerPort = event.ports[0];
});
