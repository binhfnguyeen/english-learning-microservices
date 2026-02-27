"use client"

import MySpinner from "@/components/MySpinner";
import Apis from "@/configs/Apis";
import authApis from "@/configs/AuthApis";
import endpoints from "@/configs/Endpoints";
import UserContext from "@/configs/UserContext";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import { Button, Card, Container, ListGroup, Nav } from "react-bootstrap";
import Swal from "sweetalert2";

interface TestFull {
    id: number;
    title: string;
    description: string;
    questions: Question[];
}

interface Question {
    id: number;
    content: string;
    choices: Choice[];
}

interface Choice {
    id: number;
    isCorrect: boolean;
    vocabularyId: number;
    word: string;
}

interface Answer {
    questionId: number;
    choiceId: number | null;
}

export default function FullTest() {
    const { testId } = useParams();
    const id = Number(testId);
    const [test, setTest] = useState<TestFull>();
    const [loading, setLoading] = useState<boolean>(false);
    const router = useRouter();
    const [score, setScore] = useState<number>(0);
    const [answers, setAnswers] = useState<Answer[]>([]);

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
    const [selectedChoice, setSelectedChoice] = useState<number | null>(null);

    const context = useContext(UserContext);
    const user = context?.user;

    const loadFullTest = async () => {
        try {
            setLoading(true);
            const res = await Apis.get(endpoints["fullTests"](id));
            setTest(res.data.result);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    const handleSelectChoice = (questionId: number, choiceId: number) => {
        setAnswers(prev => {
            const updated = prev.filter(a => a.questionId !== questionId);
            return [...updated, { questionId, choiceId }];
        });
        setSelectedChoice(choiceId);
    };

    const handleNextQuestion = () => {
        if (currentQuestionIndex < (test?.questions.length || 0) - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            setSelectedChoice(null);
        } else {
            handleFinishTest();
        }
    }

    const handleFinishTest = async () => {
        let finalScore = 0;

        test?.questions.forEach((q) => {
            const ans = answers.find(a => a.questionId === q.id);
            if (ans) {
                const choice = q.choices.find(c => c.id === ans.choiceId);
                if (choice?.isCorrect) finalScore++;
            }
        });

        await Swal.fire({
            icon: "success",
            title: "Hoàn thành bài kiểm tra!",
            text: `Bạn đạt ${finalScore} / ${test?.questions.length} điểm`,
            showConfirmButton: true,
        });

        try {
            if (!user) return;

            const body = {
                score: finalScore,
                dateTaken: new Date().toISOString().split('T')[0],
                testId: id,
                userId: user.id,
                answers: answers.map(a => ({ questionChoiceId: a.choiceId }))
            };
            await authApis.post(endpoints["addTestResult"], body);
            router.push(`/tests/${id}`);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        loadFullTest();
    }, [id])

    useEffect(() => {
        const ans = answers.find(a => a.questionId === test?.questions[currentQuestionIndex].id);
        setSelectedChoice(ans ? ans.choiceId : null);
    }, [currentQuestionIndex, test, answers]);

    if (!user) {
        return <p className="text-muted">Bạn cần đăng nhập để làm bài kiểm tra.</p>;
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

                        {test.questions.length > 0 && (
                            <div>
                                <h5>
                                    Câu {currentQuestionIndex + 1}/{test.questions.length}:{" "}
                                    {test.questions[currentQuestionIndex].content}
                                </h5>

                                <ListGroup className="mt-3">
                                    {test.questions[currentQuestionIndex].choices.map((c) => (
                                        <ListGroup.Item
                                            key={c.id}
                                            action
                                            active={selectedChoice === c.id}
                                            onClick={() => handleSelectChoice(test.questions[currentQuestionIndex].id, c.id)}
                                        >
                                            {c.word}
                                        </ListGroup.Item>
                                    ))}
                                </ListGroup>

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
                                        disabled={selectedChoice === null}
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