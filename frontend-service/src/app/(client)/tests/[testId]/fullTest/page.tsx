"use client"

import MySpinner from "@/components/MySpinner";
import authApis from "@/configs/AuthApis";
import endpoints from "@/configs/Endpoints";
import UserContext from "@/configs/UserContext";
import { useParams, useRouter } from "next/navigation";
import React, { useContext, useEffect, useState } from "react";
import { Button, Card, Container, ProgressBar } from "react-bootstrap";
import Swal from "sweetalert2";

import {
    DndContext,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent
} from "@dnd-kit/core";

import {
    arrayMove,
    SortableContext,
    useSortable,
    horizontalListSortingStrategy
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";

export interface Vocabulary {
    id: number;
    word: string;
    meaning?: string;
    partOfSpeech?: string;
    level?: string;
    picture?: string | null;
}

export interface Choice {
    id: number;
    isCorrect?: boolean;
    textContent?: string | null;
    vocabulary?: Vocabulary | null;
}

export type QuestionType = "FILL_IN_BLANK" | "REWRITE_SENTENCE" | "WORD_ORDER" | "MULTIPLE_CHOICE";

export interface Question {
    id: number;
    content: string;
    type: QuestionType;
    correctAnswerText?: string | null;
    choices: Choice[];
}

export interface TestDetail {
    id: number;
    title?: string;
    description?: string;
    difficultyLevel?: string;
    questions: Question[];
}

export interface Answer {
    questionId: number;
    choiceId: number | null;
    givenAnswerText?: string;
}

type SensorsType = ReturnType<typeof useSensors>;

interface TextQuestionProps {
    q: Question;
    value: string;
    onChange: (value: string) => void;
}

interface WordOrderQuestionProps extends TextQuestionProps {
    sensors: SensorsType;
}

interface MultipleChoiceQuestionProps {
    q: Question;
    selectedId?: number | null;
    onChange: (id: number) => void;
}

function SortableItem({ id }: { id: string }) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        padding: "10px 16px",
        border: "1px solid #ddd",
        borderRadius: 10,
        background: "#fff",
        cursor: "grab",
        fontWeight: 500,
        boxShadow: "0 2px 6px rgba(0,0,0,0.05)"
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            {id}
        </div>
    );
}

function WordOrderQuestion({ q, value, onChange, sensors }: WordOrderQuestionProps) {
    const [items, setItems] = useState<string[]>(() => {
        if (value) return value.split(" ").filter((w: string) => w);
        return q.choices.map((c: Choice) => c.textContent || c.vocabulary?.word || "");
    });

    useEffect(() => {
        if (!value) {
            onChange(items.join(" "));
        }
    }, []);

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            const oldIndex = items.indexOf(active.id as string);
            const newIndex = items.indexOf(over.id as string);
            const newItems = arrayMove(items, oldIndex, newIndex);
            setItems(newItems);
            onChange(newItems.join(" "));
        }
    };

    return (
        <>
            <h4 className="mb-2">{q.content}</h4>
            <p className="text-muted small mb-4">
                <em>Gợi ý: Nhấn giữ và kéo thả các khối từ bên dưới để sắp xếp thành một câu hoàn chỉnh.</em>
            </p>

            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={items} strategy={horizontalListSortingStrategy}>
                    <div className="d-flex gap-2 flex-wrap p-3 border rounded bg-light">
                        {items.map((word) => (
                            <SortableItem key={word} id={word} />
                        ))}
                    </div>
                </SortableContext>
            </DndContext>
        </>
    );
}

function FillInBlankQuestion({ q, value, onChange }: TextQuestionProps) {
    const charLength = q.correctAnswerText ? q.correctAnswerText.length : 0;
    const lengthHint = charLength > 0 ? ` (từ này có ${charLength} ký tự)` : "";

    return (
        <>
            <h4 className="mb-2">{q.content}</h4>
            <p className="text-muted small mb-3">
                <em>Gợi ý: Gõ từ hoặc cụm từ còn thiếu vào ô trống{lengthHint}.</em>
            </p>

            <input
                className="form-control mt-2 shadow-sm rounded-3"
                style={{ padding: "12px 16px" }}
                value={value}
                placeholder="Nhập đáp án của bạn vào đây..."
                onChange={(e) => onChange(e.target.value)}
                autoComplete="off"
            />
        </>
    );
}

function RewriteSentenceQuestion({ q, value, onChange }: TextQuestionProps) {
    return (
        <>
            <h4 className="mb-2">{q.content}</h4>
            <p className="text-muted small mb-3">
                <em>Gợi ý: Viết một câu hoàn chỉnh sao cho giữ nguyên ý nghĩa của câu gốc.</em>
            </p>

            <textarea
                className="form-control mt-2 shadow-sm rounded-3"
                style={{ padding: "12px 16px" }}
                rows={4}
                value={value}
                placeholder="Viết lại câu của bạn tại đây..."
                onChange={(e) => onChange(e.target.value)}
            />
        </>
    );
}

function MultipleChoiceQuestion({ q, selectedId, onChange }: MultipleChoiceQuestionProps) {
    return (
        <>
            <h4 className="mb-2">{q.content}</h4>
            <p className="text-muted small mb-4">
                <em>Gợi ý: Nhấp chuột để chọn một đáp án đúng nhất.</em>
            </p>

            {q.choices.map((c: Choice) => {
                const content = c.textContent || c.vocabulary?.word;
                const isSelected = selectedId === c.id;

                return (
                    <div
                        key={c.id}
                        onClick={() => onChange(c.id)}
                        className={`p-3 rounded-3 border shadow-sm mt-3 d-flex justify-content-between 
                        ${isSelected ? "bg-light border-primary" : "bg-white"}`}
                        style={{ cursor: "pointer", transition: "0.2s" }}
                    >
                        {content}
                        {isSelected && <span className="text-primary fw-bold">✓</span>}
                    </div>
                );
            })}
        </>
    );
}

export default function FullTest() {
    const { testId } = useParams();
    const id = Number(testId);

    const [test, setTest] = useState<TestDetail | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const router = useRouter();

    const [answers, setAnswers] = useState<Answer[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);

    const context = useContext(UserContext);
    const user = context?.user;

    const sensors = useSensors(useSensor(PointerSensor));

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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, user]);

    const saveAnswer = (choiceId: number | null, text: string = "") => {
        if (!test || !test.questions[currentQuestionIndex]) return;

        const questionId = test.questions[currentQuestionIndex].id;

        setAnswers(prev => {
            const updated = prev.filter(a => a.questionId !== questionId);
            return [...updated, { questionId, choiceId, givenAnswerText: text }];
        });
    };

    const canMoveToNext = () => {
        const q = test?.questions[currentQuestionIndex];
        if (!q) return false;

        const currentAns = answers.find(a => a.questionId === q.id);
        if (!currentAns) return false;

        if (["FILL_IN_BLANK", "REWRITE_SENTENCE", "WORD_ORDER"].includes(q.type)) {
            return currentAns.givenAnswerText && currentAns.givenAnswerText.trim() !== "";
        }

        return currentAns.choiceId !== null && currentAns.choiceId !== undefined;
    };

    const handleNext = () => {
        if (!test) return;
        if (currentQuestionIndex < test.questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        } else {
            handleFinish();
        }
    };

    const handleFinish = async () => {
        try {
            await authApis.post(endpoints["addTestResult"], {
                testId: id,
                userId: user?.id,
                answers: answers
            });

            Swal.fire("Xong!", "Bạn đã hoàn thành bài thi", "success")
                .then(() => router.push(`/tests/${id}`));

        } catch (err) {
            console.error(err);
        }
    };

    const renderStep = () => {
        if (!test || !test.questions[currentQuestionIndex]) return null;

        const currentQ = test.questions[currentQuestionIndex];
        const currentAns = answers.find(a => a.questionId === currentQ.id) || {} as Partial<Answer>;

        switch (currentQ.type) {
            case "FILL_IN_BLANK":
                return (
                    <FillInBlankQuestion
                        key={currentQ.id}
                        q={currentQ}
                        value={currentAns.givenAnswerText || ""}
                        onChange={(v: string) => saveAnswer(null, v)}
                    />
                );
            case "REWRITE_SENTENCE":
                return (
                    <RewriteSentenceQuestion
                        key={currentQ.id}
                        q={currentQ}
                        value={currentAns.givenAnswerText || ""}
                        onChange={(v: string) => saveAnswer(null, v)}
                    />
                );
            case "WORD_ORDER":
                return (
                    <WordOrderQuestion
                        key={currentQ.id}
                        q={currentQ}
                        value={currentAns.givenAnswerText || ""}
                        onChange={(v: string) => saveAnswer(null, v)}
                        sensors={sensors}
                    />
                );
            case "MULTIPLE_CHOICE":
            default:
                return (
                    <MultipleChoiceQuestion
                        key={currentQ.id}
                        q={currentQ}
                        selectedId={currentAns.choiceId}
                        onChange={(id: number) => saveAnswer(id)}
                    />
                );
        }
    };

    if (!user) return <Container>Login required</Container>;

    return (
        <Container className="my-5" style={{ maxWidth: 800 }}>
            {loading ? <MySpinner /> : test?.questions?.length && (
                <>
                    <ProgressBar
                        now={(currentQuestionIndex + 1) / test.questions.length * 100}
                        style={{ height: 10, borderRadius: 10 }}
                    />

                    <Card className="mt-4 shadow-sm border-0" style={{ borderRadius: 16 }}>
                        <Card.Body className="p-4">

                            {renderStep()}

                            <div className="d-flex justify-content-between mt-4">
                                <Button
                                    variant="light"
                                    onClick={() => setCurrentQuestionIndex(p => Math.max(0, p - 1))}
                                    disabled={currentQuestionIndex === 0}
                                >
                                    Back
                                </Button>

                                <Button
                                    onClick={handleNext}
                                    disabled={!canMoveToNext()}
                                >
                                    {currentQuestionIndex === test.questions.length - 1 ? "Hoàn thành" : "Next"}
                                </Button>
                            </div>

                        </Card.Body>
                    </Card>
                </>
            )}
        </Container>
    );
}