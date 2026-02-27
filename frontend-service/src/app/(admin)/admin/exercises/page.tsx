"use client";

import MySpinner from "@/components/MySpinner";
import Apis from "@/configs/Apis";
import endpoints from "@/configs/Endpoints";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
    Alert,
    Button,
    Card,
    Container,
    Form,
    Image,
    InputGroup,
    Table,
} from "react-bootstrap";

interface Vocabulary {
    id: number;
    word: string;
    meaning: string;
    partOfSpeech: string;
    speech: string;
    picture: string;
}

export default function VocabsPage() {
    const [vocabularies, setVocabularies] = useState<Vocabulary[]>([]);
    const [page, setPage] = useState<number>(0);
    const [keyword, setKeyword] = useState<string>("");
    const [hasMore, setHasMore] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const loadVocabularies = async () => {
        let url = `${endpoints["vocabularies"]}?page=${page}`;
        if (keyword) {
            url += `&keyword=${keyword}`;
        }
        try {
            setLoading(true);
            const res = await Apis.get(url);

            const content = res.data.result.content || [];
            setHasMore(!res.data.result.last);

            if (page === 0) {
                setVocabularies(content);
            } else {
                setVocabularies((prev) => [...prev, ...content]);
            }
        } catch (ex) {
            console.error(ex);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setLoading(true);
        const timer = setTimeout(() => {
            if (page === 0 || (page > 0 && hasMore)) {
                loadVocabularies();
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [page, keyword]);

    useEffect(() => {
        setPage(0);
    }, [keyword]);

    const loadMore = () => {
        setPage(page + 1);
    };

    return (
        <Container className="my-5">
            <Card className="shadow-sm border-0">
                <Card.Body>
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h3 className="fw-bold mb-0">Danh sách từ vựng</h3>

                        <InputGroup style={{ maxWidth: "300px" }}>
                            <Form.Control
                                value={keyword}
                                onChange={(e) => setKeyword(e.target.value)}
                                type="text"
                                placeholder="Tìm kiếm từ vựng..."
                            />
                        </InputGroup>
                    </div>

                    <Table hover responsive bordered className="align-middle">
                        <thead className="table-light text-center">
                            <tr>
                                <th>STT</th>
                                <th>Từ vựng</th>
                                <th>Nghĩa</th>
                                <th>Loại từ</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="text-center py-4">
                                        <MySpinner />
                                    </td>
                                </tr>
                            ) : vocabularies.length > 0 ? (
                                vocabularies.map((v, idx) => (
                                    <tr key={v.id}>
                                        <td className="text-center fw-semibold">{idx + 1}</td>
                                        <td className="fw-bold">{v.word}</td>
                                        <td>{v.meaning}</td>
                                        <td className="text-center">
                                            <span className="badge bg-success text-light">
                                                {v.partOfSpeech}
                                            </span>
                                        </td>
                                        <td className="text-center">
                                            <Link
                                                href={`/admin/exercises/${v.id}?word=${encodeURIComponent(v.word)}`}
                                                className="btn btn-outline-primary btn-sm flex-fill"
                                            >
                                                + Bài luyện tập
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="text-center text-muted py-4">
                                        Không có từ vựng
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </Table>

                    {vocabularies.length === 0 && !loading && (
                        <Alert className="mt-4" variant="info">
                            Không có từ vựng
                        </Alert>
                    )}

                    {hasMore && !loading && (
                        <div className="mt-3 text-center">
                            <Button variant="secondary" onClick={loadMore}>
                                Tải thêm
                            </Button>
                        </div>
                    )}
                </Card.Body>
            </Card>
        </Container>
    );
}
