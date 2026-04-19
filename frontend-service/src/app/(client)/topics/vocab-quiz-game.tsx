"use client";
import { Button, Card, ProgressBar, Badge } from "react-bootstrap";
import { useEffect, useState } from "react";
import { CheckCircleFill, XCircleFill, ArrowRightCircleFill, ArrowRepeat } from "react-bootstrap-icons";

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
            // Lấy 10 từ ngẫu nhiên nếu danh sách quá dài để game không bị nhàm
            const sampleSize = Math.min(vocabs.length, 10);
            const shuffled = [...vocabs].sort(() => Math.random() - 0.5).slice(0, sampleSize);
            setQuizVocabs(shuffled);
            setAnswers(new Array(shuffled.length).fill(null));
            setCurrentIndex(0);
        }
    }, [vocabs]);

    useEffect(() => {
        if (quizVocabs.length === 0) return;

        const current = quizVocabs[currentIndex];

        // Lấy nghĩa sai từ toàn bộ list vocabs ban đầu để đa dạng đáp án
        const otherMeanings = vocabs
            .filter((v) => v.word !== current.word)
            .map((v) => v.meaning)
            .sort(() => Math.random() - 0.5)
            .slice(0, 3); // Lấy 3 đáp án sai

        const opts = [current.meaning, ...otherMeanings].sort(() => Math.random() - 0.5);
        setOptions(opts);
    }, [currentIndex, quizVocabs, vocabs]);

    if (quizVocabs.length === 0) return null;

    const current = quizVocabs[currentIndex];
    const selected = answers[currentIndex];

    const score = answers.reduce((total, ans, index) => {
        return ans === quizVocabs[index]?.meaning ? total + 1 : total;
    }, 0);

    const isFinished = currentIndex === quizVocabs.length - 1 && selected !== null;

    const handleAnswer = (option: string) => {
        if (selected) return; // Chỉ cho phép chọn 1 lần
        const newAnswers = [...answers];
        newAnswers[currentIndex] = option;
        setAnswers(newAnswers);
    };

    const nextQuestion = () => {
        if (currentIndex < quizVocabs.length - 1) setCurrentIndex(currentIndex + 1);
    };

    const restartGame = () => {
        const sampleSize = Math.min(vocabs.length, 10);
        const shuffled = [...vocabs].sort(() => Math.random() - 0.5).slice(0, sampleSize);
        setQuizVocabs(shuffled);
        setAnswers(new Array(shuffled.length).fill(null));
        setCurrentIndex(0);
    };

    return (
        <Card className="shadow-sm border-0 rounded-4 h-100 bg-white">
            <Card.Body className="p-4 d-flex flex-column">

                {/* Header: Tiến trình & Điểm số */}
                <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="fw-bold text-secondary small text-uppercase tracking-wider">
                        Câu {currentIndex + 1} / {quizVocabs.length}
                    </span>
                    <Badge bg="warning" text="dark" className="px-3 py-2 rounded-pill shadow-sm fs-6">
                        Điểm: {score} 🌟
                    </Badge>
                </div>

                <ProgressBar
                    now={((currentIndex + (selected ? 1 : 0)) / quizVocabs.length) * 100}
                    variant="success"
                    className="mb-4"
                    style={{ height: '8px', borderRadius: '10px' }}
                />

                {/* Nội dung câu hỏi */}
                <div className="text-center mb-4 mt-2">
                    <div className="text-muted small mb-1">Nghĩa của từ này là gì?</div>
                    <h2 className="fw-bold text-dark display-6 m-0">{current.word}</h2>
                </div>

                {/* Danh sách đáp án */}
                <div className="d-flex flex-column gap-2 mb-4">
                    {options.map((opt, index) => {
                        const isSelected = selected === opt;
                        const isCorrect = opt === current.meaning;
                        const isWrongSelected = isSelected && !isCorrect;

                        let btnClass = "btn-outline-secondary bg-white text-dark border-2 text-start p-3 fw-medium rounded-4 transition";
                        let icon = null;

                        if (selected) {
                            if (isCorrect) {
                                btnClass = "btn-success border-success text-white fw-bold p-3 rounded-4 shadow-sm";
                                icon = <CheckCircleFill className="ms-auto" size={20} />;
                            } else if (isWrongSelected) {
                                btnClass = "btn-danger border-danger text-white fw-bold p-3 rounded-4 shadow-sm opacity-75";
                                icon = <XCircleFill className="ms-auto" size={20} />;
                            } else {
                                btnClass = "btn-outline-secondary border-2 text-start p-3 fw-medium rounded-4 opacity-50";
                            }
                        }

                        return (
                            <Button
                                key={index}
                                className={`d-flex align-items-center ${btnClass}`}
                                onClick={() => handleAnswer(opt)}
                                disabled={selected !== null}
                            >
                                <span className="me-2 fw-bold opacity-50">{String.fromCharCode(65 + index)}.</span>
                                {opt}
                                {icon}
                            </Button>
                        );
                    })}
                </div>

                {/* Kết quả & Hành động */}
                <div className="mt-auto">
                    {selected && (
                        <div className={`p-3 rounded-4 mb-3 ${selected === current.meaning ? 'bg-success bg-opacity-10 text-success' : 'bg-danger bg-opacity-10 text-danger'}`}>
                            <div className="fw-bold mb-1">
                                {selected === current.meaning ? 'Chính xác!' : 'Rất tiếc, sai rồi!'}
                            </div>
                            <div className="small text-dark">
                                <span className="fw-bold">Ví dụ:</span> {current.example}
                            </div>
                        </div>
                    )}

                    {isFinished ? (
                        <Button variant="primary" size="lg" className="w-100 fw-bold rounded-pill shadow d-flex justify-content-center align-items-center gap-2" onClick={restartGame}>
                            <ArrowRepeat size={24} /> Chơi lại lần nữa
                        </Button>
                    ) : (
                        <Button
                            variant="primary"
                            size="lg"
                            className="w-100 fw-bold rounded-pill shadow-sm d-flex justify-content-center align-items-center gap-2"
                            onClick={nextQuestion}
                            disabled={!selected}
                            style={{ opacity: !selected ? 0 : 1, transition: '0.3s' }}
                        >
                            Câu tiếp theo <ArrowRightCircleFill size={20} />
                        </Button>
                    )}
                </div>

            </Card.Body>
        </Card>
    );
}