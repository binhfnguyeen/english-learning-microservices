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
    const [loading, setLoading] = useState(false);

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

        // ===== CONFIRM TRƯỚC KHI CẬP NHẬT =====
        const confirmUpdate = window.confirm(
            "Bạn có chắc muốn cập nhật thông tin cá nhân?"
        );
        if (!confirmUpdate) return;

        const data = new FormData();
        data.append("firstName", formData.firstName);
        data.append("lastName", formData.lastName);
        data.append("email", formData.email);
        data.append("phone", formData.phone);
        if (avatar) data.append("avatar", avatar);

        try {
            setLoading(true);

            await authApis.post(endpoints["updateProfile"](user.id), data, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            alert("Cập nhật thành công!");
        } catch (err) {
            console.error(err);
            alert("Có lỗi xảy ra khi cập nhật.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-5" style={{ maxWidth: 600 }}>
            <div
                className="card border-0"
                style={{
                    borderRadius: 16,
                    boxShadow: "0 10px 28px rgba(0,0,0,0.08)",
                    background: "linear-gradient(135deg,#ffffff,#f8fafc)"
                }}
            >
                <div className="text-center pt-4">
                    <h4 className="fw-bold">Cập nhật thông tin</h4>
                    <div className="text-muted small">Quản lý hồ sơ cá nhân</div>
                </div>

                <div className="card-body p-4">
                    {!context ? (
                        <p className="text-center text-danger">
                            Không tìm thấy thông tin người dùng.
                        </p>
                    ) : (
                        <>
                            {/* Avatar */}
                            <div className="text-center mb-4">
                                <img
                                    src={
                                        avatar
                                            ? URL.createObjectURL(avatar)
                                            : user?.avatar || "/default-avatar.png"
                                    }
                                    alt="Avatar"
                                    className="rounded-circle"
                                    style={{
                                        width: 120,
                                        height: 120,
                                        objectFit: "cover",
                                        border: "4px solid #fff",
                                        boxShadow: "0 6px 16px rgba(0,0,0,0.1)"
                                    }}
                                />

                                <input
                                    type="file"
                                    accept="image/*"
                                    className="form-control mt-3"
                                    onChange={handleAvatarChange}
                                />
                            </div>

                            <form onSubmit={handleSubmit}>
                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label fw-semibold">Họ</label>
                                        <input
                                            type="text"
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleChange}
                                            className="form-control"
                                        />
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <label className="form-label fw-semibold">Tên</label>
                                        <input
                                            type="text"
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleChange}
                                            className="form-control"
                                        />
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label fw-semibold">Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="form-control"
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label fw-semibold">Số điện thoại</label>
                                    <input
                                        type="text"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="form-control"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="btn btn-primary w-100 py-2 fw-bold"
                                    style={{
                                        borderRadius: 10,
                                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                                    }}
                                >
                                    {loading ? "Đang cập nhật..." : "Lưu thay đổi"}
                                </button>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}