"use client";
import Apis from "@/configs/Apis";
import endpoints from "@/configs/Endpoints";
import useTTS from "@/utils/useTTS";
import React, { useEffect, useState } from "react";
import { Card, Button, Form, Spinner } from "react-bootstrap";
import { VolumeUp } from "react-bootstrap-icons";

interface Props {
    vocabId: number;
    onDone: () => void;
}

interface Choice {
    id: number;
    content: string;
    isCorrect: boolean;
}

interface Exercise {
    id: number;
    question: string;
    exerciseType: "CHOOSE_MEANING" | "LISTEN_AND_TYPE";
    vocabularyId: number;
    choices: Choice[];
}

export default function Exercise({ vocabId, onDone }: Props) {
    const [exercises, setExercises] = useState<Exercise[]>([]);
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
                const res = await Apis.get(endpoints["VocabExercises"](vocabId));
                const data: Exercise[] = res.data.result || [];
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

        loadExercises();
    }, [vocabId]);

    useEffect(() => {
        if (exercise && exercise.exerciseType === "LISTEN_AND_TYPE") {
            const word = exercise.choices[0]?.content || "";
            if (word) {
                speak(word);
            }
        }
    }, [exercise, speak]);

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "200px" }}>
                <Spinner animation="border" />
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
        setSubmitted(false);
        setSelected("");
        if (current < exercises.length - 1) {
            setCurrent(prev => prev + 1);
        } else {
            onDone();
        }
    };

    const isCorrect: boolean =
        exercise.exerciseType === "CHOOSE_MEANING"
            ? exercise.choices.find(c => c.isCorrect)?.content === selected
            : exercise.choices[0]?.content.toLowerCase() === selected.toLowerCase();

    return (
        <Card
            className="shadow-sm text-center p-4"
            style={{
                maxWidth: "500px",
                width: "100%",
                borderRadius: "16px",
                border: "1px solid #eee",
            }}
        >
            <Card.Title
                className="fw-bold"
                style={{ fontSize: "1.25rem", marginBottom: "1.5rem" }}
            >
                {exercise.question}
            </Card.Title>

            {exercise.exerciseType === "CHOOSE_MEANING" ? (
                <div className="d-grid gap-2">
                    {exercise.choices.map((choice: Choice) => {
                        let variant: string = "outline-secondary";

                        if (submitted) {
                            if (choice.isCorrect) {
                                variant = "success"; // tô xanh đáp án đúng
                            } else if (choice.content === selected && !choice.isCorrect) {
                                variant = "danger"; // tô đỏ đáp án sai đã chọn
                            }
                        } else if (selected === choice.content) {
                            variant = "primary"; // đang chọn
                        }

                        return (
                            <Button
                                key={choice.id}
                                variant={variant}
                                disabled={submitted}
                                onClick={() => setSelected(choice.content)}
                                style={{ padding: "10px", fontSize: "1rem" }}
                            >
                                {choice.content}
                            </Button>
                        );
                    })}
                </div>
            ) : (
                <>
                    <div className="d-flex justify-content-center mb-3">
                        <Button
                            variant="outline-primary"
                            className="d-flex justify-content-center align-items-center"
                            onClick={() => speak(exercise.choices[0]?.content || "")}
                            disabled={isSpeaking}
                            style={{
                                width: "60px",
                                height: "60px",
                                borderRadius: "50%",
                                fontSize: "1.5rem",
                                position: "relative",
                            }}
                        >
                            {isSpeaking ? (
                                <span
                                    className="spinner-border"
                                    role="status"
                                    aria-hidden="true"
                                    style={{ width: "2rem", height: "2rem", borderWidth: "0.2em" }}
                                ></span>
                            ) : (
                                <VolumeUp />
                            )}
                        </Button>
                    </div>

                    <Form.Control
                        type="text"
                        placeholder="Nhập đáp án..."
                        value={selected}
                        onChange={(e) => setSelected(e.target.value)}
                        disabled={submitted}
                        style={{ fontSize: "1rem", padding: "10px" }}
                    />

                    {submitted && !isCorrect && (
                        <p className="mt-3 text-muted" style={{ fontSize: "1rem" }}>
                            Đáp án đúng:{" "}
                            <span className="fw-bold text-success">
                                {exercise.choices[0]?.content}
                            </span>
                        </p>
                    )}
                </>
            )}


            {!submitted ? (
                <Button
                    className="mt-4 px-4"
                    onClick={handleSubmit}
                    disabled={!selected}
                    style={{ fontSize: "1rem", borderRadius: "8px" }}
                >
                    Nộp bài
                </Button>
            ) : (
                <>
                    <p
                        className="mt-3 fw-bold"
                        style={{ color: isCorrect ? "green" : "red", fontSize: "1rem" }}
                    >
                        {isCorrect ? "Chính xác!" : "Sai rồi!"}
                    </p>
                    <Button
                        variant="success"
                        className="mt-2 px-4"
                        onClick={handleNext}
                        style={{ fontSize: "1rem", borderRadius: "8px" }}
                    >
                        {current < exercises.length - 1 ? "Bài tiếp theo" : "Tiếp tục học"}
                    </Button>
                </>
            )}
        </Card>
    );
}
