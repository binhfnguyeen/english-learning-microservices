"use client";

import MySpinner from "@/components/MySpinner";
import endpoints from "@/configs/Endpoints";
import authApis from "@/configs/AuthApis";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, Col, Image, Row, Badge, ProgressBar } from "react-bootstrap";

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
    picture: string | null;
}

interface LearnedWord {
    id: number;
    learnedDate: string;
    vocabulary: Vocabulary;
}

// ==========================================
// SVG ICONS & PLACEHOLDERS
// ==========================================
const IconCalendar = ({ size = 28, className = "" }) => (
    <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
        <line x1="16" y1="2" x2="16" y2="6"></line>
        <line x1="8" y1="2" x2="8" y2="6"></line>
        <line x1="3" y1="10" x2="21" y2="10"></line>
    </svg>
);

const IconBook = ({ size = 28, className = "" }) => (
    <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path>
    </svg>
);

const IconTrophy = ({ size = 28, className = "" }) => (
    <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
        <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
        <path d="M4 22h16"></path>
        <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path>
        <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path>
        <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>
    </svg>
);

const IconAvatarPlaceholder = ({ size = 60, className = "text-muted opacity-50" }) => (
    <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
    </svg>
);

const IconImagePlaceholder = ({ size = 40, className = "text-muted opacity-50" }) => (
    <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
        <circle cx="8.5" cy="8.5" r="1.5"></circle>
        <polyline points="21 15 16 10 5 21"></polyline>
    </svg>
);

// ==========================================
// COMPONENT CHÍNH
// ==========================================
export default function Progress() {
    const { userId } = useParams();
    const id = Number(userId);

    const [progress, setProgress] = useState<Progress | null>(null);
    const [learnedWords, setLearnedWords] = useState<LearnedWord[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        if (!id || isNaN(id)) return;

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

        void loadData();
    }, [id]);

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: "60vh" }}>
                <MySpinner />
            </div>
        );
    }

    if (!progress) {
        return (
            <div className="container mt-5 text-center">
                <div className="p-5 bg-light rounded-4 border border-dashed">
                    <h5 className="text-muted fw-bold">Không có dữ liệu tiến trình.</h5>
                    <p className="text-muted mb-0">Học viên này chưa có dữ liệu học tập hoặc tài khoản không tồn tại.</p>
                </div>
            </div>
        );
    }

    const safeXp = progress.xp || 0;
    const level = Math.floor(safeXp / 100);
    const currentXp = safeXp % 100;
    const xpPercent = currentXp;
    const nextLevelXp = 100 - currentXp;

    return (
        <div className="container my-5" style={{ maxWidth: 1100 }}>

            {/* ================= PROFILE ================= */}
            <Card
                className="border-0 mb-5"
                style={{
                    borderRadius: 24,
                    boxShadow: "0 10px 30px rgba(0,0,0,0.04)",
                    background: "linear-gradient(145deg, #ffffff, #f8fafc)"
                }}
            >
                <Card.Body className="p-4 p-md-5">
                    <Row className="align-items-center g-4">
                        <Col md={3} className="text-center border-end border-light d-none d-md-block">

                            {/* XỬ LÝ AVATAR FALLBACK */}
                            {progress.user?.avatar ? (
                                <Image
                                    src={progress.user.avatar}
                                    roundedCircle
                                    width={130}
                                    height={130}
                                    alt="Avatar"
                                    style={{
                                        border: "4px solid #fff",
                                        boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
                                        objectFit: "cover"
                                    }}
                                />
                            ) : (
                                <div
                                    className="d-flex justify-content-center align-items-center bg-light rounded-circle mx-auto"
                                    style={{
                                        width: 130,
                                        height: 130,
                                        border: "4px solid #fff",
                                        boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
                                    }}
                                >
                                    <IconAvatarPlaceholder />
                                </div>
                            )}

                            <h4 className="mt-3 fw-bold text-dark m-0">
                                {progress.user?.firstName} {progress.user?.lastName}
                            </h4>
                            <div className="text-muted small mt-1">{progress.user?.email}</div>
                        </Col>

                        <Col md={9} className="ps-md-4">
                            <Row className="g-3 mb-4">
                                {/* Days */}
                                <Col sm={4}>
                                    <Card
                                        className="text-white text-center border-0 h-100 transition hover-shadow"
                                        style={{
                                            borderRadius: 16,
                                            background: "linear-gradient(135deg, #3b82f6, #60a5fa)",
                                            boxShadow: "0 8px 20px rgba(59, 130, 246, 0.2)"
                                        }}
                                    >
                                        <Card.Body className="p-4">
                                            <IconCalendar className="mb-2 opacity-75" />
                                            <div className="fw-semibold small text-uppercase tracking-wider opacity-75">Ngày đã học</div>
                                            <h2 className="fw-bold m-0 mt-1">{progress.daysStudied || 0}</h2>
                                        </Card.Body>
                                    </Card>
                                </Col>

                                {/* Words */}
                                <Col sm={4}>
                                    <Card
                                        className="text-white text-center border-0 h-100 transition hover-shadow"
                                        style={{
                                            borderRadius: 16,
                                            background: "linear-gradient(135deg, #10b981, #34d399)",
                                            boxShadow: "0 8px 20px rgba(16, 185, 129, 0.2)"
                                        }}
                                    >
                                        <Card.Body className="p-4">
                                            <IconBook className="mb-2 opacity-75" />
                                            <div className="fw-semibold small text-uppercase tracking-wider opacity-75">Từ đã học</div>
                                            <h2 className="fw-bold m-0 mt-1">{progress.wordsLearned || 0}</h2>
                                        </Card.Body>
                                    </Card>
                                </Col>

                                {/* Level */}
                                <Col sm={4}>
                                    <Card
                                        className="text-white text-center border-0 h-100 transition hover-shadow"
                                        style={{
                                            borderRadius: 16,
                                            background: "linear-gradient(135deg, #f59e0b, #fbbf24)",
                                            boxShadow: "0 8px 20px rgba(245, 158, 11, 0.2)"
                                        }}
                                    >
                                        <Card.Body className="p-4">
                                            <IconTrophy className="mb-2 opacity-75" />
                                            <div className="fw-semibold small text-uppercase tracking-wider opacity-75">Trình độ</div>
                                            <h3 className="fw-bold m-0 mt-1">{progress.cefr || "N/A"}</h3>
                                            <div className="small opacity-75">{progress.proficiency || "-"}</div>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            </Row>

                            <div className="bg-light p-4 rounded-4 border">
                                <div className="d-flex justify-content-between align-items-end mb-2">
                                    <div className="fw-bold text-primary" style={{ fontSize: "1.1rem" }}>
                                        🌟 Level {level}
                                    </div>
                                    <div className="fw-bold text-muted">
                                        {currentXp} <span className="fw-normal">/ 100 XP</span>
                                    </div>
                                </div>

                                <ProgressBar
                                    now={xpPercent}
                                    variant="primary"
                                    style={{
                                        height: 14,
                                        borderRadius: 20,
                                        backgroundColor: "#e2e8f0"
                                    }}
                                />

                                <div className="text-end mt-2 small text-secondary fw-medium">
                                    Cần thêm <span className="text-primary fw-bold">{nextLevelXp} XP</span> để thăng cấp {level + 1}
                                </div>
                            </div>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* ================= LEARNED WORDS ================= */}
            <h4 className="fw-bold text-dark mb-4 d-flex align-items-center gap-2">
                <IconBook className="text-primary" size={24} /> Kho từ vựng đã chinh phục ({learnedWords.length})
            </h4>

            {learnedWords.length === 0 ? (
                <div className="text-center py-5 bg-white rounded-4 border shadow-sm">
                    <div className="fs-1 mb-2">🌱</div>
                    <p className="text-muted fw-medium m-0">Hành trình vạn dặm bắt đầu từ một bước chân. Bạn chưa học từ nào!</p>
                </div>
            ) : (
                <Row className="g-3">
                    {[...learnedWords]
                        .sort((a, b) =>
                            new Date(b.learnedDate).getTime() - new Date(a.learnedDate).getTime()
                        )
                        .map((item) => (
                            <Col xs={6} sm={4} md={3} lg={2} key={item.id}>
                                <Card
                                    className="border-0 h-100 bg-white"
                                    style={{
                                        borderRadius: 16,
                                        overflow: "hidden",
                                        boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
                                        transition: "transform 0.2s, box-shadow 0.2s"
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = "translateY(-4px)";
                                        e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.08)";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = "translateY(0)";
                                        e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.04)";
                                    }}
                                >
                                    <div className="position-relative bg-light d-flex justify-content-center align-items-center" style={{ height: 120, borderBottom: "1px solid #f1f5f9" }}>
                                        {item.vocabulary.picture ? (
                                            <Image
                                                src={item.vocabulary.picture}
                                                alt={item.vocabulary.word}
                                                style={{
                                                    height: "100%",
                                                    width: "100%",
                                                    objectFit: "cover"
                                                }}
                                            />
                                        ) : (
                                            <div className="d-flex flex-column align-items-center justify-content-center h-100">
                                                <IconImagePlaceholder />
                                            </div>
                                        )}

                                        <Badge
                                            bg="info"
                                            className="position-absolute shadow-sm"
                                            style={{ top: 8, right: 8, borderRadius: "8px" }}
                                        >
                                            {item.vocabulary.partOfSpeech}
                                        </Badge>
                                    </div>

                                    <Card.Body className="p-3 d-flex flex-column">
                                        <div className="fw-bold fs-6 text-dark mb-1 text-truncate" title={item.vocabulary.word}>
                                            {item.vocabulary.word}
                                        </div>

                                        <div className="text-muted small text-truncate mb-2" title={item.vocabulary.meaning}>
                                            {item.vocabulary.meaning}
                                        </div>

                                        <div className="mt-auto pt-2 border-top text-end" style={{ fontSize: 11, color: "#94a3b8" }}>
                                            Học ngày: {new Date(item.learnedDate).toLocaleDateString("vi-VN")}
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                </Row>
            )}
        </div>
    );
}