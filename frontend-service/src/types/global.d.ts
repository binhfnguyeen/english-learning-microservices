interface SpeechRecognition extends EventTarget {
    lang: string;
    continuous: boolean;
    interimResults: boolean;
    start(): void;
    stop(): void;
    abort(): void;
    onaudioend?: (event: Event) => void;
    onaudiostart?: (event: Event) => void;
    onend?: (event: Event) => void;
    onerror?: (event: SpeechRecognitionErrorEvent) => void;
    onnomatch?: (event: SpeechRecognitionEvent) => void;
    onresult?: (event: SpeechRecognitionEvent) => void;
    onsoundend?: (event: Event) => void;
    onsoundstart?: (event: Event) => void;
    onspeechend?: (event: Event) => void;
    onspeechstart?: (event: Event) => void;
    onstart?: (event: Event) => void;
}

interface SpeechRecognitionResult {
    isFinal: boolean;
    [index: number]: {
        transcript: string;
        confidence: number;
    };
    length: number;
}

interface SpeechRecognitionResultList {
    [index: number]: SpeechRecognitionResult;
    length: number;
}

interface SpeechRecognitionEvent extends Event {
    resultIndex: number;
    results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
    error: string;
    message: string;
}

interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
}

declare const SpeechRecognition: {
    prototype: SpeechRecognition;
    new(): SpeechRecognition;
};

declare module "mic-recorder-to-mp3";