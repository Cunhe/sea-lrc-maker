import LINK from "#const/link.json" assert { type: "json" };
import STRINGS from "#const/strings.json" assert { type: "json" };
import { convertTimeToTag, formatText } from "@lrc-maker/lrc-parser";
import { useCallback, useContext, useEffect, useMemo, useRef } from "react";
import { themeColor, ThemeMode } from "../hooks/usePref.js";
import { unregister } from "../utils/sw.unregister.js";
import { appContext, ChangBits } from "./app.context.js";
import { AkariHideWall } from "./svg.img.js";

const numberInputProps = { type: "number", step: 1 } as const;
type OnChange<T> = (event: React.ChangeEvent<T>) => void;
const useNumberInput = (defaultValue: number, onChange: OnChange<HTMLInputElement>) => {
    const ref = useRef<HTMLInputElement>(null);
    useEffect(() => {
        const target = ref.current;
        if (!target) return;
        const reset = (): void => { target.value = defaultValue.toString(); };
        target.addEventListener("change", reset);
        return (): void => target.removeEventListener("change", reset);
    }, [defaultValue]);
    const $onChange = useCallback((ev: React.ChangeEvent<HTMLInputElement>) => {
        if (ev.target.validity.valid) onChange(ev);
    }, [onChange]);
    return { ...numberInputProps, ref, onChange: $onChange, defaultValue };
};

export const Preferences: React.FC = () => {
    const { prefState, prefDispatch, lang } = useContext(appContext, ChangBits.lang || ChangBits.prefState);
    const onColorPick = useCallback((ev: React.ChangeEvent<HTMLInputElement>) => {
        prefDispatch({ type: "themeColor", payload: ev.target.value });
    }, [prefDispatch]);
    const onSpaceChange = useCallback((ev: React.ChangeEvent<HTMLInputElement>) => {
        prefDispatch({ type: ev.target.name as "spaceStart" & "spaceEnd", payload: ev.target.value });
    }, [prefDispatch]);
    const onLangChanged = useCallback((ev: React.ChangeEvent<HTMLSelectElement>) => {
        prefDispatch({ type: "lang", payload: ev.target.value });
    }, [prefDispatch]);
    const onThemeModeChange = useCallback((ev: React.ChangeEvent<HTMLSelectElement>) => {
        prefDispatch({ type: "themeMode", payload: Number.parseInt(ev.target.value, 10) as ThemeMode });
    }, [prefDispatch]);
    const onFixedChanged = useCallback((ev: React.ChangeEvent<HTMLSelectElement>) => {
        prefDispatch({ type: "fixed", payload: Number.parseInt(ev.target.value, 10) as Fixed });
    }, [prefDispatch]);
    const toggle = useCallback((type: "builtInAudio" | "showWaveform" | "screenButton") => {
        prefDispatch({ type, payload: (s) => !s[type] });
    }, [prefDispatch]);
    const updateTime = useMemo(() => {
        try {
            return new Intl.DateTimeFormat(prefState.lang, { year: "numeric", month: "short", day: "numeric", hour: "numeric", minute: "numeric", hour12: false }).format(new Date(import.meta.env.app.updateTime));
        } catch { return import.meta.env.app.updateTime; }
    }, [prefState.lang]);
    const formatedText = useMemo(() => formatText("   hello   世界～   ", prefState.spaceStart, prefState.spaceEnd), [prefState.spaceStart, prefState.spaceEnd]);
    return (
        <div className="preferences">
            <ul>
                <li><section className="list-item"><span>{lang.preferences.version}</span><span>{import.meta.env.app.version}</span></section></li>
                <li><section className="list-item"><span>{lang.preferences.commitHash}</span><span>{import.meta.env.app.hash}</span></section></li>
                <li><section className="list-item"><span>{lang.preferences.updateTime}</span><span>{updateTime}</span></section></li>
                <li><section className="list-item"><span>{lang.preferences.repo}</span><a className="link" href={LINK.url} target="_blank" rel="noopener noreferrer">Github</a></section></li>
                <li><section className="list-item"><span>{lang.preferences.language}</span>
                    <div className="option-select"><select value={prefState.lang} onChange={onLangChanged}>{i18n.langMap.map(([code, display]) => <option key={code} value={code}>{display}</option>)}</select></div>
                </section></li>
                <li><label className="list-item"><span>{lang.preferences.builtInAudio}</span>
                    <label className="toggle-switch"><input type="checkbox" checked={prefState.builtInAudio} onChange={() => toggle("builtInAudio")} /><span className="toggle-switch-label" /></label>
                </label></li>
                <li><label className="list-item"><span>{lang.preferences.spaceButton}</span>
                    <label className="toggle-switch"><input type="checkbox" checked={prefState.screenButton} onChange={() => toggle("screenButton")} /><span className="toggle-switch-label" /></label>
                </label></li>
                <li><label className="list-item"><span>{lang.preferences.showWaveform}</span>
                    <label className="toggle-switch"><input type="checkbox" checked={prefState.showWaveform} onChange={() => toggle("showWaveform")} /><span className="toggle-switch-label" /></label>
                </label></li>
                <li><section className="list-item"><span>{lang.preferences.themeMode.label}</span>
                    <div className="option-select"><select value={prefState.themeMode} onChange={onThemeModeChange}>
                        <option value={ThemeMode.auto}>{lang.preferences.themeMode.auto}</option>
                        <option value={ThemeMode.light}>{lang.preferences.themeMode.light}</option>
                        <option value={ThemeMode.dark}>{lang.preferences.themeMode.dark}</option>
                    </select></div>
                </section></li>
                <li><section className="list-item"><span>{lang.preferences.themeColor}</span>
                    <div>{Object.values(themeColor).map((color) => (
                        <label key={color} className={["color-picker", "ripple", color === prefState.themeColor ? "checked" : ""].join(STRINGS.space)} style={{ backgroundColor: color }}>
                            <input hidden type="radio" name="theme-color" value={color} checked={color === prefState.themeColor} onChange={onColorPick} />
                        </label>
                    ))}</div>
                </section></li>
                <li><section className="list-item"><span>{lang.preferences.lrcFormat}</span>
                    <span><time className="format-example-time">{convertTimeToTag(83.456, prefState.fixed)}</time><span className="format-example-text">{formatedText}</span></span>
                </section></li>
                <li><section className="list-item"><span>{lang.preferences.fixed}</span>
                    <div className="option-select"><select value={prefState.fixed} onChange={onFixedChanged}><option value={0}>0</option><option value={1}>1</option><option value={2}>2</option><option value={3}>3</option></select></div>
                </section></li>
                <li><label className="list-item"><label htmlFor="space-start">{lang.preferences.leftSpace}</label>
                    <input name="spaceStart" id="space-start" required min={-1} {...useNumberInput(prefState.spaceStart, onSpaceChange)} />
                </label></li>
                <li><label className="list-item"><label htmlFor="space-end">{lang.preferences.rightSpace}</label>
                    <input name="spaceEnd" id="space-end" required min={-1} {...useNumberInput(prefState.spaceEnd, onSpaceChange)} />
                </label></li>
                <li><section className="list-item"><span>{lang.preferences.clearCache}</span>
                    <button className="button" type="button" onClick={() => void unregister()}>{lang.preferences.clearCache}</button>
                </section></li>
            </ul>
            <AkariHideWall />
        </div>
    );
};
