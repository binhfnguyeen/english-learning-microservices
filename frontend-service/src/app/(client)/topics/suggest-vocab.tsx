"use client";
import { Button, Card, Form, Modal, Spinner, Row, Col, Badge } from "react-bootstrap";
import { useContext, useState, useEffect } from "react";
import UserContext from "@/configs/UserContext";
import Cookies from "js-cookie";
import { VolumeUp, Magic, LightbulbFill, Controller } from "react-bootstrap-icons";
import useTTS from "@/utils/useTTS";
import VocabQuizGame from "@/app/(client)/topics/vocab-quiz-game";

interface Props {
    show: boolean;
    onHide: () => void;
}

interface VocabItem {
    word: string;
    meaning: string;
    example: string;
}

export default function SuggestVocab({ show, onHide }: Props) {
    const context = useContext(UserContext);
    const user = context?.user;

    const [topicInput, setTopicInput] = useState("");
    const [generatedVocabs, setGeneratedVocabs] = useState<VocabItem[]>([]);
    const [wsLoading, setWsLoading] = useState(false);

    const { speak, isSpeaking } = useTTS();

    useEffect(() => {
        if (!show) {
            setTopicInput("");
            setGeneratedVocabs([]);
            setWsLoading(false);
        }
    }, [show]);

    const generateVocab = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!topicInput.trim() || !user) return;

        setGeneratedVocabs([]);
        setWsLoading(true);

        const token = Cookies.get("accessToken");
        if (!token) return;

        const ws = new WebSocket(`ws://localhost:8080/api/ai/ws/vocab/${user.id}?token=${token}`);

        ws.onopen = () => ws.send(JSON.stringify({ topic: topicInput }));

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === "vocab") setGeneratedVocabs((prev) => [...prev, data.data]);
            if (data.type === "done" || data.type === "error") {
                if (data.type === "error") alert(data.message);
                setWsLoading(false);
                ws.close();
            }
        };

        ws.onerror = () => {
            setWsLoading(false);
            ws.close();
        };
    };

    return (
        <Modal show={show} onHide={onHide} size="xl" centered backdrop="static">
            <Modal.Header closeButton className="border-0 pb-0">
                <Modal.Title className="fw-bold text-primary d-flex align-items-center gap-2 fs-4">
                    <Magic className="text-warning" /> AI Khám phá từ vựng
                </Modal.Title>
            </Modal.Header>

            <Modal.Body className="pt-2 px-4 pb-4">
                <p className="text-muted mb-4">Nhập bất kỳ chủ đề nào bạn muốn học (VD: Travel, IT, Cooking), AI sẽ ngay lập tức tạo ra bộ từ vựng và bài tập trắc nghiệm cho riêng bạn!</p>

                <Form className="d-flex gap-2 mb-4" onSubmit={generateVocab}>
                    <Form.Control
                        type="text"
                        value={topicInput}
                        onChange={(e) => setTopicInput(e.target.value)}
                        placeholder="Nhập chủ đề vào đây..."
                        className="shadow-sm rounded-pill px-4 border-primary"
                        style={{ height: '50px' }}
                    />
                    <Button
                        type="submit"
                        disabled={wsLoading || !topicInput.trim()}
                        className="rounded-pill px-4 fw-bold d-flex align-items-center gap-2 shadow-sm"
                        style={{ height: '50px' }}
                    >
                        {wsLoading ? <Spinner size="sm" animation="border" /> : <><LightbulbFill /> Tạo bộ từ</>}
                    </Button>
                </Form>

                {wsLoading && generatedVocabs.length === 0 && (
                    <div className="text-center py-5">
                        <Spinner animation="grow" variant="primary" />
                        <p className="text-muted mt-3 fw-medium">AI đang vắt óc suy nghĩ từ vựng cho bạn...</p>
                    </div>
                )}

                {(generatedVocabs.length > 0 || wsLoading) && (
                    <Row className="g-4">
                        {/* Cột Danh sách Từ vựng */}
                        <Col lg={6}>
                            <div className="bg-light p-3 rounded-4 h-100 border">
                                <h5 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
                                    <Badge bg="primary" pill>{generatedVocabs.length}</Badge> Từ vựng tìm được
                                </h5>

                                <div className="pe-2" style={{ maxHeight: "500px", overflowY: "auto", overflowX: 'hidden' }}>
                                    {generatedVocabs.map((item, index) => (
                                        <Card key={index} className="mb-3 shadow-sm border-0 rounded-4 transition hover-scale">
                                            <Card.Body className="p-3">
                                                <div className="d-flex justify-content-between align-items-start mb-2">
                                                    <div>
                                                        <h4 className="text-primary fw-bold mb-1">{item.word}</h4>
                                                        <div className="text-success fw-medium fs-6">{item.meaning}</div>
                                                    </div>
                                                    <Button
                                                        variant="light"
                                                        className="rounded-circle p-2 text-primary shadow-sm border"
                                                        onClick={() => speak(item.word)}
                                                        disabled={isSpeaking}
                                                    >
                                                        <VolumeUp size={20} />
                                                    </Button>
                                                </div>
                                                <div className="mt-2 p-2 bg-light rounded-3 small text-muted fst-italic border-start border-3 border-warning">
                                                    "{item.example}"
                                                </div>
                                            </Card.Body>
                                        </Card>
                                    ))}
                                    {wsLoading && (
                                        <div className="text-center py-3">
                                            <Spinner animation="border" variant="secondary" size="sm" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Col>

                        {/* Cột Bài tập Trắc nghiệm */}
                        <Col lg={6}>
                            <div className="bg-primary bg-opacity-10 p-3 rounded-4 h-100 border border-primary border-opacity-25">
                                <h5 className="fw-bold text-primary mb-3 d-flex align-items-center gap-2">
                                    <Controller /> Mini Game Ôn Tập
                                </h5>
                                {generatedVocabs.length >= 3 ? (
                                    <VocabQuizGame vocabs={generatedVocabs} />
                                ) : (
                                    <div className="text-center text-muted py-5 mt-5">
                                        Đang đợi AI tạo đủ ít nhất 3 từ để bắt đầu game...
                                    </div>
                                )}
                            </div>
                        </Col>
                    </Row>
                )}
            </Modal.Body>
        </Modal>
    );
}