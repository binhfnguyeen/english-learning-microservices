"use client";

import Link from "next/link";
import { FormEvent, useContext, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import Apis from "@/configs/Apis";
import authApis from "@/configs/AuthApis";
import endpoints from "@/configs/Endpoints";
import UserContext from "@/configs/UserContext";

export default function LoginPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const router = useRouter();
    const context = useContext(UserContext);

    const login = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoading(true);
        setMessage("");

        try {
            const response = await Apis.post(endpoints.login, { username, password });
            const { accessToken, refreshToken } = response.data.result;

            Cookies.set("accessToken", accessToken, { path: "/", sameSite: "lax" });
            Cookies.set("refreshToken", refreshToken, { path: "/", sameSite: "lax" });

            const profile = await authApis.get(endpoints.profile);
            context?.dispatch({ type: "login", payload: profile.data.result });

            try {
                await authApis.post(endpoints.dateLearned(profile.data.result.id));
            } catch (error) {
                console.error("Cannot track login date", error);
            }

            router.push("/");
            router.refresh();
        } catch (error) {
            console.error(error);
            setMessage("Login failed. Please check your username and password.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="rounded-3xl border border-white/10 bg-white p-6 text-slate-900 shadow-2xl sm:p-8">
            <p className="mb-2 text-sm font-black uppercase text-lime-600">Welcome Back</p>
            <h2 className="mb-6 text-3xl font-black">Login</h2>

            <form onSubmit={login} className="space-y-4">
                <input
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    className="w-full rounded-2xl border-2 border-slate-200 px-4 py-3 font-bold outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
                    placeholder="Username"
                    required
                />
                <input
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    type="password"
                    className="w-full rounded-2xl border-2 border-slate-200 px-4 py-3 font-bold outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
                    placeholder="Password"
                    required
                />

                <div className="flex items-center justify-between text-sm font-bold">
                    <label className="flex items-center gap-2 text-slate-500">
                        <input type="checkbox" className="h-4 w-4 rounded border-slate-300" />
                        Remember me
                    </label>
                    <Link href="/forgot-password" className="text-sky-600 no-underline hover:text-sky-700">
                        Forgot password?
                    </Link>
                </div>

                {message && (
                    <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-600">
                        {message}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-2xl border-b-4 border-sky-700 bg-sky-500 px-5 py-3 font-black uppercase text-white transition-colors hover:bg-sky-400 disabled:cursor-not-allowed disabled:border-slate-300 disabled:bg-slate-300"
                >
                    {loading ? "Logging in..." : "Login"}
                </button>
            </form>

            <p className="mb-0 mt-5 text-center text-sm font-bold text-slate-500">
                Don't have an account?{" "}
                <Link href="/register" className="text-lime-600 no-underline hover:text-lime-700">
                    Create Profile
                </Link>
            </p>
        </div>
    );
}
