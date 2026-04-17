"use client";

import MySpinner from "@/components/MySpinner";
import endpoints from "@/configs/Endpoints";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { Badge, Card, Container, ProgressBar } from "react-bootstrap";
import authApis from "@/configs/AuthApis";

// ==========================================
// 1. ĐỊNH NGHĨA TYPESCRIPT INTERFACES
// ==========================================
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
    textContent?: string;
    vocabulary: Vocabulary | null;
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
    difficultyLevel: string;
    questions: Question[];
}

interface Answer {
    questionId: number;
    questionChoiceId: number | null;
    givenAnswerText?: string;
}

// ==========================================
// 2. CÁC COMPONENT SVG ICONS
// ==========================================
const IconDocument = ({ size = 24, className = "" }) => (
    <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline>
    </svg>
);

const IconTarget = ({ size = 24, className = "" }) => (
    <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle>
    </svg>
);

const IconCheck = ({ size = 20, className = "" }) => (
    <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
);

const IconX = ({ size = 20, className = "" }) => (
    <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
);

const IconLightbulb = ({ size = 20, className = "" }) => (
    <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 18h6"></path><path d="M10 22h4"></path><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.14.74.74 1.21 1.5 1.39 2.36"></path>
    </svg>
);

const IconFire = ({ size = 24, className = "" }) => (
    <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path>
    </svg>
);

const IconThumbsUp = ({ size = 24, className = "" }) => (
    <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
    </svg>
);

const IconTrendingUp = ({ size = 24, className = "" }) => (
    <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline>
    </svg>
);

const IconBook = ({ size = 24, className = "" }) => (
    <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path>
    </svg>
);


// ==========================================
// 3. COMPONENT CHÍNH
// ==========================================
export default function DetailTest() {
    const { testId, resultId } = useParams();
    const id = Number(testId);
    const rsId = Number(resultId);

    const [test, setTest] = useState<TestFull | null>(null);
    const [answers, setAnswers] = useState<Answer[]>([]);
    const [score, setScore] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(false);

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const [resTest, resResult, resAnswers] = await Promise.all([
                authApis.get(endpoints["Test"](id)),
                authApis.get(`/test-results/${rsId}`),
                authApis.get(endpoints["answers"](id))
            ]);

            setTest(resTest.data.result);
            setScore(resResult.data.result?.score ?? 0);
            setAnswers(resAnswers.data.result ?? []);
        } catch (err) {
            console.error("Lỗi tải dữ liệu:", err);
        } finally {
            setLoading(false);
        }
    }, [id, rsId]);

    useEffect(() => {
        if (id && rsId) loadData();
    }, [id, rsId, loadData]);

    const getDifficultyVariant = (level?: string) => {
        if (!level) return "secondary";
        const text = level.toLowerCase();
        if (text.includes("easy") || text.includes("dễ")) return "success";
        if (text.includes("medium") || text.includes("trung")) return "warning";
        if (text.includes("hard") || text.includes("khó")) return "danger";
        return "secondary";
    };

    const percent = (score / 10) * 100;

    // Đánh giá xếp loại kèm icon SVG tương ứng
    const getEvaluation = (p: number) => {
        if (p >= 80) return { text: "Xuất sắc!", icon: <IconFire className="text-danger" />, color: "text-success" };
        if (p >= 65) return { text: "Khá tốt!", icon: <IconThumbsUp className="text-primary" />, color: "text-primary" };
        if (p >= 50) return { text: "Cần cố gắng!", icon: <IconTrendingUp className="text-warning" />, color: "text-warning" };
        return { text: "Ôn tập lại nhé!", icon: <IconBook className="text-danger" />, color: "text-danger" };
    };

    const evaluation = getEvaluation(percent);

    return (
        <Container className="my-5" style={{ maxWidth: 900 }}>
            {/* Header Navigation */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold text-dark m-0">Chi tiết bài làm</h2>
                    <span className="text-muted small">Phân tích kết quả và đáp án</span>
                </div>
                <Link
                    href={`/tests/${id}`}
                    className="btn btn-outline-secondary px-4 fw-medium"
                    style={{ borderRadius: '12px' }}
                >
                    ← Quay lại bài thi
                </Link>
            </div>

            {loading ? (
                <div className="py-5">
                    <MySpinner />
                </div>
            ) : test ? (
                <>
                    {/* ===== THỐNG KÊ ĐIỂM SỐ ===== */}
                    <Card className="mb-5 border-0 shadow-sm" style={{ borderRadius: '20px' }}>
                        <Card.Body className="p-0">
                            <div className="bg-primary bg-gradient text-white p-4" style={{ borderTopLeftRadius: '20px', borderTopRightRadius: '20px' }}>
                                <div className="d-flex justify-content-between align-items-center">
                                    <h4 className="m-0 fw-bold d-flex align-items-center gap-2">
                                        <IconDocument size={26} /> {test.title}
                                    </h4>
                                    <Badge bg="light" text="dark" className="px-3 py-2 fs-6 rounded-pill border shadow-sm">
                                        <span className={`text-${getDifficultyVariant(test.difficultyLevel)}`}>
                                            Độ khó: {test.difficultyLevel}
                                        </span>
                                    </Badge>
                                </div>
                            </div>

                            <div className="p-4 p-md-5">
                                <div className="row g-4 text-center align-items-center">
                                    {/* Điểm số */}
                                    <div className="col-md-4">
                                        <div className="p-4 rounded-4 bg-light border border-2 border-primary border-opacity-10">
                                            <div className="text-muted mb-2 fw-medium">Tổng điểm</div>
                                            <h1 className="fw-bold text-primary m-0 display-4">
                                                {score.toFixed(1)} <span className="fs-4 text-muted">/ 10</span>
                                            </h1>
                                        </div>
                                    </div>

                                    {/* Tỷ lệ đúng */}
                                    <div className="col-md-4">
                                        <div className="p-4 rounded-4 bg-light border border-2 border-success border-opacity-10">
                                            <div className="text-muted mb-2 fw-medium">Tỷ lệ chính xác</div>
                                            <h1 className="fw-bold text-success m-0 display-4">
                                                {percent.toFixed(0)}%
                                            </h1>
                                        </div>
                                    </div>

                                    {/* Nhận xét */}
                                    <div className="col-md-4">
                                        <div className="p-4 rounded-4 bg-light border border-2 border-secondary border-opacity-10 h-100 d-flex flex-column justify-content-center">
                                            <div className="text-muted mb-2 fw-medium">Đánh giá</div>
                                            <h3 className={`fw-bold m-0 d-flex align-items-center justify-content-center gap-2 ${evaluation.color}`}>
                                                {evaluation.text} {evaluation.icon}
                                            </h3>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-5">
                                    <div className="d-flex justify-content-between text-muted small mb-2 fw-bold">
                                        <span>Tiến độ hoàn thành</span>
                                        <span className={evaluation.color}>{percent.toFixed(0)}%</span>
                                    </div>
                                    <ProgressBar
                                        now={percent}
                                        variant={percent >= 50 ? "success" : "danger"}
                                        style={{ height: "12px", borderRadius: "10px" }}
                                    />
                                </div>
                            </div>
                        </Card.Body>
                    </Card>

                    {/* ===== DANH SÁCH CÂU HỎI & ĐÁP ÁN ===== */}
                    <h4 className="fw-bold mb-4 d-flex align-items-center gap-2 text-primary">
                        <IconTarget size={28} /> Giải chi tiết
                    </h4>

                    <div className="d-flex flex-column gap-4">
                        {test.questions.map((q, index) => {
                            const userAnswer = answers.find(a => a.questionId === q.id);
                            const userText = userAnswer?.givenAnswerText?.trim().toLowerCase() ?? "";
                            const correctText = q.correctAnswerText?.trim().toLowerCase() ?? "";
                            const isTextCorrect = userText === correctText && userText !== "";

                            return (
                                <Card key={q.id} className="border-0 shadow-sm" style={{ borderRadius: '16px' }}>
                                    <Card.Body className="p-4 p-md-5">
                                        <div className="d-flex gap-3 mb-4">
                                            <div
                                                className="bg-primary text-white d-flex align-items-center justify-content-center fw-bold shadow-sm"
                                                style={{ width: 40, height: 40, borderRadius: '10px', flexShrink: 0 }}
                                            >
                                                {index + 1}
                                            </div>
                                            <h5 className="fw-bold m-0 mt-2 lh-base text-dark">
                                                {q.content}
                                            </h5>
                                        </div>

                                        {/* Giao diện Điền từ / Sắp xếp chữ */}
                                        {q.type !== "MULTIPLE_CHOICE" ? (
                                            <div className="d-flex flex-column gap-3">
                                                {/* Câu trả lời của user */}
                                                <div className={`p-3 px-4 rounded-3 border-start border-4 ${isTextCorrect ? 'bg-success bg-opacity-10 border-success' : 'bg-danger bg-opacity-10 border-danger'}`}>
                                                    <div className="text-muted small fw-bold mb-1 text-uppercase">Bài làm của bạn</div>
                                                    <div className="fs-5 fw-medium d-flex align-items-center gap-2">
                                                        {isTextCorrect ? <IconCheck className="text-success" /> : <IconX className="text-danger" />}
                                                        <span className={isTextCorrect ? "text-success" : "text-danger text-decoration-line-through opacity-75"}>
                                                            {userAnswer?.givenAnswerText || "(Bỏ trống)"}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Đáp án chuẩn (Chỉ hiện khi user sai) */}
                                                {!isTextCorrect && (
                                                    <div className="p-3 px-4 rounded-3 bg-light border border-secondary border-opacity-25">
                                                        <div className="text-muted small fw-bold mb-1 text-uppercase">Đáp án chuẩn</div>
                                                        <div className="fs-5 fw-bold text-success d-flex align-items-center gap-2">
                                                            <IconLightbulb className="text-warning" /> {q.correctAnswerText}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            /* Giao diện Trắc nghiệm */
                                            <div className="d-flex flex-column gap-3 ms-md-5">
                                                {q.choices.map((c, i) => {
                                                    const label = String.fromCharCode(65 + i); // A, B, C, D
                                                    const isUserChoice = userAnswer?.questionChoiceId === c.id;
                                                    const isCorrect = c.isCorrect;

                                                    let cardClass = "p-3 rounded-3 border d-flex justify-content-between align-items-center transition ";
                                                    let textClass = "fw-medium";

                                                    if (isCorrect) {
                                                        cardClass += "bg-success bg-opacity-10 border-success shadow-sm";
                                                        textClass = "text-success fw-bold";
                                                    } else if (isUserChoice) {
                                                        cardClass += "bg-danger bg-opacity-10 border-danger";
                                                        textClass = "text-danger fw-bold";
                                                    } else {
                                                        cardClass += "bg-white border-light-subtle opacity-75"; // Mờ nhẹ các lựa chọn sai mà ko chọn
                                                    }

                                                    return (
                                                        <div key={c.id} className={cardClass}>
                                                            <div className={`d-flex align-items-center gap-3 ${textClass}`}>
                                                                <span className="bg-white border rounded text-center fw-bold" style={{ width: 30, height: 30, lineHeight: '28px' }}>
                                                                    {label}
                                                                </span>
                                                                <span className="fs-6">{c.textContent || c.vocabulary?.word}</span>
                                                            </div>

                                                            <div className="d-flex gap-2">
                                                                {isUserChoice && !isCorrect && (
                                                                    <Badge bg="danger" className="p-2 d-flex align-items-center gap-1">
                                                                        <IconX size={14} /> Sai
                                                                    </Badge>
                                                                )}
                                                                {isCorrect && (
                                                                    <Badge bg="success" className="p-2 d-flex align-items-center gap-1">
                                                                        <IconCheck size={14} /> Đáp án
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </Card.Body>
                                </Card>
                            );
                        })}
                    </div>
                </>
            ) : (
                <div className="text-center py-5 bg-light rounded-4 border">
                    <p className="text-muted m-0">Không có dữ liệu bài làm.</p>
                </div>
            )}
        </Container>
    );
}