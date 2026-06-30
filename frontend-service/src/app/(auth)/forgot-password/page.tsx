"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Apis from "@/configs/Apis";
import endpoints from "@/configs/Endpoints";

export default function ForgotPasswordPage() {
    const [step, setStep] = useState<1 | 2>(1);
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const submit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoading(true);
        setMessage("");

        try {
            if (step === 1) {
                await Apis.post(`${endpoints.forgotPassword}?email=${encodeURIComponent(email)}`);
                setMessage("OTP code has been sent to your email.");
                setStep(2);
            } else {
                await Apis.post(`${endpoints.resetPassword}?email=${encodeURIComponent(email)}&otp=${encodeURIComponent(otp)}&newPassword=${encodeURIComponent(newPassword)}`);
                router.push("/login");
            }
        } catch (error) {
            console.error(error);
            setMessage(step === 1 ? "Failed to send OTP." : "Invalid or expired OTP.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="rounded-3xl border border-white/10 bg-white p-6 text-slate-900 shadow-2xl sm:p-8">
            <p className="mb-2 text-sm font-black uppercase text-lime-600">Recover Account</p>
            <h2 className="mb-6 text-3xl font-black">
                {step === 1 ? "Forgot Password" : "Reset Password"}
            </h2>

            <form onSubmit={submit} className="space-y-4">
                <input
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    disabled={step === 2}
                    type="email"
                    className="w-full rounded-2xl border-2 border-slate-200 px-4 py-3 font-bold outline-none focus:border-sky-500"
                    placeholder="Email"
                    required
                />

                {step === 2 && (
                    <>
                        <input value={otp} onChange={(event) => setOtp(event.target.value)} maxLength={6} className="w-full rounded-2xl border-2 border-slate-200 px-4 py-3 font-bold outline-none focus:border-sky-500" placeholder="OTP Code" required />
                        <input value={newPassword} onChange={(event) => setNewPassword(event.target.value)} type="password" className="w-full rounded-2xl border-2 border-slate-200 px-4 py-3 font-bold outline-none focus:border-sky-500" placeholder="New Password" required />
                    </>
                )}

                {message && <div className="rounded-2xl bg-sky-50 px-4 py-3 text-sm font-bold text-sky-700">{message}</div>}

                <button type="submit" disabled={loading} className="w-full rounded-2xl border-b-4 border-sky-700 bg-sky-500 px-5 py-3 font-black uppercase text-white hover:bg-sky-400 disabled:border-slate-300 disabled:bg-slate-300">
                    {loading ? "Processing..." : step === 1 ? "Send OTP" : "Confirm"}
                </button>
            </form>

            <Link href="/login" className="mt-5 block text-center text-sm font-black text-slate-500 no-underline hover:text-slate-800">
                Back to Login
            </Link>
        </div>
    );
}
