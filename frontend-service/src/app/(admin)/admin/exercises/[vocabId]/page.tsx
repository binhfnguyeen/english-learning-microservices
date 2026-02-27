"use client";

import Apis from "@/configs/Apis";
import endpoints from "@/configs/Endpoints";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Alert, Badge, Button, Card, Container, Modal, Nav, Table } from "react-bootstrap";
import AddExercise from "./addExercises/AddExercises";
import authApis from "@/configs/AuthApis";
import Link from "next/link";

interface Choice {
    content: string;
    isCorrect: boolean;
}

interface Exercise {
    id: number;
    question: string;
    exerciseType: string;
    choices: Choice[];
}

export default function ExercisesVocabPage() {
    const params = useParams<{ vocabId: string }>();
    const searchParams = useSearchParams();
    const id = Number(params.vocabId);
    const word = searchParams.get("word");
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [showAdd, setShowAdd] = useState<boolean>(false);
    const [msg, setMsg] = useState<string>("");

    const loadExercises = async () => {
        try {
            setLoading(true);
            const res = await Apis.get(endpoints["VocabExercises"](id));
            setExercises(res.data.result);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadExercises();
    }, [id]);

    const handleDelete = async (e: React.FormEvent<HTMLElement>, id: number) => {
        e.preventDefault();
        try {
            await authApis.delete(endpoints["delExercise"](id));
            setMsg("Xóa chủ đề thành công!");
            setExercises(prev => prev.filter(t => t.id !== id));
        } catch (err) {
            setMsg("Xóa chủ đề không thành công!");
            console.error(err);
        }
    }

    useEffect(() => {
        if (msg) {
            const timer = setTimeout(() => setMsg(""), 2000);
            return () => clearTimeout(timer);
        }
    }, [msg]);

    return (
        <Container className="my-5">
            <Card className="shadow-sm border-0">
                <Card.Body>
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h3 className="fw-bold mb-0">Bài tập cho từ vựng: {word}</h3>

                        <div className="d-flex gap-2">
                            <Button variant="primary" onClick={() => setShowAdd(true)}>
                                + Thêm Exercise
                            </Button>
                            <Link href="/admin/exercises" className="btn btn-outline-secondary">
                                Quay lại
                            </Link>
                        </div>
                    </div>

                    {msg && (
                        <Alert
                            variant={msg.includes("không") ? "danger" : "success"}
                            className="py-2 position-fixed top-0 end-0 m-3 shadow"
                            style={{ zIndex: 9999, minWidth: "250px" }}
                        >
                            {msg}
                        </Alert>
                    )}

                    <Table hover responsive bordered className="align-middle">
                        <thead className="table-light text-center">
                            <tr>
                                <th>STT</th>
                                <th>Câu hỏi</th>
                                <th>Loại</th>
                                <th>Đáp án</th>
                                <th>Xóa</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-4">
                                        Đang tải...
                                    </td>
                                </tr>
                            ) : exercises.length > 0 ? (
                                exercises.map((ex, idx) => (
                                    <tr key={idx}>
                                        <td className="text-center fw-semibold">
                                            {idx + 1}
                                        </td>
                                        <td>{ex.question}</td>
                                        <td className="text-center">
                                            <Badge bg="info">{ex.exerciseType}</Badge>
                                        </td>
                                        <td>
                                            <ul className="mb-0 list-unstyled">
                                                {ex.choices.map((c, cIdx) => (
                                                    <li
                                                        key={cIdx}
                                                        className={
                                                            c.isCorrect
                                                                ? "text-success fw-bold"
                                                                : ""
                                                        }
                                                    >
                                                        {c.content}
                                                    </li>
                                                ))}
                                            </ul>
                                        </td>
                                        <td className="text-center">
                                            <Button
                                                variant="danger"
                                                size="sm"
                                                onClick={(e) => handleDelete(e, ex.id)}
                                            >
                                                Xóa
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="text-center text-muted py-4">
                                        Không có bài tập
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>

            <Modal show={showAdd} onHide={() => setShowAdd(false)} size="lg" centered backdrop="static">
                <Modal.Body>
                    <AddExercise onSuccess={() => {
                        setShowAdd(false);
                        loadExercises();
                    }} />
                </Modal.Body>
            </Modal>
        </Container>
    );
}
