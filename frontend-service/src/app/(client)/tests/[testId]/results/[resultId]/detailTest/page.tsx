"use client"
import MySpinner from "@/components/MySpinner";
import Apis from "@/configs/Apis";
import endpoints from "@/configs/Endpoints";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Badge, Card, Container, ListGroup, Nav } from "react-bootstrap";

interface TestFull {
    id: number;
    title: string;
    description: string;
    questions: Question[];
}

interface Question {
    id: number;
    content: string;
    choices: Choice[];
}

interface Choice {
    id: number;
    isCorrect: boolean;
    vocabularyId: number;
    word: string;
}

interface Explanation {
    questionId: number;
    explanation: string;
    relatedWords: string[];
}

interface Answer {
    questionChoiceId: UserChoice;
}

interface UserChoice {
    id: number;
    isCorrect: boolean;
}

export default function DetailTest() {
    const { testId } = useParams();
    const { resultId } = useParams();
    const id = Number(testId);
    const rsId = Number(resultId);
    const [test, setTest] = useState<TestFull>();
    const [answers, setAnswers] = useState<Answer[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [explanations, setExplanations] = useState<Explanation[]>([]);
    const [loadingExplain, setLoadingExplain] = useState<boolean>(false);

    const loadFullTest = async () => {
        try {
            setLoading(true);
            const res = await Apis.get(endpoints["fullTests"](id));
            setTest(res.data.result);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    const loadExplanations = async (questions: Question[]) => {
        try {
            setLoadingExplain(true);
            const res = await fetch("/api/gemini", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ questions }),
            });

            if (!res.ok) throw new Error("Gemini API error");
            const data: Explanation[] = await res.json();
            setExplanations(data);
        } catch (err) {
            console.error("Load explanations error:", err);
        } finally {
            setLoadingExplain(false);
        }
    }

    const loadAnswers = async () => {
        try {
            setLoading(true);
            const res = await Apis.get(endpoints["answers"](rsId));
            setAnswers(res.data.result);
            console.info(res.data.result);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadFullTest();
    }, [id])

    useEffect(() => {
        loadAnswers();
    }, [rsId])

    useEffect(() => {
        if (test?.questions?.length) {
            loadExplanations(test.questions);
        }
    }, [test]);

    const getExplanation = (qid: number) =>
        explanations.find((e) => e.questionId === qid);

    return (
        <Container className="my-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-bold">Chi tiết đề: {test?.title}</h2>
                <Nav className="mb-3">
                    <Link href="/tests" className="btn btn-outline-secondary btn-sm">
                        Quay lại
                    </Link>
                </Nav>
            </div>

            {loading ? (
                <MySpinner />
            ) : test ? (
                <Card className="shadow-sm">
                    <Card.Body>
                        <Card.Text className="text-muted">{test.description}</Card.Text>

                        <ListGroup variant="flush">
                            {test.questions.map((q, index) => {
                                const explain = getExplanation(q.id);
                                return (
                                    <ListGroup.Item key={q.id}>
                                        <strong>Câu {index + 1}:</strong> {q.content}
                                        <ul
                                            className="mt-2 mb-0"
                                            style={{ listStyle: "none", paddingLeft: 0 }}
                                        >
                                            {q.choices.map((c, choiceIndex) => {
                                                const label = String.fromCharCode(65 + choiceIndex);

                                                const userAnswer = answers.find(a =>
                                                    q.choices.some(ch => ch.id === a.questionChoiceId.id) &&
                                                    a.questionChoiceId.id === c.id
                                                );

                                                const isUserChoice = !!userAnswer;
                                                const isCorrect = c.isCorrect;

                                                let badge = null;
                                                if (isCorrect && (!isUserChoice || (isUserChoice && isCorrect))) {
                                                    badge = <Badge bg="success" className="ms-2">Đáp án đúng</Badge>;
                                                } else if (isUserChoice && !isCorrect) {
                                                    badge = <Badge bg="danger" className="ms-2">Bạn chọn</Badge>;
                                                }

                                                return (
                                                    <li key={c.id}>
                                                        <strong>{label}.</strong> {c.word} {badge}
                                                    </li>
                                                );
                                            })}
                                        </ul>

                                        <div className="mt-2 p-2 bg-light rounded">
                                            {loadingExplain && !explain ? (
                                                <small className="text-muted">
                                                    Đang tải giải thích...
                                                </small>
                                            ) : explain ? (
                                                <>
                                                    <div>
                                                        <strong>Giải thích:</strong> {explain.explanation}
                                                    </div>
                                                    <div>
                                                        <strong>Từ liên quan:</strong>{" "}
                                                        {explain.relatedWords.join(", ")}
                                                    </div>
                                                </>
                                            ) : (
                                                <small className="text-muted">
                                                    Không có giải thích
                                                </small>
                                            )}
                                        </div>
                                    </ListGroup.Item>
                                );
                            })}
                        </ListGroup>
                    </Card.Body>
                </Card>
            ) : (
                <p className="text-muted">Không tìm thấy đề thi.</p>
            )}
        </Container>
    );
}