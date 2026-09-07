export async function unregister() {
    const APP_NAME = "seawind-lrc-maker";
    if ("serviceWorker" in navigator) {
        await caches.keys().then(async (cacheNames) => {
            return Promise.all(
                cacheNames.filter((cacheName) => cacheName.startsWith(APP_NAME)).map(async (cacheName) => caches.delete(cacheName)),
            );
        });
        await navigator.serviceWorker.getRegistration().then((registration) => {
            if (registration) {
                void registration.unregister().then(() => location.reload());
            }
        });
    }
}
