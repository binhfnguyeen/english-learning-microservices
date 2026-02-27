"use client"
import Apis from "@/configs/Apis";
import authApis from "@/configs/AuthApis";
import endpoints from "@/configs/Endpoints";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Alert, Button, Card, Col, Container, Form, Nav, Row, Spinner } from "react-bootstrap";

interface Vocabulary {
    id: number;
    word: string;
    meaning: string;
    partOfSpeech: string;
    picture: string;
}

export default function UpdateVocab() {
    const { vocabId } = useParams();
    const id = Number(vocabId);
    const imageRef = useRef<HTMLInputElement>(null);
    const [word, setWord] = useState<string>("");
    const [meaning, setMeaning] = useState<string>("");
    const [partOfSpeech, setPartOfSpeech] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [msg, setMsg] = useState<string>("");
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [vocabulary, setVocabulary] = useState<Vocabulary>();

    const loadVocabulary = async () => {
        try {
            setLoading(true);
            const res = await Apis.get(endpoints["vocabulary"](id));
            setVocabulary(res.data.result);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    const updateVocab = async (e: React.FormEvent<HTMLElement>) => {
        e.preventDefault();
        try {
            setLoading(true);
            const formData = new FormData();
            formData.append("id", id.toString());
            formData.append("word", word);
            formData.append("meaning", meaning);
            formData.append("partOfSpeech", partOfSpeech);
            if (imageRef.current?.files?.[0]) {
                formData.append("picture", imageRef.current.files[0]);
            }

            const res = await authApis.post(endpoints["vocabularies"], formData);
            console.info(res.data);

            setMsg("Cập nhật từ vựng thành công!");
        } catch (ex) {
            console.error(ex);
            setMsg("Cập nhật từ vựng không thành công!");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadVocabulary();
    }, [id])

    useEffect(() => {
        if (vocabulary && vocabulary.id) {
            setWord(vocabulary.word || "");
            setMeaning(vocabulary.meaning || "");
            setPartOfSpeech(vocabulary.partOfSpeech || "");
            setPreviewImage(vocabulary.picture || "");
        }
    }, [vocabulary])

    useEffect(() => {
        if (msg) {
            const timer = setTimeout(() => setMsg(""), 2000);
            return () => clearTimeout(timer);
        }
    }, [msg]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            setPreviewImage(URL.createObjectURL(e.target.files[0]));
        }
    };

    return (
        <Container className="mt-4">
            <Nav className="mb-3">
                <Link href="/admin/vocabularies" className="btn btn-outline-secondary btn-sm">
                    Quay lại
                </Link>
            </Nav>

            <Card className="shadow-sm border-0 rounded-3">
                <Card.Body>
                    <h3 className="mb-4 fw-bold text-primary">Cập nhật từ vựng</h3>

                    {msg && (
                        <Alert
                            variant={msg.includes("không") ? "danger" : "success"}
                            className="py-2 position-fixed top-0 end-0 m-3 shadow"
                            style={{ zIndex: 9999, minWidth: "250px" }}
                        >
                            {msg}
                        </Alert>

                    )}

                    <Form onSubmit={updateVocab}>
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
                                    "Cập nhật từ vựng"
                                )}
                            </Button>
                        </div>
                    </Form>
                </Card.Body>
            </Card>
        </Container>
    );
}