"use client";

import MySpinner from "@/components/MySpinner";
import endpoints from "@/configs/Endpoints";
import authApis from "@/configs/AuthApis";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, Col, Image, Row, Badge, ProgressBar } from "react-bootstrap";
import { Calendar3, Book, Trophy } from "react-bootstrap-icons";

interface User {
    id: number;
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar: string;
}

interface Progress {
    user: User;
    daysStudied: number;
    wordsLearned: number;
    cefr: string;
    proficiency: string;
    xp: number;
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
    learnedDate: string;
    vocabulary: Vocabulary;
}

export default function Progress() {
    const { userId } = useParams();
    const id = Number(userId);

    const [progress, setProgress] = useState<Progress>();
    const [learnedWords, setLearnedWords] = useState<LearnedWord[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        if (!id) return;

        const loadData = async () => {
            try {
                setLoading(true);

                const [pRes, wRes] = await Promise.all([
                    authApis.get(endpoints["progress"](id)),
                    authApis.get(endpoints["learnedWord"](id))
                ]);

                setProgress(pRes.data.result);
                setLearnedWords(wRes.data.result || []);
            } catch (err) {
                console.error("Lỗi tải progress:", err);
            } finally {
                setLoading(false);
            }
        };

        loadData();
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

    const level = Math.floor(progress.xp / 100);
    const currentXp = progress.xp % 100;
    const xpPercent = (currentXp / 100) * 100;
    const nextLevelXp = 100 - currentXp;

    return (
        <div className="container mt-4" style={{ maxWidth: 1100 }}>

            {/* ================= PROFILE ================= */}
            <Card
                className="border-0 mb-4"
                style={{
                    borderRadius: 18,
                    boxShadow: "0 10px 28px rgba(0,0,0,0.06)",
                    background: "linear-gradient(135deg, #ffffff, #f8fafc)"
                }}
            >
                <Card.Body className="p-4">
                    <Row className="align-items-center">
                        <Col md={3} className="text-center">
                            <Image
                                src={progress.user.avatar || "https://via.placeholder.com/150"}
                                roundedCircle
                                width={120}
                                height={120}
                                alt="Avatar"
                                style={{
                                    border: "4px solid #fff",
                                    boxShadow: "0 6px 16px rgba(0,0,0,0.1)",
                                    objectFit: "cover"
                                }}
                            />
                            <h5 className="mt-3 fw-bold">
                                {progress.user.firstName} {progress.user.lastName}
                            </h5>
                            <div className="text-muted small">{progress.user.email}</div>
                        </Col>

                        <Col md={9}>
                            <Row className="g-3">

                                {/* Days */}
                                <Col sm={4}>
                                    <Card
                                        className="text-white text-center border-0 h-100"
                                        style={{
                                            borderRadius: 14,
                                            background: "linear-gradient(135deg,#3b82f6,#60a5fa)",
                                            boxShadow: "0 8px 20px rgba(0,0,0,0.08)"
                                        }}
                                    >
                                        <Card.Body>
                                            <Calendar3 size={26} className="mb-2" />
                                            <div className="fw-semibold">Ngày đã học</div>
                                            <h3 className="mb-0">{progress.daysStudied}</h3>
                                        </Card.Body>
                                    </Card>
                                </Col>

                                {/* Words */}
                                <Col sm={4}>
                                    <Card
                                        className="text-white text-center border-0 h-100"
                                        style={{
                                            borderRadius: 14,
                                            background: "linear-gradient(135deg,#10b981,#34d399)",
                                            boxShadow: "0 8px 20px rgba(0,0,0,0.08)"
                                        }}
                                    >
                                        <Card.Body>
                                            <Book size={26} className="mb-2" />
                                            <div className="fw-semibold">Từ đã học</div>
                                            <h3 className="mb-0">{progress.wordsLearned}</h3>
                                        </Card.Body>
                                    </Card>
                                </Col>

                                {/* Level */}
                                <Col sm={4}>
                                    <Card
                                        className="text-white text-center border-0 h-100"
                                        style={{
                                            borderRadius: 14,
                                            background: "linear-gradient(135deg,#f59e0b,#fbbf24)",
                                            boxShadow: "0 8px 20px rgba(0,0,0,0.08)"
                                        }}
                                    >
                                        <Card.Body>
                                            <Trophy size={26} className="mb-2" />
                                            <div className="fw-semibold">Trình độ</div>
                                            <h4 className="mb-0">{progress.cefr}</h4>
                                            <small>{progress.proficiency}</small>
                                        </Card.Body>
                                    </Card>
                                </Col>

                            </Row>

                            <div className="mt-4">

                                {/* Level Header */}
                                <div className="d-flex justify-content-between align-items-center mb-1">
                                    <div className="fw-semibold">
                                        Level {level}
                                    </div>
                                    <div className="small text-muted">
                                        {currentXp}/100 XP
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                <ProgressBar
                                    now={xpPercent}
                                    style={{
                                        height: 12,
                                        borderRadius: 20,
                                        backgroundColor: "#e5e7eb"
                                    }}
                                />

                                {/* Next level info */}
                                <div className="text-end mt-1 small text-muted">
                                    Còn {nextLevelXp} XP để lên Level {level + 1}
                                </div>
                            </div>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* ================= LEARNED WORDS ================= */}
            <Card
                className="border-0"
                style={{
                    borderRadius: 16,
                    boxShadow: "0 6px 18px rgba(0,0,0,0.05)"
                }}
            >
                <Card.Header className="bg-white fw-bold">
                    Danh sách từ đã học
                </Card.Header>

                <Card.Body style={{ maxHeight: 400, overflowY: "auto" }}>
                    {learnedWords.length === 0 ? (
                        <p className="text-muted text-center">Chưa có từ nào được học.</p>
                    ) : (
                        <Row className="g-3">
                            {learnedWords
                                .sort((a, b) =>
                                    new Date(b.learnedDate).getTime() -
                                    new Date(a.learnedDate).getTime()
                                )
                                .map((item) => (
                                    <Col xs={6} sm={4} md={3} key={item.id}>
                                        <Card
                                            className="border-0 h-100"
                                            style={{
                                                borderRadius: 12,
                                                overflow: "hidden",
                                                boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                                                transition: "0.2s"
                                            }}
                                        >
                                            <Image
                                                src={item.vocabulary.picture || "https://via.placeholder.com/150"}
                                                alt={item.vocabulary.word}
                                                style={{
                                                    height: 100,
                                                    width: "100%",
                                                    objectFit: "cover"
                                                }}
                                            />

                                            <Card.Body className="p-2">
                                                <div className="fw-semibold small text-truncate">
                                                    {item.vocabulary.word}
                                                </div>

                                                <Badge bg="info" className="mb-1">
                                                    {item.vocabulary.partOfSpeech}
                                                </Badge>

                                                <div className="text-muted small text-truncate">
                                                    {item.vocabulary.meaning}
                                                </div>

                                                <div className="text-end mt-1" style={{ fontSize: 11, color: "#aaa" }}>
                                                    {new Date(item.learnedDate).toLocaleDateString("vi-VN")}
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