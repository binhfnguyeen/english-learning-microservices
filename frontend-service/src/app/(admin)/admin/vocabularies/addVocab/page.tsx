"use client"
import authApis from "@/configs/AuthApis";
import endpoints from "@/configs/Endpoints";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react"
import { Alert, Button, Card, Col, Container, Form, Nav, Row, Spinner } from "react-bootstrap";

export default function AddVocabs() {
    const imageRef = useRef<HTMLInputElement>(null);
    const [word, setWord] = useState<string>("");
    const [meaning, setMeaning] = useState<string>("");
    const [partOfSpeech, setPartOfSpeech] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [msg, setMsg] = useState<string>("");
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            setPreviewImage(URL.createObjectURL(e.target.files[0]));
        }
    };

    const addVocab = async (e: React.FormEvent<HTMLElement>) => {
        e.preventDefault();
        try {
            setLoading(true);
            const formData = new FormData();
            formData.append("word", word);
            formData.append("meaning", meaning);
            formData.append("partOfSpeech", partOfSpeech);
            if (imageRef.current?.files?.[0]) {
                formData.append("picture", imageRef.current.files[0]);
            }

            const res = await authApis.post(endpoints["vocabularies"], formData);
            console.info(res.data);

            setMsg("Thêm từ vựng mới thành công!");
            setWord("");
            setMeaning("");
            setPartOfSpeech("");
            setPreviewImage(null);
            if (imageRef.current) imageRef.current.value = "";
        } catch (ex) {
            console.error(ex);
            setMsg("Thêm từ vựng mới không thành công!");
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        if (msg) {
            const timer = setTimeout(() => setMsg(""), 2000);
            return () => clearTimeout(timer);
        }
    }, [msg]);


    return (
        <Container className="mt-4">
            <Nav className="mb-3">
                <Link href="/admin/vocabularies" className="btn btn-outline-secondary btn-sm">
                    Quay lại
                </Link>
            </Nav>

            <Card className="shadow-sm border-0 rounded-3">
                <Card.Body>
                    <h3 className="mb-4 fw-bold text-primary">Thêm từ vựng</h3>

                    {msg && (
                        <Alert
                            variant={msg.includes("không") ? "danger" : "success"}
                            className="py-2 position-fixed top-0 end-0 m-3 shadow"
                            style={{ zIndex: 9999, minWidth: "250px" }}
                        >
                            {msg}
                        </Alert>
                    )}

                    <Form onSubmit={addVocab}>
                        <Row className="mb-3">
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="fw-semibold">Từ</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Nhập từ..."
                                        value={word}
                                        onChange={(e) => setWord(e.target.value)}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="fw-semibold">Nghĩa của từ</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Nhập nghĩa..."
                                        value={meaning}
                                        onChange={(e) => setMeaning(e.target.value)}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="fw-semibold">Loại từ</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Danh từ, Động từ..."
                                        value={partOfSpeech}
                                        onChange={(e) => setPartOfSpeech(e.target.value)}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="fw-semibold">Hình</Form.Label>
                                    <Form.Control
                                        type="file"
                                        accept="image/*"
                                        ref={imageRef}
                                        onChange={handleImageChange}
                                    />
                                    {previewImage && (
                                        <div className="mt-2">
                                            <img
                                                src={previewImage}
                                                alt="preview"
                                                style={{ width: "100px", height: "auto", borderRadius: "8px" }}
                                            />
                                        </div>
                                    )}
                                </Form.Group>
                            </Col>
                        </Row>

                        <div className="mt-4">
                            <Button variant="primary" type="submit" disabled={loading} className="px-4">
                                {loading ? (
                                    <>
                                        <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />{" "}
                                        Đang xử lý...
                                    </>
                                ) : (
                                    "Thêm từ vựng"
                                )}
                            </Button>
                        </div>
                    </Form>
                </Card.Body>
            </Card>
        </Container>
    );
}