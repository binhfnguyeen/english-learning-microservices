"use client";

import authApis from "@/configs/AuthApis";
import endpoints from "@/configs/Endpoints";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button, Container, Form, Card, Row, Col, Badge } from "react-bootstrap";


interface Vocabulary {
    id: number;
    word: string;
}

interface Topic {
    id: number;
    name: string;
}

type QuestionType = "MULTIPLE_CHOICE" | "FILL_IN_BLANK" | "REWRITE_SENTENCE" | "WORD_ORDER";

interface ChoiceForm {
    vocabularyId: number | "";
    textContent: string;
    isCorrect: boolean;
}

interface QuestionForm {
    content: string;
    type: QuestionType;
    correctAnswerText: string;
    choices: ChoiceForm[];
}

const IconFileText = ({ size = 24, className = "" }) => (
    <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <line x1="16" y1="13" x2="8" y2="13"></line>
        <line x1="16" y1="17" x2="8" y2="17"></line>
        <polyline points="10 9 9 9 8 9"></polyline>
    </svg>
);

const IconPlus = ({ size = 20, className = "" }) => (
    <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
);

const IconTrash = ({ size = 18, className = "" }) => (
    <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6"></polyline>
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    </svg>
);

const IconSave = ({ size = 20, className = "" }) => (
    <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
        <polyline points="17 21 17 13 7 13 7 21"></polyline>
        <polyline points="7 3 7 8 15 8"></polyline>
    </svg>
);

const IconZap = ({ size = 18, className = "" }) => (
    <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
    </svg>
);

const IconLightbulb = ({ size = 16, className = "" }) => (
    <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 18h6"></path>
        <path d="M10 22h4"></path>
        <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.14.74.74 1.21 1.5 1.39 2.36"></path>
    </svg>
);

export default function AddTestFull() {
    const [topics, setTopics] = useState<Topic[]>([]);
    const [selectedTopicId, setSelectedTopicId] = useState<number | "">("");
    const [vocabularies, setVocabularies] = useState<Vocabulary[]>([]);

    const [title, setTitle] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const [difficultyLevel, setDifficultyLevel] = useState<string>("Easy");
    const [questions, setQuestions] = useState<QuestionForm[]>([]);

    const [submitted, setSubmitted] = useState<boolean>(false);

    const shuffleArray = <T,>(array: T[]): T[] => {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    };

    useEffect(() => {
        (async () => {
            try {
                const res = await authApis.get(`${endpoints["topics"]}?page=0&size=9999`);
                setTopics(res.data.result.content || []);
            } catch (err) {
                console.error("Error loading topics:", err);
            }
        })();
    }, []);

    const handleSelectTopic = async (id: number | "") => {
        setSelectedTopicId(id);
        if (!id) {
            setVocabularies([]);
            return;
        }
        try {
            const url = `${endpoints["topic_vocabs"](id as number)}?page=0&size=9999`;
            const res = await authApis.get(url);
            setVocabularies(res.data.result.content || []);
        } catch (err) {
            console.error("Error loading vocabulary:", err);
        }
    };

    const addQuestion = () => {
        setQuestions([
            ...questions,
            { content: "Choose the correct answer:", type: "MULTIPLE_CHOICE", correctAnswerText: "", choices: [] }
        ]);
    };

    const removeQuestion = (index: number) => {
        setQuestions(questions.filter((_, i) => i !== index));
    };

    const updateQuestion = <K extends keyof QuestionForm>(
        index: number,
        field: K,
        value: QuestionForm[K]
    ) => {
        const updated = [...questions];
        updated[index][field] = value;

        if (field === "type") {
            const typeValue = value as QuestionType;

            if (typeValue === "FILL_IN_BLANK" || typeValue === "REWRITE_SENTENCE") {
                updated[index].choices = [];
            }

            if (typeValue === "MULTIPLE_CHOICE") {
                updated[index].correctAnswerText = "";
            }

            const currentContent = updated[index].content || "";

            if (
                currentContent.trim() === "" ||
                currentContent.startsWith("Sắp xếp") ||
                currentContent.startsWith("Viết lại") ||
                currentContent.startsWith("Điền từ") ||
                currentContent.startsWith("Chọn đáp")
            ) {
                if (typeValue === "WORD_ORDER") {
                    updated[index].content = "Arrange the following word blocks into a complete sentence:";
                } else if (typeValue === "REWRITE_SENTENCE") {
                    updated[index].content = "Rewrite the following sentence with equivalent meaning: \"[Enter original sentence here]\"";
                } else if (typeValue === "FILL_IN_BLANK") {
                    updated[index].content = "Fill in the blank with the appropriate word/phrase: [Enter beginning] ___ [Enter ending]";
                } else if (typeValue === "MULTIPLE_CHOICE") {
                    updated[index].content = "Choose the correct answer:";
                }
            }
        }

        setQuestions(updated);
    };

    const autoGenerateWordBlocks = async (qIndex: number) => {
        const q = questions[qIndex];
        if (!q.correctAnswerText || q.correctAnswerText.trim() === "") {
            const Swal = (await import("sweetalert2")).default;
            void Swal.fire("Attention", "Please enter the 'Correct Answer' before auto-generating word blocks!", "warning");
            return;
        }

        const words = q.correctAnswerText.trim().split(/\s+/);

        const generatedChoices: ChoiceForm[] = words.map(w => ({
            vocabularyId: "",
            textContent: w,
            isCorrect: false
        }));

        const shuffledChoices = shuffleArray(generatedChoices);

        const updated = [...questions];
        updated[qIndex].choices = shuffledChoices;
        setQuestions(updated);
    };

    const addChoice = (qIndex: number) => {
        const updated = [...questions];
        updated[qIndex].choices.push({ vocabularyId: "", textContent: "", isCorrect: false });
        setQuestions(updated);
    };

    const removeChoice = (qIndex: number, cIndex: number) => {
        const updated = [...questions];
        updated[qIndex].choices = updated[qIndex].choices.filter((_, i) => i !== cIndex);
        setQuestions(updated);
    };

    const updateChoice = <K extends keyof ChoiceForm>(
        qIndex: number,
        cIndex: number,
        field: K,
        value: ChoiceForm[K]
    ) => {
        const updated = [...questions];
        updated[qIndex].choices[cIndex][field] = value;
        setQuestions(updated);
    };

    const handleSubmit = async () => {
        setSubmitted(true);
        const Swal = (await import("sweetalert2")).default;

        if (!title || !difficultyLevel || selectedTopicId === "") {
            await Swal.fire("Error", "Please enter a Title and select a Topic!", "error");
            return;
        }

        if (questions.length === 0) {
            await Swal.fire("Error", "Please add at least 1 question", "error");
            return;
        }

        const payload = {
            title,
            description,
            difficultyLevel,
            topicId: selectedTopicId,
            questions: questions.map(q => ({
                ...q,
                choices: q.choices.map(c => ({
                    ...c,
                    vocabularyId: c.vocabularyId === "" ? null : c.vocabularyId,
                    textContent: c.textContent.trim() === "" ? null : c.textContent
                }))
            }))
        };

        try {
            await authApis.post(endpoints["Tests"], payload);
            await Swal.fire("Success!", "New practice test has been added", "success");
        } catch (err) {
            console.error(err);
            await Swal.fire("Failed!", "An error occurred while saving the test", "error");
        }
    };

    return (
        <Container className="my-5" style={{ maxWidth: 900 }}>
            {/* Header Navigation */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold text-dark m-0 d-flex align-items-center gap-2">
                        <IconFileText className="text-primary" size={28} /> Create New Practice Test
                    </h2>
                </div>
                <Link
                    href="/admin/tests"
                    className="btn btn-outline-secondary px-4 fw-medium"
                    style={{ borderRadius: '12px' }}
                >
                    ← Go Back
                </Link>
            </div>

            <Card className="shadow-sm border-0 mb-4 rounded-4">
                <Card.Body className="p-4 bg-light">
                    <h5 className="fw-bold mb-3 text-dark">1. General Information</h5>
                    <Row className="g-3">
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold">Select Topic <span className="text-danger">*</span></Form.Label>
                                <Form.Select
                                    required
                                    value={selectedTopicId}
                                    onChange={(e) => handleSelectTopic(e.target.value === "" ? "" : Number(e.target.value))}
                                    className={`shadow-sm ${submitted && selectedTopicId === "" ? "border-danger" : ""}`}
                                    style={{ padding: '10px 14px' }}
                                >
                                    <option value="">-- Select Topic (Required) --</option>
                                    {topics.map((t) => (
                                        <option key={t.id} value={t.id}>
                                            {t.name}
                                        </option>
                                    ))}
                                </Form.Select>
                                {selectedTopicId === "" && submitted && (
                                    <div className="text-danger small mt-1 fw-medium">Please select a topic.</div>
                                )}
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label className="fw-bold">Difficulty Level <span className="text-danger">*</span></Form.Label>
                                <Form.Select
                                    value={difficultyLevel}
                                    onChange={(e) => setDifficultyLevel(e.target.value)}
                                    className="shadow-sm"
                                    style={{ padding: '10px 14px' }}
                                >
                                    <option value="Easy">Easy</option>
                                    <option value="Medium">Medium</option>
                                    <option value="Hard">Hard</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={12}>
                            <Form.Group>
                                <Form.Label className="fw-bold">Test Title <span className="text-danger">*</span></Form.Label>
                                <Form.Control
                                    value={title}
                                    placeholder="Enter title..."
                                    onChange={(e) => setTitle(e.target.value)}
                                    className={`shadow-sm ${submitted && !title ? "border-danger" : ""}`}
                                    style={{ padding: '10px 14px' }}
                                />
                                {!title && submitted && (
                                    <div className="text-danger small mt-1 fw-medium">Title cannot be empty.</div>
                                )}
                            </Form.Group>
                        </Col>
                        <Col md={12}>
                            <Form.Group>
                                <Form.Label className="fw-bold">Description</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    value={description}
                                    placeholder="Enter description..."
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="shadow-sm"
                                    style={{ padding: '10px 14px' }}
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* DANH SÁCH CÂU HỎI */}
            <h5 className="fw-bold mb-3 text-dark mt-5">2. Questions List</h5>
            {questions.map((q, qIndex) => {
                const showVocabSelect = selectedTopicId !== "" && q.type === "MULTIPLE_CHOICE";

                return (
                    <Card key={qIndex} className="shadow-sm mb-4 rounded-4 border-start border-primary border-4">
                        <Card.Body className="p-4">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <Badge bg="primary" className="fs-6 px-3 py-2 rounded-pill shadow-sm">Question {qIndex + 1}</Badge>
                                <Button
                                    variant="outline-danger"
                                    size="sm"
                                    className="d-flex align-items-center gap-1 rounded-pill px-3"
                                    onClick={() => removeQuestion(qIndex)}
                                >
                                    <IconTrash size={16} /> Delete question
                                </Button>
                            </div>

                            <Row className="g-3 mb-4">
                                {/* Loại câu hỏi */}
                                <Col md={4}>
                                    <Form.Group>
                                        <Form.Label className="fw-bold text-muted small text-uppercase">Question Type</Form.Label>
                                        <Form.Select
                                            value={q.type}
                                            onChange={(e) => updateQuestion(qIndex, "type", e.target.value as QuestionType)}
                                            className="shadow-sm"
                                        >
                                            <option value="MULTIPLE_CHOICE">Multiple Choice</option>
                                            <option value="FILL_IN_BLANK">Fill in the Blank</option>
                                            <option value="WORD_ORDER">Word Order</option>
                                            <option value="REWRITE_SENTENCE">Rewrite Sentence</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Col>

                                <Col md={8}>
                                    <Form.Group>
                                        <Form.Label className="fw-bold text-muted small text-uppercase">
                                            Question Content (Structure Suggestion)
                                        </Form.Label>
                                        <Form.Control
                                            value={q.content}
                                            placeholder="Example: Choose the correct word..."
                                            onChange={(e) => updateQuestion(qIndex, "content", e.target.value)}
                                            className="shadow-sm"
                                        />
                                    </Form.Group>
                                </Col>

                                {q.type !== "MULTIPLE_CHOICE" && (
                                    <Col md={12}>
                                        <div className="bg-success bg-opacity-10 p-3 rounded-4 border border-success border-opacity-25 shadow-sm">
                                            <div className="d-flex justify-content-between align-items-center mb-2">
                                                <Form.Label className="fw-bold text-success m-0">
                                                    Correct Answer (Text)
                                                </Form.Label>
                                                {q.type === "WORD_ORDER" && (
                                                    <Button
                                                        variant="success"
                                                        size="sm"
                                                        className="fw-bold px-3 py-1 shadow-sm d-flex align-items-center gap-1 rounded-pill"
                                                        onClick={() => autoGenerateWordBlocks(qIndex)}
                                                    >
                                                        <IconZap size={14} /> Auto Generate Blocks
                                                    </Button>
                                                )}
                                            </div>

                                            <Form.Control
                                                value={q.correctAnswerText}
                                                placeholder={q.type === "WORD_ORDER" ? "Enter the complete sentence here then click 'Auto Generate Blocks' above ↗" : "Enter correct answer for auto-matching..."}
                                                onChange={(e) => updateQuestion(qIndex, "correctAnswerText", e.target.value)}
                                            />
                                            <Form.Text className="text-muted mt-2 d-flex align-items-center gap-1">
                                                <IconLightbulb className="text-warning" />
                                                {q.type === "WORD_ORDER" ? "Type the full sentence; the system will split it into drag-and-drop blocks." : "Enter correct word/sentence."}
                                            </Form.Text>
                                        </div>
                                    </Col>
                                )}
                            </Row>

                            {["MULTIPLE_CHOICE", "WORD_ORDER"].includes(q.type) && (
                                <div className="bg-light p-3 rounded-4 border shadow-sm">
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <span className="fw-bold text-secondary text-uppercase small">
                                            {q.type === "WORD_ORDER" ? "Word blocks (Drag & Drop)" : "Answer choices"}
                                        </span>
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            className="d-flex align-items-center gap-1 rounded-pill px-3"
                                            onClick={() => addChoice(qIndex)}
                                        >
                                            <IconPlus size={16} /> Add {q.type === "WORD_ORDER" ? "block" : "choice"}
                                        </Button>
                                    </div>

                                    {q.choices.length === 0 && (
                                        <p className="text-muted small m-0 fst-italic d-flex align-items-center gap-1">
                                            <IconLightbulb className="text-warning" />
                                            {q.type === "WORD_ORDER" ? "Enter correct sentence above then click 'Auto Generate Blocks'." : "No data available."}
                                        </p>
                                    )}

                                    {q.choices.map((c, cIndex) => (
                                        <Row key={cIndex} className="g-2 align-items-center mt-2 bg-white p-2 rounded-3 border shadow-sm mx-0 transition hover-bg-light">

                                            {showVocabSelect && (
                                                <Col xs={12} md={3}>
                                                    <Form.Select
                                                        value={c.vocabularyId}
                                                        onChange={(e) => updateChoice(qIndex, cIndex, "vocabularyId", e.target.value ? Number(e.target.value) : "")}
                                                    >
                                                        <option value="">-- Vocabulary --</option>
                                                        {vocabularies.map((v) => (
                                                            <option key={v.id} value={v.id}>
                                                                {v.word}
                                                            </option>
                                                        ))}
                                                    </Form.Select>
                                                </Col>
                                            )}

                                            <Col xs={12} md={q.type === "MULTIPLE_CHOICE" ? (showVocabSelect ? 5 : 8) : 9}>
                                                <Form.Control
                                                    placeholder={showVocabSelect ? "Or enter text (if not selecting vocabulary)" : "Enter text display..."}
                                                    value={c.textContent}
                                                    onChange={(e) => updateChoice(qIndex, cIndex, "textContent", e.target.value)}
                                                />
                                            </Col>

                                            {q.type === "MULTIPLE_CHOICE" && (
                                                <Col xs={8} md={2} className="text-center">
                                                    <Form.Check
                                                        type="checkbox"
                                                        label={<span className={c.isCorrect ? "text-success fw-bold" : ""}>Correct</span>}
                                                        checked={c.isCorrect}
                                                        onChange={(e) => updateChoice(qIndex, cIndex, "isCorrect", e.target.checked)}
                                                    />
                                                </Col>
                                            )}

                                            <Col xs={4} md={showVocabSelect ? 2 : (q.type === "WORD_ORDER" ? 3 : 2)} className="text-end">
                                                <Button
                                                    variant="outline-danger"
                                                    size="sm"
                                                    className="d-flex align-items-center justify-content-center gap-1 w-100 rounded-3"
                                                    onClick={() => removeChoice(qIndex, cIndex)}
                                                >
                                                    <IconTrash size={16} /> Delete
                                                </Button>
                                            </Col>
                                        </Row>
                                    ))}
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                );
            })}

            <div className="d-flex justify-content-between align-items-center mt-4 p-4 bg-white rounded-4 shadow-sm border">
                <Button
                    variant="outline-primary"
                    onClick={addQuestion}
                    className="fw-bold px-4 py-2 border-2 d-flex align-items-center gap-2 rounded-pill"
                >
                    <IconPlus /> ADD QUESTION
                </Button>

                <Button
                    variant="primary"
                    size="lg"
                    onClick={handleSubmit}
                    className="fw-bold px-5 py-2 rounded-pill shadow d-flex align-items-center gap-2 transition hover-scale"
                >
                    <IconSave /> SAVE TEST
                </Button>
            </div>

            <div style={{ height: '100px' }}></div>
        </Container>
    );
}