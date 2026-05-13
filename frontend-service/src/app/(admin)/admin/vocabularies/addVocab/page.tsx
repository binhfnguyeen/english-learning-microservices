"use client"
import authApis from "@/configs/AuthApis";
import endpoints from "@/configs/Endpoints";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react"
import { Alert, Button, Card, Col, Container, Form, Nav, Row, Spinner } from "react-bootstrap";

export default function AddVocabs() {
    const imageRef = useRef<HTMLInputElement>(null);
    const [word, setWord] = useState<string>("");
    const [wordSuggestions, setWordSuggestions] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [fetchingDetails, setFetchingDetails] = useState(false);
    const [meaning, setMeaning] = useState<string>("");
    const [meaningSuggestions, setMeaningSuggestions] = useState<string[]>([]);
    const [showMeaningSuggestions, setShowMeaningSuggestions] = useState(false);
    const [partOfSpeech, setPartOfSpeech] = useState<string>("");
    const [level, setLevel] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [msg, setMsg] = useState<string>("");
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            setPreviewImage(URL.createObjectURL(e.target.files[0]));
        }
    };

    const fetchWordSuggestions = async (text: string) => {
        if (!text.trim()) {
            setWordSuggestions([]);
            return;
        }
        try {
            const res = await fetch(`https://api.datamuse.com/sug?s=${encodeURIComponent(text)}&max=5`);
            if (res.ok) {
                const data = await res.json();
                setWordSuggestions(data.map((d: { word: string }) => d.word));
                setShowSuggestions(true);
            }
        } catch (err) {
            console.error("Suggestion error:", err);
        }
    };

    const handleWordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setWord(val);
        fetchWordSuggestions(val);
    };

    const handleSelectSuggestion = async (selectedWord: string) => {
        setWord(selectedWord);
        setShowSuggestions(false);
        setFetchingDetails(true);

        try {
            // Auto-estimate CEFR Level based on true frequency
            const freqRes = await fetch(`https://api.datamuse.com/words?sp=${encodeURIComponent(selectedWord)}&md=f&max=1`);
            if (freqRes.ok) {
                const freqData = await freqRes.json();
                if (freqData.length > 0 && freqData[0].tags) {
                    const fTag = freqData[0].tags.find((t: string) => t.startsWith('f:'));
                    if (fTag) {
                        const freq = parseFloat(fTag.split(':')[1]);
                        let autoLevel = "C2";
                        if (freq > 100) autoLevel = "A1";
                        else if (freq > 50) autoLevel = "A2";
                        else if (freq > 10) autoLevel = "B1";
                        else if (freq > 3) autoLevel = "B2";
                        else if (freq > 0.5) autoLevel = "C1";
                        setLevel(autoLevel);
                    }
                }
            }

            // Auto-fill Meaning and populate suggestions from Google Translate API
            const transRes = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=vi&dt=t&dt=bd&q=${encodeURIComponent(selectedWord)}`);
            if (transRes.ok) {
                const transData = await transRes.json();
                
                // Set primary meaning
                if (transData[0] && transData[0][0] && transData[0][0][0]) {
                    setMeaning(transData[0][0][0].toLowerCase());
                }

                // Extract multiple dictionary definitions
                let allMeanings: string[] = [];
                if (transData[1] && transData[1].length > 0) {
                    transData[1].forEach((posGroup: any) => {
                        if (posGroup[1] && posGroup[1].length > 0) {
                            allMeanings = [...allMeanings, ...posGroup[1]];
                        }
                    });
                }
                
                if (allMeanings.length > 0) {
                    setMeaningSuggestions(Array.from(new Set(allMeanings)));
                } else if (transData[0] && transData[0][0] && transData[0][0][0]) {
                    setMeaningSuggestions([transData[0][0][0].toLowerCase()]);
                } else {
                    setMeaningSuggestions([]);
                }
            }

            // Auto-fill Part of Speech
            const dictRes = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${selectedWord}`);
            if (dictRes.ok) {
                const dictData = await dictRes.json();
                if (dictData[0] && dictData[0].meanings[0]) {
                    const pos = dictData[0].meanings[0].partOfSpeech.toLowerCase();
                    setPartOfSpeech(pos);
                }
            }
        } catch (err) {
            console.error("Auto-fill error:", err);
        } finally {
            setFetchingDetails(false);
        }
    };

    const addVocab = async (e: React.FormEvent<HTMLElement>) => {
        e.preventDefault();
        try {
            setLoading(true);
            const formData = new FormData();
            formData.append("word", word);
            formData.append("meaning", meaning);
            formData.append("partOfSpeech", partOfSpeech);
            formData.append("level", level);
            if (imageRef.current?.files?.[0]) {
                formData.append("picture", imageRef.current.files[0]);
            }

            const res = await authApis.post(endpoints["vocabularies"], formData);
            console.info(res.data);

            setMsg("Thêm từ vựng mới thành công!");
            setWord("");
            setMeaning("");
            setPartOfSpeech("");
            setLevel("");
            setPreviewImage(null);
            if (imageRef.current) imageRef.current.value = "";
        } catch (ex) {
            console.error(ex);
            setMsg("Thêm từ vựng mới không thành công!");
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        if (msg) {
            const timer = setTimeout(() => setMsg(""), 2000);
            return () => clearTimeout(timer);
        }
    }, [msg]);


    return (
        <Container className="mt-4">
            <Nav className="mb-3">
                <Link href="/admin/vocabularies" className="btn btn-outline-secondary btn-sm">
                    Quay lại
                </Link>
            </Nav>

            <Card className="shadow-sm border-0 rounded-3">
                <Card.Body>
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h3 className="mb-0 fw-bold text-primary">Thêm từ vựng</h3>
                    </div>

                    {msg && (
                        <Alert
                            variant={msg.includes("không") ? "danger" : "success"}
                            className="py-2 position-fixed top-0 end-0 m-3 shadow"
                            style={{ zIndex: 9999, minWidth: "250px" }}
                        >
                            {msg}
                        </Alert>
                    )}

                    <Form onSubmit={addVocab}>
                        <Row className="mb-3">
                            <Col md={6}>
                                <Form.Group className="position-relative">
                                    <Form.Label className="fw-semibold">Từ</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Nhập từ..."
                                        value={word}
                                        onChange={handleWordChange}
                                        onFocus={() => { if (wordSuggestions.length > 0) setShowSuggestions(true); }}
                                        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                        required
                                    />
                                    {showSuggestions && wordSuggestions.length > 0 && (
                                        <div className="position-absolute w-100 bg-white border rounded shadow-sm mt-1" style={{ zIndex: 1000, maxHeight: '200px', overflowY: 'auto' }}>
                                            {wordSuggestions.map((suggestion, idx) => (
                                                <div
                                                    key={idx}
                                                    className="p-2 cursor-pointer hover-bg-light border-bottom text-dark"
                                                    style={{ cursor: 'pointer' }}
                                                    onMouseDown={() => handleSelectSuggestion(suggestion)}
                                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                                                >
                                                    {suggestion}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {fetchingDetails && <Form.Text className="text-info"><Spinner size="sm" animation="border" className="me-1" /> Đang tự động điền thông tin...</Form.Text>}
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="position-relative">
                                    <Form.Label className="fw-semibold">Nghĩa của từ</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Nhập nghĩa..."
                                        value={meaning}
                                        onChange={(e) => setMeaning(e.target.value)}
                                        onFocus={() => { if (meaningSuggestions.length > 0) setShowMeaningSuggestions(true); }}
                                        onBlur={() => setTimeout(() => setShowMeaningSuggestions(false), 200)}
                                        required
                                    />
                                    {showMeaningSuggestions && meaningSuggestions.length > 0 && (
                                        <div className="position-absolute w-100 bg-white border rounded shadow-sm mt-1" style={{ zIndex: 1000, maxHeight: '200px', overflowY: 'auto' }}>
                                            {meaningSuggestions.map((suggestion, idx) => (
                                                <div
                                                    key={idx}
                                                    className="p-2 cursor-pointer hover-bg-light border-bottom text-dark"
                                                    style={{ cursor: 'pointer' }}
                                                    onMouseDown={() => {
                                                        setMeaning(suggestion);
                                                        setShowMeaningSuggestions(false);
                                                    }}
                                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                                                >
                                                    {suggestion}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="fw-semibold">Loại từ</Form.Label>
                                    <Form.Select
                                        value={partOfSpeech}
                                        onChange={(e) => setPartOfSpeech(e.target.value)}
                                        required
                                    >
                                        <option value="">-- Chọn loại từ --</option>
                                        <option value="noun">Noun (Danh từ)</option>
                                        <option value="verb">Verb (Động từ)</option>
                                        <option value="adjective">Adjective (Tính từ)</option>
                                        <option value="adverb">Adverb (Trạng từ)</option>
                                        <option value="pronoun">Pronoun (Đại từ)</option>
                                        <option value="preposition">Preposition (Giới từ)</option>
                                        <option value="conjunction">Conjunction (Liên từ)</option>
                                        <option value="interjection">Interjection (Thán từ)</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="fw-semibold">Mức độ</Form.Label>
                                    <Form.Select
                                        value={level}
                                        onChange={(e) => setLevel(e.target.value)}
                                        required
                                    >
                                        <option value="">-- Chọn mức độ --</option>
                                        <option value="A1">A1</option>
                                        <option value="A2">A2</option>
                                        <option value="B1">B1</option>
                                        <option value="B2">B2</option>
                                        <option value="C1">C1</option>
                                        <option value="C2">C2</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="fw-semibold">Hình</Form.Label>
                                    <Form.Control
                                        type="file"
                                        accept="image/*"
                                        ref={imageRef}
                                        onChange={handleImageChange}
                                    />
                                    {previewImage && (
                                        <div className="mt-2">
                                            <img
                                                src={previewImage}
                                                alt="preview"
                                                style={{ width: "100px", height: "auto", borderRadius: "8px" }}
                                            />
                                        </div>
                                    )}
                                </Form.Group>
                            </Col>
                        </Row>

                        <div className="mt-4">
                            <Button variant="primary" type="submit" disabled={loading} className="px-4">
                                {loading ? (
                                    <>
                                        <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />{" "}
                                        Đang xử lý...
                                    </>
                                ) : (
                                    "Thêm từ vựng"
                                )}
                            </Button>
                        </div>
                    </Form>
                </Card.Body>
            </Card>
        </Container>
    );
}