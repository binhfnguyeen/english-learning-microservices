"use client"
import MySpinner from "@/components/MySpinner";
import Apis from "@/configs/Apis";
import endpoints from "@/configs/Endpoints";
import UserContext from "@/configs/UserContext";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import React, { useContext, useEffect, useState } from "react";
import { Button, Card, Container, ProgressBar } from "react-bootstrap";
import * as Icon from 'react-bootstrap-icons';
import Swal from "sweetalert2";
import Exercise from "./Exercise";
import useTTS from "@/utils/useTTS";

interface Vocabulary {
    id: number;
    word: string;
    meaning: string;
    partOfSpeech: string;
    picture: string;
}

export default function Learning() {
    const { topicId } = useParams();
    const id = Number(topicId);
    const router = useRouter();
    const context = useContext(UserContext);
    const user = context?.user;
    const [total, setTotal] = useState<number>(0);
    const [vocabularies, setVocabularies] = useState<Vocabulary[]>([]);
    const [page, setPage] = useState(0);
    const [loading, setLoading] = useState<boolean>(false);
    const [hasMore, setHasMore] = useState<boolean>(false);
    const [showExercise, setShowExercise] = useState<boolean>(false);
    const { speak, isSpeaking } = useTTS()

    const loadVocabularies = async () => {
        const url = `${endpoints["topic_vocabs"](id)}?page=${page}&size=1`;
        try {
            setLoading(true);
            const res = await Apis.get(url);

            const content = res.data.result.content || [];
            setHasMore(!res.data.result.last)

            if (page === 0) {
                setTotal(res.data.result.totalElements || 0);
                setVocabularies(content);
            } else {
                setVocabularies(prev => [...prev, ...content]);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadVocabularies();
    }, [id, page])

    const handleNext = async (vocabId: number) => {
        try {
            if (!user) return;
            await Apis.post(endpoints["learnedWords"], {
                date: new Date().toISOString().split('T')[0],
                userId: user.id,
                vocabularyId: vocabId
            });
        } catch (err) {
            console.error(err);
        }
        setShowExercise(true);
    }

    const handleFinish = async (vocabId: number) => {
        await Swal.fire({
            icon: "success",
            title: "Hoàn thành bài học!",
            showConfirmButton: true,
        });

        try {
            if (!user) return;
            await Apis.post(endpoints["learnedWords"], {
                date: new Date().toISOString().split('T')[0],
                userId: user.id,
                vocabularyId: vocabId
            });

            router.push("/topics");
        } catch (err) {
            console.error(err);
        }
    };

    const currentVocab = vocabularies[vocabularies.length - 1];
    const progress = total > 0 ? (vocabularies.length / total) * 100 : 0;

    useEffect(() => {
        if (currentVocab?.word) {
            speak(currentVocab.word);
        }
    }, [currentVocab?.id]);

    return (
        <Container className="my-5 d-flex justify-content-center">
            {loading && vocabularies.length === 0 ? (
                <MySpinner />
            ) : currentVocab ? (
                showExercise ? (
                    <Exercise vocabId={currentVocab.id}
                        onDone={() => {
                            setShowExercise(false);
                            if (hasMore) {
                                setPage(prev => prev + 1);
                            } else {
                                handleFinish(currentVocab.id);
                            }
                        }}
                    />
                ) : (
                    <Card
                        className="shadow-lg text-center p-4"
                        style={{ maxWidth: "500px", width: "100%", borderRadius: "20px" }}
                    >
                        <ProgressBar
                            now={progress}
                            className="mb-4"
                            style={{ height: "20px", borderRadius: "10px" }}
                        />

                        <Card.Img
                            variant="top"
                            src={currentVocab.picture}
                            alt={currentVocab.word}
                            className="mb-3"
                            style={{
                                maxHeight: "250px",
                                objectFit: "cover",
                                borderRadius: "15px",
                            }}
                        />
                        <Card.Title
                            className="fw-bold fs-1 mb-3 d-flex justify-content-center align-items-center gap-3"
                        >
                            <span>{currentVocab.word}</span>
                            <Button
                                variant="outline-primary"
                                className="d-flex justify-content-center align-items-center shadow-sm"
                                onClick={() => speak(currentVocab.word || "")}
                                disabled={isSpeaking}
                                style={{
                                    width: "50px",
                                    height: "50px",
                                    borderRadius: "50%",
                                    fontSize: "1.25rem",
                                    border: "2px solid #1976d2",
                                }}
                            >
                                {isSpeaking ? (
                                    <span
                                        className="spinner-border spinner-border-sm"
                                        role="status"
                                        aria-hidden="true"
                                    ></span>
                                ) : (
                                    <Icon.VolumeUp size={22} />
                                )}
                            </Button>
                        </Card.Title>
                        <Card.Subtitle className="text-muted mb-2">
                            ({currentVocab.partOfSpeech})
                        </Card.Subtitle>

                        <Card.Text className="fs-4 mb-4">{currentVocab.meaning}</Card.Text>

                        <Button
                            variant="primary"
                            size="lg"
                            onClick={() => handleNext(currentVocab.id)}
                            className="fw-bold px-5 py-2"
                            style={{ borderRadius: "12px" }}
                        >
                            {hasMore ? "Tiếp tục" : "Làm bài tập cuối"}
                        </Button>
                    </Card>
                )
            ) : (
                <div className="text-center">
                    <p>Không có từ vựng nào.</p>
                    <Link href="/topics" className="btn btn-secondary">
                        Chọn lại chủ đề
                    </Link>
                </div>
            )}
        </Container>
    );
}
