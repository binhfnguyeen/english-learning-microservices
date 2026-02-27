"use client";

import authApis from "@/configs/AuthApis";
import endpoints from "@/configs/Endpoints";
import { useEffect, useRef, useState } from "react";
import { Alert, Button, Card, Col, Form, Row, Spinner } from "react-bootstrap";
import { Plus, X } from "react-bootstrap-icons";

interface User {
    lastName: string;
    firstName: string;
    email: string;
    phone: string;
    username: string;
    password: string;
    avatar: string;
}

interface AddAdminProps {
    onSuccess?: () => void;
}

export default function AddAdmin({ onSuccess }: AddAdminProps) {
    const info: { title: string; field: keyof User; type: string }[] = [
        { title: "Họ", field: "lastName", type: "text" },
        { title: "Tên", field: "firstName", type: "text" },
        { title: "Email", field: "email", type: "text" },
        { title: "Số điện thoại", field: "phone", type: "tel" },
        { title: "Tên đăng nhập", field: "username", type: "text" },
        { title: "Mật khẩu", field: "password", type: "password" },
    ];

    const [user, setUser] = useState<User>({
        lastName: "",
        firstName: "",
        email: "",
        phone: "",
        username: "",
        password: "",
        avatar: "",
    });
    const [msg, setMsg] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const avatarRef = useRef<HTMLInputElement>(null);
    const [preview, setPreview] = useState<string>("");

    const validate = () => {
        if (!user) {
            setMsg("Vui lòng nhập đầy đủ thông tin!");
            return false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(user.email)) {
            setMsg("Email không hợp lệ!");
            return false;
        }
        const phoneRegex = /^(0[0-9]{9,10})$/;
        if (!phoneRegex.test(user.phone)) {
            setMsg("Số điện thoại không hợp lệ!");
            return false;
        }
        setMsg("");
        return true;
    };

    const register = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (validate()) {
            try {
                setLoading(true);
                const formData = new FormData();
                for (const key in user) {
                    const typedKey = key as keyof User;
                    formData.append(typedKey, user[typedKey]);
                }
                if (avatarRef.current?.files?.length) {
                    formData.append("avatar", avatarRef.current.files[0]);
                }

                await authApis.post(endpoints["listAdmin"], formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });

                setMsg("Tạo tài khoản thành công!");
                if (onSuccess) onSuccess();
            } catch (ex) {
                console.error(ex);
                setMsg("Tạo tài khoản không thành công!");
            } finally {
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        if (msg) {
            const timer = setTimeout(() => setMsg(""), 2000);
            return () => clearTimeout(timer);
        }
    }, [msg]);

    return (
        <Card className="shadow-lg p-4 border-0" style={{ borderRadius: "15px" }}>
            <Card.Body>
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h3 className="text-primary fw-bold m-0">
                        <Plus size={28} /> Thêm Admin
                    </h3>
                    <Button
                        variant="light"
                        className="border-0"
                        onClick={onSuccess}
                    >
                        <X size={24} />
                    </Button>
                </div>

                {msg && (
                    <Alert
                        variant={msg.includes("thành công") ? "success" : "danger"}
                        className="text-center"
                    >
                        {msg}
                    </Alert>
                )}

                <Form onSubmit={register}>
                    <Row className="g-3">
                        {info.map((i) => (
                            <Col xs={12} sm={6} key={i.field}>
                                <Form.Group>
                                    <Form.Label>{i.title}</Form.Label>
                                    <Form.Control
                                        type={i.type}
                                        value={user[i.field]}
                                        onChange={(e) =>
                                            setUser({ ...user, [i.field]: e.target.value })
                                        }
                                        required
                                    />
                                </Form.Group>
                            </Col>
                        ))}

                        <Col xs={12}>
                            <Form.Group>
                                <Form.Label>Ảnh đại diện</Form.Label>
                                <Form.Control
                                    type="file"
                                    accept="image/*"
                                    ref={avatarRef}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                        const file = e.target.files?.[0];
                                        if (file) setPreview(URL.createObjectURL(file));
                                    }}
                                />
                            </Form.Group>
                            {preview && (
                                <div className="text-center mt-3">
                                    <img
                                        src={preview}
                                        alt="Avatar Preview"
                                        className="rounded-circle shadow-sm border"
                                        style={{ width: "120px", height: "120px", objectFit: "cover" }}
                                    />
                                </div>
                            )}
                        </Col>

                        <Col xs={12} className="text-center mt-4">
                            <Button
                                type="submit"
                                variant="primary"
                                className="px-5 py-2 fw-bold"
                                style={{ borderRadius: "10px" }}
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Spinner animation="border" size="sm" className="me-2" /> Đang xử lý...
                                    </>
                                ) : (
                                    "Tạo tài khoản"
                                )}
                            </Button>
                        </Col>
                    </Row>
                </Form>
            </Card.Body>
        </Card>
    );
}