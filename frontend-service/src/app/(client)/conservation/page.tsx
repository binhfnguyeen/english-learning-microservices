"use client";
import { useContext, useEffect, useRef, useState } from "react";
import { MicFill, MicMuteFill, Robot } from "react-bootstrap-icons";
import useTTS from "@/utils/useTTS";
import UserContext from "@/configs/UserContext";
import Cookies from "js-cookie";

interface Message {
    sender: "you" | "bot";
    text: string;
}

export default function ChatPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [connected, setConnected] = useState(false);
    const [sttSupported, setSttSupported] = useState(false);
    const [ttsSupported, setTtsSupported] = useState(false);
    const [micOn, setMicOn] = useState(false);

    const [isGenerating, setIsGenerating] = useState(false);

    const wsRef = useRef<WebSocket | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const recognitionRef = useRef<SpeechRecognition | null>(null);

    const ttsSupportedRef = useRef(ttsSupported);
    const { speak } = useTTS();

    const speakRef = useRef(speak);
    useEffect(() => {
        speakRef.current = speak;
    }, [speak]);

    const context = useContext(UserContext);
    const user = context?.user;

    const handleSendTranscriptRef = useRef<((text: string) => void) | null>(null);

    useEffect(() => {
        const SpeechRecog = window.SpeechRecognition || window.webkitSpeechRecognition;
        const hasSTT = typeof window !== "undefined" && !!SpeechRecog;
        const hasTTS = typeof window !== "undefined" && "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;

        setSttSupported(hasSTT);
        setTtsSupported(hasTTS);

        if (hasSTT && !recognitionRef.current) {
            const recognition = new SpeechRecog();
            recognition.lang = "en-US";
            recognition.continuous = false;
            recognition.interimResults = false;

            recognition.onresult = (event: SpeechRecognitionEvent) => {
                const transcript = event.results[0][0].transcript;
                if (handleSendTranscriptRef.current) {
                    handleSendTranscriptRef.current(transcript);
                }
            };

            recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
                console.error("Speech recognition error: ", event.error);
                setMicOn(false);
            };

            recognition.onend = () => {
                setMicOn(false);
            };

            recognitionRef.current = recognition;
        }
    }, []);

    useEffect(() => {
        if (!user?.id) return;

        const token = Cookies.get("accessToken");
        if (!token) return;

        const wsUrl = `ws://localhost:8080/api/ai/ws/speaking/${user.id}?token=${token}`;
        const socket = new WebSocket(wsUrl);

        wsRef.current = socket;

        socket.onopen = () => {
            setConnected(true);
            console.log("Connected to AI Service WebSocket (Speaking)");
        };

        socket.onmessage = (event: MessageEvent) => {
            const data = JSON.parse(event.data as string);

            if (data.type === "history") {
                setMessages(data.data);

            } else if (data.type === "stream_start") {
                setMessages((prev) => [...prev, { sender: "bot", text: "" }]);
                setIsGenerating(true);

            } else if (data.type === "stream_chunk") {
                setMessages((prev) => {
                    const newMessages = [...prev];
                    const lastIndex = newMessages.length - 1;
                    if (lastIndex >= 0 && newMessages[lastIndex].sender === "bot") {
                        newMessages[lastIndex] = {
                            ...newMessages[lastIndex],
                            text: newMessages[lastIndex].text + data.text
                        };
                    }
                    return newMessages;
                });

            } else if (data.type === "stream_done") {
                setIsGenerating(false);
                if (ttsSupportedRef.current && speakRef.current) {
                    speakRef.current(data.text);
                }

            } else if (data.type === "message") {
                setMessages((prev) => [...prev, { sender: "bot", text: data.text }]);
                setIsGenerating(false);
                if (ttsSupportedRef.current && speakRef.current) {
                    speakRef.current(data.text);
                }
            }
        };

        socket.onclose = () => {
            if (wsRef.current === socket) {
                setConnected(false);
                setIsGenerating(false);
                wsRef.current = null;
            }
        };

        return () => {
            socket.close();
        };
    }, [user?.id]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    useEffect(() => { ttsSupportedRef.current = ttsSupported; }, [ttsSupported]);

    useEffect(() => {
        handleSendTranscriptRef.current = (transcript: string) => {
            if (!transcript.trim() || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN || isGenerating) {
                console.warn("WebSocket chưa sẵn sàng hoặc đang gen nội dung.");
                return;
            }

            setMessages((prev) => [...prev, { sender: "you", text: transcript }]);
            wsRef.current.send(JSON.stringify({ message: transcript }));
            setIsGenerating(true);
        };
    }, [connected, messages, isGenerating]);

    const startMic = () => {
        if (recognitionRef.current && !isGenerating) {
            try {
                recognitionRef.current.start();
                setMicOn(true);
            } catch (err) {
                console.error("Mic start error:", err);
            }
        }
    };

    const stopMic = () => {
        if (recognitionRef.current && micOn) {
            recognitionRef.current.stop();
            setMicOn(false);
        }
    };

    if (!user) {
        return (
            <div className="d-flex align-items-center justify-content-center" style={{ height: "100vh" }}>
                <div className="text-secondary fw-bold">Vui lòng đăng nhập để sử dụng tính năng này!</div>
            </div>
        );
    }

    const isMicDisabled = !sttSupported || !connected || isGenerating;

    return (
        <div
            className="d-flex flex-column"
            style={{
                height: "calc(100vh - 120px)",
                fontFamily: "'Inter', sans-serif",
                overflow: "hidden"
            }}
        >
            <div className="p-4 flex-shrink-0">
                <div
                    className="d-inline-flex align-items-center gap-3 px-4 py-3 bg-white rounded-4"
                    style={{
                        borderBottom: "4px solid #d1d5db",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.08)"
                    }}
                >
                    <div
                        className="d-flex align-items-center justify-content-center text-white"
                        style={{
                            width: "42px",
                            height: "42px",
                            borderRadius: "14px",
                            background: "#4f46e5",
                            borderBottom: "3px solid #3730a3"
                        }}
                    >
                        <Robot size={20} />
                    </div>

                    <div>
                        <h6
                            className="mb-1 fw-bold"
                            style={{
                                fontSize: "15px"
                            }}
                        >
                            AI Speaking Assistant
                        </h6>

                        <small
                            className="text-muted fw-semibold"
                            style={{
                                fontSize: "12px"
                            }}
                        >
                            Trợ lý luyện nói trực tuyến
                        </small>
                    </div>
                </div>
            </div>

            <div
                className="flex-grow-1 overflow-auto px-4"
                style={{
                    minHeight: 0,
                    paddingBottom: "16px"
                }}
            >
                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        className={`d-flex mb-3 ${msg.sender === "you"
                            ? "justify-content-end"
                            : "justify-content-start"
                            }`}
                    >
                        <div
                            className={`px-4 py-3 fw-semibold ${msg.sender === "you"
                                ? "bg-sky-500 text-white"
                                : "bg-white text-dark"
                                }`}
                            style={{
                                maxWidth: "75%",
                                fontSize: "0.95rem",
                                lineHeight: "1.6",
                                borderRadius: "20px",
                                borderBottom:
                                    msg.sender === "you"
                                        ? "4px solid #0369a1"
                                        : "4px solid #d1d5db",
                                boxShadow:
                                    "0 4px 12px rgba(0,0,0,0.08)"
                            }}
                        >
                            {msg.text ||
                                (msg.sender === "bot" &&
                                    idx === messages.length - 1 && (
                                        <span className="opacity-50">
                                            ...
                                        </span>
                                    ))}
                        </div>
                    </div>
                ))}

                <div ref={messagesEndRef} />
            </div>

            <div
                className="flex-shrink-0 d-flex justify-content-center"
                style={{
                    padding: "20px 0 24px"
                }}
            >
                <button
                    onClick={micOn ? stopMic : startMic}
                    disabled={isGenerating && !micOn}
                    className={`flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl border-b-4 px-6 py-3 text-sm font-black text-white transition-all active:translate-y-1 active:border-b-0 ${micOn
                        ? "border-rose-700 bg-rose-500 hover:bg-rose-400"
                        : "border-sky-700 bg-sky-500 hover:bg-sky-400"
                        }`}
                >
                    {micOn ? (
                        <MicMuteFill size={18} />
                    ) : (
                        <MicFill size={18} />
                    )}

                    {micOn ? "Stop" : "Start"}
                </button>
            </div>
        </div>
    );
}