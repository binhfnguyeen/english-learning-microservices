"use client"
import endpoints from "@/configs/Endpoints";
import Link from "next/link";
import { useEffect, useState, useContext } from "react";
import { Button, Card, Container, Form, Badge, ProgressBar } from "react-bootstrap";
import authApis from "@/configs/AuthApis";
import MySpinner from "@/components/MySpinner";
import UserContext from "@/configs/UserContext";

interface Topic {
    id: number;
    name: string;
    totalVocabs: number;
}

interface Test {
    id: number;
    title: string;
    description: string;
    difficultyLevel: string;
    topic?: Topic;
}

interface LearnedWord {
    id: number;
    vocabulary: {
        id: number;
        topicIds?: number[];
    };
}

const IconSearch = ({ size = 20, className = "" }) => (
    <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
);

const IconFileText = ({ size = 24, className = "" }) => (
    <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <line x1="16" y1="13" x2="8" y2="13"></line>
        <line x1="16" y1="17" x2="8" y2="17"></line>
        <polyline points="10 9 9 9 8 9"></polyline>
    </svg>
);

const IconPlay = ({ size = 18, className = "" }) => (
    <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="5 3 19 12 5 21 5 3"></polygon>
    </svg>
);

const IconLock = ({ size = 18, className = "" }) => (
    <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
    </svg>
);

const IconUnlock = ({ size = 18, className = "" }) => (
    <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
        <path d="M7 11V7a5 5 0 0 1 9.9-1"></path>
    </svg>
);

export default function Tests() {
    const { user } = useContext(UserContext) || {};

    const [tests, setTests] = useState<Test[]>([]);
    const [page, setPage] = useState<number>(0);
    const [keyword, setKeyword] = useState<string>("");
    const [hasMore, setHasMore] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);

    const [learnedCountByTopic, setLearnedCountByTopic] = useState<Record<number, number>>({});

    const loadTestsAndProgress = async () => {
        let url = `${endpoints["Tests"]}?page=${page}&size=6`;
        if (keyword) url += `&keyword=${keyword}`;

        try {
            setLoading(true);

            const res = await authApis.get(url);
            const pageData = res.data.result;
            const content: Test[] = pageData.content || [];

            setHasMore(!pageData.last);
            if (page === 0) setTests(content);
            else setTests(prev => [...prev, ...content]);

            if (user?.id && Object.keys(learnedCountByTopic).length === 0) {
                const learnedRes = await authApis.get(endpoints["learnedWord"](user.id));
                const learnedWords: LearnedWord[] = learnedRes.data.result || [];

                const counts: Record<number, number> = {};

                learnedWords.forEach(item => {
                    const tIds = item.vocabulary?.topicIds || [];

                    tIds.forEach((tId: number) => {
                        counts[tId] = (counts[tId] || 0) + 1;
                    });
                });

                console.log("Số từ đã học theo từng Topic:", counts);
                setLearnedCountByTopic(counts);
            }

        } catch (err) {
            console.error("Lỗi khi tải dữ liệu bài kiểm tra:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            if (page === 0 || (page > 0 && hasMore)) {
                loadTestsAndProgress();
            }
        }, 400);
        return () => clearTimeout(timer);
    }, [page, keyword, user?.id]);

    useEffect(() => {
        setPage(0);
    }, [keyword]);

    const getDifficultyVariant = (level?: string) => {
        if (!level) return "secondary";
        const text = level.toLowerCase();
        if (text.includes("easy") || text.includes("dễ")) return "success";
        if (text.includes("medium") || text.includes("trung")) return "warning";
        if (text.includes("hard") || text.includes("khó")) return "danger";
        return "secondary";
    };

    return (
        <Container className="my-5" style={{ maxWidth: 1000 }}>
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-5 gap-3">
                <div>
                    <h2 className="fw-bold text-dark m-0 d-flex align-items-center gap-2">
                        <IconFileText className="text-primary" size={28} /> Danh sách Đề thi
                    </h2>
                    <span className="text-muted small">Hoàn thành từ vựng trong chủ đề để mở khóa bài kiểm tra tương ứng.</span>
                </div>

                <div className="position-relative" style={{ width: "100%", maxWidth: "350px" }}>
                    <div className="position-absolute top-50 translate-middle-y ms-3 text-muted">
                        <IconSearch size={18} />
                    </div>
                    <Form.Control
                        value={keyword}
                        onChange={kw => setKeyword(kw.target.value)}
                        type="text"
                        placeholder="Tìm kiếm đề thi..."
                        className="shadow-sm border-0 bg-light py-2"
                        style={{ paddingLeft: '40px', borderRadius: '12px' }}
                    />
                </div>
            </div>

            {loading && page === 0 ? (
                <div className="py-5">
                    <MySpinner />
                </div>
            ) : (
                <>
                    <div className="row g-4">
                        {tests.map((test) => {
                            const variant = getDifficultyVariant(test.difficultyLevel);

                            const topicId = test.topic?.id;
                            const requiredVocabs = test.topic?.totalVocabs || 0;
                            const learnedVocabs = topicId ? (learnedCountByTopic[topicId] || 0) : 0;

                            const isUnlocked = !topicId || requiredVocabs === 0 || learnedVocabs >= requiredVocabs;
                            const progressPercent = requiredVocabs > 0 ? Math.min((learnedVocabs / requiredVocabs) * 100, 100) : 100;

                            return (
                                <div key={test.id} className="col-md-6 col-lg-4">
                                    <Card
                                        className={`shadow-sm border-0 h-100 position-relative ${!isUnlocked ? 'bg-light' : ''}`}
                                        style={{
                                            borderRadius: '16px',
                                            transition: '0.2s',
                                            opacity: isUnlocked ? 1 : 0.85
                                        }}
                                    >
                                        <Card.Body className="p-4 d-flex flex-column">

                                            <div className="d-flex justify-content-between align-items-start mb-3">
                                                <Badge bg={isUnlocked ? "success" : "secondary"} className="px-2 py-1 rounded-2 d-flex align-items-center gap-1 shadow-sm">
                                                    {isUnlocked ? <IconUnlock size={14}/> : <IconLock size={14}/>}
                                                    {isUnlocked ? "Đã mở khóa" : "Đang khóa"}
                                                </Badge>

                                                <Badge
                                                    bg="white"
                                                    className={`text-${variant} border border-${variant} bg-${variant} bg-opacity-10 px-2 py-1 rounded-2 shadow-sm`}
                                                >
                                                    {test.difficultyLevel}
                                                </Badge>
                                            </div>

                                            <Card.Title className="fw-bold text-dark mb-2 lh-base fs-5">
                                                {test.title}
                                            </Card.Title>

                                            <Card.Text className="text-muted small flex-grow-1 mb-3">
                                                {test.description || "Không có mô tả chi tiết cho đề thi này."}
                                            </Card.Text>

                                            {/* HIỂN THỊ TIẾN ĐỘ NẾU BỊ KHÓA VÀ CÓ TOPIC */}
                                            {!isUnlocked && topicId && (
                                                <div className="mb-4 mt-auto">
                                                    <div className="d-flex justify-content-between small text-muted mb-1 fw-medium">
                                                        <span>Tiến độ chủ đề</span>
                                                        <span>{learnedVocabs} / {requiredVocabs} từ</span>
                                                    </div>
                                                    <ProgressBar
                                                        now={progressPercent}
                                                        variant="warning"
                                                        style={{ height: 6, borderRadius: 10 }}
                                                    />
                                                </div>
                                            )}

                                            {/* NÚT ACTION */}
                                            {isUnlocked ? (
                                                <Link
                                                    href={`/tests/${test.id}`}
                                                    className="btn btn-primary w-100 fw-bold mt-auto d-flex align-items-center justify-content-center gap-2 shadow-sm"
                                                    style={{ borderRadius: '10px', padding: '10px 0' }}
                                                >
                                                    <IconPlay /> Làm bài ngay
                                                </Link>
                                            ) : (
                                                <Link
                                                    href={`/topics/${topicId}/learning`}
                                                    className="btn btn-outline-secondary w-100 fw-bold mt-auto d-flex align-items-center justify-content-center gap-2"
                                                    style={{ borderRadius: '10px', padding: '10px 0' }}
                                                >
                                                    Học thêm từ vựng
                                                </Link>
                                            )}

                                        </Card.Body>
                                    </Card>
                                </div>
                            );
                        })}
                    </div>

                    {!loading && tests.length === 0 && (
                        <div className="text-center py-5 bg-light rounded-4 border mt-2 shadow-sm">
                            <IconFileText size={48} className="text-muted mb-3 opacity-50" />
                            <p className="text-muted m-0 fs-5 fw-medium">Không tìm thấy đề thi nào phù hợp.</p>
                        </div>
                    )}

                    {!loading && hasMore && (
                        <div className="text-center mt-5">
                            <Button
                                variant="outline-primary"
                                className="px-5 fw-bold rounded-pill shadow-sm"
                                onClick={() => setPage((p) => p + 1)}
                            >
                                Xem thêm
                            </Button>
                        </div>
                    )}

                    {loading && page > 0 && (
                        <div className="text-center mt-4">
                            <MySpinner />
                        </div>
                    )}
                </>
            )}
        </Container>
    );
}