"use client";

import { BookText, Bot, Flame, Target, Trophy } from "lucide-react";
import { useAiAssistant } from "@/components/AiAssistantContext";
import { useContext, useEffect, useMemo, useState } from "react";
import UserContext from "@/configs/UserContext";
import authApis from "@/configs/AuthApis";
import endpoints from "@/configs/Endpoints";

type ProgressOverview = {
    daysStudied?: number;
    wordsLearned?: number;
    xp?: number;
    cefr?: string;
    proficiency?: string;
};

export default function ClientRightPanel() {
    const { openAssistant } = useAiAssistant();
    const user = useContext(UserContext)?.user;
    const [progress, setProgress] = useState<ProgressOverview | null>(null);
    const dailyGoal = 20;
    const todayXp = useMemo(() => Math.min(progress?.xp ?? 0, dailyGoal), [progress?.xp]);
    const goalPercent = Math.min((todayXp / dailyGoal) * 100, 100);
    
    // Áp dụng: Làm mờ 50%, chuyển xám, chặn click và chặn bôi đen chữ
    const guestPanelClass = !user ? "opacity-50 grayscale pointer-events-none select-none" : "";

    useEffect(() => {
        if (!user?.id) return;

        const loadProgress = async () => {
            try {
                const response = await authApis.get(endpoints.progress(user.id));
                setProgress(response.data.result);
            } catch (error) {
                console.error("Cannot load progress overview", error);
            }
        };

        void loadProgress();
    }, [user?.id]);

    return (
        <aside className="scrollbar-soft fixed right-0 top-0 z-30 hidden h-screen w-[300px] overflow-y-auto border-l-2 border-slate-100 bg-white px-4 py-5 xl:block">
            <div className="space-y-3 pb-4">
                
                {!user && (
                    <div className="rounded-2xl border-2 border-slate-100 bg-white p-3 shadow-sm">
                        <h2 className="m-0 text-[15px] font-black text-slate-800">Mở khóa tiến độ</h2>
                        <p className="m-0 mt-1.5 text-[12px] font-bold leading-5 text-slate-500">
                            Bạn có thể học thử ngay. Đăng nhập để lưu streak, XP và lộ trình riêng.
                        </p>
                    </div>
                )}

                <div className={`rounded-2xl border-2 border-slate-100 bg-white p-3 transition-all ${guestPanelClass}`}>
                    <div className="mb-2 flex items-center justify-between">
                        <h2 className="m-0 text-[15px] font-black text-slate-800">Tiến độ</h2>
                        <Trophy className="text-amber-500" size={20} />
                    </div>
                    <div className="grid grid-cols-2 gap-2.5">
                        <div className="rounded-2xl bg-orange-50 p-2.5">
                            <Flame className="mb-1.5 text-orange-500" size={20} />
                            <p className="m-0 text-xl font-black text-slate-900">{progress?.daysStudied ?? 0}</p>
                            <p className="m-0 text-[11px] font-bold text-slate-500">ngày streak</p>
                        </div>
                        <div className="rounded-2xl bg-sky-50 p-2.5">
                            <BookText className="mb-1.5 text-sky-500" size={18} />
                            <p className="m-0 text-xl font-black text-slate-900">{progress?.wordsLearned ?? 0}</p>
                            <p className="m-0 text-[11px] font-bold text-slate-500">từ vựng</p>
                        </div>
                    </div>
                </div>

                <div className={`rounded-2xl border-2 border-slate-100 bg-white p-3 transition-all ${guestPanelClass}`}>
                    <div className="mb-2 flex items-center gap-2">
                        <Target className="text-lime-600" size={20} />
                        <h2 className="m-0 text-[15px] font-black text-slate-800">Mục tiêu ngày</h2>
                    </div>
                    <div className="mb-2 flex items-end justify-between">
                        <span className="text-xs font-bold text-slate-500">{dailyGoal} XP</span>
                        <span className="text-xs font-black text-lime-600">{todayXp}/{dailyGoal}</span>
                    </div>
                    <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                        <div className="h-full rounded-full bg-lime-500 transition-all" style={{ width: `${goalPercent}%` }} />
                    </div>
                    <div className="mt-3 grid grid-cols-3 gap-2">
                        {[10, 20, 50].map((goal) => (
                            <button
                                key={goal}
                                type="button"
                                disabled={!user}
                                className={`rounded-xl border-2 py-1.5 text-xs font-black transition-colors ${
                                    goal === 20
                                        ? "border-lime-500 bg-lime-50 text-lime-700"
                                        : "border-slate-100 bg-white text-slate-500 hover:bg-slate-50"
                                } ${!user ? "cursor-not-allowed" : ""}`}
                            >
                                {goal} XP
                            </button>
                        ))}
                    </div>
                </div>

                <button
                    onClick={openAssistant}
                    disabled={!user}
                    className={`flex w-full items-center gap-3 rounded-2xl border-2 border-indigo-100 bg-indigo-50 p-3 text-left transition-all hover:bg-indigo-100 disabled:cursor-not-allowed ${guestPanelClass}`}
                >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white">
                        <Bot size={22} />
                    </span>
                    <span className="min-w-0 flex-1">
                        <span className="block truncate text-[14px] font-black text-slate-900">Trợ lý học tập</span>
                        <span className="block truncate text-[11px] font-bold text-slate-500">
                            {user ? "Hỏi bài bất cứ lúc nào" : "Đăng nhập dùng trợ lý"}
                        </span>
                    </span>
                </button>

                {/* Khối Trình độ chuyển sang layout ngang để tiết kiệm không gian chiều dọc */}
                <div className={`flex items-center justify-between rounded-2xl border-2 border-slate-100 bg-white p-3 transition-all ${guestPanelClass}`}>
                    <div>
                        <p className="m-0 text-[10px] font-black uppercase text-slate-400">Trình độ</p>
                        <p className="m-0 text-xl font-black text-slate-900">{progress?.cefr ?? "A1"}</p>
                    </div>
                    <div className="rounded-xl bg-slate-100 px-3 py-1.5 text-[11px] font-bold text-slate-600">
                        {progress?.proficiency ?? "Beginner"}
                    </div>
                </div>

            </div>
        </aside>
    );
}