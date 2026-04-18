"use client";
import endpoints from "@/configs/Endpoints";
import useTTS from "@/utils/useTTS";
import React, { useEffect, useState } from "react";
import { Card, Button, Form, Spinner, Badge } from "react-bootstrap";
import { VolumeUp } from "react-bootstrap-icons";
import authApis from "@/configs/AuthApis";

interface Props {
    vocabId: number;
    onDone: () => void;
}

interface Choice {
    id: number;
    content: string;
    isCorrect: boolean;
}

interface ExerciseData {
    id: number;
    question: string;
    exerciseType: "CHOOSE_MEANING" | "LISTEN_AND_TYPE" | "MULTIPLE_CHOICE";
    vocabularyId: number;
    choices: Choice[];
}

export default function Exercise({ vocabId, onDone }: Props) {
    const [exercises, setExercises] = useState<ExerciseData[]>([]);
    const [current, setCurrent] = useState<number>(0);
    const [selected, setSelected] = useState<string>("");
    const [submitted, setSubmitted] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);
    const { speak, isSpeaking } = useTTS();
    const exercise = exercises[current] ?? null;

    useEffect(() => {
        const loadExercises = async (): Promise<void> => {
            try {
                setLoading(true);
                const res = await authApis.get(endpoints["VocabExercises"](vocabId));
                const data: ExerciseData[] = res.data.result || [];
                if (data.length === 0) {
                    onDone();
                } else {
                    setExercises(data);
                }
            } catch (err) {
                console.error(err);
                onDone();
            } finally {
                setLoading(false);
            }
        };

        void loadExercises();

        return () => {
            if (typeof window !== "undefined" && window.speechSynthesis) {
                window.speechSynthesis.cancel();
            }
        };
    }, [vocabId, onDone]);

    useEffect(() => {
        if (exercise && exercise.exerciseType === "LISTEN_AND_TYPE") {
            const word = exercise.choices[0]?.content || "";
            if (word) {
                if (typeof window !== "undefined" && window.speechSynthesis) {
                    window.speechSynthesis.cancel();
                }
                speak(word);
            }
        }
    }, [exercise, speak]);

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center bg-white rounded-4 shadow-sm" style={{ minHeight: "300px" }}>
                <Spinner animation="border" variant="primary" />
            </div>
        );
    }

    if (exercises.length === 0) {
        return null;
    }

    const handleSubmit = (): void => {
        setSubmitted(true);
    };

    const handleNext = (): void => {
        if (typeof window !== "undefined" && window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }

        setSubmitted(false);
        setSelected("");
        if (current < exercises.length - 1) {
            setCurrent(prev => prev + 1);
        } else {
            onDone();
        }
    };

    const isMultipleChoiceType = exercise.exerciseType === "CHOOSE_MEANING" || exercise.exerciseType === "MULTIPLE_CHOICE";

    const isCorrect: boolean = isMultipleChoiceType
        ? exercise.choices.find(c => c.isCorrect)?.content === selected
        : exercise.choices[0]?.content.toLowerCase() === selected.toLowerCase();

    return (
        <Card
            className="shadow-sm text-center p-4 border-0 mx-auto"
            style={{
                borderRadius: "24px",
            }}
        >
            <div className="mb-4">
                <Badge bg="warning" text="dark" className="px-3 py-2 rounded-pill fw-bold border border-warning border-opacity-25 mb-3">
                    Bài tập vận dụng {current + 1}/{exercises.length}
                </Badge>
                <Card.Title className="fw-bold m-0" style={{ fontSize: "1.3rem", lineHeight: "1.5" }}>
                    {exercise.question}
                </Card.Title>
            </div>

            {isMultipleChoiceType ? (
                <div className="d-flex flex-column gap-2 mt-2">
                    {exercise.choices.map((choice: Choice) => {
                        let btnClass = "border text-start p-3 fw-medium transition d-flex justify-content-between align-items-center";
                        let variant = "light";

                        if (submitted) {
                            if (choice.isCorrect) {
                                variant = "success";
                                btnClass += " bg-success text-white border-success";
                            } else if (choice.content === selected && !choice.isCorrect) {
                                variant = "danger";
                                btnClass += " bg-danger text-white border-danger";
                            } else {
                                btnClass += " opacity-50";
                            }
                        } else if (selected === choice.content) {
                            variant = "primary";
                            btnClass += " bg-primary bg-opacity-10 text-primary border-primary";
                        } else {
                            btnClass += " bg-white hover-bg-light";
                        }

                        return (
                            <Button
                                key={choice.id}
                                variant={variant}
                                disabled={submitted}
                                onClick={() => setSelected(choice.content)}
                                className={btnClass}
                                style={{ borderRadius: "12px", fontSize: "1.05rem" }}
                            >
                                <span>{choice.content}</span>
                                {submitted && choice.isCorrect && <span>✓</span>}
                                {submitted && choice.content === selected && !choice.isCorrect && <span>✗</span>}
                            </Button>
                        );
                    })}
                </div>
            ) : (
                <>
                    <div className="d-flex justify-content-center mb-4 mt-2">
                        <Button
                            variant="outline-primary"
                            className="d-flex justify-content-center align-items-center shadow-sm bg-primary bg-opacity-10 border-primary"
                            onClick={() => {
                                if (typeof window !== "undefined" && window.speechSynthesis) {
                                    window.speechSynthesis.cancel();
                                }
                                speak(exercise.choices[0]?.content || "")
                            }}
                            disabled={isSpeaking}
                            style={{
                                width: "65px",
                                height: "65px",
                                borderRadius: "50%",
                            }}
                        >
                            {isSpeaking ? (
                                <Spinner animation="border" size="sm" />
                            ) : (
                                <VolumeUp size={24} />
                            )}
                        </Button>
                    </div>

                    <Form.Control
                        type="text"
                        placeholder="Nhập đáp án bạn nghe được..."
                        value={selected}
                        onChange={(e) => setSelected(e.target.value)}
                        disabled={submitted}
                        className="text-center shadow-sm"
                        style={{ fontSize: "1.1rem", padding: "12px", borderRadius: "12px" }}
                    />

                    {submitted && !isCorrect && (
                        <div className="mt-3 p-3 bg-light rounded-3 border">
                            <span className="text-muted d-block mb-1 small text-uppercase fw-bold">Đáp án chuẩn</span>
                            <span className="fw-bold text-success fs-5">
                                {exercise.choices[0]?.content}
                            </span>
                        </div>
                    )}
                </>
            )}

            <div className="mt-4 pt-3 border-top">
                {!submitted ? (
                    <Button
                        variant="primary"
                        className="w-100 fw-bold py-3 shadow-sm"
                        onClick={handleSubmit}
                        disabled={!selected}
                        style={{ fontSize: "1.1rem", borderRadius: "16px" }}
                    >
                        Kiểm tra đáp án
                    </Button>
                ) : (
                    <div className="d-flex flex-column align-items-center gap-3">
                        <div className={`fw-bold fs-5 d-flex align-items-center gap-2 ${isCorrect ? "text-success" : "text-danger"}`}>
                            {isCorrect ? "Chính xác tuyệt đối!" : "Sai mất rồi, cố lên nhé!"}
                        </div>
                        <Button
                            variant={isCorrect ? "success" : "primary"}
                            className="w-100 fw-bold py-3 shadow-sm"
                            onClick={handleNext}
                            style={{ fontSize: "1.1rem", borderRadius: "16px" }}
                        >
                            {current < exercises.length - 1 ? "Câu tiếp theo →" : "Tiếp tục bài học"}
                        </Button>
                    </div>
                )}
            </div>
        </Card>
    );
}