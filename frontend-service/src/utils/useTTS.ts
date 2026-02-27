import { useRef, useCallback, useEffect, useState } from "react";

export default function useTTS() {
    const speakingRef = useRef(false);
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
    const [isSpeaking, setIsSpeaking] = useState(false);

    useEffect(() => {
        const loadVoices = () => {
            const v = window.speechSynthesis.getVoices();
            setVoices(v);
        };
        loadVoices();
        window.speechSynthesis.onvoiceschanged = loadVoices;
    }, []);

    const speak = useCallback((text: string, lang: string = "en-US") => {
        if (!("speechSynthesis" in window) || !("SpeechSynthesisUtterance" in window)) {
            console.warn("TTS not supported in this browser.");
            return;
        }

        const synth = window.speechSynthesis;
        if (speakingRef.current) synth.cancel();

        const utt = new SpeechSynthesisUtterance(text);
        utt.lang = lang;
        utt.rate = 0.95;
        utt.pitch = 1.05;
        utt.volume = 1;

        const googleVoice = voices.find(v => v.name.includes("Google US English"));
        if (googleVoice) {
            utt.voice = googleVoice;
        }

        utt.onstart = () => {
            speakingRef.current = true;
            setIsSpeaking(true);
        }
        utt.onend = () => {
            speakingRef.current = false;
            setIsSpeaking(false);
        }

        synth.speak(utt);
    }, [voices]);

    return { speak, isSpeaking };
}
