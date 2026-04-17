"use client"
import endpoints from "@/configs/Endpoints";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Alert, Button, Card, Container, Form, Badge } from "react-bootstrap";
import authApis from "@/configs/AuthApis";
import MySpinner from "@/components/MySpinner";

interface Test {
    id: number;
    title: string;
    description: string;
    difficultyLevel: string;
}

const IconSearch = ({ size = 20, className = "" }) => (
    <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
);

const IconFileText = ({ size = 24, className = "" }) => (
    <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <line x1="16" y1="13" x2="8" y2="13"></line>
        <line x1="16" y1="17" x2="8" y2="17"></line>
        <polyline points="10 9 9 9 8 9"></polyline>
    </svg>
);

const IconPlay = ({ size = 18, className = "" }) => (
    <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="5 3 19 12 5 21 5 3"></polygon>
    </svg>
);

export default function Tests() {
    const [tests, setTests] = useState<Test[]>([]);
    const [page, setPage] = useState<number>(0);
    const [keyword, setKeyword] = useState<string>("");
    const [hasMore, setHasMore] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);

    const loadTests = async () => {
        let url = `${endpoints["Tests"]}?page=${page}&size=6`;
        if (keyword) url += `&keyword=${keyword}`;

        try {
            setLoading(true);
            const res = await authApis.get(url);

            const pageData = res.data.result;
            const content: Test[] = pageData.content || [];

            setHasMore(!pageData.last);

            if (page === 0) {
                setTests(content);
            } else {
                setTests(prev => [...prev, ...content]);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTests();
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (page === 0 || (page > 0 && hasMore)) {
                loadTests();
            }
        }, 400);
        return () => clearTimeout(timer);
    }, [page, keyword]);

    useEffect(() => {
        setPage(0);
    }, [keyword]);

    const getDifficultyVariant = (level?: string) => {
        if (!level) return "secondary";
        const text = level.toLowerCase();
        if (text.includes("easy") || text.includes("dễ")) return "success";
        if (text.includes("medium") || text.includes("trung")) return "warning";
        if (text.includes("hard") || text.includes("khó")) return "danger";
        return "secondary";
    };

    return (
        <Container className="my-5" style={{ maxWidth: 1000 }}>
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-5 gap-3">
                <div>
                    <h2 className="fw-bold text-dark m-0 d-flex align-items-center gap-2">
                        <IconFileText className="text-primary" size={28} /> Danh sách Đề thi
                    </h2>
                    <span className="text-muted small">Luyện tập thường xuyên để nâng cao trình độ</span>
                </div>

                <div className="position-relative" style={{ width: "100%", maxWidth: "350px" }}>
                    <div className="position-absolute top-50 translate-middle-y ms-3 text-muted">
                        <IconSearch size={18} />
                    </div>
                    <Form.Control
                        value={keyword}
                        onChange={kw => setKeyword(kw.target.value)}
                        type="text"
                        placeholder="Tìm kiếm đề thi..."
                        className="shadow-sm border-0 bg-light py-2"
                        style={{ paddingLeft: '40px', borderRadius: '12px' }}
                    />
                </div>
            </div>

            {loading && page === 0 ? (
                <div className="py-5">
                    <MySpinner />
                </div>
            ) : (
                <>
                    <div className="row g-4">
                        {tests.map((test) => {
                            const variant = getDifficultyVariant(test.difficultyLevel);

                            return (
                                <div key={test.id} className="col-md-6 col-lg-4">
                                    <Card className="shadow-sm border-0 h-100 position-relative" style={{ borderRadius: '16px', transition: '0.2s' }}>
                                        <Card.Body className="p-4 d-flex flex-column">

                                            <Card.Title className="fw-bold text-dark mb-3 lh-base fs-5">
                                                {test.title}
                                            </Card.Title>

                                            <div className="mb-3">
                                                <Badge
                                                    bg="white"
                                                    className={`text-${variant} border border-${variant} bg-${variant} bg-opacity-10 px-3 py-2 rounded-pill shadow-sm`}
                                                >
                                                    Độ khó: {test.difficultyLevel}
                                                </Badge>
                                            </div>

                                            <Card.Text className="text-muted small flex-grow-1">
                                                {test.description || "Không có mô tả chi tiết cho đề thi này."}
                                            </Card.Text>

                                            <Link
                                                href={`/tests/${test.id}`}
                                                className="btn btn-primary w-100 fw-medium mt-2 d-flex align-items-center justify-content-center gap-2"
                                                style={{ borderRadius: '10px', padding: '10px 0' }}
                                            >
                                                <IconPlay /> Làm bài ngay
                                            </Link>
                                        </Card.Body>
                                    </Card>
                                </div>
                            );
                        })}
                    </div>

                    {!loading && tests.length === 0 && (
                        <div className="text-center py-5 bg-light rounded-4 border mt-2">
                            <IconFileText size={48} className="text-muted mb-3 opacity-50" />
                            <p className="text-muted m-0 fs-5">Không tìm thấy đề thi nào phù hợp.</p>
                        </div>
                    )}

                    {!loading && hasMore && (
                        <div className="text-center mt-5">
                            <Button
                                variant="outline-primary"
                                className="px-5 fw-medium rounded-pill"
                                onClick={() => setPage((p) => p + 1)}
                            >
                                Xem thêm
                            </Button>
                        </div>
                    )}

                    {loading && page > 0 && (
                        <div className="text-center mt-4">
                            <MySpinner />
                        </div>
                    )}
                </>
            )}
        </Container>
    );
}