"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { Button, Form, Spinner } from "react-bootstrap";
import { BookHalf, ChevronDown, ChevronUp, Search, VolumeUpFill } from "react-bootstrap-icons";

interface Definition {
    definition: string;
    example?: string;
}

interface Meaning {
    partOfSpeech: string;
    definitions: Definition[];
    synonyms?: string[];
    antonyms?: string[];
}

interface DictionaryEntry {
    word: string;
    phonetics: { text?: string; audio?: string }[];
    meanings: Meaning[];
}

const POS_COLORS: Record<string, string> = {
    noun: "#3b82f6",
    verb: "#ef4444",
    adjective: "#22c55e",
    adverb: "#f59e0b",
    pronoun: "#8b5cf6",
    preposition: "#6b7280",
    conjunction: "#ec4899",
    interjection: "#14b8a6",
};

const WORD_POOL = [
    "serendipity", "ephemeral", "eloquent", "resilient", "enigma",
    "luminescent", "pragmatic", "nostalgia", "ubiquitous", "meticulous",
    "ethereal", "ineffable", "petrichor", "aurora", "mellifluous",
    "solitude", "epiphany", "wanderlust", "tranquility", "ambivalent",
    "cacophony", "euphoria", "halcyon", "labyrinth", "panacea",
    "paradigm", "quintessential", "rhetoric", "sycophant", "zealous"
];

export default function DictionaryPage() {
    const [query, setQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<DictionaryEntry | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [expandedMeaning, setExpandedMeaning] = useState<number | null>(0);
    const [randomWords, setRandomWords] = useState<string[]>([]);

    const inputRef = useRef<HTMLInputElement>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        const shuffled = [...WORD_POOL].sort(() => 0.5 - Math.random());
        setRandomWords(shuffled.slice(0, 10));

        setTimeout(() => inputRef.current?.focus(), 100);
    }, []);

    const executeSearch = async (searchWord: string) => {
        const word = searchWord.trim().toLowerCase();
        if (!word) return;

        setQuery(word);
        setLoading(true);
        setResult(null);
        setError(null);
        setExpandedMeaning(0);

        try {
            const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
            if (!res.ok) {
                setError(`Không tìm thấy từ "${word}" trong từ điển.`);
                return;
            }
            const data: DictionaryEntry[] = await res.json();
            setResult(data[0]);
        } catch {
            setError("Lỗi kết nối. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };

    const handleFormSubmit = (e: FormEvent) => {
        e.preventDefault();
        executeSearch(query);
    };

    const playAudio = () => {
        if (!result) return;
        const audioUrl = result.phonetics.find(p => p.audio)?.audio;
        if (audioUrl) {
            if (audioRef.current) audioRef.current.pause();
            audioRef.current = new Audio(audioUrl);
            audioRef.current.play();
        }
    };

    const phonetic = result?.phonetics.find(p => p.text)?.text || "";
    const hasAudio = result?.phonetics.some(p => p.audio);

    return (
        <div className="dict-widget rounded-3 bg-white p-5 shadow-sm ring-1 ring-slate-200" style={{ minHeight: 520 }}>
            <style>{`
                .dict-scroll::-webkit-scrollbar { width: 5px; }
                .dict-scroll::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 6px; }
                .meaning-card {
                    border-radius: 10px;
                    border: 1px solid #e5e7eb;
                    overflow: hidden;
                    transition: box-shadow 0.2s;
                    margin-bottom: 8px;
                }
                .meaning-card:hover { box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
                .tag-chip {
                    display: inline-block;
                    padding: 2px 10px;
                    border-radius: 999px;
                    font-size: 0.72rem;
                    font-weight: 600;
                    color: white;
                    letter-spacing: 0.3px;
                }
                .syn-chip {
                    display: inline-block;
                    padding: 2px 8px;
                    border-radius: 6px;
                    font-size: 0.72rem;
                    background: #eff6ff;
                    color: #3b82f6;
                    margin: 2px;
                    border: 1px solid #bfdbfe;
                    cursor: pointer;
                    transition: background 0.15s;
                }
                .syn-chip:hover { background: #dbeafe; }
                .ant-chip {
                    display: inline-block;
                    padding: 2px 8px;
                    border-radius: 6px;
                    font-size: 0.72rem;
                    background: #fff1f2;
                    color: #ef4444;
                    margin: 2px;
                    border: 1px solid #fecdd3;
                    cursor: pointer;
                    transition: background 0.15s;
                }
                .ant-chip:hover { background: #ffe4e6; }
                .random-word-chip {
                    padding: 6px 14px;
                    font-size: 0.85rem;
                    border-radius: 20px;
                    background: #f3f4f6;
                    color: #4b5563;
                    border: 1px solid #e5e7eb;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .random-word-chip:hover {
                    background: #e5e7eb;
                    color: #111827;
                }
            `}</style>

            <div className="d-flex flex-column gap-4">
                <div className="d-flex flex-column gap-2">
                    <div className="d-flex align-items-center justify-content-between">
                        <div>
                            <p className="text-sm fw-bold text-lime-600 mb-1 uppercase tracking-[0.18em]">English Dictionary</p>
                            <h2 className="m-0 fw-bold text-slate-900">Lookup English words and usage</h2>
                        </div>
                    </div>
                    <p className="text-sm text-slate-500 mb-0">
                        Enter a word to view pronunciation, definitions, examples, synonyms, and antonyms.
                    </p>
                </div>

                <Form onSubmit={handleFormSubmit} className="d-flex gap-2">
                    <Form.Control
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Enter English word..."
                        className="rounded-3 border-2 border-slate-200 py-2 px-3"
                        style={{ minWidth: 0 }}
                    />
                    <Button
                        type="submit"
                        disabled={loading || !query.trim()}
                        className="rounded-3 px-4"
                    >
                        {loading ? <Spinner size="sm" animation="border" /> : <Search size={16} />}
                    </Button>
                </Form>

                <div className="dict-scroll mt-3" style={{ maxHeight: "62vh", overflowY: "auto" }}>
                    {error && (
                        <div style={{
                            background: "#fff1f2", border: "1px solid #fecdd3",
                            borderRadius: "10px", padding: "12px 16px",
                            color: "#be123c", fontSize: "0.88rem"
                        }}>
                            {error}
                        </div>
                    )}

                    {result && (
                        <div>
                            <div className="d-flex align-items-center gap-3 mb-4">
                                <div>
                                    <h4 style={{ margin: 0, fontWeight: 700, color: "#111827", fontSize: "1.5rem" }}>
                                        {result.word}
                                    </h4>
                                    {phonetic && (
                                        <span style={{ color: "#6b7280", fontSize: "0.9rem" }}>{phonetic}</span>
                                    )}
                                </div>
                                {hasAudio && (
                                    <button onClick={playAudio} style={{
                                        marginLeft: "auto", background: "#ede9fe",
                                        border: "none", borderRadius: "8px",
                                        padding: "8px 12px", cursor: "pointer", color: "#7c3aed"
                                    }}>
                                        <VolumeUpFill size={18} />
                                    </button>
                                )}
                            </div>

                            {result.meanings.map((m, mi) => (
                                <div key={mi} className="meaning-card">
                                    <button
                                        onClick={() => setExpandedMeaning(expandedMeaning === mi ? null : mi)}
                                        style={{
                                            width: "100%", background: "#fafafa", border: "none",
                                            padding: "12px 16px", textAlign: "left",
                                            display: "flex", justifyContent: "space-between", alignItems: "center",
                                            cursor: "pointer"
                                        }}
                                    >
                                        <span className="tag-chip" style={{ background: POS_COLORS[m.partOfSpeech] || "#6b7280" }}>
                                            {m.partOfSpeech}
                                        </span>
                                        {expandedMeaning === mi ? <ChevronUp size={16} color="#9ca3af" /> : <ChevronDown size={16} color="#9ca3af" />}
                                    </button>

                                    {expandedMeaning === mi && (
                                        <div style={{ padding: "12px 16px 16px" }}>
                                            {m.definitions.slice(0, 3).map((def, di) => (
                                                <div key={di} style={{ marginBottom: di < 2 ? "12px" : 0 }}>
                                                    <p style={{ margin: 0, fontSize: "0.9rem", color: "#1f2937", lineHeight: 1.6 }}>
                                                        <span style={{ color: "#9ca3af", fontWeight: 600, marginRight: "6px" }}>{di + 1}.</span>
                                                        {def.definition}
                                                    </p>
                                                    {def.example && (
                                                        <p style={{
                                                            margin: "6px 0 0 16px", fontSize: "0.84rem",
                                                            color: "#6b7280", fontStyle: "italic"
                                                        }}>
                                                            "{def.example}"
                                                        </p>
                                                    )}
                                                </div>
                                            ))}

                                            {m.synonyms && m.synonyms.length > 0 && (
                                                <div style={{ marginTop: "12px" }}>
                                                    <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "#6b7280", display: "block", marginBottom: "6px" }}>
                                                        SYNONYMS
                                                    </span>
                                                    {m.synonyms.slice(0, 6).map((s, si) => (
                                                        <span key={si} className="syn-chip" onClick={() => executeSearch(s)}>
                                                            {s}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}

                                            {m.antonyms && m.antonyms.length > 0 && (
                                                <div style={{ marginTop: "10px" }}>
                                                    <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "#6b7280", display: "block", marginBottom: "6px" }}>
                                                        ANTONYMS
                                                    </span>
                                                    {m.antonyms.slice(0, 6).map((a, ai) => (
                                                        <span key={ai} className="ant-chip" onClick={() => executeSearch(a)}>
                                                            {a}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {!result && !error && !loading && (
                        <div className="d-flex flex-column align-items-center justify-content-center" style={{ padding: "32px 0", color: "#9ca3af" }}>
                            <BookHalf size={44} style={{ opacity: 0.3, marginBottom: "16px", display: "block" }} />
                            <p style={{ fontSize: "0.95rem", margin: 0, textAlign: "center" }}>Type a word above to look it up, or try one of these:</p>
                            
                            <div className="mt-4 d-flex flex-wrap justify-content-center gap-2 px-2">
                                {randomWords.map((word, index) => (
                                    <span 
                                        key={index} 
                                        className="random-word-chip"
                                        onClick={() => executeSearch(word)}
                                    >
                                        {word}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
