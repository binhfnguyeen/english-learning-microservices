"use client";

import { FormEvent, useEffect, useRef } from "react";
import { Bot, Minus, Send } from "lucide-react";
import UserContext from "@/configs/UserContext";
import { useContext } from "react";
import { useAiAssistant } from "@/components/AiAssistantContext";

export default function AiAssistant() {
    const user = useContext(UserContext)?.user;
    const {
        closeAssistant,
        connected,
        input,
        isGenerating,
        isOpen,
        messages,
        sendMessage,
        setInput,
    } = useAiAssistant();
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    if (!user) return null;

    const onSubmit = (event: FormEvent) => {
        event.preventDefault();
        sendMessage();
    };

    if (!isOpen) return null;

    return (
        <section className="fixed bottom-24 right-4 z-[2100] flex h-[500px] w-[350px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl lg:bottom-6">
            <header className="flex items-center justify-between bg-indigo-600 px-4 py-3 text-white">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
                        <Bot size={24} />
                    </div>
                    <div>
                        <p className="m-0 text-base font-black">Learning Assistant</p>
                        <p className="m-0 text-xs font-bold text-indigo-100">
                            {connected ? "Online" : "Connecting..."}
                        </p>
                    </div>
                </div>
                <button
                    onClick={closeAssistant}
                    className="rounded-full p-2 text-white/90 transition-colors hover:bg-white/15 hover:text-white"
                    aria-label="Minimize"
                >
                    <Minus size={20} />
                </button>
            </header>

            <div className="flex-1 overflow-y-auto bg-slate-50 px-4 py-4">
                {messages.length === 0 && (
                    <div className="flex h-full flex-col items-center justify-center text-center text-slate-400">
                        <Bot className="mb-3" size={44} />
                        <p className="m-0 text-sm font-bold">Start a conversation...</p>
                    </div>
                )}

                {messages.map((message, index) => (
                    <div
                        key={`${message.sender}-${index}`}
                        className={`mb-3 flex ${message.sender === "you" ? "justify-end" : "justify-start"}`}
                    >
                        <div
                            className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-6 shadow-sm ${
                                message.sender === "you"
                                    ? "rounded-br-md bg-indigo-600 text-white"
                                    : "rounded-bl-md border border-slate-100 bg-white text-slate-800"
                            }`}
                        >
                            {message.text || (
                                <span className="flex h-6 items-center gap-1">
                                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400" />
                                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:120ms]" />
                                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:240ms]" />
                                </span>
                            )}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={onSubmit} className="flex gap-2 border-t border-slate-100 bg-white p-3">
                <input
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    disabled={!connected || isGenerating}
                    placeholder={isGenerating ? "AI is thinking..." : "Ask a question here..."}
                    className="min-w-0 flex-1 rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold outline-none ring-indigo-200 transition focus:ring-2 disabled:cursor-not-allowed disabled:opacity-70"
                />
                <button
                    type="submit"
                    disabled={!connected || !input.trim() || isGenerating}
                    className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white transition-colors hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400"
                    aria-label="Gửi tin nhắn"
                >
                    <Send size={19} />
                </button>
            </form>
        </section>
    );
}
