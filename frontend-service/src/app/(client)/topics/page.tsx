"use client"
import MySpinner from "@/components/MySpinner";
import endpoints from "@/configs/Endpoints";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Alert, Button, Card, Col, Container, Form, Row, InputGroup } from "react-bootstrap";
import authApis from "@/configs/AuthApis";
import SuggestVocab from "@/app/(client)/topics/suggest-vocab";

interface Topic {
    id: number;
    name: string;
    description: string;
}

// ==========================================
// SVG ICONS TÙY CHỈNH
// ==========================================
const IconSearch = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
);

const IconSparkles = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
    </svg>
);

const IconBook = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary mb-3">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
    </svg>
);

export default function Topics() {
    const [topics, setTopics] = useState<Topic[]>([]);
    const [page, setPage] = useState<number>(0);
    const [keyword, setKeyword] = useState<string>("");
    const [hasMore, setHasMore] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [showModal, setShowModal] = useState(false);

    const loadTopics = async () => {
        let url = `${endpoints["topics"]}?page=${page}`;
        if (keyword) url += `&keyword=${keyword}`;

        try {
            setLoading(true);
            const res = await authApis.get(url);
            const content = res.data.result.content || [];
            setHasMore(!res.data.result.last);

            if (page === 0) {
                setTopics(content);
            } else {
                setTopics(prev => [...prev, ...content]);
            }
        } catch (ex) {
            console.error(ex);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setLoading(true);
        const timer = setTimeout(() => {
            if (page === 0 || (page > 0 && hasMore)) {
                void loadTopics();
            }
        }, 500);

        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, keyword]);

    useEffect(() => {
        setPage(0);
    }, [keyword]);

    const loadMore = () => {
        setPage(prev => prev + 1);
    };

    return (
        <Container className="my-5" style={{ maxWidth: "1100px" }}>
            {/* CSS inline cho hiệu ứng hover siêu mượt */}
            <style jsx global>{`
                .topic-card-hover {
                    transition: all 0.3s ease;
                }
                .topic-card-hover:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 10px 20px rgba(0,0,0,0.08) !important;
                }
            `}</style>

            {/* HEADER & CONTROLS */}
            <div className="mb-5 text-center">
                <h1 className="fw-bolder display-5 text-dark mb-3">Khám phá Chủ đề Từ vựng</h1>
                <p className="text-muted fs-5 mb-5">Lựa chọn chủ đề yêu thích hoặc để hệ thống gợi ý lộ trình học phù hợp nhất với bạn.</p>

                <div className="p-3 p-md-4 rounded-4 shadow-sm bg-white border d-flex flex-column flex-md-row justify-content-between align-items-center gap-3 mx-auto">

                    {/* Ô Tìm kiếm */}
                    <Form className="mb-0 w-100" style={{ maxWidth: "400px" }}>
                        <InputGroup className="shadow-none">
                            <InputGroup.Text className="bg-light border-end-0 rounded-start-pill text-muted px-3">
                                <IconSearch />
                            </InputGroup.Text>
                            <Form.Control
                                value={keyword}
                                onChange={kw => setKeyword(kw.target.value)}
                                type="text"
                                placeholder="Tìm kiếm chủ đề..."
                                className="bg-light border-start-0 rounded-end-pill shadow-none py-2 px-0"
                            />
                        </InputGroup>
                    </Form>

                    {/* Nút Gợi ý cá nhân hóa */}
                    <Button
                        onClick={() => setShowModal(true)}
                        className="fw-bold px-4 py-2 d-flex align-items-center justify-content-center gap-2 w-100 w-md-auto"
                        style={{
                            borderRadius: "50px",
                            background: "linear-gradient(135deg, #10b981, #059669)",
                            border: "none",
                            color: "white",
                            boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)",
                            transition: "all 0.2s ease-in-out",
                            whiteSpace: "nowrap"
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = "translateY(-2px)";
                            e.currentTarget.style.boxShadow = "0 6px 16px rgba(16, 185, 129, 0.4)";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "translateY(0)";
                            e.currentTarget.style.boxShadow = "0 4px 12px rgba(16, 185, 129, 0.3)";
                        }}
                    >
                        <IconSparkles /> Học theo lộ trình cá nhân
                    </Button>
                </div>
            </div>

            {/* DANH SÁCH CHỦ ĐỀ */}
            <Row xs={1} md={2} lg={3} className="g-4">
                {topics.map((topic) => (
                    <Col key={topic.id}>
                        <Card className="h-100 shadow-sm border-0 rounded-4 overflow-hidden topic-card-hover bg-white">
                            {/* Dải màu trang trí phía trên thẻ */}
                            <div style={{ height: '6px', background: 'linear-gradient(90deg, #0d6efd, #4facfe)' }}></div>

                            <Card.Body className="p-4 d-flex flex-column">
                                <div className="d-flex flex-column align-items-start mb-3">
                                    <div className="bg-primary bg-opacity-10 p-2 rounded-3 mb-3">
                                        <IconBook />
                                    </div>
                                    <h4 className="fw-bold text-dark m-0">{topic.name}</h4>
                                </div>

                                <Card.Text className="text-muted flex-grow-1" style={{ fontSize: "0.95rem", lineHeight: "1.6" }}>
                                    {topic.description || "Chủ đề này chứa các từ vựng thiết yếu giúp bạn cải thiện kỹ năng giao tiếp."}
                                </Card.Text>

                                <Link
                                    href={`/topics/${topic.id}/learning`}
                                    className="btn btn-light text-primary border border-primary border-opacity-25 w-100 fw-bold rounded-pill py-2 mt-3 transition"
                                    onMouseEnter={(e) => {
                                        e.currentTarget.classList.remove('btn-light', 'text-primary');
                                        e.currentTarget.classList.add('btn-primary', 'text-white');
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.classList.remove('btn-primary', 'text-white');
                                        e.currentTarget.classList.add('btn-light', 'text-primary');
                                    }}
                                >
                                    Bắt đầu học →
                                </Link>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>

            {/* TRẠNG THÁI HIỂN THỊ */}
            {topics.length === 0 && !loading && (
                <div className="text-center py-5 bg-light rounded-4 mt-4 border border-dashed">
                    <h5 className="text-muted fw-medium m-0">Không tìm thấy chủ đề nào phù hợp.</h5>
                </div>
            )}

            {loading && (
                <div className="py-4 text-center">
                    <MySpinner />
                </div>
            )}

            {page > 0 && hasMore && !loading && (
                <div className="mt-5 text-center">
                    <Button
                        variant="outline-secondary"
                        onClick={loadMore}
                        className="rounded-pill px-5 fw-medium"
                    >
                        Tải thêm chủ đề ↓
                    </Button>
                </div>
            )}

            <SuggestVocab show={showModal} onHide={() => setShowModal(false)} />
        </Container>
    );
}