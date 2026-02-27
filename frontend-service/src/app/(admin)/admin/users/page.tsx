"use client";

import authApis from "@/configs/AuthApis";
import endpoints from "@/configs/Endpoints";
import { useEffect, useState } from "react";
import { Card, Row, Col, Badge, Spinner, Button, Modal } from "react-bootstrap";
import Image from "next/image";
import { PeopleFill, TelephoneFill, Trash } from "react-bootstrap-icons";
import AddAdmin from "./addAdmin/AddAdmin";

interface User {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    username: string;
    password: string;
    avatar: string;
    role: string;
}

export default function ListAdmin() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [showAdd, setShowAdd] = useState<boolean>(false);

    const [showDelete, setShowDelete] = useState<boolean>(false);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const res = await authApis.get(endpoints["listAdmin"]);
            setUsers(res.data.result);
        } catch (err) {
            console.error("Error loading admins:", err);
        } finally {
            setLoading(false);
        }
    };

    const confirmDelete = (user: User) => {
        setUserToDelete(user);
        setShowDelete(true);
    };

    const deleteUser = async () => {
        if (!userToDelete) return;
        try {
            setLoading(true);
            await authApis.delete(endpoints["deleteAdmin"](userToDelete.id));
            setUsers(users.filter((u) => u.id !== userToDelete.id));
            setShowDelete(false);
        } catch (err) {
            console.error("Error deleting admin:", err);
            alert("Xóa thất bại, vui lòng thử lại!");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
    }, []);

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="mb-4 text-primary d-flex align-items-center gap-2">
                    <PeopleFill size={28} /> Danh sách Quản trị viên
                </h3>
                <Button variant="primary" onClick={() => setShowAdd(true)}>
                    + Thêm quản trị viên
                </Button>
            </div>

            {loading ? (
                <div className="text-center py-5">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-3 text-muted">Đang tải dữ liệu...</p>
                </div>
            ) : users.length === 0 ? (
                <p className="text-center text-muted">Không có admin nào.</p>
            ) : (
                <Row xs={1} sm={2} md={3} lg={4} className="g-4">
                    {users.map((u) => (
                        <Col key={u.id}>
                            <Card
                                className="shadow-sm border-0 h-100 text-center"
                                style={{
                                    borderRadius: "20px",
                                    transition: "transform 0.2s ease, box-shadow 0.2s ease",
                                }}
                                onMouseEnter={(e) =>
                                    (e.currentTarget.style.transform = "translateY(-5px)")}
                                onMouseLeave={(e) =>
                                    (e.currentTarget.style.transform = "translateY(0)")}
                            >
                                <div className="d-flex justify-content-center mt-4">
                                    <Image
                                        src={u.avatar || "/default-avatar.png"}
                                        alt={`${u.firstName} ${u.lastName}`}
                                        width={110}
                                        height={110}
                                        className="rounded-circle border shadow-sm"
                                        onError={(e) =>
                                            ((e.target as HTMLImageElement).src = "/default-avatar.png")
                                        }
                                    />
                                </div>
                                <Card.Body>
                                    <Card.Title className="fw-bold fs-5 mb-1">
                                        {u.firstName} {u.lastName}
                                    </Card.Title>
                                    <Card.Text className="text-muted small mb-1">
                                        {u.email}
                                    </Card.Text>
                                    <Card.Text className="text-muted small">
                                        <TelephoneFill className="me-1" />
                                        {u.phone || "-"}
                                    </Card.Text>
                                    <Badge bg="primary" className="px-3 py-2 rounded-pill d-block mb-3">
                                        {u.role}
                                    </Badge>

                                    <Button
                                        variant="outline-danger"
                                        size="sm"
                                        onClick={() => confirmDelete(u)}
                                    >
                                        <Trash className="me-1" /> Xóa
                                    </Button>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            )}

            <Modal show={showAdd} onHide={() => setShowAdd(false)} size="lg" centered backdrop="static">
                <Modal.Body>
                    <AddAdmin onSuccess={() => {
                        setShowAdd(false);
                        loadUsers();
                    }} />
                </Modal.Body>
            </Modal>

            <Modal show={showDelete} onHide={() => setShowDelete(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Cảnh báo</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Bạn có chắc muốn xóa tài khoản{" "}
                    <strong>{userToDelete?.firstName} {userToDelete?.lastName}</strong> không?
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDelete(false)}>
                        Hủy
                    </Button>
                    <Button variant="danger" onClick={deleteUser} disabled={loading}>
                        {loading ? <Spinner size="sm" animation="border" /> : "Xóa"}
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}
