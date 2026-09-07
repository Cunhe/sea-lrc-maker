import { InputAction } from "./input-action.js";

export interface KeyBinding {
    code?: string;
    key?: string;
    ctrlKey?: boolean;
    shiftKey?: boolean;
    altKey?: boolean;
}

export type KeyBindings = Record<InputAction, KeyBinding[]>;

export function matchKeyBinding(ev: KeyboardEvent, bindings: KeyBinding[]): boolean {
    return bindings.some((binding) => {
        const ctrlOrMeta = ev.ctrlKey || ev.metaKey;
        if (binding.ctrlKey && !ctrlOrMeta) return false;
        if (!binding.ctrlKey && ctrlOrMeta) return false;
        if (binding.shiftKey && !ev.shiftKey) return false;
        if (binding.altKey && !ev.altKey) return false;
        if (binding.code && ev.code === binding.code) return true;
        if (binding.key && ev.key === binding.key) return true;
        return false;
    });
}

export function getMatchedAction(ev: KeyboardEvent, keyBindings: KeyBindings): InputAction | null {
    for (const [action, bindings] of Object.entries(keyBindings)) {
        if (matchKeyBinding(ev, bindings)) return action as InputAction;
    }
    return null;
}
