"use client"
import SidebarLayout from "@/components/Sidebar/SidebarLayout";
import Footer from "@/components/Footer";
import Cookies from "js-cookie";
import { useEffect, useReducer } from "react";
import MyUserReducer from "@/reducers/MyUserReducer";
import authApis from "@/configs/AuthApis";
import endpoints from "@/configs/Endpoints";
import UserContext from "@/configs/UserContext";
import AiAssistant from "@/components/AiAssistant";

export default function ClientRootLayout({ children }: { children: React.ReactNode }) {
    const [user, dispatch] = useReducer(MyUserReducer, null);

    useEffect(() => {
        const loadUser = async () => {
            const token = Cookies.get("accessToken");
            if (token) {
                try {
                    const res = await authApis.post(endpoints['profile']);
                    dispatch({
                        type: "login",
                        payload: res.data.result
                    })
                } catch (err) {
                    console.error("Không thể load user từ token ", err);
                    Cookies.remove("accessToken");
                }
            }
        }

        loadUser();
    }, [])

    return (
        <UserContext.Provider value={{ user, dispatch }}>
            <SidebarLayout>
                {children}
            </SidebarLayout>
            <AiAssistant />
            <Footer />
        </UserContext.Provider>
    );
}