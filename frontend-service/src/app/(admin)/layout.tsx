"use client"
import React, { useEffect, useReducer } from "react";
import AdminSidebarLayout from "@/components/Sidebar/AdminSidebarLayout";
import Footer from "@/components/Footer";
import MyUserReducer from "@/reducers/MyUserReducer";
import UserContext from "@/configs/UserContext";
import Cookies from "js-cookie";
import authApis from "@/configs/AuthApis";
import endpoints from "@/configs/Endpoints";

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
    const [user, dispatch] = useReducer(MyUserReducer, null);

    useEffect(()=>{
        const loadUser = async () => {
            const token = Cookies.get("accessToken");
            if (token){
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
        <UserContext.Provider value={{user, dispatch}}>
            <AdminSidebarLayout>
                {children}
            </AdminSidebarLayout>
            <Footer/>
        </UserContext.Provider>
    );
}