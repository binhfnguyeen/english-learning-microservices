"use client";
import authApis from "@/configs/AuthApis";
import endpoints from "@/configs/Endpoints";
import Link from "next/link";
import React, { useCallback, useEffect, useState } from "react";
import { Button, Card, Container, Form, Spinner, InputGroup, Alert } from "react-bootstrap";
import { ChevronLeft, ChevronRight } from "react-bootstrap-icons";

interface Test {
    id: number;
    title: string;
    description: string;
    difficultyLevel: string;
}

export default function Tests() {
    const [tests, setTests] = useState<Test[]>([]);
    const [page, setPage] = useState<number>(0);
    const [keyword, setKeyword] = useState<string>("");
    const [debouncedKeyword, setDebouncedKeyword] = useState<string>("");
    const [hasMore, setHasMore] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [msg, setMsg] = useState<string>("");

    const loadTests = useCallback(async (targetPage: number, searchKeyword: string) => {
        let url = `${endpoints["Tests"]}?page=${targetPage}`;
        if (searchKeyword) url += `&keyword=${encodeURIComponent(searchKeyword)}`;

        try {
            setLoading(true);
            const res = await authApis.get(url);
            const content = res.data.result.content || [];
            setHasMore(!res.data.result.last);

            if (targetPage === 0) {
                setTests(content);
            } else {
                setTests(content);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    const handleDelete = async (e: React.FormEvent<HTMLElement>, id: number) => {
        e.preventDefault();
        try {
            setLoading(true);
            await authApis.delete(endpoints["Test"](id));
            setMsg("Test deleted successfully!");
            void loadTests(0, debouncedKeyword);
            setPage(0);
        } catch (err) {
            console.error(err);
            setMsg("Failed to delete test!");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedKeyword(keyword);
        }, 500);
        return () => clearTimeout(handler);
    }, [keyword]);

    useEffect(() => {
        setPage(0);
    }, [debouncedKeyword]);

    useEffect(() => {
        void loadTests(page, debouncedKeyword);
    }, [page, debouncedKeyword, loadTests]);

    useEffect(() => {
        if (msg) {
            const timer = setTimeout(() => setMsg(""), 2000);
            return () => clearTimeout(timer);
        }
    }, [msg]);

    return (
        <Container className="my-5">
            <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">
                <h2 className="fw-bold">Practice Tests List</h2>
                <Link href="/admin/tests/addTestFull" className="btn btn-success shadow-sm px-4">
                    + Add Test
                </Link>
            </div>

            <Form className="mb-4">
                <InputGroup>
                    <Form.Control
                        value={keyword}
                        onChange={(kw) => setKeyword(kw.target.value)}
                        type="text"
                        placeholder="Search tests..."
                        className="shadow-sm"
                    />
                </InputGroup>
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

            {loading && tests.length === 0 ? (
                <div className="text-center py-5">
                    <Spinner animation="border" variant="primary" />
                </div>
            ) : (
                <div className="row g-4" style={{ opacity: loading ? 0.6 : 1, transition: "opacity 0.15s ease-in-out" }}>
                    {tests.map((test) => (
                        <div key={test.id} className="col-md-6 col-lg-4">
                            <Card className="shadow-sm border-0 h-100 hover-shadow transition">
                                <Card.Body>
                                    <Card.Title className="fw-bold text-dark">{test.title}</Card.Title>
                                    <Card.Text className="text-muted small">{test.description}</Card.Text>
                                    <Card.Text className="text-muted small">{test.difficultyLevel}</Card.Text>
                                </Card.Body>
                                <Card.Footer className="bg-white border-0 pt-0 pb-3 px-3">
                                    <div className="d-flex gap-2">
                                        <Link
                                            href={`/admin/tests/${test.id}/fullTest`}
                                            className="btn btn-outline-primary btn-sm flex-fill"
                                        >
                                            View Details
                                        </Link>
                                        <Button
                                            variant="outline-danger"
                                            size="sm"
                                            className="flex-fill"
                                            onClick={(e) => handleDelete(e, test.id)}
                                        >
                                            Delete
                                        </Button>
                                    </div>
                                </Card.Footer>
                            </Card>
                        </div>
                    ))}
                </div>
            )}

            {!loading && tests.length === 0 && (
                <Alert variant="info" className="mt-2">No tests found.</Alert>
            )}

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
