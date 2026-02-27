"use client"
import Apis from "@/configs/Apis";
import endpoints from "@/configs/Endpoints";
import UserContext from "@/configs/UserContext";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import { Button, Card, Container, Nav, Spinner, Table } from "react-bootstrap";

interface Test {
    id: number;
    title: string;
    description: string;
}

interface User {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    username: string;
    password: string;
    isActive: boolean;
    avatar: string;
    role: string;
}

interface Result {
    id: number;
    score: number;
    dateTaken: Date;
    testId: Test;
    userId: User;
}

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

export default function StartTest() {
    const { testId } = useParams();
    const id = Number(testId);
    const [test, setTest] = useState<Test>();
    const [fullTest, setFullTest] = useState<TestFull>();
    const [testResult, setTestResult] = useState<Result[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const context = useContext(UserContext);
    const user = context?.user;
    const router = useRouter();

    const loadFullTest = async () => {
        try {
            setLoading(true);
            const res = await Apis.get(endpoints["fullTests"](id));
            setFullTest(res.data.result);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    const loadTest = async () => {
        try {
            setLoading(true);
            const res = await Apis.get(endpoints["Test"](id));
            setTest(res.data.result);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const loadTestResults = async () => {
        try {
            if (!user) return;
            setLoading(true);
            const res = await Apis.get(endpoints["testResults"](id), {
                params: { userId: user.id }
            });
            setTestResult(res.data.result);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTest();
        loadTestResults();
    }, [id, user]);

    useEffect(() => {
        loadFullTest();
    }, [id])

    const totalQuestions = fullTest?.questions.length || 0;

    if (!user) {
        return <p className="text-muted">Bạn cần đăng nhập để làm bài kiểm tra.</p>;
    }

    return (
        <Container className="my-5">
            <div className="d-flex justify-content-center align-items-center mb-4 position-relative">
                <Nav className="position-absolute start-0">
                    <Link href="/tests" className="btn btn-outline-primary btn-sm">
                        Quay lại
                    </Link>
                </Nav>
                <h2 className="fw-bold m-0">Đề kiểm tra: {test?.title}</h2>
            </div>

            {loading ? (
                <div className="text-center py-5">
                    <Spinner animation="border" />
                </div>
            ) : (
                <>
                    {test && (
                        <Card className="mb-4 shadow-sm">
                            <Card.Body>
                                <Card.Title className="fw-bold fs-3">{test.title}</Card.Title>
                                <Card.Text className="text-muted">{test.description}</Card.Text>
                                <Button
                                    variant="success"
                                    size="lg"
                                    className="fw-bold"
                                    onClick={() => router.push(`/tests/${id}/fullTest`)}
                                >
                                    Bắt đầu làm bài
                                </Button>
                            </Card.Body>
                        </Card>
                    )}

                    <h4 className="fw-bold mb-3">Kết quả của bạn</h4>
                    {testResult.length > 0 ? (
                        <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                            <Table
                                striped
                                bordered={false}
                                hover
                                responsive
                                className="shadow-sm rounded-3 overflow-hidden align-middle text-center"
                            >
                                <thead className="bg-primary text-white">
                                    <tr>
                                        <th>Ngày làm</th>
                                        <th>Điểm</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[...testResult]
                                        .sort((a, b) => new Date(b.dateTaken).getTime() - new Date(a.dateTaken).getTime())
                                        .map((result, index) => (
                                            <tr key={result.id}>
                                                <td>{new Date(result.dateTaken).toLocaleDateString("vi-VN")}</td>
                                                <td>
                                                    <span
                                                        className={`fw-bold px-3 py-1 rounded-pill ${result.score >= totalQuestions / 2
                                                                ? "bg-success text-white"
                                                                : "bg-danger text-white"
                                                            }`}
                                                    >
                                                        {result.score}/{totalQuestions}
                                                    </span>
                                                </td>
                                                <td>
                                                    <Link
                                                        href={`/tests/${id}/results/${result.id}/detailTest`}
                                                        className="btn btn-sm text-decoration-underline"
                                                    >
                                                        Xem chi tiết
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                </tbody>
                            </Table>
                        </div>
                    ) : (
                        <p className="text-muted fst-italic">
                            Bạn chưa làm bài kiểm tra này.
                        </p>
                    )}

                </>
            )}
        </Container>
    );
}
