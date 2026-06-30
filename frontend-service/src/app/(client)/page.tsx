"use client";

import { useEffect, useMemo, useState } from "react";
import { useContext } from "react";
import Link from "next/link";
import authApis from "@/configs/AuthApis";
import endpoints from "@/configs/Endpoints";
import UserContext from "@/configs/UserContext";

type TopicDto = {
    id: number;
    name: string;
    description?: string;
    totalVocabs?: number;
};

type LessonStatus = "locked" | "current" | "completed";

type LearningLesson = {
    id: string;
    title: string;
    status: LessonStatus;
};

type LearningTopic = {
    id: string;
    name: string;
    color: string;
    lessons: LearningLesson[];
};

const topicColors = ["#58cc02", "#1cb0f6", "#ce82ff", "#ff9600", "#ff4b4b"];

function createLessons(topic: TopicDto, topicIndex: number, learnedCount: number, previousTopicCompleted: boolean): LearningLesson[] {
    const total = Math.min(Math.max(topic.totalVocabs ?? 4, 4), 7);
    const totalWords = Math.max(topic.totalVocabs ?? total, 1);
    const completedWords = Math.min(learnedCount, totalWords);
    const topicCompleted = completedWords >= totalWords;
    const completedNodes = topicCompleted
        ? total
        : Math.min(total, Math.floor((completedWords / totalWords) * total));
    const unlocked = topicIndex === 0 || previousTopicCompleted;

    return Array.from({ length: total }, (_, index) => {
        let status: LessonStatus = "locked";

        if (!unlocked) {
            status = "locked";
        } else if (topicCompleted) {
            status = "completed";
        } else if (index < completedNodes) {
            status = "completed";
        } else if (index === completedNodes) {
            status = "current";
        } else {
            status = "locked";
        }

        return {
            id: `${topic.id}-${index + 1}`,
            title: `${topic.name} - Bài ${index + 1}`,
            status,
        };
    });
}

function mapTopicsToLearningPath(topics: TopicDto[], learnedCountByTopic: Record<number, number>): LearningTopic[] {
    return topics.map((topic, index) => {
        const previousTopic = topics[index - 1];
        const previousTopicTotal = previousTopic ? Math.max(previousTopic.totalVocabs ?? 4, 1) : 0;
        const previousLearned = previousTopic ? learnedCountByTopic[previousTopic.id] ?? 0 : 0;
        const previousCompleted = index === 0 || previousLearned >= previousTopicTotal;

        return {
            id: String(topic.id),
            name: topic.name,
            color: topicColors[index % topicColors.length],
            lessons: createLessons(topic, index, learnedCountByTopic[topic.id] ?? 0, previousCompleted),
        };
    });
}

export default function Home() {
    const user = useContext(UserContext)?.user;
    const [topics, setTopics] = useState<TopicDto[]>([]);
    const [learnedCountByTopic, setLearnedCountByTopic] = useState<Record<number, number>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const learningTopics = useMemo(() => mapTopicsToLearningPath(topics, learnedCountByTopic), [topics, learnedCountByTopic]);

    useEffect(() => {
        const loadTopics = async () => {
            if (!user?.id) {
                setTopics([]);
                setError(null);
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);
                const response = await authApis.get(`${endpoints.topics}?page=0&size=5`);
                setTopics(response.data.result.content ?? []);
            } catch (err) {
                console.error("Cannot load topics", err);
                setError("Failed to load learning path. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        void loadTopics();
    }, [user?.id]);

    useEffect(() => {
        const loadLearnedCounts = async () => {
            if (!user?.id) {
                setLearnedCountByTopic({});
                return;
            }

            try {
                const response = await authApis.get(endpoints.learnedWord(user.id));
                const learnedWords = response.data.result || [];
                const counts: Record<number, number> = {};

                learnedWords.forEach((item: { vocabulary?: { topicIds?: number[] } }) => {
                    const topicIds: number[] = item.vocabulary?.topicIds || [];
                    topicIds.forEach((topicId) => {
                        counts[topicId] = (counts[topicId] || 0) + 1;
                    });
                });

                setLearnedCountByTopic(counts);
            } catch (err) {
                console.error("Cannot load learned words", err);
            }
        };

        void loadLearnedCounts();
    }, [user?.id]);

    return (
        <div className="space-y-6">
            {!user ? (
                <div className="relative overflow-hidden rounded-[32px] border-2 border-sky-100 bg-sky-50 p-8 shadow-sm sm:p-12">
                    <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-sky-200/40 blur-2xl"></div>
                    <div className="absolute -bottom-8 -left-8 h-40 w-40 rounded-full bg-lime-200/40 blur-2xl"></div>

                    <div className="relative z-10 flex flex-col items-center text-center">
                        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-white shadow-sm ring-1 ring-slate-100">
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 2-1-.56-2.78-2-5-2a4.9 4.9 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06Z" />
                                <path d="M10 2c1 .5 2 2 2 5" />
                            </svg>
                        </div>
                        <h2 className="mb-4 text-2xl font-black text-slate-800 sm:text-3xl">
                            Start your learning journey!
                        </h2>
                        <p className="mb-8 max-w-lg text-sm font-bold leading-relaxed text-slate-500 sm:text-base">
                            Log in or create a profile to unlock paths, save progress, track XP, and conquer vocabulary challenges every day.
                        </p>

                        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:gap-4">
                            <Link
                                href="/register"
                                className="flex min-w-[160px] items-center justify-center rounded-2xl border-b-4 border-lime-600 bg-lime-500 px-6 py-3.5 text-sm font-black uppercase tracking-wide text-white transition-transform hover:-translate-y-0.5 hover:bg-lime-400 active:translate-y-1 active:border-b-0"
                            >
                                Create Profile
                            </Link>
                            <Link
                                href="/login"
                                className="flex min-w-[160px] items-center justify-center rounded-2xl border-b-4 border-sky-600 bg-sky-500 px-6 py-3.5 text-sm font-black uppercase tracking-wide text-white transition-transform hover:-translate-y-0.5 hover:bg-sky-400 active:translate-y-1 active:border-b-0"
                            >
                                Log in
                            </Link>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    {loading && (
                        <div className="flex min-h-[300px] flex-col items-center justify-center rounded-[32px] border-2 border-slate-100 bg-white p-8">
                            <div className="mb-5 h-12 w-12 animate-spin rounded-full border-4 border-slate-100 border-t-sky-500"></div>
                            <span className="text-lg font-black text-slate-400">Loading path...</span>
                        </div>
                    )}

                    {!loading && error && (
                        <div className="flex min-h-[300px] flex-col items-center justify-center rounded-[32px] border-2 border-rose-100 bg-rose-50 p-8 text-center">
                            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-rose-200/50 text-rose-500">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                            </div>
                            <p className="text-lg font-black text-rose-600">{error}</p>
                        </div>
                    )}

                    {!loading && !error && learningTopics.length === 0 && (
                        <div className="flex min-h-[300px] flex-col items-center justify-center rounded-[32px] border-2 border-slate-100 bg-slate-50 p-8 text-center">
                            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-200/50 text-slate-400">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>
                            </div>
                            <p className="text-lg font-black text-slate-500">No learning topics available.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}