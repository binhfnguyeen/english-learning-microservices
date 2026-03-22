"use client";
import { useContext, useEffect, useRef, useState } from "react";
import { Form, Button } from "react-bootstrap";
import { MicFill, MicMuteFill, Robot } from "react-bootstrap-icons";
import "bootstrap/dist/css/bootstrap.min.css";
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
        <div className="d-flex flex-column" style={{ height: "100vh", overflow: "hidden", background: "linear-gradient(135deg, #e3f2fd, #f1f3f6)", fontFamily: "'Segoe UI', sans-serif" }}>
            <style>{`
                .typing-dot {
                    width: 6px;
                    height: 6px;
                    background-color: #6c757d;
                    border-radius: 50%;
                    margin: 0 2px;
                    animation: typing-bounce 1.4s infinite ease-in-out both;
                }
                .typing-dot:nth-child(1) { animation-delay: -0.32s; }
                .typing-dot:nth-child(2) { animation-delay: -0.16s; }
                
                @keyframes typing-bounce {
                    0%, 80%, 100% { transform: scale(0); opacity: 0.3; }
                    40% { transform: scale(1); opacity: 1; }
                }

                .chat-container {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                .chat-container::-webkit-scrollbar {
                    display: none;
                }
            `}</style>

            <div className="d-flex justify-content-between align-items-center p-3 shadow-sm" style={{ background: "#1976d2", color: "white", fontWeight: "600", zIndex: 10 }}>
                <span className="d-inline-flex align-items-center gap-2 px-2 py-2 rounded-pill bg-light shadow-sm border border-secondary-subtle">
                    <Robot size={10} className="text-primary" />
                    <span className="fw-semibold text-dark">AI Speaking Assistant</span>
                </span>
            </div>

            <div className="chat-container flex-grow-1 p-4 overflow-auto">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`d-flex mb-3 ${msg.sender === "you" ? "justify-content-end" : "justify-content-start"}`}>
                        <div
                            className="px-3 py-2 rounded-4 shadow-sm"
                            style={{
                                maxWidth: "70%",
                                background: msg.sender === "you" ? "#1976d2" : "white",
                                color: msg.sender === "you" ? "white" : "#333",
                                border: msg.sender === "bot" ? "1px solid #ddd" : "none",
                                whiteSpace: "pre-wrap",
                                minHeight: "38px",
                                display: "flex",
                                alignItems: "center"
                            }}
                        >
                            {msg.text}
                            {(msg.sender === "bot" && msg.text === "" && idx === messages.length - 1) && (
                                <div className="d-inline-flex align-items-center ms-1" style={{ height: '20px' }}>
                                    <span className="typing-dot"></span>
                                    <span className="typing-dot"></span>
                                    <span className="typing-dot"></span>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            <div className="p-3 bg-white border-top" style={{ zIndex: 10 }}>
                <Form className="d-flex align-items-center justify-content-center">
                    {micOn ? (
                        <div className="d-flex flex-column align-items-center">
                            <Button
                                variant="danger"
                                className="rounded-circle shadow-lg d-flex align-items-center justify-content-center pulse"
                                style={{ width: "80px", height: "80px", border: "none" }}
                                onClick={stopMic}
                            >
                                <MicMuteFill size={30} color="#fff" />
                            </Button>
                            <small className="text-danger mt-2 fw-semibold">Đang nghe...</small>
                        </div>
                    ) : (
                        <div className="d-flex flex-column align-items-center">
                            <Button
                                disabled={isMicDisabled}
                                variant={isMicDisabled ? "secondary" : "light"}
                                className="rounded-circle shadow-sm d-flex align-items-center justify-content-center"
                                style={{
                                    width: "70px",
                                    height: "70px",
                                    backgroundColor: isMicDisabled ? "#c0c0c0" : "#1976d2",
                                    transition: "all 0.3s ease"
                                }}
                                onClick={startMic}
                            >
                                <MicFill size={28} color="#fff" />
                            </Button>
                            <small className={`mt-2 fw-semibold ${isGenerating ? 'text-secondary' : 'text-primary'}`}>
                                {!connected
                                    ? "Đang kết nối..."
                                    : !sttSupported
                                        ? "Trình duyệt không hỗ trợ Mic"
                                        : isGenerating
                                            ? "AI đang trả lời..."
                                            : "Nhấn để nói"}
                            </small>
                        </div>
                    )}
                </Form>
            </div>
        </div>
    );
}