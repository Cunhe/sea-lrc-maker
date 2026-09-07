import { convertTimeToTag } from "@lrc-maker/lrc-parser";
import { useEffect, useRef, useState } from "react";
import { AudioActionType, audioRef, audioStatePubSub, currentTimePubSub } from "../utils/audiomodule.js";

interface ICurserProps { fixed: Fixed; }

export const Curser: React.FC<ICurserProps> = ({ fixed }) => {
    const self = useRef(Symbol(Curser.name));
    const [time, setTime] = useState(audioRef.currentTime);
    const [paused, setPaused] = useState(audioRef.paused);
    const [rate, setRate] = useState(audioRef.playbackRate);
    useEffect(() => audioStatePubSub.sub(self.current, (data) => {
        if (data.type === AudioActionType.pause) setPaused(data.payload);
        if (data.type === AudioActionType.rateChange) setRate(data.payload);
    }), []);
    useEffect(() => {
        const B = [1, 10, 100, 1000][fixed] * rate;
        if (paused || 2 * B > 60) {
            return currentTimePubSub.sub(self.current, (date) => setTime(date));
        }
        const id = setInterval(() => setTime(audioRef.currentTime), 1000 / (2 * B));
        return (): void => { clearInterval(id); };
    }, [fixed, paused, rate]);
    return <time className="curser">{convertTimeToTag(time, fixed)}</time>;
};
