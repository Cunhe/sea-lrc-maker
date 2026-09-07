import { InputAction } from "./input-action.js";
import type { KeyBindings } from "./keybindings.js";

export const defaultKeyBindings: KeyBindings = {
    [InputAction.Sync]: [{ code: "Space" }],
    [InputAction.DeleteTime]: [{ code: "Backspace" }, { code: "Delete" }],
    [InputAction.ResetOffset]: [{ code: "Digit0" }],
    [InputAction.DecreaseOffset]: [{ code: "Minus" }],
    [InputAction.IncreaseOffset]: [{ code: "Equal" }],
    [InputAction.PrevLine]: [{ code: "ArrowUp" }, { code: "KeyW" }, { code: "KeyJ" }],
    [InputAction.NextLine]: [{ code: "ArrowDown" }, { code: "KeyS" }, { code: "KeyK" }],
    [InputAction.FirstLine]: [{ code: "Home" }],
    [InputAction.LastLine]: [{ code: "End" }],
    [InputAction.PageUp]: [{ code: "PageUp" }],
    [InputAction.PageDown]: [{ code: "PageDown" }],
    [InputAction.SeekBackward]: [{ code: "ArrowLeft" }, { code: "KeyA" }, { code: "KeyH" }],
    [InputAction.SeekForward]: [{ code: "ArrowRight" }, { code: "KeyD" }, { code: "KeyL" }],
    [InputAction.ResetRate]: [{ code: "KeyR" }],
    [InputAction.IncreaseRate]: [{ code: "ArrowUp", ctrlKey: true }, { code: "KeyJ", ctrlKey: true }],
    [InputAction.DecreaseRate]: [{ code: "ArrowDown", ctrlKey: true }, { code: "KeyK", ctrlKey: true }],
    [InputAction.TogglePlay]: [{ code: "Enter", ctrlKey: true }],
    [InputAction.ShowHelp]: [{ key: "?" }],
};
