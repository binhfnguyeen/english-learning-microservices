"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button, Card, Form } from "react-bootstrap";
import { Plus, X } from "react-bootstrap-icons";
import authApis from "@/configs/AuthApis";
import endpoints from "@/configs/Endpoints";

interface AddExerciseProps {
    onSuccess?: () => void;
}

interface Choice {
    content: string;
    isCorrect: boolean;
}

export default function AddExercise({ onSuccess }: AddExerciseProps) {
    const params = useParams<{ vocabId: string }>();
    const vocabId = Number(params.vocabId);
    const searchParams = useSearchParams();
    const word = searchParams.get("word");

    const [question, setQuestion] = useState<string>("");
    const [exerciseType, setExerciseType] = useState<"CHOOSE_MEANING" | "LISTEN_AND_TYPE">("CHOOSE_MEANING");
    const [choices, setChoices] = useState<Choice[]>([
        { content: "", isCorrect: false },
        { content: "", isCorrect: false },
        { content: "", isCorrect: false },
        { content: "", isCorrect: false },
    ]);
    const [loading, setLoading] = useState<boolean>(false);

    const handleChoiceChange = (index: number, field: keyof Choice, value: string | boolean) => {
        const updated = [...choices];
        updated[index] = { ...updated[index], [field]: value } as Choice;
        setChoices(updated);
    };

    const addExercise = async () => {
        try {
            setLoading(true);
            const payload = {
                question: exerciseType === "LISTEN_AND_TYPE"
                    ? "Listen and write the word"
                    : question,
                exerciseType,
                vocabularyId: vocabId,
                choices:
                    exerciseType === "CHOOSE_MEANING"
                        ? choices.filter((c) => c.content.trim() !== "")
                        : [{ content: word ?? "", isCorrect: true }],
            };
            console.log("payload gửi:", payload);
            await authApis.post(endpoints.addExercise, payload);
            if (onSuccess) onSuccess();
        } catch (err: unknown) {
            if (err instanceof Error) {
                console.error("Add exercise failed:", err.message);
            } else {
                console.error("Add exercise failed:", err);
            }
            alert("Could not add exercise!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="shadow-lg p-4 border-0" style={{ borderRadius: "15px" }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="text-primary fw-bold m-0">
                    <Plus size={28} /> Add Exercise for vocabulary: {word}
                </h3>
                <Button variant="light" className="border-0" onClick={onSuccess}>
                    <X size={24} />
                </Button>
            </div>

            <Form>
                <Form.Group className="mb-3">
                    <Form.Label>Exercise Type</Form.Label>
                    <Form.Select
                        value={exerciseType}
                        onChange={(e) => setExerciseType(e.target.value as "CHOOSE_MEANING" | "LISTEN_AND_TYPE")}
                    >
                        <option value="CHOOSE_MEANING">Choose Meaning</option>
                        <option value="LISTEN_AND_TYPE">Listen and Write Word</option>
                    </Form.Select>
                </Form.Group>

                {exerciseType === "CHOOSE_MEANING" && (
                    <Form.Group className="mb-3">
                        <Form.Label>Question</Form.Label>
                        <Form.Control
                            type="text"
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            placeholder="Enter question"
                        />
                    </Form.Group>
                )}

                <Form.Label>Answers</Form.Label>
                {exerciseType === "CHOOSE_MEANING" ? (
                    <>
                        {choices.map((c, idx) => (
                            <div key={idx} className="d-flex align-items-center mb-2">
                                <Form.Control
                                    type="text"
                                    value={c.content}
                                    onChange={(e) =>
                                        handleChoiceChange(idx, "content", e.target.value)
                                    }
                                    placeholder={`Choice ${idx + 1}`}
                                    className="me-2"
                                />
                                <Form.Check
                                    type="radio"
                                    name="correctChoice"
                                    checked={c.isCorrect}
                                    onChange={() =>
                                        setChoices(
                                            choices.map((choice, i) => ({
                                                ...choice,
                                                isCorrect: i === idx,
                                            }))
                                        )
                                    }
                                    label="Correct"
                                />
                            </div>
                        ))}
                    </>
                ) : (
                    <p className="fw-bold text-success">{word}</p>
                )}

                <div className="mt-4 text-end">
                    <Button variant="primary" onClick={addExercise} disabled={loading}>
                        {loading ? "Saving..." : "Save Exercise"}
                    </Button>
                </div>
            </Form>
        </Card>
    );
}
