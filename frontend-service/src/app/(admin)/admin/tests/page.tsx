"use client";
import Apis from "@/configs/Apis";
import authApis from "@/configs/AuthApis";
import endpoints from "@/configs/Endpoints";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { Button, Card, Container, Form, Spinner, InputGroup, Alert } from "react-bootstrap";

interface Test {
    id: number;
    title: string;
    description: string;
}

export default function Tests() {
    const [tests, setTests] = useState<Test[]>([]);
    const [page, setPage] = useState<number>(0);
    const [keyword, setKeyword] = useState<string>("");
    const [hasMore, setHasMore] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [msg, setMsg] = useState<string>("");

    const loadTests = async () => {
        let url = `${endpoints["Tests"]}?page=${page}`;
        if (keyword) url += `&keyword=${keyword}`;

        try {
            setLoading(true);
            const res = await Apis.get(url);
            const content = res.data.result.content || [];
            setHasMore(!res.data.result.last);

            if (page === 0) {
                setTests(content);
            } else {
                setTests((prev) => [...prev, ...content]);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (e: React.FormEvent<HTMLElement>, id: number) => {
        e.preventDefault();
        try {
            setLoading(true);
            await authApis.delete(endpoints["Test"](id));
            setMsg("Xóa bài kiểm tra thành công!");
            loadTests();
        } catch (err) {
            console.error(err);
            setMsg("Xóa bài kiểm tra không thành công!");
        } finally {
            setLoading(false);
        }
    }

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

    useEffect(() => {
        if (msg) {
            const timer = setTimeout(() => setMsg(""), 2000);
            return () => clearTimeout(timer);
        }
    }, [msg]);

    return (
        <Container className="my-5">
            <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">
                <h2 className="fw-bold">List of exam questions</h2>
                <Link href="/admin/tests/addTestFull" className="btn btn-success shadow-sm px-4">
                    + Thêm đề kiểm tra
                </Link>
            </div>

            <Form className="mb-4">
                <InputGroup>
                    <Form.Control
                        value={keyword}
                        onChange={(kw) => setKeyword(kw.target.value)}
                        type="text"
                        placeholder="Tìm kiếm đề thi..."
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

            {loading ? (
                <div className="text-center py-5">
                    <Spinner animation="border" variant="primary" />
                </div>
            ) : (
                <div className="row g-4">
                    {tests.map((test) => (
                        <div key={test.id} className="col-md-6 col-lg-4">
                            <Card className="shadow-sm border-0 h-100 hover-shadow transition">
                                <Card.Body>
                                    <Card.Title className="fw-bold text-dark">{test.title}</Card.Title>
                                    <Card.Text className="text-muted small">{test.description}</Card.Text>
                                </Card.Body>
                                <Card.Footer className="bg-white border-0 pt-0 pb-3 px-3">
                                    <div className="d-flex gap-2">
                                        <Link
                                            href={`/admin/tests/${test.id}/fullTest`}
                                            className="btn btn-outline-primary btn-sm flex-fill"
                                        >
                                            Xem chi tiết
                                        </Link>
                                        <Button
                                            variant="outline-danger"
                                            size="sm"
                                            className="flex-fill"
                                            onClick={(e) => handleDelete(e, test.id)}
                                        >
                                            Xóa
                                        </Button>
                                    </div>
                                </Card.Footer>
                            </Card>
                        </div>
                    ))}
                </div>
            )}

            {!loading && tests.length === 0 && (
                <Alert variant="info" className="mt-2">Không có đề thi nào.</Alert>
            )}

            {!loading && hasMore && (
                <div className="text-center mt-4">
                    <Button variant="outline-secondary" onClick={() => setPage((p) => p + 1)}>
                        Tải thêm
                    </Button>
                </div>
            )}
        </Container>
    );
}
