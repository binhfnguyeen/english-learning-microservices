"use client";
import MySpinner from "@/components/MySpinner";
import Apis from "@/configs/Apis";
import endpoints from "@/configs/Endpoints";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, Col, Image, Row, Badge } from "react-bootstrap";
import { Calendar3, Book, Trophy } from "react-bootstrap-icons";

interface User {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    username: string;
    password: string;
    isActive: true;
    avatar: string;
    role: string;
}

interface Progress {
    userId: User;
    daysStudied: number;
    wordsLearned: number;
    level: string;
}

interface Vocabulary {
    id: number;
    word: string;
    meaning: string;
    partOfSpeech: string;
    picture: string;
}

interface LearnedWord {
    id: number;
    date: Date;
    vocabularyId: Vocabulary;
}

export default function Progress() {
    const { userId } = useParams();
    const id = Number(userId);

    const [progress, setProgress] = useState<Progress>();
    const [learnedWords, setLearnedWords] = useState<LearnedWord[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    const loadProgress = async () => {
        try {
            setLoading(true);
            const res = await Apis.get(endpoints["progress"](id));
            setProgress(res.data.result);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const loadLearnedWords = async () => {
        try {
            setLoading(true);
            const res = await Apis.get(endpoints["learnedWord"](id));
            setLearnedWords(res.data.result);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProgress();
        loadLearnedWords();
    }, [id]);

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: "60vh" }}>
                <MySpinner />
            </div>
        );
    }

    if (!progress) {
        return <p className="text-center mt-5">Không có dữ liệu tiến trình.</p>;
    }

    return (
        <div className="mt-4">
            <Card className="shadow-sm border-0 p-3">
                <Row className="align-items-center">
                    <Col md={3} className="text-center">
                        <Image
                            src={progress.userId.avatar || "https://via.placeholder.com/150"}
                            roundedCircle
                            width={130}
                            height={130}
                            alt="Avatar"
                            className="shadow-sm"
                        />
                        <h5 className="mt-3 fw-bold">{progress.userId.firstName} {progress.userId.lastName}</h5>
                        <p className="text-muted">{progress.userId.email}</p>
                    </Col>

                    <Col md={9}>
                        <Row className="g-3">
                            <Col sm={4}>
                                <Card className="text-center border-primary shadow-sm p-3">
                                    <Calendar3 size={28} className="text-primary mb-2" />
                                    <h6 className="fw-bold">Ngày đã học</h6>
                                    <h4 className="mb-0">{progress.daysStudied}</h4>
                                </Card>
                            </Col>
                            <Col sm={4}>
                                <Card className="text-center border-success shadow-sm p-3">
                                    <Book size={28} className="text-success mb-2" />
                                    <h6 className="fw-bold">Từ đã học</h6>
                                    <h4 className="mb-0">{progress.wordsLearned}</h4>
                                </Card>
                            </Col>
                            <Col sm={4}>
                                <Card className="text-center border-warning shadow-sm p-3">
                                    <Trophy size={28} className="text-warning mb-2" />
                                    <h6 className="fw-bold">Trình độ</h6>
                                    <h4 className="mb-0">{progress.level}</h4>
                                </Card>
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </Card>

            <Card className="mt-4 shadow-sm border-0 rounded-3">
                <Card.Header className="bg-white fw-bold py-2 border-bottom">
                    Danh sách từ đã học
                </Card.Header>
                <Card.Body
                    style={{
                        maxHeight: "250px",
                        overflowY: "auto",
                        padding: "0.75rem",
                    }}
                >
                    {learnedWords.length === 0 ? (
                        <p className="text-muted m-0 small">Chưa có từ nào được học.</p>
                    ) : (
                        <Row className="g-2">
                            {learnedWords
                                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                                .map((item) => (
                                    <Col xs={6} sm={4} md={3} key={item.id}>
                                        <Card className="border-0 shadow-sm h-100 rounded-3">
                                            <Image
                                                src={item.vocabularyId.picture}
                                                alt={item.vocabularyId.word}
                                                fluid
                                                style={{
                                                    height: "90px",
                                                    objectFit: "cover",
                                                    borderTopLeftRadius: "0.5rem",
                                                    borderTopRightRadius: "0.5rem",
                                                }}
                                            />
                                            <Card.Body className="p-2">
                                                <div
                                                    className="fw-semibold text-truncate"
                                                    style={{ fontSize: "0.85rem" }}
                                                    title={item.vocabularyId.word}
                                                >
                                                    {item.vocabularyId.word}
                                                </div>
                                                <Badge
                                                    bg="light"
                                                    text="dark"
                                                    className="mb-1"
                                                    style={{ fontSize: "0.65rem" }}
                                                >
                                                    {item.vocabularyId.partOfSpeech}
                                                </Badge>
                                                <div
                                                    className="text-muted text-truncate small"
                                                    title={item.vocabularyId.meaning}
                                                >
                                                    {item.vocabularyId.meaning}
                                                </div>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                ))}
                        </Row>
                    )}
                </Card.Body>
            </Card>

        </div>
    );
}