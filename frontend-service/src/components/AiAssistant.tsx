import { useContext, useEffect, useRef, useState } from "react";
import { Robot, Send, XLg } from "react-bootstrap-icons";
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
    const [connected, setConnected] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [showHint, setShowHint] = useState(false);
    const [input, setInput] = useState("");

    // Thêm state isGenerating để khóa input khi AI đang trả lời
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
                setIsGenerating(true); // Đảm bảo khóa input khi bắt đầu stream

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
                setIsGenerating(false); // Mở khóa input khi gen xong

            } else if (data.type === "message") {
                setMessages((prev) => [...prev, { sender: "bot", text: data.text }]);
                setIsGenerating(false); // Mở khóa input nếu dùng kiểu tin nhắn thường
            }
        };

        socket.onclose = () => {
            if (wsRef.current === socket) {
                setConnected(false);
                setIsGenerating(false); // Reset lại nếu bị mất kết nối
                wsRef.current = null;
            }
        };

        return () => {
            socket.close();
        };
    }, [isOpen, user?.id]);

    const sendMessage = () => {
        // Chặn gửi tin nhắn nếu AI đang gen
        if (!input.trim() || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN || isGenerating) return;

        const userMsg = input.trim();
        wsRef.current.send(JSON.stringify({ message: userMsg }));
        setMessages((prev) => [...prev, { sender: "you", text: userMsg }]);
        setInput("");
        setIsGenerating(true); // Khóa input ngay lập tức sau khi bấm gửi
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
            `}</style>

            {!isOpen && user && (
                <div className="position-fixed m-4" style={{ bottom: 0, right: 0, zIndex: 1050, position: "fixed" }}>
                    {showHint && (
                        <div
                            style={{
                                position: "absolute",
                                bottom: "70px",
                                right: "0",
                                background: "#fff",
                                borderRadius: "8px",
                                padding: "6px 10px",
                                boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                                fontSize: "0.85rem",
                                animation: "fadeIn 0.5s ease-out",
                                whiteSpace: "nowrap"
                            }}
                            className={styles.hintBubble}
                        >
                            Hi! How can I help you?
                        </div>
                    )}
                    <Button
                        variant="primary"
                        className="rounded-circle shadow position-relative"
                        style={{
                            background: "linear-gradient(135deg, #4facfe, #00f2fe)",
                            width: "60px",
                            height: "60px",
                            border: "none"
                        }}
                        onClick={() => {
                            setIsOpen(true);
                            setShowHint(false);
                        }}
                    >
                        <Robot size={24} />
                    </Button>
                </div>
            )}

            {isOpen && user && (
                <Card
                    className="position-fixed bottom-0 end-0 m-4 shadow-lg border-0"
                    style={{
                        width: "340px",
                        height: "460px",
                        borderRadius: "16px",
                        display: "flex",
                        flexDirection: "column",
                        overflow: "hidden",
                        zIndex: 1050,
                    }}
                >
                    <Card.Header
                        className="d-flex justify-content-between align-items-center text-white"
                        style={{
                            background: "linear-gradient(135deg, #4facfe, #00f2fe)",
                            border: "none",
                            fontWeight: "600",
                        }}
                    >
                        <span className="d-flex align-items-center">
                            <Robot size={20} className="me-2" /> AI Assistant
                        </span>
                        <XLg
                            role="button"
                            onClick={() => setIsOpen(false)}
                            style={{ cursor: "pointer" }}
                        />
                    </Card.Header>

                    <Card.Body
                        style={{
                            flex: 1,
                            overflowY: "auto",
                            padding: "0.75rem",
                            background: "#f1f3f6",
                        }}
                    >
                        {messages.map((msg, idx) => (
                            <div
                                key={idx}
                                className={`d-flex mb-2 ${msg.sender === "you" ? "justify-content-end" : "justify-content-start"
                                }`}
                            >
                                <div
                                    className={`px-3 py-2 shadow-sm`}
                                    style={{
                                        maxWidth: "75%",
                                        borderRadius:
                                            msg.sender === "you"
                                                ? "16px 16px 4px 16px"
                                                : "16px 16px 16px 4px",
                                        background: msg.sender === "you" ? "#4facfe" : "#e0e0e0",
                                        color: msg.sender === "you" ? "white" : "#333",
                                        fontSize: "0.9rem",
                                        whiteSpace: "pre-wrap",
                                        minHeight: "36px",
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
                    </Card.Body>

                    <Card.Footer className="p-2 bg-white border-0">
                        <Form
                            onSubmit={(e) => {
                                e.preventDefault();
                                sendMessage();
                            }}
                            className="d-flex align-items-center"
                        >
                            <Form.Control
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder={isGenerating ? "AI đang trả lời..." : "Nhập tin nhắn..."} // Cập nhật placeholder
                                size="sm"
                                className="rounded-pill"
                                disabled={!connected || isGenerating} // Khóa ô input
                            />
                            <Button
                                variant="primary"
                                size="sm"
                                className="ms-2 rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                                style={{
                                    width: "36px",
                                    height: "36px",
                                    background: (connected && input.trim() !== "" && !isGenerating)
                                        ? "linear-gradient(135deg, #4facfe, #00f2fe)"
                                        : "#c0c0c0",
                                    border: "none",
                                }}
                                onClick={sendMessage}
                                disabled={!connected || input.trim() === "" || isGenerating} // Khóa nút gửi
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