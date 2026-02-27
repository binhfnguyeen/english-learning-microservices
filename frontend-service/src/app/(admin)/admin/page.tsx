"use client";

import { useEffect, useState } from "react";
import Apis from "@/configs/Apis";
import endpoints from "@/configs/Endpoints";

import {
    Chart as ChartJS,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    BarElement,
    CategoryScale,
    LinearScale,
} from "chart.js";
import { Bar, Pie } from "react-chartjs-2";

import { Container, Row, Col, Card, Spinner } from "react-bootstrap";
import { AwardFill, BarChartFill, BookFill, PeopleFill } from "react-bootstrap-icons";

ChartJS.register(Title, Tooltip, Legend, ArcElement, BarElement, CategoryScale, LinearScale);

interface User {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    username: string;
    password: string;
    isActive: boolean;
    avatar: string;
    role: string;
}

interface Stats {
    user: User;
    totalLearnedWords: number;
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<Stats[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    const loadStats = async () => {
        try {
            setLoading(true);
            const res = await Apis.get(endpoints["userLearnedWords"]);
            setStats(res.data.result);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadStats();
    }, []);

    const labels = stats.map((s) => s.user.username);
    const values = stats.map((s) => s.totalLearnedWords);

    const totalUsers = stats.length;
    const totalWords = values.reduce((a, b) => a + b, 0);
    const topUser = stats.reduce(
        (max, s) => (s.totalLearnedWords > max.totalLearnedWords ? s : max),
        stats[0] || { user: { username: "" }, totalLearnedWords: 0 }
    );

    const barData = {
        labels,
        datasets: [
            {
                label: "Learned Words",
                data: values,
                backgroundColor: "rgba(25, 118, 210, 0.6)",
                borderColor: "#1976d2",
                borderWidth: 1,
            },
        ],
    };

    const pieData = {
        labels,
        datasets: [
            {
                data: values,
                backgroundColor: ["#1976d2", "#4caf50", "#ff9800", "#f44336", "#9c27b0", "#00bcd4"],
            },
        ],
    };

    return (
        <Container fluid className="bg-light min-vh-100 py-4">
            <Card
                className="mb-4 border-0 shadow-sm text-white"
                style={{ background: "linear-gradient(90deg, #1976d2, #512da8)" }}
            >
                <Card.Body>
                    <h2 className="fw-bold mb-1"><BarChartFill /> Admin Dashboard</h2>
                    <p className="mb-0 text-light">
                        Overview of user learning statistics and contributions
                    </p>
                </Card.Body>
            </Card>

            {loading ? (
                <div
                    className="d-flex justify-content-center align-items-center"
                    style={{ minHeight: "50vh" }}
                >
                    <Spinner animation="border" role="status" variant="primary">
                        <span className="visually-hidden">Loading...</span>
                    </Spinner>
                </div>
            ) : (
                <>
                    <Row className="mb-4 g-4">
                        <Col md={4}>
                            <Card className="shadow-sm border-0 text-center h-100 text-white"
                                style={{ background: "linear-gradient(135deg, #2196f3, #21cbf3)" }}
                            >
                                <Card.Body>
                                    <div className="mb-2 fs-3"><PeopleFill /></div>
                                    <h6 className="text-uppercase fw-semibold">Total Users</h6>
                                    <h3 className="fw-bold">{totalUsers}</h3>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={4}>
                            <Card className="shadow-sm border-0 text-center h-100 text-white"
                                style={{ background: "linear-gradient(135deg, #43a047, #66bb6a)" }}
                            >
                                <Card.Body>
                                    <div className="mb-2 fs-3"><BookFill /></div>
                                    <h6 className="text-uppercase fw-semibold">Total Learned Words</h6>
                                    <h3 className="fw-bold">{totalWords}</h3>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={4}>
                            <Card className="shadow-sm border-0 text-center h-100 text-white"
                                style={{ background: "linear-gradient(135deg, #ff9800, #ffc107)" }}
                            >
                                <Card.Body>
                                    <div className="mb-2 fs-3"><AwardFill /></div>
                                    <h6 className="text-uppercase fw-semibold">Top User</h6>
                                    <h5 className="fw-bold">{topUser?.user?.username || "N/A"}</h5>
                                    <p className="mb-0">{topUser?.totalLearnedWords || 0} words</p>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>

                    <Row xs={1} md={2} className="g-4">
                        <Col>
                            <Card className="shadow-lg border-0 h-100 rounded-3 hover-shadow">
                                <Card.Header className="bg-primary text-white fw-semibold rounded-top">
                                    Words Learned
                                </Card.Header>
                                <Card.Body>
                                    <Bar data={barData} />
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col>
                            <Card className="shadow-lg border-0 h-100 rounded-3 hover-shadow">
                                <Card.Header className="bg-success text-white fw-semibold rounded-top">
                                    User Contribution
                                </Card.Header>
                                <Card.Body>
                                    <Pie data={pieData} />
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </>
            )}
        </Container>
    );
}
