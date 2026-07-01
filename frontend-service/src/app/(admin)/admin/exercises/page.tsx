"use client";

import MySpinner from "@/components/MySpinner";
import endpoints from "@/configs/Endpoints";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
    Alert,
    Button,
    Card,
    Container,
    Form,
    InputGroup,
    Table,
} from "react-bootstrap";
import { ChevronLeft, ChevronRight } from "react-bootstrap-icons";
import authApis from "@/configs/AuthApis";

interface Vocabulary {
    id: number;
    word: string;
    meaning: string;
    partOfSpeech: string;
    level: string;
    speech: string;
    picture: string;
}

export default function VocabsPage() {
    const [vocabularies, setVocabularies] = useState<Vocabulary[]>([]);
    const [page, setPage] = useState<number>(0);
    const [keyword, setKeyword] = useState<string>("");
    const [debouncedKeyword, setDebouncedKeyword] = useState<string>("");
    const [hasMore, setHasMore] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);

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

            setVocabularies(content);
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

    const emptyRowsCount = Math.max(0, 10 - vocabularies.length);

    return (
        <Container className="my-5">
            <Card className="shadow-sm border-0">
                <Card.Body>
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h3 className="fw-bold mb-0">Vocabulary List</h3>

                        <InputGroup style={{ maxWidth: "300px" }}>
                            <Form.Control
                                value={keyword}
                                onChange={(e) => setKeyword(e.target.value)}
                                type="text"
                                placeholder="Search vocabulary..."
                            />
                        </InputGroup>
                    </div>

                    <Table hover responsive bordered className="align-middle mb-0">
                        <thead className="table-light text-center">
                            <tr>
                                <th style={{ width: "80px" }}>No.</th>
                                <th>Word</th>
                                <th>Meaning</th>
                                <th style={{ width: "120px" }}>Level</th>
                                <th style={{ width: "160px" }}>Part of Speech</th>
                                <th style={{ width: "140px" }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody style={{ opacity: loading ? 0.6 : 1, transition: "opacity 0.15s ease-in-out" }}>
                            {vocabularies.length === 0 && loading ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-5" style={{ height: "550px" }}>
                                        <MySpinner />
                                    </td>
                                </tr>
                            ) : vocabularies.length > 0 ? (
                                <>
                                    {vocabularies.map((v, idx) => (
                                        <tr key={v.id} style={{ height: "55px" }}>
                                            <td className="text-center fw-semibold">{page * 10 + idx + 1}</td>
                                            <td className="fw-bold">{v.word}</td>
                                            <td>{v.meaning}</td>
                                            <td className="text-center">{v.level}</td>
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
                                                    + Exercises
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                    {emptyRowsCount > 0 && Array.from({ length: emptyRowsCount }).map((_, idx) => (
                                        <tr key={`empty-${idx}`} style={{ height: "55px" }}>
                                            <td className="text-center text-muted">-</td>
                                            <td>&nbsp;</td>
                                            <td>&nbsp;</td>
                                            <td>&nbsp;</td>
                                            <td>&nbsp;</td>
                                            <td>&nbsp;</td>
                                        </tr>
                                    ))}
                                </>
                            ) : (
                                <>
                                    <tr>
                                        <td colSpan={6} className="text-center text-muted py-4" style={{ height: "55px" }}>
                                            No vocabulary found
                                        </td>
                                    </tr>
                                    {Array.from({ length: 9 }).map((_, idx) => (
                                        <tr key={`empty-fail-${idx}`} style={{ height: "55px" }}>
                                            <td colSpan={6}>&nbsp;</td>
                                        </tr>
                                    ))}
                                </>
                            )}
                        </tbody>
                    </Table>

                    {vocabularies.length === 0 && !loading && (
                        <Alert className="mt-4 mb-0" variant="info">
                            No vocabulary found
                        </Alert>
                    )}

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
                </Card.Body>
            </Card>
        </Container>
    );
}
