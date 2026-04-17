"use client"
import MySpinner from "@/components/MySpinner";
import endpoints from "@/configs/Endpoints";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Badge, Card, Container, ListGroup } from "react-bootstrap";
import authApis from "@/configs/AuthApis";

interface Vocabulary { id: number; word: string; }
interface Choice {
    id: number;
    isCorrect: boolean | null;
    textContent?: string | null;
    vocabulary?: Vocabulary | null;
}
interface Question {
    id: number;
    content: string;
    type: string;
    correctAnswerText?: string;
    choices: Choice[];
}
interface TestFull {
    id: number;
    title: string;
    description: string;
    questions: Question[];
}

const IconCheck = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="me-1">
        <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
);

const getQuestionTypeIcon = (type: string) => {
    switch (type) {
        case 'MULTIPLE_CHOICE':
            return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="me-1"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>;
        case 'WORD_ORDER':
            return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="me-1"><path d="M15 12h6"></path><path d="M15 6h6"></path><path d="M15 18h6"></path><path d="M3 6h8"></path><path d="M3 12h8"></path><path d="M3 18h8"></path></svg>;
        default:
            return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="me-1"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>;
    }
};

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
        if (id) loadFullTest();
    }, [id])

    return (
        <Container className="my-5" style={{ maxWidth: 850 }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold text-dark m-0">Chi tiết đề thi</h2>
                    <span className="text-muted">{test?.title}</span>
                </div>
                <Link href="/admin/tests" className="btn btn-outline-secondary px-4 rounded-pill fw-medium">
                    ← Quay lại
                </Link>
            </div>

            {loading ? (
                <MySpinner />
            ) : test ? (
                <Card className="border-0 shadow-sm rounded-4">
                    <Card.Body className="p-4 p-md-5">
                        <div className="mb-4 pb-3 border-bottom">
                            <h4 className="fw-bold text-primary">{test.title}</h4>
                            <Card.Text className="text-muted fst-italic">{test.description || "Không có mô tả chi tiết cho bài kiểm tra này."}</Card.Text>
                        </div>

                        <ListGroup variant="flush">
                            {test.questions.map((q, index) => (
                                <ListGroup.Item key={q.id} className="py-4 border-light">
                                    <div className="d-flex justify-content-between align-items-start mb-2">
                                        <div className="fw-bold fs-5 text-dark">
                                            Câu {index + 1}: <span className="fw-medium text-secondary">{q.content}</span>
                                        </div>
                                        <Badge bg="primary" className="bg-opacity-10 text-primary border border-primary border-opacity-25 px-3 py-2 rounded-pill fw-bold">
                                            {getQuestionTypeIcon(q.type)} {q.type}
                                        </Badge>
                                    </div>

                                    <div className="mt-3 ps-3">

                                        {q.type === 'MULTIPLE_CHOICE' && (
                                            <div className="d-flex flex-column gap-2">
                                                {q.choices.map((c, choiceIndex) => {
                                                    const label = String.fromCharCode(65 + choiceIndex);
                                                    const displayValue = c.vocabulary?.word || c.textContent;
                                                    return (
                                                        <div key={c.id} className={`p-3 rounded-3 border transition ${c.isCorrect ? 'bg-success bg-opacity-10 border-success shadow-sm' : 'bg-white border-light-subtle'}`}>
                                                            <div className="d-flex justify-content-between align-items-center">
                                                                <div>
                                                                    <strong className="me-2 text-primary">{label}.</strong> {displayValue}
                                                                </div>
                                                                {c.isCorrect && <Badge bg="success" className="rounded-pill px-3 py-2"><IconCheck /> Đáp án</Badge>}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}

                                        {q.type === 'WORD_ORDER' && (
                                            <div className="d-flex flex-column gap-3">
                                                <div className="d-flex flex-wrap gap-2 p-3 bg-light rounded-3 border">
                                                    <div className="w-100 text-muted small fw-bold text-uppercase mb-1">Các mảnh ghép (Blocks):</div>
                                                    {q.choices.map((c) => (
                                                        <div key={c.id} className="px-3 py-1 bg-white border rounded-2 shadow-sm fw-medium">
                                                            {c.textContent || c.vocabulary?.word}
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="p-3 bg-success bg-opacity-10 border-start border-success border-4 rounded-3">
                                                    <div className="text-success small fw-bold text-uppercase mb-1">Câu hoàn chỉnh:</div>
                                                    <div className="fs-5 fw-bold text-dark">{q.correctAnswerText}</div>
                                                </div>
                                            </div>
                                        )}

                                        {(q.type === 'FILL_IN_BLANK' || q.type === 'REWRITE_SENTENCE') && (
                                            <div className="p-4 bg-primary bg-opacity-10 border-start border-primary border-4 rounded-3">
                                                <div className="text-primary small fw-bold text-uppercase mb-1">Đáp án chính xác:</div>
                                                <div className="fs-5 fw-bold text-dark">{q.correctAnswerText || "Chưa thiết lập đáp án"}</div>
                                            </div>
                                        )}

                                    </div>
                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                    </Card.Body>
                </Card>
            ) : (
                <div className="text-center py-5 bg-light rounded-4 border border-dashed">
                    <p className="text-muted m-0">Không tìm thấy dữ liệu đề thi.</p>
                </div>
            )}
        </Container>
    );
}