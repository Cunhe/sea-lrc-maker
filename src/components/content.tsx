import LSK from "#const/local_key.json" assert { type: "json" };
import ROUTER from "#const/router.json" assert { type: "json" };
import SSK from "#const/session_key.json" assert { type: "json" };
import STRINGS from "#const/strings.json" assert { type: "json" };
import { convertTimeToTag, stringify } from "@lrc-maker/lrc-parser";
import { type JSX, lazy, Suspense, useContext, useEffect, useRef, useState } from "react";
import { ActionType as LrcActionType, useLrc } from "../hooks/useLrc.js";
import { ThemeMode } from "../hooks/usePref.js";
import { AudioActionType, audioStatePubSub } from "../utils/audiomodule.js";
import { appContext, ChangBits } from "./app.context.js";
import { Home } from "./home.js";
import { AkariNotFound, AkariOdangoLoading } from "./svg.img.js";

const LazyEditor = lazy(async () => import("./editor.js").then(({ Eidtor }) => ({ default: Eidtor })));
const LazySynchronizer = lazy(async () => import("./synchronizer.js").then(({ Synchronizer }) => ({ default: Synchronizer })));
const LazyGist = lazy(async () => import("./gist.js").then(({ Gist }) => ({ default: Gist })));
const LazyPreferences = lazy(async () => import("./preferences.js").then(({ Preferences }) => ({ default: Preferences })));

export const Content: React.FC = () => {
    const self = useRef(Symbol(Content.name));
    const { prefState, trimOptions } = useContext(appContext, ChangBits.prefState);
    const [path, setPath] = useState(location.hash);
    useEffect(() => {
        function onHashchange() { setPath(location.hash); }
        window.addEventListener("hashchange", onHashchange);
        return () => window.removeEventListener("hashchange", onHashchange);
    }, []);
    const [lrcState, lrcDispatch] = useLrc(() => ({
        text: localStorage.getItem(LSK.lyric) || STRINGS.emptyString,
        options: trimOptions,
        select: Number.parseInt(sessionStorage.getItem(SSK.selectIndex)!, 10) || 0,
    }));
    useEffect(() => audioStatePubSub.sub(self.current, (data) => {
        if (data.type === AudioActionType.getDuration) {
            lrcDispatch({ type: LrcActionType.info, payload: { name: "length", value: convertTimeToTag(data.payload, prefState.fixed, false) } });
        }
    }), [lrcDispatch, prefState.fixed]);
    useEffect(() => {
        function saveState(): void {
            lrcDispatch({ type: LrcActionType.getState, payload: (lrc) => {
                localStorage.setItem(LSK.lyric, stringify(lrc, prefState));
                sessionStorage.setItem(SSK.selectIndex, lrc.selectIndex.toString());
            }});
            localStorage.setItem(LSK.preferences, JSON.stringify(prefState));
        }
        function onVisibilitychange() { if (document.hidden) saveState(); }
        document.addEventListener("visibilitychange", onVisibilitychange);
        window.addEventListener("beforeunload", saveState);
        return () => {
            document.removeEventListener("visibilitychange", onVisibilitychange);
            window.removeEventListener("beforeunload", saveState);
        };
    }, [lrcDispatch, prefState]);
    useEffect(() => {
        function onDrop(ev: DragEvent) {
            const file = ev.dataTransfer?.files[0];
            if (file && (file.type.startsWith("text/") || /(?:\.lrc|\.txt)$/i.test(file.name))) {
                const fileReader = new FileReader();
                fileReader.addEventListener("load", () => {
                    lrcDispatch({ type: LrcActionType.parse, payload: { text: fileReader.result as string, options: trimOptions } });
                }, { once: true });
                location.hash = ROUTER.editor;
                fileReader.readAsText(file, "utf-8");
            }
        }
        document.documentElement.addEventListener("drop", onDrop);
        return () => document.documentElement.removeEventListener("drop", onDrop);
    }, [lrcDispatch, trimOptions]);
    useEffect(() => {
        document.documentElement.dataset.theme = ({ 0: "auto", 1: "light", 2: "dark" } as const)[prefState.themeMode];
    }, [prefState.themeMode]);
    useEffect(() => {
        const rgb = hex2rgb(prefState.themeColor);
        document.documentElement.style.setProperty("--theme-rgb", rgb.join(", "));
        const lum = luminanace(...rgb);
        const con = lum + 0.05;
        document.documentElement.style.setProperty("--theme-contrast-color", con * con > 0.0525 ? "var(--black)" : "var(--white)");
    }, [prefState.themeColor]);
    const content = ((): JSX.Element => {
        switch (path.slice(1)) {
            case ROUTER.editor: return <LazyEditor lrcState={lrcState} lrcDispatch={lrcDispatch} />;
            case ROUTER.synchronizer: return lrcState.lyric.length === 0 ? <AkariNotFound /> : <LazySynchronizer state={lrcState} dispatch={lrcDispatch} />;
            case ROUTER.gist: return <LazyGist lrcDispatch={lrcDispatch} langName={prefState.lang} />;
            case ROUTER.preferences: return <LazyPreferences />;
        }
        return <Home />;
    })();
    return <main className="app-main"><Suspense fallback={<AkariOdangoLoading />}>{content}</Suspense></main>;
};

const luminanace = (...rgb: [number, number, number]): number => rgb.map((v) => v / 255).map((v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4))).reduce((p, c, i) => p + c * [0.2126, 0.7152, 0.0722][i], 0);
const hex2rgb = (hex: string): [number, number, number] => {
    const value = Number.parseInt(hex.slice(1), 16);
    return [(value >> 0x10) & 0xff, (value >> 0x08) & 0xff, (value >> 0x00) & 0xff];
};
