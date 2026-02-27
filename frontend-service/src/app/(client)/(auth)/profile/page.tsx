"use client";

import authApis from "@/configs/AuthApis";
import endpoints from "@/configs/Endpoints";
import UserContext from "@/configs/UserContext";
import { useContext, useState } from "react";

export default function UpdateProfile() {
    const context = useContext(UserContext);
    const user = context?.user;

    const [formData, setFormData] = useState({
        firstName: user?.firstName || "",
        lastName: user?.lastName || "",
        email: user?.email || "",
        phone: user?.phone || "",
    });

    const [avatar, setAvatar] = useState<File | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setAvatar(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?.id) return;

        const data = new FormData();
        data.append("firstName", formData.firstName);
        data.append("lastName", formData.lastName);
        data.append("email", formData.email);
        data.append("phone", formData.phone);
        if (avatar) data.append("avatar", avatar);

        try {
            await authApis.post(endpoints["updateProfile"](user.id), data, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            alert("Cập nhật thành công!");
        } catch (err) {
            console.error(err);
            alert("Có lỗi xảy ra khi cập nhật.");
        }
    };

    return (
        <div className="container mt-5">
            <div className="card shadow-lg border-0 rounded-3">
                <div className="card-header bg-primary text-white text-center py-3 rounded-top">
                    <h3 className="mb-0">Thông tin cá nhân</h3>
                </div>

                <div className="card-body p-4">
                    {!context ? (
                        <p className="text-center text-danger">
                            Không tìm thấy context người dùng.
                        </p>
                    ) : (
                        <>
                            <div className="text-center mb-4">
                                <img
                                    src={
                                        avatar
                                            ? URL.createObjectURL(avatar)
                                            : user?.avatar || "/default-avatar.png"
                                    }
                                    alt="Avatar"
                                    className="rounded-circle border shadow-sm"
                                    style={{
                                        width: "120px",
                                        height: "120px",
                                        objectFit: "cover",
                                    }}
                                />
                                <div className="mt-3 d-flex justify-content-center">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="form-control w-50"
                                        onChange={handleAvatarChange}
                                    />
                                </div>
                            </div>

                            <form onSubmit={handleSubmit}>
                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label fw-bold">Họ</label>
                                        <input
                                            type="text"
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleChange}
                                            className="form-control"
                                        />
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <label className="form-label fw-bold">Tên</label>
                                        <input
                                            type="text"
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleChange}
                                            className="form-control"
                                        />
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label fw-bold">Email</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="form-control"
                                        />
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <label className="form-label fw-bold">Số điện thoại</label>
                                        <input
                                            type="text"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            className="form-control"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="btn btn-primary w-100 mt-3 py-2 fw-bold shadow-sm"
                                    style={{ transition: "0.3s" }}
                                >
                                    Cập nhật
                                </button>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
