"use client"
import MySpinner from "@/components/MySpinner";
import endpoints from "@/configs/Endpoints";
import UserContext from "@/configs/UserContext";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import React, { useContext, useEffect, useState } from "react";
import { Button, Card, Container, ProgressBar, Badge } from "react-bootstrap";
import Swal from "sweetalert2";
import Exercise from "./Exercise";
import useTTS from "@/utils/useTTS";
import authApis from "@/configs/AuthApis";

interface Vocabulary {
    id: number;
    word: string;
    meaning: string;
    partOfSpeech: string;
    picture: string | null;
}

const IconVolume = ({ size = 24, className = "" }) => (
    <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
        <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
    </svg>
);

const IconImagePlaceholder = ({ size = 64, className = "text-muted opacity-50" }) => (
    <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
        <circle cx="8.5" cy="8.5" r="1.5"></circle>
        <polyline points="21 15 16 10 5 21"></polyline>
    </svg>
);

const IconCheck = ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
);

export default function Learning() {
    const { topicId } = useParams();
    const id = Number(topicId);
    const router = useRouter();
    const context = useContext(UserContext);
    const user = context?.user;

    const [total, setTotal] = useState<number>(0);
    const [vocabularies, setVocabularies] = useState<Vocabulary[]>([]);
    const [page, setPage] = useState(0);

    const [currentIndex, setCurrentIndex] = useState(0);

    const [loading, setLoading] = useState<boolean>(false);
    const [hasMore, setHasMore] = useState<boolean>(false);
    const [showExercise, setShowExercise] = useState<boolean>(false);

    const [hasSpoken, setHasSpoken] = useState<boolean>(false);

    const { speak, isSpeaking } = useTTS();

    const loadVocabularies = async () => {
        const url = `${endpoints["topic_vocabs"](id)}?page=${page}&size=1`;
        try {
            setLoading(true);
            const res = await authApis.get(url);

            const content = res.data.result.content || [];
            setHasMore(!res.data.result.last)

            if (page === 0) {
                setTotal(res.data.result.totalElements || 0);
                setVocabularies(content);
                setCurrentIndex(0);
            } else {
                setVocabularies(prev => {
                    const newArr = [...prev, ...content];
                    setCurrentIndex(newArr.length - 1);
                    return newArr;
                });
            }

            setHasSpoken(false);

        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        void loadVocabularies();

        return () => {
            if (typeof window !== "undefined" && window.speechSynthesis) {
                window.speechSynthesis.cancel();
            }
        };
    }, [id, page]);

    const handleNext = async (vocabId: number) => {
        if (typeof window !== "undefined" && window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }

        if (currentIndex < vocabularies.length - 1) {
            setCurrentIndex(prev => prev + 1);
            return;
        }

        try {
            if (!user) return;
            await authApis.post(endpoints["learnedWords"], {
                date: new Date().toISOString().split('T')[0],
                userId: user.id,
                vocabularyId: vocabId
            });
        } catch (err) {
            console.error(err);
        }

        setShowExercise(true);
    };

    const handleFinish = async () => {
        await Swal.fire({
            icon: "success",
            title: "Hoàn thành bài học!",
            text: "Chúc mừng bạn đã học xong tất cả từ vựng.",
            showConfirmButton: true,
            confirmButtonColor: "#0d6efd"
        });
        router.push("/topics");
    };

    const currentVocab = vocabularies[currentIndex];

    useEffect(() => {
        if (currentVocab?.word && !showExercise) {
            if (typeof window !== "undefined" && window.speechSynthesis) {
                window.speechSynthesis.cancel();
            }
            speak(currentVocab.word);
            setHasSpoken(true);
        }
    }, [currentVocab?.id, showExercise]);

    return (
        <Container className="my-5 d-flex flex-column align-items-center justify-content-center" style={{ minHeight: "70vh" }}>
            {loading && vocabularies.length === 0 ? (
                <div className="py-5 text-center">
                    <MySpinner />
                    <p className="text-muted mt-3">Đang tải bài học...</p>
                </div>
            ) : currentVocab ? (
                showExercise ? (
                    <div className="w-100" style={{ maxWidth: "700px" }}>
                        <Exercise
                            vocabId={currentVocab.id}
                            onDone={() => {
                                setShowExercise(false);
                                if (hasMore) {
                                    setPage(prev => prev + 1);
                                } else {
                                    void handleFinish();
                                }
                            }}
                        />
                    </div>
                ) : (
                    <div className="w-100" style={{ maxWidth: "600px" }}>
                        <div className="mb-4">
                            <div className="d-flex justify-content-between align-items-center mb-2 px-1">
                                <span className="text-muted small fw-bold text-uppercase">Tiến trình học ({vocabularies.length}/{total})</span>
                            </div>

                            <div className="d-flex align-items-center gap-2 overflow-auto pb-2" style={{ scrollbarWidth: "thin", scrollBehavior: "smooth" }}>
                                {Array.from({ length: total }).map((_, idx) => {
                                    const isCompleted = idx < vocabularies.length - 1;
                                    const isActive = idx === currentIndex;
                                    const isLocked = idx > vocabularies.length - 1;

                                    let bgClass = "bg-light text-muted border-secondary";
                                    if (isActive) bgClass = "bg-primary text-white border-primary shadow-sm";
                                    else if (isCompleted) bgClass = "bg-success bg-opacity-10 text-success border-success";

                                    return (
                                        <div
                                            key={idx}
                                            onClick={() => {
                                                if (!isLocked && !showExercise) {
                                                    // Ngắt tiếng cũ nếu bấm chọn tab cũ
                                                    if (typeof window !== "undefined" && window.speechSynthesis) {
                                                        window.speechSynthesis.cancel();
                                                    }
                                                    setCurrentIndex(idx);
                                                }
                                            }}
                                            className={`d-flex align-items-center justify-content-center fw-bold border rounded-circle flex-shrink-0 transition ${bgClass}`}
                                            style={{
                                                width: isActive ? "45px" : "40px",
                                                height: isActive ? "45px" : "40px",
                                                cursor: isLocked ? "not-allowed" : "pointer",
                                                opacity: isLocked ? 0.5 : 1
                                            }}
                                        >
                                            {isCompleted && !isActive ? <IconCheck size={20} /> : idx + 1}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        <Card className="shadow-lg border-0" style={{ borderRadius: "24px", overflow: "hidden" }}>

                            <div className="bg-light d-flex align-items-center justify-content-center position-relative" style={{ height: "260px", borderBottom: "1px solid #f0f0f0" }}>
                                {currentVocab.picture ? (
                                    <img
                                        src={currentVocab.picture}
                                        alt={currentVocab.word}
                                        className="w-100 h-100"
                                        style={{ objectFit: "cover" }}
                                    />
                                ) : (
                                    <div className="d-flex flex-column align-items-center justify-content-center h-100 text-center px-4">
                                        <IconImagePlaceholder />
                                        <span className="text-muted small mt-2 opacity-75">Không có hình ảnh minh họa</span>
                                    </div>
                                )}
                            </div>

                            <Card.Body className="p-4 p-md-5 text-center d-flex flex-column align-items-center">

                                <div className="d-flex flex-wrap align-items-center justify-content-center gap-3 mb-2 w-100">
                                    <h1 className="fw-bold text-dark m-0 text-break" style={{ fontSize: "2.5rem", letterSpacing: "-0.5px" }}>
                                        {currentVocab.word}
                                    </h1>

                                    <Button
                                        variant="light"
                                        className="d-flex justify-content-center align-items-center shadow-sm text-primary border border-primary border-opacity-25 transition hover-bg-primary hover-text-white flex-shrink-0"
                                        onClick={() => {
                                            if (typeof window !== "undefined" && window.speechSynthesis) {
                                                window.speechSynthesis.cancel();
                                            }
                                            speak(currentVocab.word || "");
                                            setHasSpoken(true);
                                        }}
                                        disabled={isSpeaking}
                                        style={{
                                            width: "48px",
                                            height: "48px",
                                            borderRadius: "50%",
                                        }}
                                    >
                                        {isSpeaking ? (
                                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                        ) : (
                                            <IconVolume size={20} />
                                        )}
                                    </Button>
                                </div>

                                <Badge bg="secondary" className="bg-opacity-10 text-secondary border border-secondary border-opacity-25 px-3 py-2 rounded-pill fw-medium mb-4 fs-6 mt-2">
                                    {currentVocab.partOfSpeech}
                                </Badge>

                                <Card.Text className="fs-4 text-primary fw-medium mb-5 fst-italic">
                                    "{currentVocab.meaning}"
                                </Card.Text>

                                {currentIndex < vocabularies.length - 1 ? (
                                    <Button
                                        variant="outline-primary"
                                        size="lg"
                                        onClick={() => handleNext(currentVocab.id)}
                                        className="fw-bold px-5 py-3 w-100 shadow-sm"
                                        style={{ borderRadius: "16px", fontSize: "1.1rem" }}
                                    >
                                        Qua lại bước hiện tại →
                                    </Button>
                                ) : (
                                    <Button
                                        variant={isSpeaking ? "secondary" : "primary"}
                                        size="lg"
                                        onClick={() => handleNext(currentVocab.id)}
                                        disabled={isSpeaking || !hasSpoken}
                                        className="fw-bold px-5 py-3 w-100 shadow-sm"
                                        style={{ borderRadius: "16px", fontSize: "1.1rem" }}
                                    >
                                        {isSpeaking
                                            ? "Đang phát âm..."
                                            : (hasMore ? "Làm bài tập vận dụng →" : "Làm bài tập cuối cùng")}
                                    </Button>
                                )}

                            </Card.Body>
                        </Card>
                    </div>
                )
            ) : (
                <div className="text-center py-5 bg-light rounded-4 border w-100" style={{ maxWidth: "500px" }}>
                    <h5 className="text-dark fw-bold">Chưa có từ vựng nào</h5>
                    <p className="text-muted">Chủ đề này hiện tại chưa có dữ liệu từ vựng để học.</p>
                    <Link href="/topics" className="btn btn-primary px-4 rounded-pill mt-2">
                        ← Chọn chủ đề khác
                    </Link>
                </div>
            )}
        </Container>
    );
}