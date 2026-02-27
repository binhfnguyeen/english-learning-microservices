import axios from "axios";
import Cookies from "js-cookie";
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

const authApis = axios.create({
    baseURL: BASE_URL,
})

authApis.interceptors.request.use(
    (config)=>{
        if (typeof window !== "undefined"){
            const token = Cookies.get("accessToken");
            if (token){
                config.headers["Authorization"] = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default authApis;