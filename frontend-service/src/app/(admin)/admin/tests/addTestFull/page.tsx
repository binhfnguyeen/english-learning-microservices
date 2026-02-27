"use client";
import Apis from "@/configs/Apis";
import authApis from "@/configs/AuthApis";
import endpoints from "@/configs/Endpoints";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button, Container, Form, Nav } from "react-bootstrap";

interface Vocabulary {
    id: number;
    word: string;
}

interface Topic {
    id: number;
    name: string;
}

interface ChoiceForm {
    vocabularyId: number;
    correct: boolean;
}

interface QuestionForm {
    content: string;
    choices: ChoiceForm[];
}

export default function AddTestFull() {
    const [topics, setTopics] = useState<Topic[]>([]);
    const [selectedTopicId, setSelectedTopicId] = useState<number | null>(null);
    const [vocabularies, setVocabularies] = useState<Vocabulary[]>([]);
    const [title, setTitle] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const [questions, setQuestions] = useState<QuestionForm[]>([]);

    useEffect(() => {
        const loadTopics = async () => {
            const res = await Apis.get(`${endpoints["topics"]}?page=0&size=9999`);
            setTopics(res.data.result.content || []);
        };

        loadTopics();
    }, []);

    const handleSelectTopic = async (id: number) => {
        setSelectedTopicId(id);
        const url = `${endpoints["topic_vocabs"](id)}?page=0&size=9999`;
        const res = await Apis.get(url);
        setVocabularies(res.data.result.content || []);
    };


    const addQuestion = () => {
        setQuestions([...questions, { content: "", choices: [] }]);
    };

    const updateQuestionContent = (index: number, value: string) => {
        const updated = [...questions];
        updated[index].content = value;
        setQuestions(updated);
    };

    const addChoice = (questionIndex: number) => {
        const updated = [...questions];
        updated[questionIndex].choices.push({ vocabularyId: 0, correct: false });
        setQuestions(updated);
    };

    const updateChoice = (
        questionIndex: number,
        choiceIndex: number,
        field: keyof ChoiceForm,
        value: ChoiceForm[typeof field]
    ) => {
        const updated = [...questions];
        updated[questionIndex].choices[choiceIndex] = {
            ...updated[questionIndex].choices[choiceIndex],
            [field]: value,
        };
        setQuestions(updated);
    };

    const handleSubmit = async () => {
        const payload = {
            title,
            description,
            questions
        };
        try {
            console.log(JSON.stringify(payload, null, 2));
            await authApis.post("/tests/full", payload);
            alert("Thêm đề thành công!");
        } catch (err) {
            console.error(err);
            alert("Thêm đề thất bại!");
        }
    };

    return (
        <Container className="my-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-bold">Thêm đề kiểm tra</h2>
                <Nav>
                    <Link href="/admin/tests" className="btn btn-outline-secondary btn-sm">
                        Quay lại
                    </Link>
                </Nav>
            </div>

            <Form.Group className="mb-3">
                <Form.Label>Chọn chủ đề</Form.Label>
                <Form.Select
                    value={selectedTopicId || ""}
                    onChange={(e) => handleSelectTopic(Number(e.target.value))}
                >
                    <option value="">-- Chọn chủ đề --</option>
                    {topics.map((t) => (
                        <option key={t.id} value={t.id}>
                            {t.name}
                        </option>
                    ))}
                </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
                <Form.Label>Tiêu đề</Form.Label>
                <Form.Control
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
            </Form.Group>

            <Form.Group className="mb-3">
                <Form.Label>Mô tả</Form.Label>
                <Form.Control
                    as="textarea"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
            </Form.Group>

            {questions.map((q, qIndex) => (
                <div key={qIndex} className="border p-3 mb-3">
                    <Form.Group>
                        <Form.Label>Câu hỏi {qIndex + 1}</Form.Label>
                        <Form.Control
                            value={q.content}
                            onChange={(e) => updateQuestionContent(qIndex, e.target.value)}
                        />
                    </Form.Group>

                    {q.choices.map((c, cIndex) => (
                        <div key={cIndex} className="d-flex gap-2 mt-2">
                            <Form.Select
                                value={c.vocabularyId}
                                onChange={(e) =>
                                    updateChoice(qIndex, cIndex, "vocabularyId", Number(e.target.value))
                                }
                            >
                                <option value="">-- Chọn từ vựng --</option>
                                {vocabularies.map((v) => (
                                    <option key={v.id} value={v.id}>
                                        {v.word}
                                    </option>
                                ))}
                            </Form.Select>

                            <Form.Check
                                type="checkbox"
                                label="Đúng"
                                checked={c.correct}
                                onChange={(e) =>
                                    updateChoice(qIndex, cIndex, "correct", e.target.checked)
                                }
                            />
                        </div>
                    ))}

                    <Button
                        variant="secondary"
                        size="sm"
                        className="mt-2"
                        onClick={() => addChoice(qIndex)}
                    >
                        + Thêm đáp án
                    </Button>
                </div>
            ))}

            <Button variant="primary" onClick={addQuestion}>
                + Thêm câu hỏi
            </Button>

            <hr />

            <Button variant="success" onClick={handleSubmit}>
                Lưu đề thi
            </Button>
        </Container>
    );
}