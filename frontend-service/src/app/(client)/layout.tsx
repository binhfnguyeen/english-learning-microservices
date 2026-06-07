"use client"
import Cookies from "js-cookie";
import { useEffect, useReducer, useState } from "react";
import type { ReactNode } from "react";
import MyUserReducer from "@/reducers/MyUserReducer";
import authApis from "@/configs/AuthApis";
import endpoints from "@/configs/Endpoints";
import UserContext from "@/configs/UserContext";
import AiAssistant from "@/components/AiAssistant";
import ClientLeftSidebar from "@/components/Sidebar/ClientLeftSidebar";
import ClientRightPanel from "@/components/Sidebar/ClientRightPanel";
import { AiAssistantProvider } from "@/components/AiAssistantContext";

export default function ClientRootLayout({ children }: { children: ReactNode }) {
    const [user, dispatch] = useReducer(MyUserReducer, null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const loadUser = async () => {
            const token = Cookies.get("accessToken");
            if (token) {
                try {
                    const res = await authApis.get(endpoints['profile']);
                    dispatch({
                        type: "login",
                        payload: res.data.result
                    })
                } catch (err) {
                    console.error("Không thể load user từ token ", err);
                    Cookies.remove("accessToken");
                }
            }
            setMounted(true);
        }

        loadUser();
    }, [])

    if (!mounted) {
        return (
            <UserContext.Provider value={{ user: null, dispatch }}>
                <AiAssistantProvider>
                    <div className="h-screen overflow-hidden bg-[#f7f7f2] text-slate-900">
                        <ClientLeftSidebar userId={null} />
                        <ClientRightPanel />

                        <main className="scrollbar-soft h-screen overflow-y-auto px-4 pb-24 pt-4 lg:ml-[250px] lg:px-8 lg:pb-8 xl:mr-[300px]">
                            <div className="mx-auto min-h-full w-full max-w-[1000px]">
                                {children}
                            </div>
                        </main>
                    </div>
                </AiAssistantProvider>
            </UserContext.Provider>
        );
    }

    return (
        <UserContext.Provider value={{ user, dispatch }}>
            <AiAssistantProvider>
                <div className="h-screen overflow-hidden bg-[#f7f7f2] text-slate-900">
                    <ClientLeftSidebar userId={user?.id ?? null} />
                    <ClientRightPanel />

                    <main className="scrollbar-soft h-screen overflow-y-auto px-4 pb-24 pt-4 lg:ml-[250px] lg:px-8 lg:pb-8 xl:mr-[300px]">
                        <div className="mx-auto min-h-full w-full max-w-[1000px]">
                            {children}
                        </div>
                    </main>
                </div>
                <AiAssistant />
            </AiAssistantProvider>
        </UserContext.Provider>
    );
}
