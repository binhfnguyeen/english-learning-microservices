"use client"
import MySpinner from "@/components/MySpinner";
import Apis from "@/configs/Apis";
import endpoints from "@/configs/Endpoints";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Badge, Card, Container, ListGroup, Nav } from "react-bootstrap";
import authApis from "@/configs/AuthApis";

interface Vocabulary {
    id: number;
    word: string;
    meaning: string;
    partOfSpeech: string;
    level: string | null;
    picture: string | null;
}

interface Choice {
    id: number;
    isCorrect: boolean | null;
    vocabulary: Vocabulary;
}

interface Question {
    id: number;
    content: string;
    choices: Choice[];
}

interface TestFull {
    id: number;
    title: string;
    description: string;
    questions: Question[];
}

export default function FullTest() {
    const { testId } = useParams();
    const id = Number(testId);
    const [test, setTest] = useState<TestFull>();
    const [loading, setLoading] = useState<boolean>(false);

    const loadFullTest = async () => {
        try {
            setLoading(true);
            const res = await authApis.get(endpoints["Test"](id));
            setTest(res.data.result);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadFullTest();
    }, [id])

    return (
        <Container className="my-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-bold">Chi tiết đề: {test?.title}</h2>
                <Nav className="mb-3">
                    <Link href="/admin/tests" className="btn btn-outline-secondary btn-sm">
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
                            {test.questions.map((q, index) => (
                                <ListGroup.Item key={q.id}>
                                    <strong>Câu {index + 1}:</strong> {q.content}
                                    <ul className="mt-2 mb-0" style={{ listStyle: "none", paddingLeft: 0 }}>
                                        {q.choices.map((c, choiceIndex) => {
                                            const label = String.fromCharCode(65 + choiceIndex);
                                            return (
                                                <li key={c.id}>
                                                    <strong>{label}.</strong> {c.vocabulary.word}{" "}
                                                    {c.isCorrect === true && (
                                                        <Badge bg="success" className="ms-2">
                                                            Đáp án đúng
                                                        </Badge>
                                                    )}
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                    </Card.Body>
                </Card>
            ) : (
                <p className="text-muted">Không tìm thấy đề thi.</p>
            )}
        </Container>
    );
}