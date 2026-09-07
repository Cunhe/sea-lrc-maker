if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js").then(
        (registration) => {
            registration.update();
            console.log("ServiceWorker Registed (｡･ω･｡)ﾉ: ", registration.scope);
        },
        (err) => {
            console.log("ServiceWorker registration failed ( ꒪﹃ ꒪) ", err);
        },
    );
}
