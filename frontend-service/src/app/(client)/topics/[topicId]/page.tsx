"use client";

import MySpinner from "@/components/MySpinner";
import Apis from "@/configs/Apis";
import endpoints from "@/configs/Endpoints";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Container, Nav } from "react-bootstrap";

interface Topic {
    id: number;
    name: string;
    description: string;
}

export default function StartLearn() {
    const { topicId } = useParams();
    const id = Number(topicId);
    const [topic, setTopic] = useState<Topic>();
    const [loading, setLoading] = useState<boolean>(false);

    const loadTopic = async () => {
        try {
            setLoading(true);
            const res = await Apis.get(endpoints["topic"](id));
            setTopic(res.data.result);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadTopic();
    }, [id])

    return (
        <Container className="my-5">
            <div className="d-flex justify-content-center align-items-center mb-4 position-relative">
                <Nav className="position-absolute start-0">
                    <Link
                        href="/topics"
                        className="btn btn-outline-primary btn-sm"
                    >
                        Quay lại
                    </Link>
                </Nav>
                <h2 className="fw-bold m-0">Chủ đề: {topic?.name}</h2>
            </div>

            {loading ? (
                <MySpinner />
            ) : (
                <>
                    <p className="text-muted fs-5 text-center mb-4">
                        {topic?.description || "Không có mô tả cho chủ đề này."}
                    </p>

                    <div className="text-center">
                        <Link
                            href={`/topics/${id}/learning`}
                            className="btn btn-success btn-lg px-5 py-3 fw-bold shadow-sm"
                            style={{
                                borderRadius: "12px",
                                fontSize: "1.25rem",
                                transition: "all 0.2s ease-in-out"
                            }}
                            onMouseOver={(e) =>
                                (e.currentTarget.style.transform = "scale(1.05)")
                            }
                            onMouseOut={(e) =>
                                (e.currentTarget.style.transform = "scale(1)")
                            }
                        >
                            Bắt đầu học
                        </Link>
                    </div>
                </>
            )}
        </Container>
    );
}