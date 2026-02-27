"use client";

import Apis from "@/configs/Apis";
import endpoints from "@/configs/Endpoints";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ForgotPassword() {
    const [step, setStep] = useState<1 | 2>(1);
    const [email, setEmail] = useState<string>("");
    const [otp, setOTP] = useState<string>("");
    const [newPassword, setNewPassword] = useState<string>("");
    const [msg, setMsg] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const router = useRouter();

    const handleForgotPassword = async () => {
        try {
            setLoading(true);
            await Apis.post(endpoints["forgotPassword"], { email: email });
            setMsg("Mã OTP đã được gửi đến email của bạn!");
            setStep(2);
        } catch (err: unknown) {
            if (err instanceof Error) {
                console.error(err.message);
            } else {
                console.error(err);
            }
            setMsg("Gửi OTP thất bại!");
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async () => {
        try {
            setLoading(true);
            const body = {
                email: email,
                otp: otp,
                newPassword: newPassword
            }
            await Apis.post(endpoints["resetPassword"], body);
            setMsg("Đổi mật khẩu thành công! Hãy đăng nhập lại.");
            setStep(1);
            setEmail("");
            setOTP("");
            setNewPassword("");
            router.push("/login");
        } catch (err: unknown) {
            if (err instanceof Error) {
                console.error(err.message);
            } else {
                console.error(err);
            }
            setMsg("OTP không hợp lệ hoặc đã hết hạn!");
        } finally {
            setLoading(false);
        }
    };

    const validate = () => {
        if (!email) {
            setMsg("Vui lòng nhập email!");
            return false;
        }
        if (step === 2) {
            if (otp.length !== 6) {
                setMsg("OTP phải gồm 6 ký tự!");
                return false;
            }
            if (newPassword.length < 6) {
                setMsg("Mật khẩu mới tối thiểu 6 ký tự!");
                return false;
            }
        }
        setMsg("");
        return true;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        step === 1 ? handleForgotPassword() : handleResetPassword();
    };

    return (
        <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
            <div className="card shadow p-4" style={{ width: "400px" }}>
                <h4 className="mb-3 text-center">
                    {step === 1 ? "Quên mật khẩu" : "Đặt lại mật khẩu"}
                </h4>

                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label>Email</label>
                        <input
                            placeholder="Nhập email khôi phục tài khoản..."
                            type="email"
                            className="form-control"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={step === 2}
                        />
                    </div>

                    {step === 2 && (
                        <>
                            <div className="mb-3">
                                <label>OTP</label>
                                <input
                                    placeholder="Nhập mã OTP được gửi qua email..."
                                    type="text"
                                    className="form-control"
                                    value={otp}
                                    onChange={(e) => setOTP(e.target.value)}
                                    maxLength={6}
                                />
                            </div>

                            <div className="mb-3">
                                <label>Mật khẩu mới</label>
                                <input
                                    placeholder="Nhập mật khẩu mới..."
                                    type="password"
                                    className="form-control"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                />
                            </div>
                        </>
                    )}

                    {msg && <div className="alert alert-info py-2">{msg}</div>}

                    <button
                        type="submit"
                        className="btn btn-primary w-100"
                        disabled={loading}
                    >
                        {loading
                            ? "Đang xử lý..."
                            : step === 1
                                ? "Gửi OTP"
                                : "Xác nhận đổi mật khẩu"}
                    </button>
                </form>
            </div>
        </div>
    );
}