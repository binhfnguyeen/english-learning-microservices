"use client";

import endpoints from "@/configs/Endpoints";
import UserContext from "@/configs/UserContext";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import {
    Button,
    Card,
    Container,
    Spinner,
    Table,
    ProgressBar
} from "react-bootstrap";
import authApis from "@/configs/AuthApis";

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

    const totalQuestions = test?.questions?.length || 0;

    const sortedResults = [...testResults].sort(
        (a, b) =>
            new Date(b.dateTaken).getTime() -
            new Date(a.dateTaken).getTime()
    );

    const bestScore =
        testResults.length > 0
            ? Math.max(...testResults.map(r => r.score))
            : 0;

    const avgScore =
        testResults.length > 0
            ? testResults.reduce((sum, r) => sum + r.score, 0) /
            testResults.length
            : 0;

    const getDifficultyVariant = (level?: string) => {
        if (!level) return "secondary";

        const text = level.toLowerCase();

        if (text.includes("dễ")) return "success";
        if (text.includes("trung")) return "info";
        if (text.includes("khó")) return "danger";

        return "secondary";
    };

    if (!user) {
        return (
            <Container className="my-5 text-center">
                <p className="text-muted">
                    Bạn cần đăng nhập để xem thông tin bài thi.
                </p>
            </Container>
        );
    }

    return (
        <Container className="my-5">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <Link href="/tests" className="btn btn-outline-secondary btn-sm">
                    ← Quay lại
                </Link>
                <h2 className="fw-bold m-0 text-uppercase text-primary">
                    Thông tin bài thi
                </h2>
                <div style={{ width: "80px" }}></div>
            </div>

            {loading ? (
                <div className="text-center py-5">
                    <Spinner animation="border" variant="primary" />
                </div>
            ) : (
                <>
                    {/* ===== Test Info ===== */}
                    {test && (
                        <Card className="mb-4 shadow-sm border-0">
                            <Card.Body className="p-4 bg-light rounded shadow-sm">
                                <Card.Title className="fw-bold fs-2">
                                    {test.title}
                                </Card.Title>

                                {/* Độ khó */}
                                <div className="mb-2">
                <span
                    className={`badge bg-${getDifficultyVariant(test.difficultyLevel)}-subtle 
                    text-${getDifficultyVariant(test.difficultyLevel)} 
                    border border-${getDifficultyVariant(test.difficultyLevel)} px-3 py-2`}
                >
                    Độ khó: {test.difficultyLevel}
                </span>
                                </div>

                                <Card.Text className="text-muted mb-4">
                                    {test.description}
                                </Card.Text>

                                <div className="d-flex align-items-center gap-3">
                                    <div className="p-3 bg-white rounded shadow-sm text-center">
                                        <div className="text-muted small">Số câu hỏi</div>
                                        <div className="fw-bold fs-4">
                                            {test.questions.length}
                                        </div>
                                    </div>

                                    <Button
                                        variant="primary"
                                        size="lg"
                                        className="px-5 fw-bold"
                                        onClick={() => router.push(`/tests/${id}/fullTest`)}
                                    >
                                        Bắt đầu làm bài
                                    </Button>
                                </div>
                            </Card.Body>
                        </Card>
                    )}

                    {/* ===== Statistics ===== */}
                    {testResults.length > 0 && (
                        <Card className="mb-4 border-0 shadow-sm">
                            <Card.Body className="bg-light rounded p-4">
                                <div className="d-flex gap-4 flex-wrap">

                                    {/* Số lần làm */}
                                    <div
                                        className="bg-white p-3 rounded shadow-sm text-center"
                                        style={{ minWidth: 140 }}
                                    >
                                        <div className="text-muted small">
                                            Số lần làm
                                        </div>
                                        <div className="fw-bold fs-4">
                                            {testResults.length}
                                        </div>
                                    </div>

                                    {/* Điểm cao nhất */}
                                    <div
                                        className="bg-white p-3 rounded shadow-sm text-center"
                                        style={{ minWidth: 140 }}
                                    >
                                        <div className="text-muted small">
                                            Điểm cao nhất
                                        </div>
                                        <div className="fw-bold fs-4 text-success">
                                            {bestScore.toFixed(1)} / 10
                                        </div>
                                    </div>

                                    {/* Điểm trung bình */}
                                    <div
                                        className="bg-white p-3 rounded shadow-sm text-center"
                                        style={{ minWidth: 140 }}
                                    >
                                        <div className="text-muted small">
                                            Điểm trung bình
                                        </div>
                                        <div className="fw-bold fs-4 text-primary">
                                            {avgScore.toFixed(1)} / 10
                                        </div>
                                    </div>
                                </div>
                            </Card.Body>
                        </Card>
                    )}

                    <h4 className="fw-bold mb-3 mt-5">Lịch sử làm bài</h4>

                    {sortedResults.length > 0 ? (
                        <div className="bg-white rounded-3 shadow-sm p-2">
                            <Table hover responsive className="align-middle text-center mb-0">
                                <thead className="table-light">
                                <tr>
                                    <th className="text-start ps-4">
                                        Thời gian
                                    </th>
                                    <th style={{ width: "35%" }}>
                                        Tiến độ
                                    </th>
                                    <th>Kết quả</th>
                                    <th></th>
                                </tr>
                                </thead>
                                <tbody>
                                {[...testResults]
                                    .sort(
                                        (a, b) =>
                                            new Date(b.dateTaken).getTime() -
                                            new Date(a.dateTaken).getTime()
                                    )
                                    .map((result) => {
                                        // Score backend: thang điểm 10
                                        const percent = Math.min(result.score * 10, 100);

                                        let variant = "danger";
                                        if (percent >= 80) variant = "success";
                                        else if (percent >= 50) variant = "info";

                                        return (
                                            <tr key={result.id}>
                                                {/* Thời gian */}
                                                <td className="text-start ps-4">
                                                    <div className="fw-bold">
                                                        {new Date(result.dateTaken).toLocaleDateString("vi-VN")}
                                                    </div>
                                                    <small className="text-muted">
                                                        {new Date(result.dateTaken).toLocaleTimeString("vi-VN", {
                                                            hour: "2-digit",
                                                            minute: "2-digit",
                                                        })}
                                                    </small>
                                                </td>

                                                {/* Progress */}
                                                <td>
                                                    <div className="d-flex align-items-center gap-2">
                                                        <ProgressBar
                                                            now={percent}
                                                            variant={variant}
                                                            className="flex-grow-1"
                                                            style={{ height: "10px" }}
                                                        />
                                                        <small className="fw-bold">{percent}%</small>
                                                    </div>
                                                </td>

                                                {/* Score hiển thị thang 10 */}
                                                <td>
                                                      <span
                                                          className={`badge rounded-pill bg-${variant}-subtle text-${variant} border border-${variant} px-3 py-2`}
                                                      >
                                                        {result.score} / 10
                                                      </span>
                                                </td>

                                                {/* Detail */}
                                                <td>
                                                    <Link
                                                        href={`/tests/${id}/results/${result.id}/detailTest`}
                                                        className="btn btn-sm btn-link text-decoration-none"
                                                    >
                                                        Chi tiết →
                                                    </Link>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </Table>
                        </div>
                    ) : (
                        <div className="text-center py-5 bg-light rounded-3">
                            <p className="text-muted mb-0">
                                Bạn chưa có lượt làm bài nào.
                            </p>
                        </div>
                    )}
                </>
            )}
        </Container>
    );
}