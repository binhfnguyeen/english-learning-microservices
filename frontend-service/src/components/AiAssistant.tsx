import { useContext, useEffect, useRef, useState } from "react";
import { Robot, Send, XLg } from "react-bootstrap-icons";
import { Button, Card, Form } from "react-bootstrap";
import { v4 as uuidv4 } from "uuid";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import cleanOutput from "./CleanOutput";
import UserContext from "@/configs/UserContext";
import styles from "@/components/AiAssistant.module.css";

interface Message {
    sender: "you" | "bot";
    text: string;
}

export default function ChatAssistant() {
    const [isOpen, setIsOpen] = useState(false);
    const [connected, setConnected] = useState(false);
    const [conversationId, setConversationId] = useState<string>("");
    const [messages, setMessages] = useState<Message[]>([]);
    const [showHint, setShowHint] = useState(false);
    const [input, setInput] = useState("");
    const clientRef = useRef<Client | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const context = useContext(UserContext);
    const user = context?.user;

    useEffect(() => {
        setConversationId(uuidv4());
    }, []);

    useEffect(() => {
        if (!conversationId) return;

        setMessages([{ sender: "bot", text: "Hi! How can I help you?" }]);

        const socket = new SockJS("https://englearn-backend.onrender.com/elearn/ws-chat");
        const client = new Client({
            webSocketFactory: () => socket,
            reconnectDelay: 5000,
            onConnect: () => {
                setConnected(true);
                client.subscribe(`/topic/conversation/assisstant/${conversationId}`, (message) => {
                    const cleanText = cleanOutput(message.body);
                    setMessages((prev) => [...prev, { sender: "bot", text: cleanText }]);
                });
            },
            onDisconnect: () => {
                setConnected(false);
            }
        });

        client.activate();
        clientRef.current = client;

        return () => {
            client.deactivate();
            clientRef.current = null;
        };
    }, [conversationId]);

    const sendMessage = () => {
        if (!input.trim() || !clientRef.current || !connected) return;

        setMessages((prev) => [...prev, { sender: "you", text: input.trim() }]);

        clientRef.current.publish({
            destination: `/app/assisstant/${conversationId}`,
            body: JSON.stringify({ message: input.trim() }),
        });

        setInput("");
    };

    useEffect(() => {
        const timer1 = setTimeout(() => {
            setShowHint(true);
        }, 8000);

        const timer2 = setTimeout(() => {
            setShowHint(false);
        }, 3000);

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
        };
    });

    if (!user) {
        return null;
    }

    return (
        <>
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
                                    }}
                                >
                                    {msg.text}
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
                                placeholder="Nhập tin nhắn..."
                                size="sm"
                                className="rounded-pill"
                            />
                            <Button
                                variant="primary"
                                size="sm"
                                className="ms-2 rounded-circle d-flex align-items-center justify-content-center"
                                style={{
                                    width: "36px",
                                    height: "36px",
                                    background: "linear-gradient(135deg, #4facfe, #00f2fe)",
                                    border: "none",
                                }}
                                onClick={sendMessage}
                            >
                                <Send size={24} />
                            </Button>
                        </Form>
                    </Card.Footer>
                </Card>
            )}
        </>
    );
}