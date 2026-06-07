"use client";

import Cookies from "js-cookie";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import UserContext from "@/configs/UserContext";

export type AiMessage = {
    sender: "you" | "bot";
    text: string;
};

type AiAssistantContextValue = {
    connected: boolean;
    input: string;
    isGenerating: boolean;
    isOpen: boolean;
    messages: AiMessage[];
    closeAssistant: () => void;
    openAssistant: () => void;
    sendMessage: () => void;
    setInput: (value: string) => void;
};

const AiAssistantContext = createContext<AiAssistantContextValue | null>(null);

export function AiAssistantProvider({ children }: { children: ReactNode }) {
    const [connected, setConnected] = useState(false);
    const [input, setInput] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<AiMessage[]>([]);
    const wsRef = useRef<WebSocket | null>(null);
    const context = useContext(UserContext);
    const user = context?.user;

    const openAssistant = useCallback(() => setIsOpen(true), []);
    const closeAssistant = useCallback(() => setIsOpen(false), []);

    useEffect(() => {
        if (!user?.id || !isOpen || wsRef.current) return;

        const token = Cookies.get("accessToken");
        if (!token) return;

        const socket = new WebSocket(`ws://localhost:8080/api/ai/ws/chat/${user.id}?token=${token}`);
        wsRef.current = socket;

        socket.onopen = () => setConnected(true);
        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);

            if (data.type === "history") {
                setMessages(data.data);
                return;
            }

            if (data.type === "stream_start") {
                setMessages((prev) => [...prev, { sender: "bot", text: "" }]);
                setIsGenerating(true);
                return;
            }

            if (data.type === "stream_chunk") {
                setMessages((prev) => {
                    const next = [...prev];
                    const lastIndex = next.length - 1;

                    if (lastIndex >= 0 && next[lastIndex].sender === "bot") {
                        next[lastIndex] = {
                            ...next[lastIndex],
                            text: next[lastIndex].text + data.text,
                        };
                    }

                    return next;
                });
                return;
            }

            if (data.type === "stream_done") {
                setIsGenerating(false);
                return;
            }

            if (data.type === "message") {
                setMessages((prev) => [...prev, { sender: "bot", text: data.text }]);
                setIsGenerating(false);
            }
        };

        socket.onclose = () => {
            if (wsRef.current === socket) {
                wsRef.current = null;
                setConnected(false);
                setIsGenerating(false);
            }
        };

        return () => {
            socket.close();
        };
    }, [isOpen, user?.id]);

    const sendMessage = useCallback(() => {
        const value = input.trim();
        const socket = wsRef.current;

        if (!value || !socket || socket.readyState !== WebSocket.OPEN || isGenerating) return;

        socket.send(JSON.stringify({ message: value }));
        setMessages((prev) => [...prev, { sender: "you", text: value }]);
        setInput("");
        setIsGenerating(true);
    }, [input, isGenerating]);

    return (
        <AiAssistantContext.Provider
            value={{
                connected,
                input,
                isGenerating,
                isOpen,
                messages,
                closeAssistant,
                openAssistant,
                sendMessage,
                setInput,
            }}
        >
            {children}
        </AiAssistantContext.Provider>
    );
}

export function useAiAssistant() {
    const context = useContext(AiAssistantContext);

    if (!context) {
        throw new Error("useAiAssistant must be used within AiAssistantProvider");
    }

    return context;
}
