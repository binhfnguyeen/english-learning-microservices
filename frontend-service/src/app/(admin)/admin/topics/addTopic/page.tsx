"use client"
import authApis from "@/configs/AuthApis";
import endpoints from "@/configs/Endpoints";
import Link from "next/link";
import React, { useEffect, useState } from "react"
import { Alert, Button, Card, Col, Container, Form, Nav, Row, Spinner } from "react-bootstrap";

export default function AddTopic() {
    const [name, setName] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [msg, setMsg] = useState<string>("");

    const addTopics = async (e: React.FormEvent<HTMLElement>) => {
        e.preventDefault();
        try {
            setLoading(true);
            const body = {
                name,
                description
            }
            const res = await authApis.post(endpoints["topics"], body);
            console.info(res.data);
            setName("");
            setDescription("");
            setMsg("Thêm chủ đề mới thành công!");
        } catch (ex) {
            console.error(ex);
            setMsg("Thêm chủ đề mới không thành công!");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (msg) {
            const timer = setTimeout(() => setMsg(""), 2000);
            return () => clearTimeout(timer);
        }
    }, [msg]);


    return (
        <Container className="mt-4">
            <Nav className="mb-3">
                <Link href="/admin/topics" className="btn btn-outline-secondary btn-sm">
                    Quay lại
                </Link>
            </Nav>

            <Card className="shadow-sm border-0 rounded-3">
                <Card.Body>
                    <h3 className="mb-4 fw-bold text-primary">Thêm chủ đề</h3>

                    {msg && (
                        <Alert variant={msg.includes("không") ? "danger" : "success"}
                            className="py-2 position-fixed top-0 end-0 m-3 shadow"
                            style={{ zIndex: 9999, minWidth: "250px" }}
                        >
                            {msg}
                        </Alert>
                    )}

                    <Form onSubmit={addTopics}>
                        <Row className="mb-3">
                            <Col md={6}>
                                <Form.Group controlId="formName">
                                    <Form.Label className="fw-semibold">Tên chủ đề</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Nhập tên chủ đề..."
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group controlId="formDescription">
                                    <Form.Label className="fw-semibold">Mô tả</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={3}
                                        placeholder="Nhập mô tả chủ đề..."
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <div className="mt-4">
                            <Button
                                variant="primary"
                                type="submit"
                                disabled={loading}
                                className="px-4"
                            >
                                {loading ? (
                                    <>
                                        <Spinner
                                            as="span"
                                            animation="border"
                                            size="sm"
                                            role="status"
                                            aria-hidden="true"
                                        />{" "}
                                        Đang xử lý...
                                    </>
                                ) : (
                                    "Thêm chủ đề"
                                )}
                            </Button>
                        </div>
                    </Form>
                </Card.Body>
            </Card>
        </Container>
    );
}