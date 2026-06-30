"use client";

import Image from "next/image";
import Link from "next/link";
import { useReducer } from "react";
import type { ReactNode } from "react";
import MyUserReducer from "@/reducers/MyUserReducer";
import UserContext from "@/configs/UserContext";

export default function AuthLayout({ children }: { children: ReactNode }) {
    const [user, dispatch] = useReducer(MyUserReducer, null);

    return (
        <UserContext.Provider value={{ user, dispatch }}>
            <main className="min-h-screen bg-[#0f1f24] text-white">
                <div className="grid min-h-screen lg:grid-cols-[minmax(360px,0.9fr)_minmax(420px,1fr)]">

                    {/* Đã thêm items-center để căn giữa, đổi p-10 thành py-12 px-10 để cách viền trên/dưới đẹp hơn */}
                    <section
                        className="relative hidden flex-col items-center justify-between border-r border-white/10 py-12 px-10 lg:flex bg-cover bg-center bg-no-repeat"
                        style={{
                            backgroundImage: "url('/template/bg.jpg')"
                        }}
                    >
                        {/* Đã giảm độ mờ từ 60% xuống 20% giúp ảnh nền sáng rõ */}
                        <div className="absolute inset-0 bg-black/20 z-0"></div>

                        <Link href="/" className="relative z-10 flex w-full justify-center no-underline">
                            <Image
                                src="/template/EngLearnLogo.png"
                                alt="EngLearn"
                                width={220} // Tăng kích thước logo
                                height={220} // Tăng kích thước logo
                                className="object-contain drop-shadow-xl" // Thêm viền bóng mờ giúp logo nổi bật
                            />
                        </Link>

                        <Link href="/" className="relative z-10 text-sm font-black uppercase text-green-950 no-underline hover:text-green-400 drop-shadow-md">
                            Back to home
                        </Link>
                    </section>

                    <section className="flex min-h-screen items-center justify-center px-5 py-10">
                        <div className="w-full max-w-md">
                            <div className="mb-8 flex justify-center lg:hidden">
                                <Image
                                    src="/template/EngLearnLogo.png"
                                    alt="EngLearn"
                                    width={90}
                                    height={90}
                                    className="object-contain"
                                />
                            </div>
                            {children}
                        </div>
                    </section>
                </div>
            </main>
        </UserContext.Provider>
    );
}