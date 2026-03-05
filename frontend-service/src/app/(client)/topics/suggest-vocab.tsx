"use client";
import { Button, Card, Form, Modal, Spinner, Row, Col } from "react-bootstrap";
import { useContext, useState, useEffect } from "react";
import UserContext from "@/configs/UserContext";
import Cookies from "js-cookie";
import { VolumeUp } from "react-bootstrap-icons";
import useTTS from "@/utils/useTTS";
import VocabQuizGame from "@/app/(client)/topics/vocab-quiz-game";

interface Props {
    show: boolean;
    onHide: () => void;
}

export default function SuggestVocab({ show, onHide }: Props) {

    const context = useContext(UserContext);
    const user = context?.user;

    const [topicInput, setTopicInput] = useState("");
    const [generatedVocabs, setGeneratedVocabs] = useState<any[]>([]);
    const [wsLoading, setWsLoading] = useState(false);

    const { speak, isSpeaking } = useTTS();

    useEffect(() => {
        if (!show) {
            setTopicInput("");
            setGeneratedVocabs([]);
            setWsLoading(false);
        }
    }, [show]);

    const generateVocab = () => {

        if (!topicInput || !user) return;

        setGeneratedVocabs([]);
        setWsLoading(true);

        const token = Cookies.get("accessToken");
        if (!token) return;

        const ws = new WebSocket(
            `ws://localhost:8080/api/ai/ws/vocab/${user.id}?token=${token}`
        );

        ws.onopen = () => {
            ws.send(JSON.stringify({ topic: topicInput }));
        };

        ws.onmessage = (event) => {

            const data = JSON.parse(event.data);

            if (data.type === "vocab") {
                setGeneratedVocabs((prev) => [...prev, data.data]);
            }

            if (data.type === "done") {
                setWsLoading(false);
                ws.close();
            }

            if (data.type === "error") {
                alert(data.message);
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
        <Modal show={show} onHide={onHide} size="xl" centered>
            <Modal.Header closeButton>
                <Modal.Title className="fw-bold text-primary">
                    Gợi ý từ vựng theo chủ đề
                </Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <Form className="d-flex gap-2 mb-4">
                    <Form.Control
                        type="text"
                        value={topicInput}
                        onChange={(e) => setTopicInput(e.target.value)}
                        placeholder="Topic: Travel, Technology..."
                        className="shadow-sm"
                    />

                    <Button
                        onClick={generateVocab}
                        disabled={wsLoading}
                        style={{
                            borderRadius: "50px",
                            background: "linear-gradient(135deg, #28a745, #20c997)",
                            border: "none",
                            color: "white",
                            boxShadow: "0 4px 12px rgba(40, 167, 69, 0.3)"
                        }}
                    >
                        {wsLoading ? <Spinner size="sm" /> : "Nhận"}
                    </Button>
                </Form>

                <Row>
                    <Col md={6} style={{ maxHeight: "500px", overflowY: "auto" }}>
                        <h5 className="text-primary fw-bold mb-3">
                            Vocabulary
                        </h5>
                        {generatedVocabs.map((item, index) => (
                            <Card
                                key={index}
                                className="mb-3 shadow-sm border-0"
                                style={{ borderRadius: "12px" }}
                            >
                                <Card.Body>

                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <h5 className="text-primary fw-bold mb-0">
                                            {item.word}
                                        </h5>

                                        <Button
                                            variant="outline-primary"
                                            size="sm"
                                            onClick={() => speak(item.word)}
                                            disabled={isSpeaking}
                                            style={{ borderRadius: "50%" }}
                                        >
                                            <VolumeUp />
                                        </Button>
                                    </div>

                                    <p className="mb-1">
                                        <b>Meaning:</b> {item.meaning}
                                    </p>

                                    <p className="text-muted mb-0">
                                        <b>Example:</b> {item.example}
                                    </p>

                                </Card.Body>
                            </Card>
                        ))}

                        {generatedVocabs.length === 0 && !wsLoading && (
                            <p className="text-center text-muted">
                                Chưa có từ vựng nào
                            </p>
                        )}
                    </Col>

                    <Col md={6}>
                        <h5 className="text-primary fw-bold mb-3">
                            Quiz
                        </h5>

                        {generatedVocabs.length !== 0 && (
                            <VocabQuizGame vocabs={generatedVocabs} />
                        )}
                    </Col>
                </Row>
            </Modal.Body>
        </Modal>
    );
}