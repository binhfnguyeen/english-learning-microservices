"use client"

import MySpinner from "@/components/MySpinner";
import authApis from "@/configs/AuthApis";
import endpoints from "@/configs/Endpoints";
import Link from "next/link";
import React, { useCallback, useEffect, useState } from "react"
import { Alert, Button, Card, Col, Container, Form, Row } from "react-bootstrap";
import { ChevronLeft, ChevronRight } from "react-bootstrap-icons";

interface Vocabulary {
    id: number;
    word: string;
    meaning: string;
    partOfSpeech: string;
    level: string;
    picture: string;
}
export default function Vocabularies() {
    const [vocabularies, setVocabularies] = useState<Vocabulary[]>([]);
    const [page, setPage] = useState<number>(0);
    const [keyword, setKeyword] = useState<string>("");
    const [debouncedKeyword, setDebouncedKeyword] = useState<string>("");
    const [hasMore, setHasMore] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [msg, setMsg] = useState<string>("");

    const loadVocabularies = useCallback(async (targetPage: number, searchKeyword: string) => {
        let url = `${endpoints["vocabularies"]}?page=${targetPage}`;
        if (searchKeyword) {
            url += `&keyword=${encodeURIComponent(searchKeyword)}`;
        }
        try {
            setLoading(true);
            const res = await authApis.get(url);

            const content = res.data.result.content || [];
            setHasMore(!res.data.result.last);

            if (targetPage === 0) {
                setVocabularies(content);
            } else {
                setVocabularies(content);
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
        void loadVocabularies(page, debouncedKeyword);
    }, [page, debouncedKeyword, loadVocabularies]);

    const handleDelete = async (e: React.FormEvent<HTMLElement>, id: number) => {
        e.preventDefault();
        try {
            await authApis.delete(endpoints["vocabulary"](id));
            setMsg("Vocabulary deleted successfully!");
            void loadVocabularies(0, debouncedKeyword);
            setPage(0);
        } catch (err) {
            setMsg("Failed to delete vocabulary!");
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
                <h2 className="fw-bold">English Vocabulary</h2>
                <Link href="/admin/vocabularies/addVocab" className="btn btn-primary">
                    + Add Vocabulary
                </Link>
            </div>
            <Form>
                <Form.Group className="mb-3 mt-2">
                    <Form.Control value={keyword} onChange={kw => setKeyword(kw.target.value)} type="text" placeholder="Search vocabulary..." />
                </Form.Group>
            </Form>
            {msg && (
                <Alert className="py-2" variant={msg.includes("không") ? "danger" : "success"}>
                    {msg}
                </Alert>
            )}
            <Row className="g-4 mt-3" style={{ opacity: loading ? 0.6 : 1, transition: "opacity 0.15s ease-in-out" }}>
                {vocabularies.map((vocab) => (
                    <Col key={vocab.id} xs={12} sm={6} md={4} lg={3}>
                        <Card className="h-100 shadow-sm">
                            {vocab.picture && (
                                <Card.Img
                                    variant="top"
                                    src={vocab.picture}
                                    alt={vocab.word}
                                    style={{ height: "150px", objectFit: "cover" }}
                                />
                            )}
                            <Card.Body>
                                <Card.Title>
                                    {vocab.word}{" "}
                                    <small className="text-muted">({vocab.partOfSpeech})</small>
                                </Card.Title>
                                <Card.Text>{vocab.level}</Card.Text>
                                <Card.Text>{vocab.meaning}</Card.Text>

                                <div className="d-flex gap-2 mt-2">
                                    <Link
                                        href={`/admin/vocabularies/${vocab.id}/updateVocab`}
                                        className="btn btn-success btn-sm flex-grow-1"
                                    >
                                        Edit
                                    </Link>
                                    <Link
                                        href="#"
                                        onClick={(e) => handleDelete(e, vocab.id)}
                                        className="btn btn-danger btn-sm flex-grow-1"
                                    >
                                        Delete
                                    </Link>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>

            {vocabularies.length === 0 &&
                <Alert className="mt-4" variant="info">No vocabulary found</Alert>
            }

            {loading && vocabularies.length === 0 && <MySpinner />}

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