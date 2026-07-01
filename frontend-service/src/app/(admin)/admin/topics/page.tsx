"use client"

import MySpinner from "@/components/MySpinner";
import authApis from "@/configs/AuthApis";
import endpoints from "@/configs/Endpoints";
import Link from "next/link";
import React, { useCallback, useEffect, useState } from "react"
import { Alert, Button, Card, Col, Container, Form, Row } from "react-bootstrap";
import { ChevronLeft, ChevronRight } from "react-bootstrap-icons";

interface Topic {
    id: number;
    name: string;
    description: string;
}

export default function Topics() {
    const [topics, setTopics] = useState<Topic[]>([]);
    const [page, setPage] = useState<number>(0);
    const [keyword, setKeyword] = useState<string>("");
    const [debouncedKeyword, setDebouncedKeyword] = useState<string>("");
    const [hasMore, setHasMore] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [msg, setMsg] = useState<string>("");

    const loadTopics = useCallback(async (targetPage: number, searchKeyword: string) => {
        let url = `${endpoints["topics"]}?page=${targetPage}`;
        if (searchKeyword) url += `&keyword=${encodeURIComponent(searchKeyword)}`;

        try {
            setLoading(true);
            const res = await authApis.get(url);
            const content = res.data.result.content || [];
            setHasMore(!res.data.result.last);

            if (targetPage === 0) {
                setTopics(content);
            } else {
                setTopics(content);
            }
        } catch (ex) {
            console.error(ex);
        } finally {
            setLoading(false);
        }
    }, []);

    // Debounce keyword input
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedKeyword(keyword);
        }, 500);
        return () => clearTimeout(handler);
    }, [keyword]);

    // Reset page to 0 on new search keyword
    useEffect(() => {
        setPage(0);
    }, [debouncedKeyword]);

    // Fetch data when page or debounced keyword changes
    useEffect(() => {
        void loadTopics(page, debouncedKeyword);
    }, [page, debouncedKeyword, loadTopics]);

    const handleDelete = async (e: React.FormEvent<HTMLElement>, id: number) => {
        e.preventDefault();
        try {
            await authApis.delete(endpoints["topic"](id));
            setMsg("Topic deleted successfully!");
            void loadTopics(0, debouncedKeyword);
            setPage(0);
        } catch (err) {
            setMsg("Failed to delete topic!");
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
                    + Add Topic
                </Link>
            </div>

            <Form className="mb-4">
                <Form.Control
                    value={keyword}
                    onChange={kw => setKeyword(kw.target.value)}
                    type="text"
                    placeholder="Search topics..."
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

            <Row xs={1} md={2} lg={3} className="g-4" style={{ opacity: loading ? 0.6 : 1, transition: "opacity 0.15s ease-in-out" }}>
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
                                        View Vocabulary
                                    </Link>
                                    <Link href={`/admin/topics/${topic.id}/update`} className="btn btn-outline-success btn-sm flex-fill">
                                        Edit
                                    </Link>
                                    <Button
                                        variant="outline-danger"
                                        size="sm"
                                        className="flex-fill"
                                        onClick={(e) => handleDelete(e, topic.id)}
                                    >
                                        Delete
                                    </Button>
                                </div>
                            </Card.Footer>
                        </Card>
                    </Col>
                ))}
            </Row>

            {topics.length === 0 &&
                <Alert className="mt-4" variant="info">No topics found</Alert>
            }

            {loading && topics.length === 0 && <MySpinner />}

            <div className="d-flex justify-content-center align-items-center gap-3 mt-4 pt-3 border-top">
                <Button
                    variant="primary"
                    className="d-flex align-items-center justify-content-center p-0"
                    style={{ 
                        borderRadius: "50%", 
                        width: "38px", 
                        height: "38px",
                        transition: "opacity 0.2s ease-in-out",
                        opacity: 1 
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.8")}
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                    disabled={page === 0 || loading}
                    onClick={() => setPage(prev => prev - 1)}
                >
                    <ChevronLeft size={18} />
                </Button>
                <span className="fw-bold text-slate-600 fs-6 select-none bg-light px-3 py-2 rounded-3 border">
                    Page {page + 1}
                </span>
                <Button
                    variant="primary"
                    className="d-flex align-items-center justify-content-center p-0"
                    style={{ 
                        borderRadius: "50%", 
                        width: "38px", 
                        height: "38px",
                        transition: "opacity 0.2s ease-in-out",
                        opacity: 1 
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.8")}
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                    disabled={!hasMore || loading}
                    onClick={() => setPage(prev => prev + 1)}
                >
                    <ChevronRight size={18} />
                </Button>
            </div>
        </Container>
    );
}
