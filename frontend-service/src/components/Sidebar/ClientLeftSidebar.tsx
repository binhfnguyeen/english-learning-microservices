"use client";

import { useContext } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BookOpen, Trophy, Mic, UserCircle, LogOut, LogIn } from "lucide-react";
import UserContext from "@/configs/UserContext";

type ClientLeftSidebarProps = {
    userId: number | null;
};

const navItems = [
    { label: "Learn Vocabulary", href: "/topics", icon: BookOpen },
    { label: "Dictionary", href: "/dictionary", icon: BookOpen },
    { label: "Practice Tests", href: "/tests", icon: Trophy },
    { label: "Speaking Practice", href: "/conservation", icon: Mic },
    { label: "Profile", href: "/profile", icon: UserCircle },
];

export default function ClientLeftSidebar({ userId }: ClientLeftSidebarProps) {
    const { dispatch } = useContext(UserContext) || {};
    const pathname = usePathname();
    const router = useRouter();
    const profileHref = userId ? "/profile" : "/login";

    // Luôn render danh sách item
    const items = navItems.map((item) =>
        item.label === "Profile" ? { ...item, href: profileHref } : item
    );

    const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

    const handleLogout = () => {
        dispatch?.({ type: "logout" });
        router.push("/login");
    };

    const guestItemClass = !userId ? "opacity-50 grayscale pointer-events-none select-none" : "";

    return (
        <>
            <aside className="fixed left-0 top-0 z-40 hidden h-screen w-[250px] border-r-2 border-slate-100 bg-white px-4 py-5 lg:flex lg:flex-col">
                <Link
                    href="/topics"
                    className="flex justify-center no-underline"
                >
                    <Image
                        src="/template/EngLearnLogo.png"
                        alt="EngLearn"
                        width={160}
                        height={160}
                        className="object-contain drop-shadow-sm"
                        priority
                    />
                </Link>

                <nav className="flex flex-col gap-2">
                    {items.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.href) && userId;
                        const allowForGuest = !userId && item.href === "/topics";
                        const itemClass = `${active ? "bg-lime-50 text-lime-700 ring-2 ring-lime-200" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"} ${!allowForGuest ? guestItemClass : ""}`;

                        return (
                            <Link
                                key={item.label}
                                href={item.href}
                                className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-base font-extrabold no-underline transition-colors ${itemClass}`}
                            >
                                <div className="flex h-6 w-6 items-center justify-center">
                                    <Icon size={24} strokeWidth={2.6} />
                                </div>
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="mt-auto pt-4">
                    {userId ? (
                        <button
                            type="button"
                            onClick={handleLogout}
                            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-100"
                        >
                            <LogOut size={18} strokeWidth={2.2} />
                            Log out
                        </button>
                    ) : (
                        <Link
                            href="/login"
                            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm font-black text-sky-700 transition hover:bg-sky-100 no-underline"
                        >
                            <LogIn size={18} strokeWidth={2.2} />
                            Log in
                        </Link>
                    )}
                </div>
            </aside>

            {/* Điều hướng trên Mobile cũng được cập nhật hiển thị xám tương tự */}
            <nav className={`fixed inset-x-0 bottom-0 z-50 grid h-20 grid-cols-5 border-t-2 border-slate-100 bg-white px-2 shadow-[0_-8px_30px_rgba(15,23,42,0.08)] lg:hidden`}>
                {items.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href) && userId;

                    return (
                        <Link
                            key={item.label}
                            href={item.href}
                            className={`flex flex-col items-center justify-center gap-1 rounded-2xl text-xs font-extrabold no-underline transition-colors ${active ? "text-lime-600" : "text-slate-500 hover:text-slate-900"
                                } ${guestItemClass}`}
                        >
                            <div className="flex h-6 w-6 items-center justify-center">
                                <Icon size={24} strokeWidth={2.6} />
                            </div>
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>
        </>
    );
}