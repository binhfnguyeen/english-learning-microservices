"use client";

import { Button, Col, Container, Nav, Row } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import React, { useContext, useEffect, useState } from "react";
import UserContext from "@/configs/UserContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { List, X } from "react-bootstrap-icons";
import styles from "@/components/Sidebar/SidebarGlobal.module.css";
import Image from "next/image";

export default function AdminSidebarLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const context = useContext(UserContext);

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 992;
            setIsMobile(mobile);
            if (!mobile) setSidebarOpen(true); // desktop auto open
        };

        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    if (!context) {
        return <div className="p-4 text-center">Không tìm thấy context người dùng.</div>;
    }

    const { user, dispatch } = context;

    const handleLogout = () => {
        dispatch({ type: "logout" });
        window.location.reload();
    };

    return (
        <div className={styles.appWrapper}>
            <Container fluid className="p-0">
                <Row className="g-0">

                    {isMobile && (
                        <div className={styles.mobileHeader}>
                            <Image
                                src="/template/EngLearnLogo.png"
                                alt="Logo"
                                width={120}
                                height={60}
                                style={{ cursor: "pointer" }}
                                onClick={() => router.push("/admin")}
                            />

                            <Button
                                variant="light"
                                size="sm"
                                className="border-0"
                                onClick={() => setSidebarOpen(prev => !prev)}
                            >
                                {sidebarOpen ? <X size={22} /> : <List size={22} />}
                            </Button>
                        </div>
                    )}

                    {isMobile && sidebarOpen && (
                        <div
                            className={styles.overlay}
                            onClick={() => setSidebarOpen(false)}
                        />
                    )}

                    <Col
                        xs="auto"
                        className={`
                            d-flex flex-column
                            ${styles.sidebar}
                            ${sidebarOpen ? styles.open : styles.closed}
                        `}
                    >
                        {!isMobile && (
                            <div className={`${styles.sidebarHeader} p-3`}>
                                <div className={!sidebarOpen ? styles.logoHidden : ""}>
                                    <Image
                                        src="/template/EngLearnLogo.png"
                                        alt="Logo"
                                        width={100}
                                        height={80}
                                        style={{ cursor: "pointer", objectFit: "contain" }}
                                        onClick={() => router.push("/admin")}
                                    />
                                </div>

                                <Button
                                    variant="light"
                                    size="sm"
                                    className="border-0"
                                    onClick={() => setSidebarOpen(prev => !prev)}
                                >
                                    {sidebarOpen ? <X size={20} /> : <List size={20} />}
                                </Button>
                            </div>
                        )}

                        {sidebarOpen && (
                            <div className="px-3 mt-3">
                                <h6 className="text-muted mb-3">Admin chức năng</h6>

                                <Nav className="flex-column">
                                    {user ? (
                                        <>
                                            <Nav.Link as={Link} href="/admin/topics">
                                                Thêm chủ đề tiếng Anh
                                            </Nav.Link>

                                            <Nav.Link as={Link} href="/admin/vocabularies">
                                                Thêm từ vựng
                                            </Nav.Link>

                                            <Nav.Link as={Link} href="/admin/tests">
                                                Thêm đề ôn tập
                                            </Nav.Link>

                                            <Nav.Link as={Link} href="/admin/exercises">
                                                Thêm luyện tập
                                            </Nav.Link>

                                            <Nav.Link as={Link} href="/admin/users">
                                                Quản trị viên
                                            </Nav.Link>

                                            <Button
                                                className={`mt-4 ${styles.logoutBtn}`}
                                                onClick={handleLogout}
                                            >
                                                Đăng xuất
                                            </Button>
                                        </>
                                    ) : (
                                        <Link
                                            href="/login"
                                            className="btn btn-outline-primary btn-sm"
                                        >
                                            Đăng nhập
                                        </Link>
                                    )}
                                </Nav>
                            </div>
                        )}
                    </Col>

                    <Col className={styles.mainContent}>
                        {children}
                    </Col>

                </Row>
            </Container>
        </div>
    );
}