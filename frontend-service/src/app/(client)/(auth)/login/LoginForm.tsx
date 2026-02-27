"use client";

import Apis from "@/configs/Apis";
import authApis from "@/configs/AuthApis";
import endpoints from "@/configs/Endpoints";
import UserContext from "@/configs/UserContext";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { useContext, useState, useEffect } from "react";
import { Alert } from "react-bootstrap";

export default function LoginForm() {
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState<{ [key: string]: string }>({});
    const router = useRouter();
    const userContext = useContext(UserContext);
    const [msg, setMsg] = useState("");

    if (!userContext) {
        throw new Error("UserContext not found. Wrap component with UserContext.Provider.");
    }
    const { dispatch } = userContext;

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
                await Apis.post(endpoints["dateLearned"](profile.data.result.id));
                setMsg("Đăng nhập thành công!");
                router.push("/");
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
        <div className="card shadow-lg border-0 rounded-4 p-4">
            {msg && (
                <Alert
                    variant={msg.includes("thất bại") ? "danger" : "success"}
                    className="py-2 position-fixed top-0 end-0 m-3 shadow"
                    style={{ zIndex: 9999, minWidth: "250px" }}
                >
                    {msg}
                </Alert>
            )}

            <form onSubmit={login}>
                <h3 className="text-center fw-bold mb-4">Đăng nhập</h3>

                <div className="form-outline mb-4">
                    <input
                        type="text"
                        className="form-control form-control-lg"
                        placeholder="Tên đăng nhập"
                        value={user["username"] || ""}
                        onChange={(e) => setUser({ ...user, username: e.target.value })}
                        required
                    />
                </div>

                <div className="form-outline mb-3">
                    <input
                        type="password"
                        className="form-control form-control-lg"
                        placeholder="Mật khẩu"
                        value={user["password"] || ""}
                        onChange={(e) => setUser({ ...user, password: e.target.value })}
                        required
                    />
                </div>

                <div className="d-flex justify-content-between align-items-center mb-3">
                    <div className="form-check">
                        <input className="form-check-input me-2" type="checkbox" id="rememberMe" />
                        <label className="form-check-label" htmlFor="rememberMe">
                            Ghi nhớ tôi
                        </label>
                    </div>
                    <a href="/forgot-password" className="text-primary fw-semibold small">
                        Quên mật khẩu?
                    </a>
                </div>

                <div className="d-grid">
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
                                Đang xử lý...
                            </>
                        ) : (
                            "Đăng nhập"
                        )}
                    </button>
                </div>

                <p className="small fw-bold mt-3 text-center">
                    Chưa có tài khoản?{" "}
                    <a href="/register" className="link-danger">
                        Đăng ký
                    </a>
                </p>
            </form>
        </div>
    );
}
