"use client"

import MySpinner from "@/components/MySpinner";
import authApis from "@/configs/AuthApis";
import endpoints from "@/configs/Endpoints";
import UserContext from "@/configs/UserContext";
import { useParams, useRouter } from "next/navigation";
import React, { useContext, useEffect, useState } from "react";
import { Badge, Button, Card, Container, ProgressBar } from "react-bootstrap";
import Swal from "sweetalert2";

interface Vocabulary {
    id: number;
    word: string;
    meaning: string;
    partOfSpeech: string;
    level: string | null;
    picture: string | null;
}

interface TestFull {
    id: number;
    title: string;
    description: string;
    questions: Question[];
}

interface Question {
    id: number;
    content: string;
    type: string;
    choices: Choice[];
}

interface Choice {
    id: number;
    isCorrect: boolean | null;
    textContent?: string;
    vocabulary: Vocabulary | null;
}

interface Answer {
    questionId: number;
    choiceId: number | null;
    givenAnswerText?: string;
}

export default function FullTest() {
    const { testId } = useParams();
    const id = Number(testId);
    const [test, setTest] = useState<TestFull>();
    const [loading, setLoading] = useState<boolean>(false);
    const router = useRouter();
    const [answers, setAnswers] = useState<Answer[]>([]);

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
    const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
    const [textInput, setTextInput] = useState<string>("");

    const context = useContext(UserContext);
    const user = context?.user;

    const loadFullTest = async () => {
        try {
            setLoading(true);
            const res = await authApis.get(endpoints["Test"](id));
            setTest(res.data.result);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id && user) loadFullTest();
    }, [id, user]);

    useEffect(() => {
        if (!test || !test.questions?.length) return;

        const currentQuestion = test.questions[currentQuestionIndex];
        if (!currentQuestion) return;

        setAnswers(prev => {
            const ans = prev.find(a => a.questionId === currentQuestion.id);
            setSelectedChoice(ans?.choiceId ?? null);
            setTextInput(ans?.givenAnswerText ?? "");
            return prev;
        });
    }, [currentQuestionIndex, test]);

    const handleTextInputChange = (val: string) => {
        setTextInput(val);
        if (!test?.questions[currentQuestionIndex]) return;

        const questionId = test.questions[currentQuestionIndex].id;

        setAnswers(prev => {
            const updated = prev.filter(a => a.questionId !== questionId);
            return [...updated, { questionId, choiceId: null, givenAnswerText: val }];
        });
    };

    const handleSelectChoice = (questionId: number, choiceId: number, isTextBased = false, textVal = "") => {
        if (isTextBased) {
            handleTextInputChange(textVal);
            setSelectedChoice(choiceId);
        } else {
            setAnswers(prev => {
                const updated = prev.filter(a => a.questionId !== questionId);
                return [...updated, { questionId, choiceId }];
            });
            setSelectedChoice(choiceId);
        }
    };

    const canMoveToNext = () => {
        if (!test?.questions[currentQuestionIndex]) return false;

        const currentQ = test.questions[currentQuestionIndex];

        if (["REWRITE_SENTENCE", "WORD_ORDER", "FILL_IN_BLANK"].includes(currentQ.type)) {
            return textInput.trim() !== "";
        }
        return selectedChoice !== null;
    };

    const handleNextQuestion = () => {
        if (currentQuestionIndex < (test?.questions.length || 0) - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        } else {
            handleFinishTest();
        }
    };

    const handleFinishTest = async () => {
        try {
            if (!user) return;

            const payloadAnswers = answers
                .filter(a => a.choiceId !== null || a.givenAnswerText?.trim())
                .map(a => ({
                    questionId: a.questionId,
                    questionChoiceId: a.choiceId,
                    givenAnswerText: a.givenAnswerText ?? null
                }));

            await authApis.post(endpoints["addTestResult"], {
                testId: id,
                userId: user.id,
                answers: payloadAnswers
            });

            Swal.fire({
                icon: "success",
                title: "Tuyệt vời!",
                text: "Bạn đã hoàn thành bài kiểm tra.",
                confirmButtonColor: "#0d6efd"
            }).then(() => {
                router.push(`/tests/${id}/results`);
            });
        } catch (err) {
            console.error(err);
            Swal.fire("Lỗi", "Không thể lưu kết quả bài thi", "error");
        }
    };

    if (!user) {
        return <Container className="my-5 text-center">Bạn cần đăng nhập.</Container>;
    }

    return (
        <Container className="my-5" style={{ maxWidth: '800px' }}>
            {loading ? (
                <MySpinner />
            ) : test?.questions?.length ? (
                <>
                    <ProgressBar
                        now={((currentQuestionIndex + 1) / test.questions.length) * 100}
                    />

                    <Card className="mt-4">
                        <Card.Body>
                            {(() => {
                                const currentQ = test.questions[currentQuestionIndex];

                                return (
                                    <div>
                                        <h4>{currentQ.content}</h4>

                                        <div className="mt-3">
                                            {currentQ.choices?.map((c, idx) => {
                                                const content = c.textContent || c.vocabulary?.word || "";
                                                const picture = c.vocabulary?.picture;

                                                return (
                                                    <div
                                                        key={c.id}
                                                        onClick={() => handleSelectChoice(currentQ.id, c.id)}
                                                        style={{
                                                            border: "1px solid #ddd",
                                                            padding: 10,
                                                            marginBottom: 10,
                                                            cursor: "pointer",
                                                            background: selectedChoice === c.id ? "#e7f1ff" : "#fff"
                                                        }}
                                                    >
                                                        {picture ? (
                                                            <div style={{ display: "flex", gap: 10 }}>
                                                                {/* ✅ FIX LỖI Ở ĐÂY */}
                                                                <img
                                                                    src={picture}
                                                                    alt={content}
                                                                    width={60}
                                                                    height={60}
                                                                    style={{ objectFit: "cover" }}
                                                                />
                                                                <span>{content}</span>
                                                            </div>
                                                        ) : (
                                                            <span>{content}</span>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })()}

                            <div className="d-flex justify-content-between mt-4">
                                <Button
                                    onClick={() => setCurrentQuestionIndex(prev => Math.max(prev - 1, 0))}
                                >
                                    Back
                                </Button>

                                <Button onClick={handleNextQuestion} disabled={!canMoveToNext()}>
                                    Next
                                </Button>
                            </div>
                        </Card.Body>
                    </Card>
                </>
            ) : (
                <p>Không có dữ liệu</p>
            )}
        </Container>
    );
}