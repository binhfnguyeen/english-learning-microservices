"use client";

import MySpinner from "@/components/MySpinner";
import endpoints from "@/configs/Endpoints";
import UserContext from "@/configs/UserContext";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import {
    Button,
    Card,
    Container,
    Table,
    ProgressBar,
    Badge
} from "react-bootstrap";
import authApis from "@/configs/AuthApis";

// ==========================================
// 1. ĐỊNH NGHĨA TYPESCRIPT INTERFACES
// ==========================================
interface Question {
    id: number;
    content: string;
}

interface TestDetail {
    id: number;
    title: string;
    description: string;
    difficultyLevel: string;
    questions: Question[];
}

interface Result {
    id: number;
    score: number;
    dateTaken: string;
    testTitle: string;
    userId: number;
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

const IconPlay = ({ size = 20, className = "" }) => (
    <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="5 3 19 12 5 21 5 3"></polygon>
    </svg>
);

const IconTrophy = ({ size = 24, className = "" }) => (
    <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
        <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
        <path d="M4 22h16"></path>
        <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path>
        <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path>
        <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>
    </svg>
);

const IconActivity = ({ size = 24, className = "" }) => (
    <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
    </svg>
);

const IconRotate = ({ size = 24, className = "" }) => (
    <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
        <polyline points="3 3 3 8 8 8"></polyline>
    </svg>
);

const IconHistory = ({ size = 24, className = "" }) => (
    <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <polyline points="12 6 12 12 16 14"></polyline>
    </svg>
);

export default function StartTest() {
    const { testId } = useParams();
    const id = Number(testId);

    const [test, setTest] = useState<TestDetail | null>(null);
    const [testResults, setTestResults] = useState<Result[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    const context = useContext(UserContext);
    const user = context?.user;
    const router = useRouter();

    const loadData = async () => {
        if (!id) return;
        try {
            setLoading(true);

            const testRes = await authApis.get(endpoints["Test"](id));
            setTest(testRes.data.result);

            if (user) {
                const resultRes = await authApis.get(
                    endpoints["testResults"](id),
                    { params: { userId: user.id } }
                );
                setTestResults(resultRes.data.result || []);
            }
        } catch (err) {
            console.error("Lỗi tải dữ liệu:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [id, user?.id]);

    const sortedResults = [...testResults].sort(
        (a, b) => new Date(b.dateTaken).getTime() - new Date(a.dateTaken).getTime()
    );

    const bestScore = testResults.length > 0 ? Math.max(...testResults.map(r => r.score)) : 0;
    const avgScore = testResults.length > 0 ? testResults.reduce((sum, r) => sum + r.score, 0) / testResults.length : 0;

    const getDifficultyVariant = (level?: string) => {
        if (!level) return "secondary";
        const text = level.toLowerCase();
        if (text.includes("easy") || text.includes("dễ")) return "success";
        if (text.includes("medium") || text.includes("trung")) return "warning";
        if (text.includes("hard") || text.includes("khó")) return "danger";
        return "secondary";
    };

    if (!user) {
        return (
            <Container className="my-5 text-center py-5 bg-light rounded-4 border">
                <p className="text-muted m-0 fs-5">
                    Vui lòng đăng nhập để xem thông tin và làm bài thi.
                </p>
            </Container>
        );
    }

    return (
        <Container className="my-5" style={{ maxWidth: 900 }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold text-dark m-0 d-flex align-items-center gap-2">
                        <IconFileText className="text-primary" size={28} /> Thông tin bài thi
                    </h2>
                    <span className="text-muted small">Kiểm tra thông tin trước khi bắt đầu</span>
                </div>
                <Link
                    href="/tests"
                    className="btn btn-outline-secondary px-4 fw-medium"
                    style={{ borderRadius: '12px' }}
                >
                    ← Danh sách đề thi
                </Link>
            </div>

            {loading ? (
                <div className="py-5 text-center">
                    <MySpinner />
                </div>
            ) : (
                <>
                    {/* ===== THÔNG TIN BÀI THI ===== */}
                    {test && (
                        <Card className="mb-5 shadow-sm border-0" style={{ borderRadius: '20px' }}>
                            <Card.Body className="p-0">
                                <div className="bg-primary bg-gradient text-white p-4 p-md-5" style={{ borderTopLeftRadius: '20px', borderTopRightRadius: '20px' }}>
                                    <div className="d-flex flex-column flex-md-row justify-content-between gap-3">
                                        <div>
                                            <Badge bg="light" text="dark" className="mb-3 px-3 py-2 fs-6 rounded-pill border shadow-sm">
                                                <span className={`text-${getDifficultyVariant(test.difficultyLevel)}`}>
                                                    Độ khó: {test.difficultyLevel}
                                                </span>
                                            </Badge>
                                            <h1 className="fw-bold mb-2">{test.title}</h1>
                                            <p className="text-white-50 fs-5 m-0" style={{ maxWidth: '600px' }}>
                                                {test.description || "Không có mô tả chi tiết."}
                                            </p>
                                        </div>
                                        <div className="d-flex align-items-center justify-content-md-end">
                                            <div className="bg-white bg-opacity-10 p-3 rounded-4 text-center border border-white border-opacity-25" style={{ minWidth: '120px' }}>
                                                <div className="text-white-50 small mb-1">Số câu hỏi</div>
                                                <div className="fw-bold fs-2">{test.questions.length}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-4 bg-white d-flex justify-content-end" style={{ borderBottomLeftRadius: '20px', borderBottomRightRadius: '20px' }}>
                                    <Button
                                        variant="primary"
                                        size="lg"
                                        className="px-5 py-3 fw-bold rounded-pill d-flex align-items-center gap-2 shadow-sm transition hover-shadow"
                                        onClick={() => router.push(`/tests/${id}/fullTest`)}
                                    >
                                        <IconPlay /> Bắt đầu làm bài
                                    </Button>
                                </div>
                            </Card.Body>
                        </Card>
                    )}

                    {testResults.length > 0 && (
                        <div className="row g-4 mb-5 text-center">
                            <div className="col-md-4">
                                <div className="p-4 rounded-4 bg-light border border-2 border-secondary border-opacity-10 h-100">
                                    <IconRotate className="text-secondary mb-2" size={28} />
                                    <div className="text-muted mb-1 fw-medium">Số lần làm</div>
                                    <h2 className="fw-bold text-dark m-0">{testResults.length} <span className="fs-5 text-muted fw-normal">lần</span></h2>
                                </div>
                            </div>

                            <div className="col-md-4">
                                <div className="p-4 rounded-4 bg-light border border-2 border-success border-opacity-10 h-100">
                                    <IconTrophy className="text-success mb-2" size={28} />
                                    <div className="text-muted mb-1 fw-medium">Điểm cao nhất</div>
                                    <h2 className="fw-bold text-success m-0">{bestScore.toFixed(1)} <span className="fs-5 text-muted fw-normal">/ 10</span></h2>
                                </div>
                            </div>

                            <div className="col-md-4">
                                <div className="p-4 rounded-4 bg-light border border-2 border-primary border-opacity-10 h-100">
                                    <IconActivity className="text-primary mb-2" size={28} />
                                    <div className="text-muted mb-1 fw-medium">Điểm trung bình</div>
                                    <h2 className="fw-bold text-primary m-0">{avgScore.toFixed(1)} <span className="fs-5 text-muted fw-normal">/ 10</span></h2>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="d-flex align-items-center gap-2 mb-4 mt-5">
                        <IconHistory className="text-dark" size={26} />
                        <h4 className="fw-bold m-0 text-dark">Lịch sử làm bài</h4>
                    </div>

                    {sortedResults.length > 0 ? (
                        <Card className="border-0 shadow-sm" style={{ borderRadius: '16px', overflow: 'hidden' }}>
                            <Table hover responsive className="align-middle text-center mb-0 border-white">
                                <thead className="bg-light">
                                <tr>
                                    <th className="text-start ps-4 py-3 text-muted fw-medium border-0">Thời gian</th>
                                    <th style={{ width: "35%" }} className="py-3 text-muted fw-medium border-0">Tiến độ</th>
                                    <th className="py-3 text-muted fw-medium border-0">Kết quả</th>
                                    <th className="py-3 border-0"></th>
                                </tr>
                                </thead>
                                <tbody className="border-top-0">
                                {sortedResults.map((result) => {
                                    const percent = Math.min(result.score * 10, 100);
                                    let variant = "danger";
                                    if (percent >= 80) variant = "success";
                                    else if (percent >= 50) variant = "info";

                                    return (
                                        <tr key={result.id}>
                                            {/* Thời gian */}
                                            <td className="text-start ps-4 py-3 border-light-subtle">
                                                <div className="fw-bold text-dark">
                                                    {new Date(result.dateTaken).toLocaleDateString("vi-VN")}
                                                </div>
                                                <small className="text-muted">
                                                    {new Date(result.dateTaken).toLocaleTimeString("vi-VN", {
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                    })}
                                                </small>
                                            </td>

                                            {/* Progress Bar */}
                                            <td className="py-3 border-light-subtle">
                                                <div className="d-flex align-items-center justify-content-center gap-3 px-3">
                                                    <ProgressBar
                                                        now={percent}
                                                        variant={variant}
                                                        className="flex-grow-1 bg-light"
                                                        style={{ height: "8px" }}
                                                    />
                                                    <small className={`fw-bold text-${variant}`} style={{ width: '35px' }}>
                                                        {parseInt(percent)}%
                                                    </small>
                                                </div>
                                            </td>

                                            {/* Score */}
                                            <td className="py-3 border-light-subtle">
                                                <Badge
                                                    bg="white"
                                                    className={`text-${variant} border border-${variant} bg-${variant} bg-opacity-10 px-3 py-2 rounded-pill`}
                                                >
                                                    {result.score.toFixed(1)} / 10
                                                </Badge>
                                            </td>

                                            {/* Action */}
                                            <td className="py-3 pe-4 text-end border-light-subtle">
                                                <Link
                                                    href={`/tests/${id}/results/${result.id}/detailTest`}
                                                    className="btn btn-light text-primary fw-medium btn-sm rounded-pill px-3"
                                                >
                                                    Chi tiết
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                })}
                                </tbody>
                            </Table>
                        </Card>
                    ) : (
                        <div className="text-center py-5 bg-light rounded-4 border">
                            <IconHistory size={48} className="text-muted mb-3 opacity-50" />
                            <p className="text-muted m-0 fs-5">Bạn chưa có lượt làm bài nào.</p>
                        </div>
                    )}
                </>
            )}
        </Container>
    );
}