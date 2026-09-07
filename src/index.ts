import { createElement } from "react";
import { render } from "react-dom";
import { App } from "./components/app.js";

if (!("scrollBehavior" in document.documentElement.style)) {
    import("./polyfill/smooth-scroll.js");
}

render(createElement(App), document.querySelector(".app-container"), () => {
    if (navigator.standalone || window.matchMedia("(display-mode: standalone)").matches) {
        document.addEventListener("click", (ev) => {
            const href = (ev.target as HTMLAnchorElement).getAttribute("href");
            if (href?.startsWith("#") === true) {
                ev.preventDefault();
                location.replace(href);
            }
        });
    }
    window.addEventListener("dragover", (ev) => {
        ev.preventDefault();
        ev.dataTransfer!.dropEffect = "copy";
    });
    window.addEventListener("drop", (ev) => ev.preventDefault());
});
