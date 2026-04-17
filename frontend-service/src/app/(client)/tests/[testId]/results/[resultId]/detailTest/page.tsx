"use client";

import MySpinner from "@/components/MySpinner";
import endpoints from "@/configs/Endpoints";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Badge, Card, Container, ListGroup, Nav, ProgressBar } from "react-bootstrap";
import authApis from "@/configs/AuthApis";

interface Vocabulary {
    id: number;
    word: string;
    meaning: string;
    partOfSpeech: string;
    level: string | null;
    picture: string | null;
}

interface TestFull {
    id: number;
    title: string;
    description: string;
    difficultyLevel: string;
    questions: Question[];
}

interface Question {
    id: number;
    content: string;
    type: string;                 // Bổ sung type câu hỏi
    correctAnswerText?: string;   // Bổ sung đáp án text chuẩn
    choices: Choice[];
}

// ĐÃ XÓA PHẦN INTERFACE BỊ TRÙNG LẶP, CHỈ GIỮ LẠI BẢN CHUẨN NÀY
interface Choice {
    id: number;
    isCorrect: boolean | null;
    textContent?: string;
    vocabulary: Vocabulary | null;
}

interface Answer {
    questionId: number;
    questionChoiceId: number | null; // Cập nhật cho phép null
    givenAnswerText?: string;        // Bổ sung chuỗi user đã nhập
}

export default function DetailTest() {
    const { testId, resultId } = useParams();
    const id = Number(testId);
    const rsId = Number(resultId);

    const [test, setTest] = useState<TestFull | null>(null);
    const [answers, setAnswers] = useState<Answer[]>([]);
    const [score, setScore] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(false);

    const loadData = async () => {
        try {
            setLoading(true);

            const resTest = await authApis.get(endpoints["Test"](id));
            setTest(resTest.data.result);

            const resResult = await authApis.get(`/test-results/${rsId}`);
            setScore(resResult.data.result?.score || 0);

            const resAnswers = await authApis.get(endpoints["answers"](id));
            setAnswers(resAnswers.data.result || []);

        } catch (err) {
            console.error("Lỗi tải dữ liệu:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id && rsId) loadData();
    }, [id, rsId]);

    const getDifficultyVariant = (level?: string) => {
        if (!level) return "secondary";
        const text = level.toLowerCase();
        if (text.includes("easy") || text.includes("dễ")) return "success";
        if (text.includes("medium") || text.includes("trung")) return "info";
        if (text.includes("hard") || text.includes("khó")) return "danger";
        return "secondary";
    };

    const percent = (score / 10) * 100;

    return (
        <Container className="my-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-bold text-primary">Kết quả chi tiết</h2>
                <Nav>
                    <Link href={`/tests/${id}`} className="btn btn-outline-secondary btn-sm rounded-pill px-3">
                        Quay lại bài thi
                    </Link>
                </Nav>
            </div>

            {loading ? (
                <MySpinner />
            ) : test ? (
                <>
                    <Card className="mb-4 border-0 shadow-sm overflow-hidden">
                        <Card.Header className="bg-primary text-white fw-bold py-3">
                            {test.title}
                        </Card.Header>
                        <Card.Body className="bg-light p-4">
                            <div className="row g-3">
                                <div className="col-md-4">
                                    <div className="bg-white p-3 rounded shadow-sm text-center">
                                        <div className="text-muted small mb-1">Độ khó</div>
                                        <Badge bg={getDifficultyVariant(test.difficultyLevel)} className="px-3 py-2">
                                            {test.difficultyLevel}
                                        </Badge>
                                    </div>
                                </div>

                                <div className="col-md-4">
                                    <div className="bg-white p-3 rounded shadow-sm text-center">
                                        <div className="text-muted small mb-1">Điểm</div>
                                        <div className="fw-bold fs-4 text-primary">
                                            {score.toFixed(1)} / 10
                                        </div>
                                    </div>
                                </div>

                                <div className="col-md-4">
                                    <div className="bg-white p-3 rounded shadow-sm text-center">
                                        <div className="text-muted small mb-1">Tỷ lệ đúng</div>
                                        <div className="fw-bold fs-4 text-success">
                                            {percent.toFixed(0)}%
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4">
                                <ProgressBar
                                    now={percent}
                                    variant={percent >= 50 ? "success" : "danger"}
                                    style={{ height: "10px" }}
                                />
                            </div>
                        </Card.Body>
                    </Card>

                    <Card className="shadow-sm border-0">
                        <Card.Body className="p-0">
                            <ListGroup variant="flush">
                                {test.questions.map((q, index) => {
                                    // Tìm câu trả lời của user cho câu hỏi này
                                    const userAnswer = answers.find(a => a.questionId === q.id);

                                    return (
                                        <ListGroup.Item key={q.id} className="p-4 border-bottom">
                                            <div className="fw-bold fs-5 mb-3">
                                                Câu {index + 1}: {q.content}
                                            </div>

                                            {/* RẼ NHÁNH: Nếu là câu hỏi text (Viết lại câu, Sắp xếp) */}
                                            {q.type && q.type !== 'MULTIPLE_CHOICE' ? (
                                                <div className="p-3 bg-light rounded border">
                                                    <div className="mb-2">
                                                        <span className="fw-bold text-muted">Bạn đã trả lời: </span>
                                                        <span className={userAnswer?.givenAnswerText?.trim().toLowerCase() === q.correctAnswerText?.trim().toLowerCase() ? "text-success fw-bold" : "text-danger fw-bold"}>
                                                            {userAnswer?.givenAnswerText || "(Không có câu trả lời)"}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span className="fw-bold text-muted">Đáp án đúng: </span>
                                                        <span className="text-success fw-bold">{q.correctAnswerText}</span>
                                                    </div>
                                                </div>
                                            ) : (
                                                /* RẼ NHÁNH: Dạng câu hỏi trắc nghiệm bình thường */
                                                <div className="d-flex flex-column gap-2">
                                                    {q.choices.map((c, choiceIndex) => {
                                                        const label = String.fromCharCode(65 + choiceIndex);
                                                        const isUserChoice = userAnswer?.questionChoiceId === c.id;
                                                        const isCorrect = c.isCorrect;

                                                        let className = "p-3 rounded border d-flex justify-content-between align-items-center ";
                                                        if (isCorrect) className += "bg-success-subtle border-success";
                                                        else if (isUserChoice && !isCorrect) className += "bg-danger-subtle border-danger";
                                                        else className += "bg-white";

                                                        return (
                                                            <div key={c.id} className={className}>
                                                                <div>
                                                                    <span className="fw-bold me-2">{label}.</span>
                                                                    {c.textContent || c.vocabulary?.word}
                                                                </div>

                                                                <div>
                                                                    {isCorrect && <Badge bg="success">Đúng</Badge>}
                                                                    {isUserChoice && !isCorrect && (
                                                                        <Badge bg="danger" className="ms-2">Bạn chọn</Badge>
                                                                    )}
                                                                    {isUserChoice && isCorrect && (
                                                                        <Badge bg="primary" className="ms-2">Bạn chọn</Badge>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </ListGroup.Item>
                                    );
                                })}
                            </ListGroup>
                        </Card.Body>
                    </Card>
                </>
            ) : (
                <div className="text-center py-5">
                    Không tìm thấy dữ liệu.
                </div>
            )}
        </Container>
    );
}