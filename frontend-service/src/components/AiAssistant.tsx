"use client";
import { useContext, useEffect, useRef, useState } from "react";
import { Robot, Send, XLg, ArrowsAngleExpand, ArrowsAngleContract } from "react-bootstrap-icons";
import { Button, Card, Form } from "react-bootstrap";
import UserContext from "@/configs/UserContext";
import styles from "@/components/AiAssistant.module.css";
import Cookies from "js-cookie";

interface Message {
    sender: "you" | "bot";
    text: string;
}

export default function ChatAssistant() {
    const [isOpen, setIsOpen] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false); // State quản lý kích thước
    const [connected, setConnected] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [showHint, setShowHint] = useState(false);
    const [input, setInput] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);

    const wsRef = useRef<WebSocket | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const context = useContext(UserContext);
    const user = context?.user;

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    useEffect(() => {
        if (!user?.id || !isOpen) return;

        const token = Cookies.get("accessToken");
        if (!token) return;

        const wsUrl = `ws://localhost:8080/api/ai/ws/chat/${user.id}?token=${token}`;
        const socket = new WebSocket(wsUrl);
        wsRef.current = socket;

        socket.onopen = () => {
            setConnected(true);
            console.log("Connected to AI Service WebSocket (Chat)");
        };

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);

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
            } else if (data.type === "message") {
                setMessages((prev) => [...prev, { sender: "bot", text: data.text }]);
                setIsGenerating(false);
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
    }, [isOpen, user?.id]);

    const sendMessage = () => {
        if (!input.trim() || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN || isGenerating) return;

        const userMsg = input.trim();
        wsRef.current.send(JSON.stringify({ message: userMsg }));
        setMessages((prev) => [...prev, { sender: "you", text: userMsg }]);
        setInput("");
        setIsGenerating(true);
    };

    useEffect(() => {
        const timer1 = setTimeout(() => {
            setShowHint(true);
        }, 8000);

        const timer2 = setTimeout(() => {
            setShowHint(false);
        }, 11000);

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
        };
    }, []);

    if (!user) {
        return null;
    }

    return (
        <>
            <style>{`
                .typing-dot {
                    width: 5px;
                    height: 5px;
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
                
                /* Ẩn scrollbar nhưng vẫn cho cuộn */
                .chat-scroll-container::-webkit-scrollbar {
                    width: 6px;
                }
                .chat-scroll-container::-webkit-scrollbar-thumb {
                    background-color: rgba(0,0,0,0.1);
                    border-radius: 10px;
                }
                .chat-scroll-container::-webkit-scrollbar-track {
                    background: transparent;
                }
            `}</style>

            {/* Nút Floating Action Button */}
            {!isOpen && (
                <div className="position-fixed m-4" style={{ bottom: 0, right: 0, zIndex: 1050 }}>
                    {showHint && (
                        <div
                            style={{
                                position: "absolute",
                                bottom: "75px",
                                right: "0",
                                background: "#ffffff",
                                color: "#333",
                                borderRadius: "12px",
                                padding: "8px 14px",
                                boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
                                fontSize: "0.9rem",
                                fontWeight: "500",
                                animation: "fadeIn 0.5s ease-out",
                                whiteSpace: "nowrap"
                            }}
                            className={styles.hintBubble}
                        >
                            Hi! How can I help you?
                        </div>
                    )}
                    <Button
                        className="rounded-circle shadow-lg d-flex align-items-center justify-content-center transition-transform"
                        style={{
                            background: "linear-gradient(135deg, #007bff, #00c6ff)",
                            width: "65px",
                            height: "65px",
                            border: "none",
                            transition: "transform 0.2s"
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
                        onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
                        onClick={() => {
                            setIsOpen(true);
                            setShowHint(false);
                        }}
                    >
                        <Robot size={28} color="white" />
                    </Button>
                </div>
            )}

            {/* Khung Chat */}
            {isOpen && (
                <Card
                    className="position-fixed bottom-0 end-0 m-4 border-0"
                    style={{
                        width: isExpanded ? "550px" : "360px",
                        height: isExpanded ? "75vh" : "520px",
                        maxWidth: "92vw",
                        maxHeight: "85vh",
                        borderRadius: "20px",
                        display: "flex",
                        flexDirection: "column",
                        overflow: "hidden",
                        zIndex: 1050,
                        boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
                        transition: "all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)"
                    }}
                >
                    <Card.Header
                        className="d-flex justify-content-between align-items-center text-white px-4 py-3"
                        style={{
                            background: "linear-gradient(135deg, #007bff, #00c6ff)",
                            borderBottom: "none",
                        }}
                    >
                        <div className="d-flex align-items-center gap-2 fw-bold fs-5">
                            <Robot size={24} /> AI Assistant
                        </div>
                        <div className="d-flex align-items-center gap-3">
                            {isExpanded ? (
                                <ArrowsAngleContract
                                    size={18}
                                    role="button"
                                    onClick={() => setIsExpanded(false)}
                                    style={{ cursor: "pointer", opacity: 0.8 }}
                                    onMouseEnter={(e) => e.currentTarget.style.opacity = "1"}
                                    onMouseLeave={(e) => e.currentTarget.style.opacity = "0.8"}
                                />
                            ) : (
                                <ArrowsAngleExpand
                                    size={18}
                                    role="button"
                                    onClick={() => setIsExpanded(true)}
                                    style={{ cursor: "pointer", opacity: 0.8 }}
                                    onMouseEnter={(e) => e.currentTarget.style.opacity = "1"}
                                    onMouseLeave={(e) => e.currentTarget.style.opacity = "0.8"}
                                />
                            )}
                            <XLg
                                size={20}
                                role="button"
                                onClick={() => setIsOpen(false)}
                                style={{ cursor: "pointer", opacity: 0.8 }}
                                onMouseEnter={(e) => e.currentTarget.style.opacity = "1"}
                                onMouseLeave={(e) => e.currentTarget.style.opacity = "0.8"}
                            />
                        </div>
                    </Card.Header>

                    <Card.Body
                        className="chat-scroll-container"
                        style={{
                            flex: 1,
                            overflowY: "auto",
                            padding: "1.25rem",
                            background: "#f8f9fa",
                        }}
                    >
                        {messages.length === 0 && (
                            <div className="h-100 d-flex flex-column align-items-center justify-content-center text-muted opacity-50">
                                <Robot size={48} className="mb-2" />
                                <p>Bắt đầu cuộc trò chuyện...</p>
                            </div>
                        )}

                        {messages.map((msg, idx) => (
                            <div
                                key={idx}
                                className={`d-flex mb-3 ${msg.sender === "you" ? "justify-content-end" : "justify-content-start"}`}
                            >
                                <div
                                    className="px-3 py-2 shadow-sm position-relative"
                                    style={{
                                        maxWidth: isExpanded ? "80%" : "85%",
                                        borderRadius: msg.sender === "you" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                                        background: msg.sender === "you" ? "linear-gradient(135deg, #007bff, #0056b3)" : "#ffffff",
                                        color: msg.sender === "you" ? "#ffffff" : "#212529",
                                        fontSize: "0.95rem",
                                        lineHeight: "1.5",
                                        whiteSpace: "pre-wrap",
                                        minHeight: "40px",
                                        border: msg.sender === "bot" ? "1px solid #e9ecef" : "none"
                                    }}
                                >
                                    {msg.text}
                                    {(msg.sender === "bot" && msg.text === "" && idx === messages.length - 1) && (
                                        <div className="d-flex align-items-center justify-content-center" style={{ height: '24px', width: '30px' }}>
                                            <span className="typing-dot"></span>
                                            <span className="typing-dot"></span>
                                            <span className="typing-dot"></span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </Card.Body>

                    <Card.Footer className="p-3 bg-white border-top">
                        <Form
                            onSubmit={(e) => {
                                e.preventDefault();
                                sendMessage();
                            }}
                            className="d-flex align-items-center gap-2"
                        >
                            <Form.Control
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder={isGenerating ? "AI đang suy nghĩ..." : "Hỏi AI bất cứ điều gì..."}
                                className="border-0 shadow-none px-3"
                                style={{
                                    background: "#f1f3f5",
                                    borderRadius: "20px",
                                    height: "44px"
                                }}
                                disabled={!connected || isGenerating}
                            />
                            <Button
                                className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 transition-transform"
                                style={{
                                    width: "44px",
                                    height: "44px",
                                    background: (connected && input.trim() !== "" && !isGenerating)
                                        ? "linear-gradient(135deg, #007bff, #00c6ff)"
                                        : "#e9ecef",
                                    border: "none",
                                    color: (connected && input.trim() !== "" && !isGenerating) ? "white" : "#adb5bd"
                                }}
                                onClick={sendMessage}
                                disabled={!connected || input.trim() === "" || isGenerating}
                            >
                                <Send size={18} />
                            </Button>
                        </Form>
                    </Card.Footer>
                </Card>
            )}
        </>
    );
}