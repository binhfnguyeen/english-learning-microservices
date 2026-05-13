"use client"
import authApis from "@/configs/AuthApis";
import endpoints from "@/configs/Endpoints";
import Link from "next/link";
import React, { useEffect, useState } from "react"
import { Alert, Button, Card, Col, Container, Form, Nav, Row, Spinner } from "react-bootstrap";

export default function AddTopic() {
    const [name, setName] = useState<string>("");
    const [topicSuggestions, setTopicSuggestions] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [fetchingDescription, setFetchingDescription] = useState(false);
    const [description, setDescription] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [msg, setMsg] = useState<string>("");

    const fetchTopicSuggestions = async (text: string) => {
        if (!text.trim()) {
            setTopicSuggestions([]);
            return;
        }
        try {
            const res = await fetch(`https://api.datamuse.com/sug?s=${encodeURIComponent(text)}&max=5`);
            if (res.ok) {
                const data = await res.json();
                if (data && data.length > 0) {
                    setTopicSuggestions(data.map((d: { word: string }) => d.word));
                    setShowSuggestions(true);
                } else {
                    setTopicSuggestions([]);
                }
            }
        } catch (err) {
            console.error("Suggestion error:", err);
        }
    };

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setName(val);
        fetchTopicSuggestions(val);
    };

    const handleSelectSuggestion = async (selectedName: string) => {
        setName(selectedName);
        setShowSuggestions(false);
        setFetchingDescription(true);

        try {
            const dictRes = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${selectedName}`);
            if (dictRes.ok) {
                const dictData = await dictRes.json();
                if (dictData[0] && dictData[0].meanings[0] && dictData[0].meanings[0].definitions[0]) {
                    setDescription(dictData[0].meanings[0].definitions[0].definition);
                }
            }
        } catch (err) {
            console.error("Auto-fill description error:", err);
        } finally {
            setFetchingDescription(false);
        }
    };

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
                                <Form.Group controlId="formName" className="position-relative">
                                    <Form.Label className="fw-semibold">Tên chủ đề</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Nhập tên chủ đề..."
                                        value={name}
                                        onChange={handleNameChange}
                                        onFocus={() => { if (topicSuggestions.length > 0) setShowSuggestions(true); }}
                                        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                        required
                                    />
                                    {showSuggestions && topicSuggestions.length > 0 && (
                                        <div className="position-absolute w-100 bg-white border rounded shadow-sm mt-1" style={{ zIndex: 1000, maxHeight: '200px', overflowY: 'auto' }}>
                                            {topicSuggestions.map((suggestion, idx) => (
                                                <div
                                                    key={idx}
                                                    className="p-2 cursor-pointer hover-bg-light border-bottom text-dark"
                                                    style={{ cursor: 'pointer' }}
                                                    onMouseDown={() => handleSelectSuggestion(suggestion)}
                                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                                                >
                                                    {suggestion}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {fetchingDescription && <Form.Text className="text-info"><Spinner size="sm" animation="border" className="me-1" /> Đang tự động điền mô tả...</Form.Text>}
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