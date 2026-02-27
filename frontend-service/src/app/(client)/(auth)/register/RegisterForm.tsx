"use client";

import Apis from "@/configs/Apis";
import endpoints from "@/configs/Endpoints";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Alert } from "react-bootstrap";

interface User {
    lastName: string;
    firstName: string;
    email: string;
    phone: string;
    username: string;
    password: string;
    confirm: string;
    avatar: string;
}

export default function RegisterForm() {
    const [user, setUser] = useState<User>({
        lastName: "",
        firstName: "",
        email: "",
        phone: "",
        username: "",
        password: "",
        confirm: "",
        avatar: "",
    });
    const [msg, setMsg] = useState("");
    const [loading, setLoading] = useState(false);
    const avatarRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    const validate = () => {
        if (!user.lastName || !user.firstName || !user.email || !user.username || !user.password) {
            setMsg("Vui lòng nhập đầy đủ thông tin!");
            return false;
        }
        if (user.password !== user.confirm) {
            setMsg("Mật khẩu KHÔNG khớp!");
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
        if (!validate()) return;

        try {
            setLoading(true);
            const formData = new FormData();
            for (const key in user) {
                const typedKey = key as keyof User;
                if (typedKey !== "confirm") {
                    formData.append(typedKey, user[typedKey]);
                }
            }
            if (avatarRef.current?.files?.length) {
                formData.append("avatar", avatarRef.current.files[0]);
            }

            await Apis.post(endpoints["register"], formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            setMsg("Đăng ký thành công!");
            router.push("/login");
        } catch (ex) {
            console.error(ex);
            setMsg("Đăng ký thất bại!");
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
        <div className="card shadow border-0 rounded-4 p-4" style={{ maxWidth: "420px", margin: "0 auto" }}>
            {msg && (
                <Alert
                    variant={msg.includes("thất bại") ? "danger" : "success"}
                    className="py-2 position-fixed top-0 end-0 m-3 shadow"
                    style={{ zIndex: 9999, minWidth: "250px" }}
                >
                    {msg}
                </Alert>
            )}

            <form onSubmit={register}>
                <h4 className="text-center fw-bold mb-4">Đăng ký</h4>

                <div className="row">
                    <div className="col-md-6 mb-3">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Họ"
                            value={user.lastName}
                            onChange={(e) => setUser({ ...user, lastName: e.target.value })}
                            required
                        />
                    </div>

                    <div className="col-md-6 mb-3">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Tên"
                            value={user.firstName}
                            onChange={(e) => setUser({ ...user, firstName: e.target.value })}
                            required
                        />
                    </div>
                </div>

                <div className="mb-3">
                    <input
                        type="email"
                        className="form-control"
                        placeholder="Email"
                        value={user.email}
                        onChange={(e) => setUser({ ...user, email: e.target.value })}
                        required
                    />
                </div>

                <div className="mb-3">
                    <input
                        type="tel"
                        className="form-control"
                        placeholder="Số điện thoại"
                        value={user.phone}
                        onChange={(e) => setUser({ ...user, phone: e.target.value })}
                        required
                    />
                </div>

                <div className="mb-3">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Tên đăng nhập"
                        value={user.username}
                        onChange={(e) => setUser({ ...user, username: e.target.value })}
                        required
                    />
                </div>

                <div className="mb-3">
                    <input
                        type="password"
                        className="form-control"
                        placeholder="Mật khẩu"
                        value={user.password}
                        onChange={(e) => setUser({ ...user, password: e.target.value })}
                        required
                    />
                </div>

                <div className="mb-3">
                    <input
                        type="password"
                        className="form-control"
                        placeholder="Xác nhận mật khẩu"
                        value={user.confirm}
                        onChange={(e) => setUser({ ...user, confirm: e.target.value })}
                        required
                    />
                </div>

                <div className="mb-3">
                    <input type="file" ref={avatarRef} className="form-control" />
                </div>

                <div className="text-center mt-3">
                    <button
                        type="submit"
                        className="btn btn-primary w-100 d-flex align-items-center justify-content-center"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span
                                    className="spinner-border spinner-border-sm me-2"
                                    role="status"
                                    aria-hidden="true"
                                ></span>
                                Đang đăng ký...
                            </>
                        ) : (
                            "Đăng ký"
                        )}
                    </button>
                    <p className="small fw-bold mt-3 mb-0">
                        Đã có tài khoản?{" "}
                        <a href="/login" className="link-danger">
                            Đăng nhập
                        </a>
                    </p>
                </div>
            </form>
        </div>
    );
}
