"use client"

import MySpinner from "@/components/MySpinner";
import Apis from "@/configs/Apis";
import authApis from "@/configs/AuthApis";
import endpoints from "@/configs/Endpoints";
import Link from "next/link";
import React, { useEffect, useState } from "react"
import { Alert, Button, Card, Col, Container, Form, Nav, Row } from "react-bootstrap";

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
    const [msg, setMsg] = useState<string>("");

    const loadTopics = async () => {
        let url = `${endpoints["topics"]}?page=${page}`;
        if (keyword) url += `&keyword=${keyword}`;

        try {
            setLoading(true);
            const res = await Apis.get(url);
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

    const handleDelete = async (e: React.FormEvent<HTMLElement>, id: number) => {
        e.preventDefault();
        try {
            await authApis.delete(endpoints["topic"](id));
            setMsg("Xóa chủ đề thành công!");
            setTopics(prev => prev.filter(t => t.id !== id));
        } catch (err) {
            setMsg("Xóa chủ đề không thành công!");
            console.error(err);
        }
    };

    useEffect(() => {
        if (msg) {
            const timer = setTimeout(() => setMsg(""), 2000);
            return () => clearTimeout(timer);
        }
    }, [msg]);

    return (
        <Container className="my-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-bold">English Topics</h2>
                <Link href="/admin/topics/addTopic" className="btn btn-primary">
                    + Thêm chủ đề
                </Link>
            </div>

            <Form className="mb-4">
                <Form.Control
                    value={keyword}
                    onChange={kw => setKeyword(kw.target.value)}
                    type="text"
                    placeholder="Tìm kiếm chủ đề..."
                    className="shadow-sm"
                />
            </Form>

            {msg && (
                <Alert
                    variant={msg.includes("không") ? "danger" : "success"}
                    className="py-2 position-fixed top-0 end-0 m-3 shadow"
                    style={{ zIndex: 9999, minWidth: "250px" }}
                >
                    {msg}
                </Alert>
            )}

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
                                    <Link href={`/admin/topics/${topic.id}`} className="btn btn-outline-primary btn-sm flex-fill">
                                        Xem từ vựng
                                    </Link>
                                    <Link href={`/admin/topics/${topic.id}/update`} className="btn btn-outline-success btn-sm flex-fill">
                                        Cập nhật
                                    </Link>
                                    <Button
                                        variant="outline-danger"
                                        size="sm"
                                        className="flex-fill"
                                        onClick={(e) => handleDelete(e, topic.id)}
                                    >
                                        Xóa
                                    </Button>
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
        </Container>
    );
}
