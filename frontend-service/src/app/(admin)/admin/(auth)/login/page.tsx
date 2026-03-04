"use client";

import Apis from "@/configs/Apis";
import authApis from "@/configs/AuthApis";
import endpoints from "@/configs/Endpoints";
import UserContext from "@/configs/UserContext";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useContext, useState } from "react";
import { Alert, Button, Form, Spinner } from "react-bootstrap";
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
                if (token) {
                    Cookies.set("accessToken", token, { path: "/" });
                }

                const profile = await authApis.get(endpoints["profile"]);
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
        <div
            style={{
                minHeight: "100vh",
                background: "linear-gradient(135deg, #1e3a8a, #0ea5e9)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "20px",
            }}
        >
            {msg && (
                <Alert
                    variant={msg.includes("thất bại") ? "danger" : "success"}
                    className="position-fixed top-0 end-0 m-4 shadow"
                    style={{ zIndex: 9999, minWidth: "280px", borderRadius: "12px" }}
                >
                    {msg}
                </Alert>
            )}

            <div
                style={{
                    width: "100%",
                    maxWidth: "400px",
                    background: "rgba(255,255,255,0.95)",
                    backdropFilter: "blur(10px)",
                    borderRadius: "20px",
                    padding: "40px 30px",
                    boxShadow: "0 20px 50px rgba(0,0,0,0.2)",
                    animation: "fadeIn 0.4s ease-in-out",
                }}
            >
                <div className="text-center mb-4">
                    <Database size={40} className="text-primary mb-2" />
                    <h2
                        className="fw-bold mb-0"
                        style={{
                            background: "linear-gradient(90deg, #2563eb, #06b6d4)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            letterSpacing: "1px",
                        }}
                    >
                        ADMIN LOGIN
                    </h2>
                    <p className="text-muted small mt-2">
                        Hệ thống quản trị EngLearn
                    </p>
                </div>

                <Form onSubmit={login}>
                    {info.map((i) => (
                        <Form.Group key={i.field} className="mb-3">
                            <Form.Label className="fw-semibold">
                                {i.title}
                            </Form.Label>
                            <Form.Control
                                required
                                value={user[i.field] || ""}
                                onChange={(e) =>
                                    setUser({ ...user, [i.field]: e.target.value })
                                }
                                type={i.type}
                                placeholder={i.title}
                                style={{
                                    borderRadius: "12px",
                                    padding: "10px 14px",
                                    border: "1px solid #ddd",
                                    transition: "0.3s",
                                }}
                                onFocus={(e) =>
                                    (e.currentTarget.style.boxShadow =
                                        "0 0 0 3px rgba(37,99,235,0.2)")
                                }
                                onBlur={(e) =>
                                    (e.currentTarget.style.boxShadow = "none")
                                }
                            />
                        </Form.Group>
                    ))}

                    <Button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: "100%",
                            padding: "10px",
                            borderRadius: "12px",
                            fontWeight: "600",
                            background: "linear-gradient(90deg, #2563eb, #06b6d4)",
                            border: "none",
                            transition: "0.3s",
                        }}
                    >
                        {loading ? (
                            <Spinner size="sm" animation="border" />
                        ) : (
                            "Đăng nhập"
                        )}
                    </Button>
                </Form>
            </div>

            <style jsx>{`
            @keyframes fadeIn {
                from {
                    opacity: 0;
                    transform: translateY(20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
        `}</style>
        </div>
    );
}
