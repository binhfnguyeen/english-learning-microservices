"use client"
import MySpinner from "@/components/MySpinner";
import endpoints from "@/configs/Endpoints";
import Link from "next/link";
import {useEffect, useState} from "react";
import {Alert, Button, Card, Col, Container, Form, Row} from "react-bootstrap";
import authApis from "@/configs/AuthApis";
import SuggestVocab from "@/app/(client)/topics/suggest-vocab";
interface Topic {
    id: number;
    name: string;
    description: string;
}

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
                loadTopics();
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [page, keyword]);

    useEffect(() => {
        setPage(0);
    }, [keyword]);

    const loadMore = () => {
        setPage(prev => prev + 1);
    };

    return (
        <Container className="my-5">
            <div className="p-3 rounded-4 shadow-sm bg-light d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
                <h2 className="fw-bold text-primary m-0">English Topics</h2>

                <div className="d-flex gap-3 align-items-center flex-wrap">
                    <Form className="mb-0">
                        <div className="position-relative">
                            <Form.Control
                                value={keyword}
                                onChange={kw => setKeyword(kw.target.value)}
                                type="text"
                                placeholder="Search topics..."
                                className="shadow-sm rounded-pill ps-4"
                                style={{ minWidth: "250px" }}
                            />
                        </div>
                    </Form>

                    <Button
                        onClick={() => setShowModal(true)}
                        className="fw-semibold px-4 py-2 d-flex align-items-center gap-2"
                        style={{
                            borderRadius: "50px",
                            background: "linear-gradient(135deg, #28a745, #20c997)",
                            border: "none",
                            color: "white",
                            boxShadow: "0 4px 12px rgba(40, 167, 69, 0.3)",
                            transition: "all 0.2s ease-in-out"
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = "translateY(-2px)";
                            e.currentTarget.style.boxShadow =
                                "0 6px 16px rgba(40, 167, 69, 0.4)";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "translateY(0)";
                            e.currentTarget.style.boxShadow =
                                "0 4px 12px rgba(40, 167, 69, 0.3)";
                        }}
                    >
                        Học từ vựng theo trình độ cá nhân
                    </Button>
                </div>
            </div>

            <Row xs={1} md={2} lg={3} className="g-4">
                {topics.map((topic) => (
                    <Col key={topic.id}>
                        <Card className="h-100 shadow-sm border-0 rounded-3">
                            <Card.Header className="bg-primary text-white fw-bold">
                                {topic.name}
                            </Card.Header>
                            <Card.Body>
                                <Card.Text>{topic.description}</Card.Text>
                            </Card.Body>
                            <Card.Footer className="bg-white border-0">
                                <div className="d-flex gap-2">
                                    <Link href={`/topics/${topic.id}`} className="btn btn-outline-primary btn-sm flex-fill">
                                        Học từ vựng với chủ đề {topic.name}
                                    </Link>
                                </div>
                            </Card.Footer>
                        </Card>
                    </Col>
                ))}
            </Row>

            {topics.length === 0 &&
                <Alert className="mt-4" variant="info">Không có chủ đề</Alert>
            }

            {loading && <MySpinner />}

            {page > 0 && hasMore && (
                <div className="mt-4 text-center">
                    <Button variant="secondary" onClick={loadMore}>
                        Xem thêm...
                    </Button>
                </div>
            )}

            <SuggestVocab show={showModal} onHide={() => setShowModal(false)} />
        </Container>
    );
}