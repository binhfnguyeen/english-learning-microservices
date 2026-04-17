"use client"

import MySpinner from "@/components/MySpinner";
import authApis from "@/configs/AuthApis";
import endpoints from "@/configs/Endpoints";
import UserContext from "@/configs/UserContext";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import React, { useContext, useEffect, useState } from "react";
import { Button, Card, Container, ListGroup, Nav } from "react-bootstrap";
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
    }

    useEffect(() => {
        if (id && user) {
            loadFullTest();
        }
    }, [id, user]);

    // ĐÃ SỬA: Loại bỏ 'answers' khỏi dependencies để không làm kẹt phím khi nhập văn bản
    useEffect(() => {
        if (!test || !test.questions || test.questions.length === 0) return;
        const currentQuestion = test.questions[currentQuestionIndex];
        if (!currentQuestion) return;

        setAnswers(prevAnswers => {
            const ans = prevAnswers.find(a => a.questionId === currentQuestion.id);
            setSelectedChoice(ans?.choiceId || null);
            setTextInput(ans?.givenAnswerText || "");
            return prevAnswers;
        });
    }, [currentQuestionIndex, test]);

    const handleTextInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setTextInput(value);

        if (!test || !test.questions[currentQuestionIndex]) return;
        const questionId = test.questions[currentQuestionIndex].id;

        setAnswers(prev => {
            const updated = prev.filter(a => a.questionId !== questionId);
            return [...updated, { questionId, choiceId: null, givenAnswerText: value }];
        });
    };

    const handleSelectChoice = (questionId: number, choiceId: number) => {
        setAnswers(prev => {
            const updated = prev.filter(a => a.questionId !== questionId);
            return [...updated, { questionId, choiceId }];
        });
        setSelectedChoice(choiceId);
    };

    const canMoveToNext = () => {
        if (!test || !test.questions || !test.questions[currentQuestionIndex]) return false;
        const currentQ = test.questions[currentQuestionIndex];

        if (currentQ.type === 'REWRITE_SENTENCE' || currentQ.type === 'WORD_ORDER') {
            return textInput !== null && textInput.trim() !== "";
        }
        return selectedChoice !== null;
    };

    const handleNextQuestion = () => {
        if (currentQuestionIndex < (test?.questions.length || 0) - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        } else {
            handleFinishTest();
        }
    }

    const handleFinishTest = async () => {
        try {
            if (!user) return;

            const payloadAnswers = answers
                .filter(a => a.choiceId !== null || (a.givenAnswerText && a.givenAnswerText.trim() !== ""))
                .map(a => ({
                    questionId: a.questionId,
                    questionChoiceId: a.choiceId || null,
                    givenAnswerText: a.givenAnswerText || null
                }));

            const body = {
                testId: id,
                userId: user.id,
                answers: payloadAnswers
            };

            await authApis.post(endpoints["addTestResult"], body);

            Swal.fire({
                icon: "success",
                title: "Đã nộp bài!",
                text: "Hệ thống đã lưu kết quả của bạn.",
                showConfirmButton: false,
                timer: 1500
            });

            router.push(`/tests/${id}/results`);
        } catch (err) {
            console.error("Lỗi khi lưu kết quả:", err);
            Swal.fire("Lỗi", "Không thể lưu kết quả bài thi", "error");
        }
    };

    if (!user) {
        return <Container className="my-5"><p className="text-muted">Bạn cần đăng nhập để làm bài kiểm tra.</p></Container>;
    }

    return (
        <Container className="my-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-bold">Bài kiểm tra: {test?.title}</h2>
                <Nav>
                    <Link href={`/tests/${id}`} className="btn btn-outline-secondary btn-sm">
                        Quay lại
                    </Link>
                </Nav>
            </div>

            {loading ? (
                <MySpinner />
            ) : test ? (
                <Card className="shadow-sm">
                    <Card.Body>
                        <p className="text-muted">{test.description}</p>

                        {test.questions && test.questions.length > 0 && (
                            <div>
                                <h5>
                                    Câu {currentQuestionIndex + 1}/{test.questions.length}:{" "}
                                    {test.questions[currentQuestionIndex].content}
                                </h5>

                                <div className="mt-3">
                                    {(() => {
                                        const currentQ = test.questions[currentQuestionIndex];

                                        if (currentQ.type === 'REWRITE_SENTENCE') {
                                            return (
                                                <div className="p-3 bg-light rounded border">
                                                    <p className="fw-bold mb-2">Viết lại câu sau:</p>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        placeholder="Nhập câu trả lời của bạn..."
                                                        value={textInput}
                                                        onChange={handleTextInputChange}
                                                    />
                                                </div>
                                            );
                                        }

                                        if (currentQ.type === 'WORD_ORDER') {
                                            return (
                                                <div className="p-3 bg-light rounded border">
                                                    <p className="fw-bold mb-2">Sắp xếp các từ thành câu hoàn chỉnh:</p>
                                                    <div className="d-flex gap-2 mb-3 flex-wrap">
                                                        {currentQ.choices?.map(c => {
                                                            // Đảm bảo lấy text hoặc cảnh báo nếu backend gửi thiếu
                                                            const word = c.textContent || c.vocabulary?.word;
                                                            return (
                                                                <Button
                                                                    variant="outline-primary"
                                                                    size="sm"
                                                                    key={c.id}
                                                                    onClick={() => {
                                                                        if (!word) return;
                                                                        const newValue = textInput ? textInput + " " + word : word;
                                                                        handleTextInputChange({ target: { value: newValue } } as React.ChangeEvent<HTMLInputElement>);
                                                                    }}
                                                                >
                                                                    {word || "Lỗi (Thiếu textContent)"}
                                                                </Button>
                                                            );
                                                        })}
                                                    </div>
                                                    <input
                                                        type="text"
                                                        className="form-control mt-2"
                                                        value={textInput}
                                                        onChange={handleTextInputChange}
                                                    />
                                                    <Button
                                                        variant="link"
                                                        className="text-danger p-0 mt-2"
                                                        onClick={() => handleTextInputChange({ target: { value: "" } } as any)}
                                                    >
                                                        Xóa làm lại
                                                    </Button>
                                                </div>
                                            );
                                        }

                                        // Mặc định: MULTIPLE_CHOICE
                                        return (
                                            <ListGroup>
                                                {currentQ.choices?.map((c) => (
                                                    <ListGroup.Item
                                                        key={c.id}
                                                        action
                                                        active={selectedChoice === c.id}
                                                        onClick={() => handleSelectChoice(currentQ.id, c.id)}
                                                    >
                                                        {c.textContent || c.vocabulary?.word || "Lỗi DTO"}
                                                    </ListGroup.Item>
                                                ))}
                                            </ListGroup>
                                        );
                                    })()}
                                </div>

                                <div className="mt-4 d-flex justify-content-between">
                                    <Button
                                        variant="secondary"
                                        onClick={() => setCurrentQuestionIndex(prev => Math.max(prev - 1, 0))}
                                        disabled={currentQuestionIndex === 0}
                                    >
                                        Câu trước
                                    </Button>

                                    <Button
                                        onClick={handleNextQuestion}
                                        disabled={!canMoveToNext()}
                                    >
                                        {currentQuestionIndex === test.questions.length - 1
                                            ? "Hoàn thành"
                                            : "Câu tiếp theo"}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </Card.Body>
                </Card>
            ) : (
                <p className="text-muted">Không tìm thấy đề thi.</p>
            )}
        </Container>
    );
}