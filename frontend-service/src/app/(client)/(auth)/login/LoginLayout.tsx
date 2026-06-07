"use client";

import Image from "next/image";
import React from "react";

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return (
    <section className="min-h-screen bg-slate-950 py-10">
      <div className="mx-auto flex min-h-[calc(100vh-80px)] w-full max-w-7xl flex-col overflow-hidden rounded-[40px] bg-white shadow-2xl lg:flex-row">
        <div className="relative hidden lg:block lg:w-[45%]">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('/template/bg.jpg')" }}
          />
          <div className="absolute inset-0 bg-slate-950/20" />
          <div className="relative flex h-full flex-col justify-center px-10 py-16 text-white">
            <div className="mb-8">
              <Image
                src="/template/EngLearnLogo.png"
                alt="EngLearn"
                width={140}
                height={140}
                className="h-auto w-auto"
              />
            </div>
            <h1 className="text-4xl font-black leading-tight">Học tiếng Anh hiệu quả với EngLearn</h1>
            <p className="mt-5 max-w-md text-sm leading-7 text-slate-200">
              Đăng nhập để lưu tiến trình, theo dõi XP và mở khóa toàn bộ tính năng học tiếng Anh.
            </p>
          </div>
        </div>

        <div className="flex w-full flex-1 items-center justify-center px-6 py-10 sm:px-10 lg:w-[55%]">
          <div className="w-full max-w-md">{children}</div>
        </div>
      </div>
    </section>
  );
}
