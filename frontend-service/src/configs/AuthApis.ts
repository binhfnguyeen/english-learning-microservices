import axios from "axios";
import Cookies from "js-cookie";
import endpoints from "./Endpoints";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const authApis = axios.create({
    baseURL: BASE_URL,
})

authApis.interceptors.request.use(
    (config) => {
        if (typeof window !== "undefined") {
            const token = Cookies.get("accessToken");
            if (token) {
                config.headers["Authorization"] = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

authApis.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Nếu lỗi 401 (Unauthorized) và chưa từng thử refresh cho request này
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            const refreshToken = Cookies.get("refreshToken");

            if (refreshToken) {
                try {
                    // Gọi API refresh token
                    const response = await axios.post(`${BASE_URL}${endpoints.refresh}`, {
                        refreshToken: refreshToken
                    });

                    const { accessToken } = response.data;

                    // Lưu access token mới vào cookie
                    Cookies.set("accessToken", accessToken);

                    // Cập nhật header Authorization cho request gốc và thực hiện lại
                    originalRequest.headers["Authorization"] = `Bearer ${accessToken}`;
                    return authApis(originalRequest);
                } catch (refreshError) {
                    // Nếu refresh token cũng hết hạn hoặc lỗi, thực hiện logout
                    Cookies.remove("accessToken");
                    Cookies.remove("refreshToken");
                    if (typeof window !== "undefined") {
                        window.location.href = "/login";
                    }
                    return Promise.reject(refreshError);
                }
            }
        }

        return Promise.reject(error);
    }
);

export default authApis;