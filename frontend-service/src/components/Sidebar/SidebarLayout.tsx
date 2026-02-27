"use client"
import { Button, Col, Container, Nav, Row } from "react-bootstrap";
import 'bootstrap/dist/css/bootstrap.min.css';
import React, { useContext, useEffect, useState } from "react";
import UserContext from "@/configs/UserContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { List, X } from "react-bootstrap-icons";
import styles from '@/components/Sidebar/SidebarGlobal.module.css';
import Image from "next/image";

export default function SidebarLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const context = useContext(UserContext);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 992);
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    if (!context) {
        return (
            <div className="p-4 text-center">
                <p>Không tìm thấy context người dùng.</p>
            </div>
        );
    }

    const { user, dispatch } = context;

    const handleLogout = () => {
        dispatch({ type: "logout" });
    };

    return (
        <div className={styles.appWrapper}>
            <Container fluid>
                <Row>
                    {isMobile && (
                        <div className="d-flex justify-content-between align-items-center p-2 shadow-sm bg-white">
                            <h1
                                className="fw-bold text-primary mb-0"
                                style={{ fontSize: "1.4rem", cursor: "pointer" }}
                                onClick={() => router.push("/")}
                            >
                                <Image
                                    src="/template/EngLearnLogo.png"
                                    alt="ELearnWeb Logo"
                                    width={120}
                                    height={60}
                                    style={{ objectFit: "contain" }}
                                />
                            </h1>
                            <Button
                                variant="light"
                                size="sm"
                                className="border-0"
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                            >
                                {sidebarOpen ? <X size={22} /> : <List size={22} />}
                            </Button>
                        </div>
                    )}

                    <Col
                        md="auto"
                        className={`d-flex flex-column bg-white shadow-sm p-3 
                            ${styles.sidebar} 
                            ${isMobile ? (sidebarOpen ? styles.open : "") : (sidebarOpen ? "" : styles.closed)}
                        `}
                    >
                        {!isMobile && (
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                {sidebarOpen && (
                                    <h1
                                        className="fw-bold text-primary mb-0"
                                        style={{ fontSize: "1.8rem", cursor: "pointer" }}
                                        onClick={() => router.push("/")}
                                    >
                                        <Image
                                            src="/template/EngLearnLogo.png"
                                            alt="ELearnWeb Logo"
                                            width={100}
                                            height={100}
                                            style={{ objectFit: "contain" }}
                                        />
                                    </h1>
                                )}
                                <Button
                                    variant="light"
                                    size="sm"
                                    className="border-0"
                                    onClick={() => setSidebarOpen(!sidebarOpen)}
                                >
                                    {sidebarOpen ? <X size={20} /> : <List size={20} />}
                                </Button>
                            </div>
                        )}

                        <div className={styles.sidebarContent}>
                            <h6 className="text-muted mb-3">Chức năng</h6>
                            <Nav defaultActiveKey="/home" className="flex-column">
                                {user != null ? (
                                    <>
                                        <Nav.Link as={Link} href="/topics">Học từ vựng</Nav.Link>
                                        <Nav.Link as={Link} href="/tests">Kiểm tra từ vựng</Nav.Link>
                                        <Nav.Link as={Link} href="/conservation">Luyện nói với chatbot</Nav.Link>
                                        <Nav.Link as={Link} href={`/progress/${user.id}`}>Theo dõi tiến độ</Nav.Link>
                                        <Nav.Link as={Link} href={`/profile`}>Thông tin cá nhân</Nav.Link>
                                        <Button
                                            variant="outline-danger"
                                            className="mt-4"
                                            onClick={handleLogout}
                                        >
                                            Đăng xuất
                                        </Button>
                                    </>
                                ) : (
                                    <Link href="/login" className="btn btn-outline-primary btn-sm flex-fill">
                                        Đăng nhập
                                    </Link>
                                )}
                            </Nav>
                        </div>
                    </Col>

                    <Col
                        className={`bg-light 
                            ${styles.mainContent} 
                            ${!isMobile && !sidebarOpen ? styles.full : ""}
                        `}
                    >
                        {children}
                    </Col>
                </Row>
            </Container>
        </div>
    );
}
