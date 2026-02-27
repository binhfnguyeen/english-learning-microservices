"use client"
import Apis from "@/configs/Apis";
import authApis from "@/configs/AuthApis";
import endpoints from "@/configs/Endpoints";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Alert, Button, Card, Container, Form, Nav, Spinner, InputGroup } from "react-bootstrap";

interface Vocabulary {
    id: number;
    word: string;
    meaning: string;
    partOfSpeech: string;
    picture: string;
}

export default function AddVocab() {
    const { topicId } = useParams();
    const id = Number(topicId);

    const [vocabularies, setVocabularies] = useState<Vocabulary[]>([]);
    const [keyword, setKeyword] = useState("");
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState("");

    const loadVocabularies = async () => {
        try {
            setLoading(true);
            let url = `${endpoints["vocabNotInTopic"](id)}`;
            if (keyword) {
                url += `?keyword=${encodeURIComponent(keyword)}`;
            }
            const res = await Apis.get(url);
            setVocabularies(res.data.result || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(loadVocabularies, 500);
        return () => clearTimeout(timer);
    }, [keyword]);

    const handleAddVocab = async (vocabId: number) => {
        try {
            await authApis.post(endpoints["topic_vocabs"](id), null, {
                params: { vocabId }
            });
            setMsg("Thêm từ thành công!");
            loadVocabularies();
        } catch (err) {
            setMsg("Thêm từ thất bại!");
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
            <Nav className="mb-3">
                <Link href={`/admin/topics/${id}`} className="btn btn-outline-secondary btn-sm">
                    Quay lại
                </Link>
            </Nav>

            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-bold">Chọn từ để thêm vào Topic</h2>
            </div>

            <InputGroup className="mb-3">
                <Form.Control
                    type="text"
                    placeholder="Tìm kiếm từ vựng..."
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                />
            </InputGroup>

            {msg && (
                <Alert
                    variant={msg.includes("thất bại") ? "danger" : "success"}
                    className="py-2 position-fixed top-0 end-0 m-3 shadow"
                    style={{ zIndex: 9999, minWidth: "250px" }}
                >
                    {msg}
                </Alert>
            )}

            {loading ? (
                <div className="d-flex justify-content-center align-items-center" style={{ height: "60vh" }}>
                    <Spinner animation="border" />
                </div>
            ) : (
                <div className="d-grid gap-3">
                    {vocabularies.map((vocab) => (
                        <Card key={vocab.id} className="shadow-sm border-0 hover-card">
                            <Card.Body className="d-flex justify-content-between align-items-center">
                                <div>
                                    <strong>{vocab.word}</strong> – {vocab.meaning}{" "}
                                    <small className="text-muted">({vocab.partOfSpeech})</small>
                                </div>
                                <Button
                                    variant="success"
                                    size="sm"
                                    onClick={() => handleAddVocab(vocab.id)}
                                >
                                    Thêm
                                </Button>
                            </Card.Body>
                        </Card>
                    ))}
                </div>
            )}

            {vocabularies.length === 0 && !loading && (
                <Alert variant="info" className="mt-3">Không còn từ nào để thêm</Alert>
            )}

            <style jsx>{`
                .hover-card {
                    transition: transform 0.15s ease-in-out, box-shadow 0.15s;
                }
                .hover-card:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 6px 16px rgba(0,0,0,0.1);
                }
            `}</style>
        </Container>
    );
}
