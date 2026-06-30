"use client"
import authApis from "@/configs/AuthApis";
import endpoints from "@/configs/Endpoints";
import Link from "next/link";
import { useParams } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react"
import { Alert, Button, Card, Col, Container, Form, Nav, Row, Spinner } from "react-bootstrap";

interface Topic {
    id: number,
    name: string,
    description: string
}

export default function Update() {
    const { topicId } = useParams();
    const id = Number(topicId);
    const [name, setName] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const [topic, setTopic] = useState<Topic>();
    const [loading, setLoading] = useState<boolean>(false);
    const [msg, setMsg] = useState<string>("");

    const loadTopic = useCallback(async () => {
        try {
            setLoading(true);
            const res = await authApis.get(endpoints["topic"](id));
            setTopic(res.data.result);
        } catch (ex) {
            console.error(ex);
        } finally {
            setLoading(false);
        }
    }, [id]);

    const updateTopic = async (e: React.FormEvent<HTMLElement>) => {
        e.preventDefault();
        try {
            setLoading(true);
            const body = {
                name,
                description
            }
            const res = await authApis.put(endpoints["topic"](id), body);
            console.info(res.data);
            setMsg("Topic updated successfully!");
        } catch (ex) {
            console.error(ex);
            setMsg("Failed to update topic!");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadTopic();
    }, [loadTopic])

    useEffect(() => {
        if (topic && topic.id) {
            setName(topic.name || "");
            setDescription(topic.description || "");
        }
    }, [topic])

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
                    Go Back
                </Link>
            </Nav>

            <Card className="shadow-sm border-0 rounded-3">
                <Card.Body>
                    <h3 className="mb-4 fw-bold text-primary">Update Topic</h3>

                    {msg && (
                        <Alert
                            variant={msg.toLowerCase().includes("failed") ? "danger" : "success"}
                            className="py-2 position-fixed top-0 end-0 m-3 shadow"
                            style={{ zIndex: 9999, minWidth: "250px" }}
                        >
                            {msg}
                        </Alert>
                    )}

                    <Form onSubmit={updateTopic}>
                        <Row className="mb-3">
                            <Col md={6}>
                                <Form.Group controlId="formName">
                                    <Form.Label className="fw-semibold">Topic Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Enter topic name..."
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group controlId="formDescription">
                                    <Form.Label className="fw-semibold">Description</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={3}
                                        placeholder="Enter topic description..."
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
                                        Saving...
                                    </>
                                ) : (
                                    "Save Changes"
                                )}
                            </Button>
                        </div>
                    </Form>
                </Card.Body>
            </Card>
        </Container>
    );
}