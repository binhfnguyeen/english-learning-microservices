"use client"
import MySpinner from "@/components/MySpinner";
import endpoints from "@/configs/Endpoints";
import Link from "next/link";
import { useContext, useEffect, useState, useCallback, useMemo } from "react";
import { Container } from "react-bootstrap";
import authApis from "@/configs/AuthApis";
import UserContext from "@/configs/UserContext";
import SuggestVocab from "@/app/(client)/topics/suggest-vocab";
import { motion } from "framer-motion";
import { BookOpen, Check, Lock, Star } from "lucide-react";

// ==========================================
// CÁC TYPE VÀ INTERFACE
// ==========================================
type LessonStatus = "locked" | "current" | "completed";

export type LearningLesson = {
    id: string;
    title: string;
    status: LessonStatus;
};

export type LearningTopic = {
    id: string;
    name: string;
    color: string;
    lessons: LearningLesson[];
};

interface Topic {
    id: number;
    name: string;
    description: string;
    totalVocabs?: number;
}

interface LearnedWord {
    id: number;
    vocabulary: {
        id: number;
        topicIds?: number[];
    };
}

// ==========================================
// CẤU HÌNH UI & SVG ICONS
// ==========================================
const topicColors = ["#58cc02", "#1cb0f6", "#ce82ff", "#ff9600", "#ff4b4b"];
const randomOffsets = [0, -35, 15, -25, 35, -10, -40, 25, -20, 30, -15, 40, 10];
const COL_WIDTH = 110; 
const GRID_HEIGHT = 220; 
const HEADER_HEIGHT = 90;
const CENTER_Y = GRID_HEIGHT / 2;

const IconSearch = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
);

const IconSparkles = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
    </svg>
);

// ==========================================
// COMPONENT PATH NODE (VẼ TỪNG BÀI HỌC)
// ==========================================
function PathNode({ lesson, index, topicId }: { lesson: LearningLesson; index: number; topicId: number }) {
    const offsetIndex = (index + topicId) % randomOffsets.length;
    const offset = randomOffsets[offsetIndex];

    const baseClasses = "relative flex items-center justify-center rounded-full border-b-[4px] text-white transition-all";
    const stateClasses = {
        completed: "h-[64px] w-[64px] border-amber-500 bg-yellow-400 hover:bg-yellow-300",
        current: "h-[76px] w-[76px] border-lime-700 bg-lime-500 hover:bg-lime-400 shadow-lg ring-4 ring-lime-100",
        locked: "h-[64px] w-[64px] border-slate-300 bg-slate-200 text-slate-400",
    };
    const icon = {
        completed: <Check size={30} strokeWidth={3.5} />,
        current: <Star size={36} fill="currentColor" strokeWidth={3} />,
        locked: <Lock size={26} strokeWidth={3} />,
    };

    const isCurrent = lesson.status === "current";

    const nodeContent = isCurrent ? (
        <motion.div
            whileHover={{ y: -4, scale: 1.05 }}
            transition={{ type: "spring", stiffness: 380, damping: 12 }}
            className={`relative ${baseClasses} ${stateClasses.current}`}
        >
            <span className="absolute inset-[-8px] -z-10 animate-ping rounded-full bg-lime-300 opacity-40" />

            <div className="absolute -top-[68px] flex animate-bounce flex-col items-center drop-shadow-md">
                <div className="whitespace-nowrap rounded-xl border-2 border-slate-200 bg-white px-3 py-1.5 text-[14px] font-black uppercase tracking-wide text-lime-600">
                    Bắt đầu
                </div>
                <div className="-mt-2 h-3 w-3 rotate-45 border-b-2 border-r-2 border-slate-200 bg-white" />
            </div>

            {icon.current}
            <span className="sr-only">{lesson.title}</span>
        </motion.div>
    ) : (
        <div className={`${baseClasses} ${stateClasses[lesson.status]} ${lesson.status === "locked" ? "cursor-not-allowed" : ""}`}>
            {icon[lesson.status]}
            <span className="sr-only">{lesson.title}</span>
        </div>
    );

    return (
        <div className={`relative flex h-full w-full flex-col items-center justify-center ${isCurrent ? "z-50" : "z-10"}`}>
            <div style={{ transform: `translateY(${offset}px)` }} className="relative flex w-full items-center justify-center">
                {lesson.status === "locked" ? (
                    nodeContent
                ) : (
                    <Link href={`/topics/${topicId}/learning`} className="no-underline">
                        {nodeContent}
                    </Link>
                )}
            </div>
        </div>
    );
}

// ==========================================
// HÀM MAP DATA
// ==========================================
function createLessons(topic: Topic, topicIndex: number, learnedCount: number, previousTopicCompleted: boolean): LearningLesson[] {
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

function mapTopicsToLearningPath(topics: Topic[], learnedCountByTopic: Record<number, number>): LearningTopic[] {
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

// ==========================================
// COMPONENT CHÍNH
// ==========================================
export default function Topics() {
    const { user } = useContext(UserContext) || {};
    const [topics, setTopics] = useState<Topic[]>([]);
    const [page, setPage] = useState<number>(0);
    const [keyword, setKeyword] = useState<string>("");
    const [hasMore, setHasMore] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [showModal, setShowModal] = useState(false);
    const [isVocabLoading, setIsVocabLoading] = useState(false);
    const [learnedCountByTopic, setLearnedCountByTopic] = useState<Record<number, number>>({});

    const learningTopics = useMemo(() => mapTopicsToLearningPath(topics, learnedCountByTopic), [topics, learnedCountByTopic]);

    // Tính toán trước tọa độ SVG dùng cho Learning Path
    const { globalNodes, cumulativeX } = useMemo(() => {
        const nodes: { x: number; y: number; isCompleted: boolean }[] = [];
        let currX = 0;

        learningTopics.forEach((topic) => {
            const numericTopicId = Number(topic.id) || 0;
            topic.lessons.forEach((lesson, localIndex) => {
                const offset = randomOffsets[(localIndex + numericTopicId) % randomOffsets.length];
                nodes.push({
                    x: currX + COL_WIDTH / 2,
                    y: CENTER_Y + offset,
                    isCompleted: lesson.status === "completed" || lesson.status === "current",
                });
                currX += COL_WIDTH;
            });
        });

        return { globalNodes: nodes, cumulativeX: currX };
    }, [learningTopics]);

    const loadTopicProgress = useCallback(async () => {
        if (!user?.id) {
            setLearnedCountByTopic({});
            return;
        }
        try {
            const learnedRes = await authApis.get(endpoints["learnedWord"](user.id));
            const learnedWords: LearnedWord[] = learnedRes.data.result || [];
            const counts: Record<number, number> = {};

            learnedWords.forEach(item => {
                const topicIds = item.vocabulary?.topicIds || [];
                topicIds.forEach((topicId) => {
                    counts[topicId] = (counts[topicId] || 0) + 1;
                });
            });
            setLearnedCountByTopic(counts);
        } catch (ex) {
            console.error("Cannot load learned vocabulary counts", ex);
        }
    }, [user?.id]);

    const loadTopics = useCallback(async () => {
        let url = `${endpoints["topics"]}?page=${page}`;
        if (keyword) url += `&keyword=${keyword}`;

        try {
            setLoading(true);
            const res = await authApis.get(url);
            const content = res.data.result.content || [];
            setHasMore(!res.data.result.last);

            if (page === 0) {
                setTopics(content);
            } else {
                setTopics(prev => [...prev, ...content]);
            }
        } catch (ex) {
            console.error(ex);
        } finally {
            setLoading(false);
        }
    }, [page, keyword]);

    useEffect(() => {
        setLoading(true);
        const timer = setTimeout(() => {
            if (page === 0 || (page > 0 && hasMore)) {
                void loadTopics();
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [page, keyword, hasMore, loadTopics]);

    useEffect(() => {
        void loadTopicProgress();
    }, [loadTopicProgress]);

    useEffect(() => {
        setPage(0);
    }, [keyword]);

    const loadMore = () => {
        setPage(prev => prev + 1);
    };

    // Lazy load ngang
    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        if (!hasMore || loading) return;
        const { scrollLeft, clientWidth, scrollWidth } = e.currentTarget;
        if (scrollLeft + clientWidth >= scrollWidth - 250) {
            loadMore();
        }
    };

    return (
        <Container style={{ maxWidth: "800px" }}>
            <style jsx global>{`
                .horizontal-scroll::-webkit-scrollbar { height: 10px; }
                .horizontal-scroll::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 12px; }
                .horizontal-scroll::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 12px; border: 2px solid #f1f5f9; }
                .horizontal-scroll::-webkit-scrollbar-thumb:hover { background-color: #94a3b8; }
            `}</style>

            <div className="mb-5 text-center">
                <div className="mx-auto flex flex-col gap-4 rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-100 sm:flex-row sm:items-center sm:justify-between">
                    <div className="relative w-full sm:max-w-sm text-start">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                            <IconSearch />
                        </div>
                        <input
                            type="text"
                            placeholder="Tìm kiếm chủ đề..."
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            className="w-full rounded-2xl bg-slate-50 py-3 pl-11 pr-4 text-sm font-semibold text-slate-700 outline-none ring-1 ring-slate-200 transition-all focus:bg-white focus:ring-2 focus:ring-sky-500"
                        />
                    </div>

                    <button
                        onClick={() => setShowModal(true)}
                        disabled={isVocabLoading}
                        className="flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-2xl border-b-4 border-emerald-700 bg-emerald-500 px-6 py-3 text-sm font-black text-white transition-all hover:bg-emerald-400 active:translate-y-1 active:border-b-0 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
                    >
                        {isVocabLoading ? (
                            <>
                                <div className="spinner-border spinner-border-sm" role="status" style={{ width: '1rem', height: '1rem', borderWidth: '0.15em' }}></div>
                                AI đang chạy...
                            </>
                        ) : (
                            <>
                                <IconSparkles />
                                Học theo lộ trình cá nhân
                            </>
                        )}
                    </button>
                </div>
            </div>

            {topics.length > 0 && (
                <div className="flex flex-col w-full space-y-6">
                    <div 
                        className="horizontal-scroll relative mx-auto w-full overflow-x-auto rounded-[32px] bg-slate-50/50 py-6 shadow-inner ring-1 ring-slate-100"
                        onScroll={handleScroll}
                    >
                        <div className="relative flex w-max min-w-full flex-row px-8">
                            
                            <svg
                                className="pointer-events-none absolute left-8 top-[90px] z-0"
                                width={cumulativeX}
                                height={GRID_HEIGHT}
                            >
                                {globalNodes.map((node, i) => {
                                    if (i === 0) return null;
                                    const prev = globalNodes[i - 1];
                                    const strokeColor = node.isCompleted ? "#facc15" : "#e2e8f0";
                                    return (
                                        <line
                                            key={`line-${i}`}
                                            x1={prev.x}
                                            y1={prev.y}
                                            x2={node.x}
                                            y2={node.y}
                                            stroke={strokeColor}
                                            strokeWidth="6"
                                            strokeDasharray="10 10"
                                            strokeLinecap="round"
                                        />
                                    );
                                })}
                            </svg>

                            {learningTopics.map((topic) => {
                                const numericTopicId = Number(topic.id) || 0;
                                const topicWidth = topic.lessons.length * COL_WIDTH;

                                return (
                                    <div key={topic.id} className="relative z-10 flex flex-col" style={{ width: topicWidth }}>
                                        <div className="relative w-full" style={{ height: `${HEADER_HEIGHT}px` }}>
                                            <div 
                                                className="sticky left-4 z-20 w-max rounded-2xl px-5 py-3 text-white shadow-md"
                                                style={{ backgroundColor: topic.color }}
                                            >
                                                <p className="m-0 text-[10px] font-black uppercase tracking-widest text-white/80">Unit</p>
                                                <h2 className="m-0 max-w-[200px] truncate text-lg font-black">{topic.name}</h2>
                                                <Link 
                                                    href={`/topics/${topic.id}`} 
                                                    className="mt-1 flex items-center gap-1.5 text-xs font-bold text-white/90 no-underline transition-colors hover:text-white"
                                                >
                                                    <BookOpen size={14} /> Chi tiết
                                                </Link>
                                            </div>
                                        </div>

                                        <div
                                            className="grid w-full items-center"
                                            style={{ height: `${GRID_HEIGHT}px`, gridTemplateColumns: `repeat(${topic.lessons.length}, 1fr)` }}
                                        >
                                            {topic.lessons.map((lesson, index) => (
                                                <PathNode key={lesson.id} lesson={lesson} index={index} topicId={numericTopicId} />
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}

                            {loading && page > 0 && (
                                <div className="relative z-10 flex flex-col justify-center px-12" style={{ height: `${GRID_HEIGHT + HEADER_HEIGHT}px` }}>
                                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-500"></div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {topics.length === 0 && !loading && (
                <div className="text-center py-5 bg-light rounded-4 mt-4 border border-dashed">
                    <h5 className="text-muted fw-medium m-0">Không tìm thấy chủ đề nào phù hợp.</h5>
                </div>
            )}

            {loading && page === 0 && (
                <div className="py-4 text-center">
                    <MySpinner />
                </div>
            )}

            <SuggestVocab show={showModal} onHide={() => setShowModal(false)} onLoadingChange={setIsVocabLoading} />
        </Container>
    );
}