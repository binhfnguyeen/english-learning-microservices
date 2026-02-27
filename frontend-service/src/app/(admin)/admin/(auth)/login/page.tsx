"use client";

import Apis from "@/configs/Apis";
import authApis from "@/configs/AuthApis";
import endpoints from "@/configs/Endpoints";
import UserContext from "@/configs/UserContext";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useContext, useState } from "react";
import { Alert, Button, Container, Form, Spinner } from "react-bootstrap";
import { Database } from "react-bootstrap-icons";

export default function AdminLogin() {
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState<{ [key: string]: string }>({});
    const [msg, setMsg] = useState("");
    const router = useRouter();
    const { dispatch } = useContext(UserContext)!;

    const info = [
        { title: "Tên đăng nhập", field: "username", type: "text" },
        { title: "Mật khẩu", field: "password", type: "password" },
    ];

    const login = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            setLoading(true);
            const res = await Apis.post(endpoints["login"], { ...user });

            if (res.data.code == 1000) {
                const token = res.data.result.token;
                Cookies.set("accessToken", token, { path: "/", sameSite: "lax" });

                const profile = await authApis.post(endpoints["profile"]);
                dispatch({ type: "login", payload: profile.data.result });
                setMsg("Đăng nhập thành công!")
                router.push("/admin");
            }
        } catch (ex) {
            console.error(ex);
            setMsg("Đăng nhập thất bại!");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (msg) {
            const timer = setTimeout(() => setMsg(""), 2000);
            return () => clearTimeout(timer);
        }
    }, [msg]);

    return (
        <Container className="d-flex flex-column align-items-center mt-5">
            <h1
                className="fw-bold mb-4 text-primary d-flex align-items-center"
                style={{
                    fontSize: "2rem",
                    letterSpacing: "1px",
                    gap: "10px",
                }}
            >
                <Database size={36} className="text-primary" />
                <span
                    style={{
                        background: "linear-gradient(90deg, #2563eb, #06b6d4)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                    }}
                >
                    ĐĂNG NHẬP ADMIN
                </span>
            </h1>

            {msg && (
                <Alert
                    variant={msg.includes("thất bại") ? "danger" : "success"}
                    className="py-2 position-fixed top-0 end-0 m-3 shadow"
                    style={{ zIndex: 9999, minWidth: "250px" }}
                >
                    {msg}
                </Alert>
            )}

            <Form onSubmit={login} style={{ maxWidth: "320px", width: "100%" }}>
                {info.map((i) => (
                    <Form.Group key={i.field} className="mb-3" controlId={i.field}>
                        <Form.Label className="fw-semibold">{i.title}</Form.Label>
                        <Form.Control
                            required
                            value={user[i.field] || ""}
                            onChange={(e) =>
                                setUser({ ...user, [i.field]: e.target.value })
                            }
                            type={i.type}
                            placeholder={i.title}
                            className="rounded-3 shadow-sm"
                        />
                    </Form.Group>
                ))}
                <div className="text-center">
                    <Button
                        type="submit"
                        className="px-5 py-2 fw-semibold rounded-3"
                        disabled={loading}
                        variant="primary"
                    >
                        {loading ? <Spinner size="sm" animation="border" /> : "Đăng nhập"}
                    </Button>
                </div>
            </Form>
        </Container>
    );
}
