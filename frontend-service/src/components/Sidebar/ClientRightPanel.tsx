"use client";

import { BookText, Bot, Flame, Target, Trophy } from "lucide-react";
import { useAiAssistant } from "@/components/AiAssistantContext";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
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
    const [dailyGoal, setDailyGoal] = useState<number>(20);
    const [startingXp, setStartingXp] = useState<number | null>(null);
    const [goalNotificationShown, setGoalNotificationShown] = useState<boolean>(false);

    const [todayStr, setTodayStr] = useState<string>("");

    useEffect(() => {
        const d = new Date();
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        setTodayStr(`${year}-${month}-${day}`);
    }, []);

    useEffect(() => {
        if (!todayStr) return;
        if (typeof window !== "undefined" && user?.id) {
            const savedGoal = localStorage.getItem(`dailyGoal_${user.id}`);
            if (savedGoal) {
                setDailyGoal(Number(savedGoal));
            }
            const achieved = localStorage.getItem(`goalAchieved_${user.id}_${todayStr}`);
            setGoalNotificationShown(achieved === "true");
        }
    }, [user?.id, todayStr]);

    const handleSelectGoal = (goal: number) => {
        if (!user?.id || !todayStr) return;
        setDailyGoal(goal);
        localStorage.setItem(`dailyGoal_${user.id}`, goal.toString());

        const currentTodayXp = startingXp !== null && progress ? Math.max(0, (progress.xp ?? 0) - startingXp) : 0;
        if (currentTodayXp < goal) {
            localStorage.setItem(`goalAchieved_${user.id}_${todayStr}`, "false");
            setGoalNotificationShown(false);
        }
    };

    const todayXp = useMemo(() => {
        if (startingXp === null || !progress) return 0;
        return Math.max(0, (progress.xp ?? 0) - startingXp);
    }, [progress, startingXp]);

    const goalPercent = useMemo(() => {
        if (dailyGoal === 0) return 0;
        return Math.min((todayXp / dailyGoal) * 100, 100);
    }, [todayXp, dailyGoal]);

    useEffect(() => {
        if (!todayStr || !user?.id || !progress) return;
        const currentXp = progress.xp ?? 0;
        const key = `startXp_${user.id}_${todayStr}`;
        const savedStart = localStorage.getItem(key);
        if (savedStart === null) {
            localStorage.setItem(key, currentXp.toString());
            setStartingXp(currentXp);
        } else {
            setStartingXp(Number(savedStart));
        }
    }, [user?.id, progress, todayStr]);

    // Detect when daily goal is reached
    useEffect(() => {
        if (!todayStr || !user?.id || todayXp === 0 || dailyGoal === 0) return;
        if (todayXp >= dailyGoal && !goalNotificationShown) {
            localStorage.setItem(`goalAchieved_${user.id}_${todayStr}`, "true");
            setGoalNotificationShown(true);

            // Track daily streak date-learned on backend
            const trackStreak = async () => {
                try {
                    await authApis.post(endpoints.dateLearned(user.id));
                    // Dispatch CustomEvent to notify layout / list components to reload streak count
                    window.dispatchEvent(new CustomEvent("update-progress"));
                } catch {
                    // Ignore already tracked for today
                }
            };
            void trackStreak();

            // Display congratulations Alert using sweetalert2
            const showNotification = async () => {
                const Swal = (await import("sweetalert2")).default;
                void Swal.fire({
                    icon: "success",
                    title: "Daily Goal Achieved!",
                    text: `Congratulations! You have completed your daily goal of ${dailyGoal} XP!`,
                    confirmButtonColor: "#84cc16"
                });
            };
            void showNotification();
        }
    }, [todayXp, dailyGoal, goalNotificationShown, user?.id, todayStr]);

    const guestPanelClass = !user ? "opacity-50 grayscale pointer-events-none select-none" : "";

    const loadProgress = useCallback(async () => {
        if (!user?.id) return;
        try {
            const response = await authApis.get(endpoints.progress(user.id));
            setProgress(response.data.result);
        } catch (error) {
            console.error("Cannot load progress overview", error);
        }
    }, [user?.id]);

    useEffect(() => {
        if (!user?.id) return;
        void loadProgress();

        const handleUpdate = () => {
            void loadProgress();
        };

        window.addEventListener("update-progress", handleUpdate);
        return () => {
            window.removeEventListener("update-progress", handleUpdate);
        };
    }, [user?.id, loadProgress]);

    return (
        <aside className="scrollbar-soft fixed right-0 top-0 z-30 hidden h-screen w-[300px] overflow-y-auto border-l-2 border-slate-100 bg-white px-4 py-5 xl:block">
            <div className="space-y-3 pb-4">

                {!user && (
                    <div className="rounded-2xl border-2 border-slate-100 bg-white p-3 shadow-sm">
                        <h2 className="m-0 text-[15px] font-black text-slate-800">Unlock Progress</h2>
                        <p className="m-0 mt-1.5 text-[12px] font-bold leading-5 text-slate-500">
                            You can start learning as a guest. Log in to save streak, XP, and personal paths.
                        </p>
                    </div>
                )}

                <div className={`rounded-2xl border-2 border-slate-100 bg-white p-3 transition-all ${guestPanelClass}`}>
                    <div className="mb-2 flex items-center justify-between">
                        <h2 className="m-0 text-[15px] font-black text-slate-800">Progress</h2>
                        <Trophy className="text-amber-500" size={20} />
                    </div>
                    <div className="grid grid-cols-2 gap-2.5">
                        <div className="rounded-2xl bg-orange-50 p-2.5">
                            <Flame className="mb-1.5 text-orange-500" size={20} />
                            <p className="m-0 text-xl font-black text-slate-900">{progress?.daysStudied ?? 0}</p>
                            <p className="m-0 text-[11px] font-bold text-slate-500">day streak</p>
                        </div>
                        <div className="rounded-2xl bg-sky-50 p-2.5">
                            <BookText className="mb-1.5 text-sky-500" size={18} />
                            <p className="m-0 text-xl font-black text-slate-900">{progress?.wordsLearned ?? 0}</p>
                            <p className="m-0 text-[11px] font-bold text-slate-500">words</p>
                        </div>
                    </div>
                </div>

                <div className={`rounded-2xl border-2 border-slate-100 bg-white p-3 transition-all ${guestPanelClass}`}>
                    <div className="mb-2 flex items-center gap-2">
                        <Target className="text-lime-600" size={20} />
                        <h2 className="m-0 text-[15px] font-black text-slate-800">Daily Goal</h2>
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
                                onClick={() => handleSelectGoal(goal)}
                                disabled={!user}
                                className={`rounded-xl border-2 py-1.5 text-xs font-black transition-colors ${goal === dailyGoal
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
                        <span className="block truncate text-[14px] font-black text-slate-900">Learning Assistant</span>
                        <span className="block truncate text-[11px] font-bold text-slate-500">
                            {user ? "Ask questions anytime" : "Log in to use assistant"}
                        </span>
                    </span>
                </button>

                {/* Khối Trình độ chuyển sang layout ngang để tiết kiệm không gian chiều dọc */}
                <div className={`flex items-center justify-between rounded-2xl border-2 border-slate-100 bg-white p-3 transition-all ${guestPanelClass}`}>
                    <div>
                        <p className="m-0 text-[10px] font-black uppercase text-slate-400">Level</p>
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