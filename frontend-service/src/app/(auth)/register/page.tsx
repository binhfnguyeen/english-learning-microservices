"use client";

import Link from "next/link";
import { FormEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Apis from "@/configs/Apis";
import endpoints from "@/configs/Endpoints";

export default function RegisterPage() {
    const [form, setForm] = useState({
        lastName: "",
        firstName: "",
        email: "",
        phone: "",
        username: "",
        password: "",
        confirm: "",
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const avatarRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    const register = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setMessage("");

        if (form.password !== form.confirm) {
            setMessage("Confirmation password does not match.");
            return;
        }

        try {
            setLoading(true);
            const formData = new FormData();
            Object.entries(form).forEach(([key, value]) => {
                if (key !== "confirm") formData.append(key, value);
            });

            if (avatarRef.current?.files?.[0]) {
                formData.append("avatar", avatarRef.current.files[0]);
            }

            await Apis.post(endpoints.register, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            router.push("/login");
        } catch (error) {
            console.error(error);
            setMessage("Registration failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="rounded-3xl border border-white/10 bg-white p-6 text-slate-900 shadow-2xl sm:p-8">
            <p className="mb-2 text-sm font-black uppercase text-lime-600">Create Profile</p>
            <h2 className="mb-6 text-3xl font-black">Register</h2>

            <form onSubmit={register} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                    <input className="rounded-2xl border-2 border-slate-200 px-4 py-3 font-bold outline-none focus:border-sky-500" placeholder="First Name" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required />
                    <input className="rounded-2xl border-2 border-slate-200 px-4 py-3 font-bold outline-none focus:border-sky-500" placeholder="Last Name" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required />
                </div>
                <input type="email" className="w-full rounded-2xl border-2 border-slate-200 px-4 py-3 font-bold outline-none focus:border-sky-500" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                <input className="w-full rounded-2xl border-2 border-slate-200 px-4 py-3 font-bold outline-none focus:border-sky-500" placeholder="Phone Number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
                <input className="w-full rounded-2xl border-2 border-slate-200 px-4 py-3 font-bold outline-none focus:border-sky-500" placeholder="Username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required />
                <input type="password" className="w-full rounded-2xl border-2 border-slate-200 px-4 py-3 font-bold outline-none focus:border-sky-500" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
                <input type="password" className="w-full rounded-2xl border-2 border-slate-200 px-4 py-3 font-bold outline-none focus:border-sky-500" placeholder="Confirm Password" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} required />
                <input ref={avatarRef} type="file" className="w-full rounded-2xl border-2 border-slate-200 px-4 py-3 text-sm font-bold" />

                {message && <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-600">{message}</div>}

                <button type="submit" disabled={loading} className="w-full rounded-2xl border-b-4 border-lime-700 bg-lime-500 px-5 py-3 font-black uppercase text-white hover:bg-lime-400 disabled:border-slate-300 disabled:bg-slate-300">
                    {loading ? "Registering..." : "Create Profile"}
                </button>
            </form>

            <p className="mb-0 mt-5 text-center text-sm font-bold text-slate-500">
                Already have an account?{" "}
                <Link href="/login" className="text-sky-600 no-underline hover:text-sky-700">
                    Log in
                </Link>
            </p>
        </div>
    );
}
