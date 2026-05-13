"use client";
import { useState, useRef, useEffect } from "react";
import { Button, Form, Spinner } from "react-bootstrap";
import { BookHalf, XLg, Search, VolumeUpFill, ChevronDown, ChevronUp, ArrowsAngleExpand, ArrowsAngleContract } from "react-bootstrap-icons";

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

export default function Dictionary() {
    const [isOpen, setIsOpen] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [query, setQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<DictionaryEntry | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [expandedMeaning, setExpandedMeaning] = useState<number | null>(0);
    const [showHint, setShowHint] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        if (isOpen) setTimeout(() => inputRef.current?.focus(), 100);
    }, [isOpen]);

    useEffect(() => {
        const t1 = setTimeout(() => setShowHint(true), 5000);
        const t2 = setTimeout(() => setShowHint(false), 8000);
        return () => { clearTimeout(t1); clearTimeout(t2); };
    }, []);

    const lookup = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        const word = query.trim().toLowerCase();
        if (!word) return;

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
        <>
            <style>{`
                .dict-scroll::-webkit-scrollbar { width: 5px; }
                .dict-scroll::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 6px; }
                .dict-widget {
                    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
                    animation: slideUp 0.25s cubic-bezier(0.25, 0.8, 0.25, 1);
                }
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(20px) scale(0.96); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
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
            `}</style>

            {/* FAB Button */}
            {!isOpen && (
                <div className="position-fixed m-4" style={{ bottom: 0, right: "90px", zIndex: 1049 }}>
                    {showHint && (
                        <div style={{
                            position: "absolute", bottom: "75px", right: 0,
                            background: "#fff", color: "#333", borderRadius: "12px",
                            padding: "8px 14px", boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
                            fontSize: "0.9rem", fontWeight: 500, whiteSpace: "nowrap",
                            animation: "slideUp 0.3s ease-out"
                        }}>
                            📖 English Dictionary
                        </div>
                    )}
                    <Button
                        className="rounded-circle shadow-lg d-flex align-items-center justify-content-center"
                        style={{
                            background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
                            width: "58px", height: "58px", border: "none",
                            transition: "transform 0.2s"
                        }}
                        onMouseEnter={e => e.currentTarget.style.transform = "scale(1.08)"}
                        onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                        onClick={() => setIsOpen(true)}
                    >
                        <BookHalf size={24} color="white" />
                    </Button>
                </div>
            )}

            {/* Dictionary Widget */}
            {isOpen && (
                <div className="dict-widget position-fixed m-4" style={{
                    bottom: 0, right: "90px", zIndex: 1049,
                    width: isExpanded ? "550px" : "360px",
                    maxWidth: "92vw",
                    background: "#fff", borderRadius: "20px",
                    boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
                    display: "flex", flexDirection: "column",
                    maxHeight: isExpanded ? "85vh" : "600px",
                    height: isExpanded ? "85vh" : "600px",
                    overflow: "hidden",
                    transition: "all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)"
                }}>
                    {/* Header */}
                    <div style={{
                        background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
                        padding: "14px 18px",
                        display: "flex", justifyContent: "space-between", alignItems: "center"
                    }}>
                        <div className="d-flex align-items-center gap-2 text-white fw-bold" style={{ fontSize: "1rem" }}>
                            <BookHalf size={20} /> English Dictionary
                        </div>
                        <div className="d-flex align-items-center gap-3">
                            {isExpanded ? (
                                <ArrowsAngleContract
                                    size={16} color="white" role="button"
                                    onClick={() => setIsExpanded(false)}
                                    style={{ cursor: "pointer", opacity: 0.8 }}
                                    onMouseEnter={e => e.currentTarget.style.opacity = "1"}
                                    onMouseLeave={e => e.currentTarget.style.opacity = "0.8"}
                                />
                            ) : (
                                <ArrowsAngleExpand
                                    size={16} color="white" role="button"
                                    onClick={() => setIsExpanded(true)}
                                    style={{ cursor: "pointer", opacity: 0.8 }}
                                    onMouseEnter={e => e.currentTarget.style.opacity = "1"}
                                    onMouseLeave={e => e.currentTarget.style.opacity = "0.8"}
                                />
                            )}
                            <XLg size={18} color="white" role="button" onClick={() => setIsOpen(false)}
                                style={{ cursor: "pointer", opacity: 0.8 }}
                                onMouseEnter={e => e.currentTarget.style.opacity = "1"}
                                onMouseLeave={e => e.currentTarget.style.opacity = "0.8"}
                            />
                        </div>
                    </div>

                    {/* Search */}
                    <div style={{ padding: "14px 16px", borderBottom: "1px solid #f3f4f6" }}>
                        <Form onSubmit={lookup} className="d-flex gap-2">
                            <Form.Control
                                ref={inputRef}
                                type="text"
                                value={query}
                                onChange={e => setQuery(e.target.value)}
                                placeholder="Search English word..."
                                style={{
                                    borderRadius: "10px", border: "1.5px solid #e5e7eb",
                                    padding: "8px 14px", fontSize: "0.9rem",
                                    boxShadow: "none", outline: "none"
                                }}
                            />
                            <Button type="submit" disabled={loading || !query.trim()}
                                style={{
                                    borderRadius: "10px", minWidth: "42px",
                                    background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
                                    border: "none", padding: "8px 12px"
                                }}>
                                {loading ? <Spinner size="sm" animation="border" /> : <Search size={16} />}
                            </Button>
                        </Form>
                    </div>

                    {/* Result */}
                    <div className="dict-scroll" style={{ flex: 1, overflowY: "auto", padding: "14px 16px" }}>
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
                                {/* Word + Phonetic */}
                                <div className="d-flex align-items-center gap-2 mb-3">
                                    <div>
                                        <h4 style={{ margin: 0, fontWeight: 700, color: "#111827", fontSize: "1.4rem" }}>
                                            {result.word}
                                        </h4>
                                        {phonetic && (
                                            <span style={{ color: "#6b7280", fontSize: "0.88rem" }}>{phonetic}</span>
                                        )}
                                    </div>
                                    {hasAudio && (
                                        <button onClick={playAudio} style={{
                                            marginLeft: "auto", background: "#ede9fe",
                                            border: "none", borderRadius: "8px",
                                            padding: "6px 10px", cursor: "pointer", color: "#7c3aed"
                                        }}>
                                            <VolumeUpFill size={16} />
                                        </button>
                                    )}
                                </div>

                                {/* Meanings */}
                                {result.meanings.map((m, mi) => (
                                    <div key={mi} className="meaning-card">
                                        <button
                                            onClick={() => setExpandedMeaning(expandedMeaning === mi ? null : mi)}
                                            style={{
                                                width: "100%", background: "#fafafa", border: "none",
                                                padding: "10px 14px", textAlign: "left",
                                                display: "flex", justifyContent: "space-between", alignItems: "center",
                                                cursor: "pointer"
                                            }}
                                        >
                                            <span className="tag-chip" style={{ background: POS_COLORS[m.partOfSpeech] || "#6b7280" }}>
                                                {m.partOfSpeech}
                                            </span>
                                            {expandedMeaning === mi
                                                ? <ChevronUp size={14} color="#9ca3af" />
                                                : <ChevronDown size={14} color="#9ca3af" />}
                                        </button>

                                        {expandedMeaning === mi && (
                                            <div style={{ padding: "10px 14px 12px" }}>
                                                {m.definitions.slice(0, 3).map((def, di) => (
                                                    <div key={di} style={{ marginBottom: di < 2 ? "10px" : 0 }}>
                                                        <p style={{ margin: 0, fontSize: "0.88rem", color: "#1f2937", lineHeight: 1.5 }}>
                                                            <span style={{ color: "#9ca3af", fontWeight: 600, marginRight: "4px" }}>{di + 1}.</span>
                                                            {def.definition}
                                                        </p>
                                                        {def.example && (
                                                            <p style={{
                                                                margin: "4px 0 0 14px", fontSize: "0.82rem",
                                                                color: "#6b7280", fontStyle: "italic"
                                                            }}>
                                                                "{def.example}"
                                                            </p>
                                                        )}
                                                    </div>
                                                ))}

                                                {m.synonyms && m.synonyms.length > 0 && (
                                                    <div style={{ marginTop: "10px" }}>
                                                        <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "#6b7280", display: "block", marginBottom: "4px" }}>
                                                            SYNONYMS
                                                        </span>
                                                        {m.synonyms.slice(0, 6).map((s, si) => (
                                                            <span key={si} className="syn-chip"
                                                                onClick={() => { setQuery(s); lookup(); }}>
                                                                {s}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}

                                                {m.antonyms && m.antonyms.length > 0 && (
                                                    <div style={{ marginTop: "8px" }}>
                                                        <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "#6b7280", display: "block", marginBottom: "4px" }}>
                                                            ANTONYMS
                                                        </span>
                                                        {m.antonyms.slice(0, 6).map((a, ai) => (
                                                            <span key={ai} className="ant-chip"
                                                                onClick={() => { setQuery(a); lookup(); }}>
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
                            <div style={{ textAlign: "center", padding: "30px 0", color: "#9ca3af" }}>
                                <BookHalf size={40} style={{ opacity: 0.3, marginBottom: "10px" }} />
                                <p style={{ fontSize: "0.88rem", margin: 0 }}>Type a word above to look it up</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
