"use client";
import { Button, Card, ProgressBar } from "react-bootstrap";
import { useEffect, useState } from "react";

interface Vocab {
    word: string;
    meaning: string;
    example: string;
}

interface Props {
    vocabs: Vocab[];
}

export default function VocabQuizGame({ vocabs }: Props) {

    const [quizVocabs, setQuizVocabs] = useState<Vocab[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [options, setOptions] = useState<string[]>([]);
    const [answers, setAnswers] = useState<(string | null)[]>([]);

    useEffect(() => {
        if (vocabs.length >= 3) {
            const shuffled = [...vocabs].sort(() => Math.random() - 0.5);

            setQuizVocabs(shuffled);
            setAnswers(new Array(shuffled.length).fill(null));
            setCurrentIndex(0);
        }
    }, [vocabs]);

    useEffect(() => {
        if (quizVocabs.length === 0) return;

        const current = quizVocabs[currentIndex];

        const otherMeanings = quizVocabs
            .filter((v) => v.word !== current.word)
            .map((v) => v.meaning);

        const opts = [current.meaning, ...otherMeanings]
            .sort(() => Math.random() - 0.5);

        setOptions(opts);

    }, [currentIndex, quizVocabs]);

    if (quizVocabs.length === 0) return null;

    const current = quizVocabs[currentIndex];
    const selected = answers[currentIndex];

    const handleAnswer = (option: string) => {

        const newAnswers = [...answers];
        newAnswers[currentIndex] = option;

        setAnswers(newAnswers);
    };

    const nextQuestion = () => {
        if (currentIndex < quizVocabs.length - 1)
            setCurrentIndex(currentIndex + 1);
    };

    const prevQuestion = () => {
        if (currentIndex > 0)
            setCurrentIndex(currentIndex - 1);
    };

    const restartGame = () => {
        const shuffled = [...vocabs].sort(() => Math.random() - 0.5);

        setQuizVocabs(shuffled);
        setAnswers(new Array(shuffled.length).fill(null));
        setCurrentIndex(0);
    };

    const score = answers.reduce((total, ans, index) => {
        if (ans === quizVocabs[index]?.meaning)
            return total + 1;
        return total;
    }, 0);

    const progress = ((currentIndex + 1) / quizVocabs.length) * 100;

    return (
        <Card className="mt-4 shadow-sm border-0">
            <Card.Body>

                <ProgressBar now={progress} className="mb-3" />

                <div className="d-flex justify-content-between mb-2">
                    <small>Question {currentIndex + 1}/{quizVocabs.length}</small>
                    <small>Score: {score}</small>
                </div>

                <h5 className="mb-4 text-primary">
                    Word: <b>{current.word}</b>
                </h5>

                {options.map((opt, index) => {

                    let variant = "outline-secondary";

                    if (selected) {
                        if (opt === current.meaning)
                            variant = "success";
                        else if (opt === selected)
                            variant = "danger";
                    }

                    return (
                        <Button
                            key={index}
                            variant={variant}
                            className="w-100 mb-2 text-start"
                            onClick={() => handleAnswer(opt)}
                        >
                            {opt}
                        </Button>
                    );
                })}

                {selected && (
                    <p className="mt-3 text-muted">
                        <b>Example:</b> {current.example}
                    </p>
                )}

                <div className="d-flex justify-content-between mt-4">

                    <Button
                        variant="secondary"
                        onClick={prevQuestion}
                        disabled={currentIndex === 0}
                    >
                        Previous
                    </Button>

                    {currentIndex < quizVocabs.length - 1 ? (
                        <Button
                            onClick={nextQuestion}
                            disabled={!selected}
                        >
                            Next
                        </Button>
                    ) : (
                        <Button
                            variant="success"
                            onClick={restartGame}
                        >
                            Restart
                        </Button>
                    )}

                </div>

            </Card.Body>
        </Card>
    );
}