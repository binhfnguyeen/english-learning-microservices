"use client";
import { Button, Form, Modal, Spinner, Badge } from "react-bootstrap";
import { useState, useEffect } from "react";
import authApis from "@/configs/AuthApis";
import endpoints from "@/configs/Endpoints";
import { LightbulbFill, PlusCircleFill, Search, BookHalf, BookmarkCheckFill } from "react-bootstrap-icons";

interface Props {
    show: boolean;
    onHide: () => void;
    topicId?: number;
    topicName?: string;
    onSuccess?: () => void;
}

interface SuggestionItem {
    word: string;
    meaning?: string;
    partOfSpeech?: string;
    isAdded?: boolean;
    isLoading?: boolean;
    isFetchingDetails?: boolean;
}

interface VocabItem {
    id: number;
    word: string;
    meaning: string;
    partOfSpeech: string;
    level: string;
    picture?: string;
}

export default function PublicApiSuggestVocab({ show, onHide, topicId, topicName, onSuccess }: Props) {
    const [topicInput, setTopicInput] = useState(topicName || "");
    const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (topicName) setTopicInput(topicName);
    }, [topicName]);

    const fetchSuggestions = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!topicInput.trim()) return;

        setLoading(true);
        try {
            let searchTopic = topicInput;
            try {
                const transRes = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(topicInput)}&langpair=vi|en`);
                if (transRes.ok) {
                    const transData = await transRes.json();
                    if (transData.responseData.translatedText) {
                        searchTopic = transData.responseData.translatedText;
                    }
                }
            } catch (err) {
                console.warn("Translation failed, using original topic", err);
            }

            const encodedTopic = encodeURIComponent(searchTopic);
            const [trgRes, mlRes] = await Promise.all([
                fetch(`https://api.datamuse.com/words?rel_trg=${encodedTopic}&max=15`),
                fetch(`https://api.datamuse.com/words?ml=${encodedTopic}&max=15`)
            ]);

            const trgData = trgRes.ok ? await trgRes.json() : [];
            const mlData = mlRes.ok ? await mlRes.json() : [];

            const combined = [...mlData, ...trgData];
            const uniqueWords = new Set<string>();
            const data = combined.filter((item: { word: string }) => {
                const lowerWord = item.word.toLowerCase();
                if (uniqueWords.has(lowerWord)) return false;
                uniqueWords.add(lowerWord);
                return true;
            });

            const items: SuggestionItem[] = data.slice(0, 20).map((item: { word: string }) => ({
                word: item.word,
                isAdded: false,
                isLoading: false,
                isFetchingDetails: false
            }));

            setSuggestions(items);
        } catch (err) {
            console.error("Error fetching suggestions:", err);
            alert("Could not retrieve suggestions from Datamuse API.");
        } finally {
            setLoading(false);
        }
    };

    const handleQuickAdd = async (item: SuggestionItem, index: number) => {
        try {
            setSuggestions(prev => prev.map((v, i) => i === index ? { ...v, isLoading: true } : v));
            let meaning = "";
            let partOfSpeech = "noun";

            try {
                const transRes = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=vi&dt=t&q=${encodeURIComponent(item.word)}`);
                if (transRes.ok) {
                    const transData = await transRes.json();
                    if (transData[0] && transData[0][0] && transData[0][0][0]) {
                        meaning = transData[0][0][0].toLowerCase();
                    }
                }

                const dictRes = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${item.word}`);
                if (dictRes.ok) {
                    const dictData = await dictRes.json();
                    partOfSpeech = dictData[0].meanings[0].partOfSpeech.toLowerCase();
                }
            } catch (error) {
                console.error("Error fetching word details:", error);
                meaning = meaning || item.word;
            }

            const searchRes = await authApis.get(`${endpoints["vocabularies"]}?keyword=${encodeURIComponent(item.word)}`);
            let vocabId = null;
            const existing = searchRes.data.result.content.find((v: VocabItem) => v.word.toLowerCase() === item.word.toLowerCase());

            if (existing) {
                vocabId = existing.id;
                const formData = new FormData();
                formData.append("id", vocabId.toString());
                formData.append("word", item.word);
                formData.append("meaning", meaning || existing.meaning);
                formData.append("partOfSpeech", partOfSpeech || existing.partOfSpeech);
                formData.append("level", existing.level || "B1");

                await authApis.post(endpoints["vocabularies"], formData, {
                    headers: { "Content-Type": "multipart/form-data" }
                });
            } else {
                const formData = new FormData();
                formData.append("word", item.word);
                formData.append("meaning", meaning || "");
                formData.append("partOfSpeech", partOfSpeech || "noun");
                formData.append("level", "B1");

                const createRes = await authApis.post(endpoints["vocabularies"], formData, {
                    headers: { "Content-Type": "multipart/form-data" }
                });
                vocabId = createRes.data.result.id;
            }

            if (topicId) {
                await authApis.post(endpoints["topic_vocabs"](topicId), null, {
                    params: { vocabId }
                });
            }

            setSuggestions(prev => prev.map((v, i) => i === index ? { ...v, isAdded: true, isLoading: false, meaning, partOfSpeech } : v));
            if (onSuccess) onSuccess();
        } catch (err) {
            console.error(err);
            alert("Failed to add word!");
            setSuggestions(prev => prev.map((v, i) => i === index ? { ...v, isLoading: false } : v));
        }
    };

    // Helper: Map partOfSpeech to Bootstrap badge colors
    const getBadgeColor = (pos: string = 'noun') => {
        const posMap: Record<string, string> = {
            noun: 'primary',
            verb: 'danger',
            adjective: 'success',
            adverb: 'warning text-dark',
            pronoun: 'info',
            preposition: 'secondary',
        };
        return posMap[pos.toLowerCase()] || 'dark';
    };

    return (
        <>
            {/* Inline style để custom thanh cuộn và hiệu ứng hover */}
            <style jsx>{`
                .vocab-scroll-container::-webkit-scrollbar {
                    width: 6px;
                }
                .vocab-scroll-container::-webkit-scrollbar-track {
                    background: #f1f5f9;
                    border-radius: 8px;
                }
                .vocab-scroll-container::-webkit-scrollbar-thumb {
                    background-color: #cbd5e1;
                    border-radius: 8px;
                }
                .vocab-scroll-container::-webkit-scrollbar-thumb:hover {
                    background-color: #94a3b8;
                }
                .vocab-card {
                    transition: all 0.2s ease-in-out;
                    border: 1px solid #e2e8f0;
                }
                .vocab-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
                    border-color: #93c5fd;
                }
            `}</style>

            <Modal show={show} onHide={onHide} size="lg" centered backdrop="static" scrollable contentClassName="border-0 shadow-lg">
                <Modal.Header closeButton className="bg-light border-bottom-0 pb-2">
                    <Modal.Title className="fw-bolder text-primary d-flex align-items-center gap-2">
                        <div className="bg-white p-2 rounded shadow-sm d-flex align-items-center justify-content-center">
                            <Search size={20} className="text-primary" />
                        </div>
                        Auto Vocabulary Suggestions
                    </Modal.Title>
                </Modal.Header>

                <Modal.Body className="p-4 pt-2 bg-light rounded-bottom d-flex flex-column">
                    <p className="text-muted small mb-4">
                        The system will automatically search for popular vocabulary and synonyms related to the topic you enter.
                    </p>

                    <Form className="d-flex gap-2 mb-4 flex-shrink-0" onSubmit={fetchSuggestions}>
                        <div className="position-relative flex-grow-1">
                            <Form.Control
                                type="text"
                                size="lg"
                                value={topicInput}
                                onChange={(e) => setTopicInput(e.target.value)}
                                placeholder="Enter topic in English or Vietnamese (e.g., Environment...)"
                                className="shadow-sm border-0 rounded-3 px-4 fs-6"
                                style={{ height: '48px' }}
                                disabled={!!topicName}
                                readOnly={!!topicName}
                            />
                        </div>
                        <Button
                            type="submit"
                            disabled={loading || !topicInput.trim()}
                            className="rounded-3 px-4 fw-bold d-flex align-items-center gap-2 shadow-sm"
                            variant="primary"
                            style={{ height: '48px' }}
                        >
                            {loading ? <Spinner size="sm" animation="border" /> : <><LightbulbFill size={18} /> Analyze</>}
                        </Button>
                    </Form>

                    <div className="pe-2 vocab-scroll-container flex-grow-1" style={{ height: "400px", overflowY: "auto", overflowX: "hidden" }}>
                        {suggestions.length > 0 ? (
                            <div className="d-flex flex-column gap-3 py-1">
                                {suggestions.map((item, index) => (
                                    <div key={index} className={`vocab-card bg-white rounded-4 p-3 d-flex justify-content-between align-items-center ${item.isAdded ? 'opacity-75' : ''}`}>
                                        <div className="flex-grow-1 overflow-hidden">
                                            <div className="d-flex align-items-center gap-2 mb-1">
                                                <h5 className="mb-0 fw-bold text-dark text-capitalize">{item.word}</h5>
                                                {item.meaning && (
                                                    <Badge bg={getBadgeColor(item.partOfSpeech)} pill className="fw-normal px-2">
                                                        {item.partOfSpeech}
                                                    </Badge>
                                                )}
                                            </div>

                                            {item.meaning ? (
                                                <div className="text-secondary small d-flex align-items-center gap-1 text-truncate">
                                                    <BookHalf size={12} /> {item.meaning}
                                                </div>
                                            ) : (
                                                <div className="text-muted small fst-italic">
                                                    Click "Add" to automatically translate definition...
                                                </div>
                                            )}
                                        </div>

                                        <div className="ms-3 flex-shrink-0">
                                            <Button
                                                variant={item.isAdded ? "success" : "outline-primary"}
                                                className={`rounded-pill px-3 py-2 btn-sm d-flex align-items-center gap-2 fw-medium ${item.isAdded ? 'border-success' : ''}`}
                                                onClick={() => !item.isAdded && handleQuickAdd(item, index)}
                                                disabled={item.isAdded || item.isLoading}
                                                style={{ minWidth: "130px", justifyContent: "center" }}
                                            >
                                                {item.isLoading ? (
                                                    <><Spinner size="sm" /> Adding...</>
                                                ) : item.isAdded ? (
                                                    <><BookmarkCheckFill size={16} /> Added</>
                                                ) : (
                                                    <><PlusCircleFill size={16} /> {topicName ? `Add to topic ${topicName}` : 'Add'}</>
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : !loading && (
                            <div className="text-center py-5 d-flex flex-column align-items-center justify-content-center bg-white rounded-4 border h-100">
                                <div className="bg-light p-3 rounded-circle mb-3">
                                    <Search size={40} className="text-muted opacity-50" />
                                </div>
                                <h6 className="fw-bold text-secondary">No vocabulary data yet</h6>
                                <p className="text-muted small mb-0 px-4">Enter any topic in the search box above to get the most relevant vocabulary suggestions from AI.</p>
                            </div>
                        )}
                    </div>
                </Modal.Body>
            </Modal>
        </>
    );
}