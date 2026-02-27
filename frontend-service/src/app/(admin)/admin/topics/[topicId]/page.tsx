"use client"

import MySpinner from "@/components/MySpinner";
import Apis from "@/configs/Apis";
import authApis from "@/configs/AuthApis";
import endpoints from "@/configs/Endpoints";
import Link from "next/link";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react"
import { Alert, Button, Card, Col, Form, Nav, Row } from "react-bootstrap";

interface Vocabulary {
    id: number;
    word: string,
    meaning: string,
    partOfSpeech: string,
    picture: string
}

export default function VocabTopic() {

    const [vocabularies, setVocabularies] = useState<Vocabulary[]>([]);
    const [page, setPage] = useState<number>(0);
    const [keyword, setKeyword] = useState<string>("");
    const [hasMore, setHasMore] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [msg, setMsg] = useState<string>("");
    const { topicId } = useParams();
    const id = Number(topicId);

    const loadVocabularies = async () => {
        let url = `${endpoints["topic_vocabs"](id)}?page=${page}`;

        if (keyword) {
            url += `&keyword=${keyword}`;
        }

        try {
            setLoading(true);
            const res = await Apis.get(url);
            const content = res.data.result.content || [];
            setHasMore(!res.data.result.last)

            if (page === 0) {
                setVocabularies(content);
            } else {
                setVocabularies(prev => [...prev, ...content]);
            }
        } catch (ex) {
            console.error(ex);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        setLoading(true);
        const timer = setTimeout(() => {
            if (page === 0 || (page > 0 && hasMore)) {
                loadVocabularies();
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [page, keyword])

    useEffect(() => {
        setPage(0);
    }, [keyword]);

    const loadMore = () => {
        setPage(page + 1);
    }

    const handleRemove = async (e: React.FormEvent<HTMLElement>, topicId: number, vocabId: number) => {
        e.preventDefault();

        try {
            await authApis.delete(endpoints["topic_vocabs"](topicId), {
                params: { vocabId }
            });
            setMsg("Xóa từ thành công!");
            loadVocabularies();
        } catch (err) {
            console.error(err);
            setMsg("Xóa từ không thành công!");
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
        <div className="container mt-4">
            <Nav className="ms-auto align-items-center gap-2 mb-2">
                <Link href="/admin/topics" className="btn btn-outline-primary btn-sm">Quay lại</Link>
            </Nav>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-bold">Danh sách từ vựng</h2>
                <Link href={`/admin/topics/${id}/addVocab`} className="btn btn-primary">
                    + Thêm từ vựng thuộc chủ đề
                </Link>
            </div>
            <Form className="mb-3 mt-2">
                <Form.Group>
                    <Form.Control
                        value={keyword}
                        onChange={kw => setKeyword(kw.target.value)}
                        type="text"
                        placeholder="Tìm kiếm từ vựng..."
                    />
                </Form.Group>
            </Form>

            {msg && (
                <Alert
                    variant={msg.includes("thất bại") ? "danger" : "success"}
                    className="py-2 position-fixed top-0 end-0 m-3 shadow"
                    style={{ zIndex: 9999, minWidth: "250px" }}
                >
                    {msg}
                </Alert>
            )}

            <Row className="g-4 mt-3">
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
                                <Card.Text>{vocab.meaning}</Card.Text>

                                <div className="d-flex gap-2 mt-2">
                                    <Link
                                        href="#"
                                        onClick={(e)=>handleRemove(e, id, vocab.id)}
                                        className="btn btn-danger btn-sm flex-grow-1"
                                    >
                                        Xóa
                                    </Link>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>

            {vocabularies.length === 0 &&
                <Alert variant="info">Không có từ vựng thuộc chủ đề</Alert>
            }

            {loading && <MySpinner />}

            {page > 0 && hasMore && (
                <div className="mt-2 mb-2 text-center">
                    <Button variant="primary" onClick={loadMore}>Xem thêm...</Button>
                </div>
            )}
        </div>
    );
}