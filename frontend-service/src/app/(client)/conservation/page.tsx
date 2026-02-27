"use client";
import { useEffect, useRef, useState } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { v4 as uuidv4 } from "uuid";
import { Form, Button } from "react-bootstrap";
import { MicFill, MicMuteFill, Robot, VolumeMute, VolumeUp } from "react-bootstrap-icons";
import "bootstrap/dist/css/bootstrap.min.css";
import useTTS from "@/utils/useTTS";
import authApis from "@/configs/AuthApis";
import endpoints from "@/configs/Endpoints";

interface Message {
    sender: "you" | "bot";
    text: string;
}

type SpeechRecType = {
    webkitSpeechRecognition?: typeof SpeechRecognition;
    SpeechRecognition?: typeof SpeechRecognition;
};

interface ProvidedData {
    audio_provided: string;
    post_provided: string;
}

interface OverallResultData {
    ai_reading: string;
    length_of_recording_in_sec: number;
    number_of_recognized_words: number;
    number_of_words_in_post: number;
    overall_points: number;
    post_language_id: number;
    post_language_name: string;
    score_id: string;
    user_recording_transcript: string;
}

interface WordResultData {
    points: string;
    speed: string;
    word: string;
}

export interface ScoreResponse {
    provided_data: ProvidedData[] | null;
    overall_result_data: OverallResultData[] | null;
    word_result_data: WordResultData[] | null;
}

export default function ChatPage() {
    const [conversationId, setConversationId] = useState<string>("");
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [sttSupported, setSttSupported] = useState(false);
    const [ttsSupported, setTtsSupported] = useState(false);
    const [micOn, setMicOn] = useState(false);
    const [mute, setMute] = useState(false);
    const [loadingUpload, setLoadingUpload] = useState(false);

    const clientRef = useRef<Client | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const recognitionRef = useRef<SpeechRecognition | null>(null);
    const muteRef = useRef(mute);
    const ttsSupportedRef = useRef(ttsSupported);
    const { speak } = useTTS();
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const [postId, setPostId] = useState<string>("");

    useEffect(() => {
        setConversationId(uuidv4());
    }, []);

    useEffect(() => {
        const hasSTT =
            typeof window !== "undefined" &&
            (!!(window as SpeechRecType).webkitSpeechRecognition ||
                !!(window as SpeechRecType).SpeechRecognition);
        const hasTTS =
            typeof window !== "undefined" &&
            "speechSynthesis" in window &&
            "SpeechSynthesisUtterance" in window;

        setSttSupported(hasSTT);
        setTtsSupported(hasTTS);
    }, []);

    useEffect(() => {
        if (!conversationId) return;

        setMessages([{ sender: "bot", text: "Bạn cần ghi âm và đọc theo câu có sẵn để được chấm điểm phát âm!" }]);

        const socket = new SockJS("https://englearn-backend.onrender.com/elearn/ws-chat");
        const client = new Client({
            webSocketFactory: () => socket,
            reconnectDelay: 5000,
            onConnect: () => {
                client.subscribe(`/topic/conversation/practice/${conversationId}`, (message) => {
                    const payload = JSON.parse(message.body);
                    const msg: Message = {
                        sender: "bot",
                        text: payload.content
                    };

                    setPostId(payload.postId);

                    setMessages((prev) => [...prev, msg]);

                    if (!muteRef.current && ttsSupportedRef.current) {
                        speak(payload.content);
                    }
                });
            }
        });

        client.activate();
        clientRef.current = client;

        return () => {
            client.deactivate();
            clientRef.current = null;
        };
    }, [conversationId, speak]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    useEffect(() => { muteRef.current = mute; }, [mute]);
    useEffect(() => { ttsSupportedRef.current = ttsSupported; }, [ttsSupported]);

    const startMic = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);

            audioChunksRef.current = [];
            mediaRecorderRef.current.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorderRef.current.start();
            setMicOn(true);

            setTimeout(() => {
                if (mediaRecorderRef.current && micOn) {
                    stopMic(postId);
                }
            }, 59000);
        } catch (err) {
            console.error("Mic start error:", err);
        }
    };

    function convertToWav(blob: Blob): Promise<Blob> {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => {
                const arrayBuffer = reader.result as ArrayBuffer;
                const audioContext = new AudioContext();
                audioContext.decodeAudioData(arrayBuffer, (audioBuffer) => {
                    const wavBuffer = audioBufferToWav(audioBuffer);
                    const wavBlob = new Blob([wavBuffer], { type: "audio/wav" });
                    resolve(wavBlob);
                });
            };
            reader.readAsArrayBuffer(blob);
        });
    }

    function audioBufferToWav(buffer: AudioBuffer) {
        const numOfChan = buffer.numberOfChannels,
            length = buffer.length * numOfChan * 2 + 44,
            result = new ArrayBuffer(length),
            view = new DataView(result),
            channels = [],
            sampleRate = buffer.sampleRate;

        let offset = 0;
        function writeString(s: string) {
            for (let i = 0; i < s.length; i++) {
                view.setUint8(offset++, s.charCodeAt(i));
            }
        }

        writeString("RIFF");
        view.setUint32(offset, 36 + buffer.length * numOfChan * 2, true); offset += 4;
        writeString("WAVE");
        writeString("fmt ");
        view.setUint32(offset, 16, true); offset += 4;
        view.setUint16(offset, 1, true); offset += 2;
        view.setUint16(offset, numOfChan, true); offset += 2;
        view.setUint32(offset, sampleRate, true); offset += 4;
        view.setUint32(offset, sampleRate * 2 * numOfChan, true); offset += 4;
        view.setUint16(offset, numOfChan * 2, true); offset += 2;
        view.setUint16(offset, 16, true); offset += 2;
        writeString("data");
        view.setUint32(offset, buffer.length * numOfChan * 2, true); offset += 4;

        for (let i = 0; i < buffer.numberOfChannels; i++) {
            channels.push(buffer.getChannelData(i));
        }
        const interleaved = new Float32Array(buffer.length * numOfChan);
        for (let i = 0; i < buffer.length; i++) {
            for (let j = 0; j < numOfChan; j++) {
                interleaved[i * numOfChan + j] = channels[j][i];
            }
        }
        let idx = offset;
        for (let i = 0; i < interleaved.length; i++, idx += 2) {
            const s = Math.max(-1, Math.min(1, interleaved[i]));
            view.setInt16(idx, s < 0 ? s * 0x8000 : s * 0x7fff, true);
        }
        return result;
    }

    const stopMic = async (postId: string) => {
        try {
            mediaRecorderRef.current?.stop();

            mediaRecorderRef.current!.onstop = async () => {
                setLoadingUpload(true);

                const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
                const wavBlob = await convertToWav(blob);

                const formData = new FormData();
                formData.append("audio", wavBlob, "recording.wav");

                try {
                    const res = await authApis.post<ScoreResponse[]>(
                        endpoints["score"](postId),
                        formData
                    );

                    const scoreData = res.data;

                    if (scoreData[1]?.overall_result_data?.length) {
                        const result = scoreData[1].overall_result_data[0];
                        setMessages(prev => [
                            ...prev,
                            {
                                sender: "bot",
                                text: `Kết quả: ${result.overall_points.toFixed(2)} điểm. Bạn đọc: "${result.user_recording_transcript}"`
                            }
                        ]);
                    }

                    clientRef.current?.publish({
                        destination: `/app/speak/${conversationId}`,
                        body: JSON.stringify({ message: "generate_practice_sentence" }),
                    });
                } catch (err) {
                    console.error("Upload/score error:", err);
                } finally {
                    setMicOn(false);
                    setLoadingUpload(false);
                }
            };
        } catch (err) {
            console.error("Stop mic error:", err);
            setMicOn(false);
            setLoadingUpload(false);
        }
    };

    const sendMessage = (textParam?: string) => {
        const content = (textParam ?? input).trim();
        if (!content || !clientRef.current) return;

        setMessages((prev) => [...prev, { sender: "you", text: content }]);

        clientRef.current.publish({
            destination: `/app/speak/${conversationId}`,
            body: JSON.stringify({ message: content }),
        });

        setInput("");
    };

    useEffect(() => {
        return () => {
            if (clientRef.current) {
                clientRef.current.deactivate();
                clientRef.current = null;
            }
            if ("speechSynthesis" in window) {
                window.speechSynthesis.cancel();
            }
            if (recognitionRef.current) {
                recognitionRef.current.stop();
                recognitionRef.current = null;
            }
        };
    }, []);

    return (
        <div className="d-flex flex-column" style={{ minHeight: "100vh", background: "linear-gradient(135deg, #e3f2fd, #f1f3f6)", fontFamily: "'Segoe UI', sans-serif" }}>
            <div className="d-flex justify-content-between align-items-center p-3 shadow-sm" style={{ background: "#1976d2", color: "white", fontWeight: "600" }}>
                <span className="d-inline-flex align-items-center gap-2 px-2 py-2 rounded-pill bg-light shadow-sm border border-secondary-subtle">
                    <Robot size={10} className="text-primary" />
                    <span className="fw-semibold text-dark">AI Assistant – {conversationId.slice(0, 6)}</span>
                </span>
                <Button
                    variant={mute ? "outline-light" : "light"}
                    onClick={() => setMute((m) => !m)}
                    size="sm"
                    className="d-flex align-items-center gap-1"
                >
                    {mute ? <VolumeMute /> : <VolumeUp />}
                </Button>
            </div>

            <div className="flex-grow-1 p-4 overflow-auto">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`d-flex mb-3 ${msg.sender === "you" ? "justify-content-end" : "justify-content-start"}`}>
                        <div
                            className="px-3 py-2 rounded-4 shadow-sm"
                            style={{
                                maxWidth: "70%",
                                background: msg.sender === "you" ? "#1976d2" : "white",
                                color: msg.sender === "you" ? "white" : "#333",
                                border: msg.sender === "bot" ? "1px solid #ddd" : "none",
                            }}
                        >
                            {msg.text}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            <div className="p-3 bg-white border-top">
                <Form
                    className="d-flex align-items-center justify-content-center"
                    onSubmit={(e) => {
                        e.preventDefault();
                        sendMessage();
                    }}
                >
                    {messages.length <= 1 ? (
                        <div className="d-flex flex-column align-items-center">
                            <Button
                                variant="success"
                                className="px-4 py-2 rounded-pill shadow-sm fw-semibold"
                                onClick={() =>
                                    clientRef.current?.publish({
                                        destination: `/app/speak/${conversationId}`,
                                        body: JSON.stringify({ message: "generate_practice_sentence" }),
                                    })
                                }
                            >
                                Bắt đầu luyện tập
                            </Button>
                        </div>
                    ) : loadingUpload ? (
                        <div className="d-flex flex-column align-items-center">
                            <Button
                                disabled
                                variant="light"
                                className="rounded-circle shadow-sm d-flex align-items-center justify-content-center"
                                style={{ width: "70px", height: "70px", backgroundColor: "#1976d2" }}
                            >
                                <span className="spinner-border spinner-border-sm text-white" role="status" />
                            </Button>
                            <small className="text-secondary mt-2 fw-semibold">Đang chấm điểm...</small>
                        </div>
                    ) : micOn ? (
                        <div className="d-flex flex-column align-items-center">
                            <Button
                                variant="danger"
                                className="rounded-circle shadow-lg d-flex align-items-center justify-content-center pulse"
                                style={{ width: "80px", height: "80px", border: "none" }}
                                onClick={() => stopMic(postId)}
                            >
                                <MicMuteFill size={30} color="#fff" />
                            </Button>
                            <small className="text-danger mt-2 fw-semibold">Recording...</small>
                        </div>
                    ) : (
                        <div className="d-flex flex-column align-items-center">
                            <Button
                                disabled={!postId}
                                variant="light"
                                className="rounded-circle shadow-sm d-flex align-items-center justify-content-center"
                                style={{ width: "70px", height: "70px", backgroundColor: "#1976d2" }}
                                onClick={startMic}
                            >
                                <MicFill size={28} color="#fff" />
                            </Button>
                            <small className="text-primary mt-2 fw-semibold">Speak</small>
                        </div>
                    )}
                </Form>
            </div>
        </div>
    );
}
