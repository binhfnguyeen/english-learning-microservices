"use client";

import Image from "next/image";
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
    const [editing, setEditing] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleAvatarChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        if (e.target.files?.[0]) {
            setAvatar(e.target.files[0]);
        }
    };

    const handleCancel = () => {
        setEditing(false);

        setFormData({
            firstName: user?.firstName || "",
            lastName: user?.lastName || "",
            email: user?.email || "",
            phone: user?.phone || "",
        });

        setAvatar(null);
    };

    const handleSubmit = async (
        e: React.FormEvent<HTMLFormElement>
    ) => {
        e.preventDefault();

        if (!user?.id) return;

        const confirmUpdate = window.confirm(
            "Bạn có chắc muốn cập nhật thông tin cá nhân?"
        );

        if (!confirmUpdate) return;

        const data = new FormData();

        data.append("firstName", formData.firstName);
        data.append("lastName", formData.lastName);
        data.append("email", formData.email);
        data.append("phone", formData.phone);

        if (avatar) {
            data.append("avatar", avatar);
        }

        try {
            setLoading(true);

            await authApis.post(
                endpoints["updateProfile"](user.id),
                data,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            alert("Cập nhật thành công!");
            setEditing(false);
        } catch (err) {
            console.error(err);
            alert("Có lỗi xảy ra khi cập nhật.");
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return (
            <div className="container py-5">
                <div className="alert alert-danger">
                    Không tìm thấy thông tin người dùng.
                </div>
            </div>
        );
    }

    return (
        <div
            className="container py-4"
            style={{
                maxWidth: "1050px",
            }}
        >
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold mb-1">
                        Hồ sơ cá nhân
                    </h2>

                    <p className="text-muted mb-0">
                        Quản lý thông tin tài khoản
                    </p>
                </div>

                {!editing ? (
                    <button
                        type="button"
                        className="btn btn-primary fw-bold px-4"
                        style={{
                            borderRadius: "14px",
                        }}
                        onClick={() => setEditing(true)}
                    >
                        Chỉnh sửa hồ sơ
                    </button>
                ) : (
                    <button
                        type="button"
                        className="btn btn-outline-secondary fw-bold px-4"
                        style={{
                            borderRadius: "14px",
                        }}
                        onClick={handleCancel}
                    >
                        Hủy
                    </button>
                )}
            </div>

            {/* Card */}
            <div
                className="bg-white"
                style={{
                    borderRadius: "24px",
                    padding: "32px",
                    boxShadow:
                        "0 8px 30px rgba(0,0,0,0.06)",
                }}
            >
                <form onSubmit={handleSubmit}>
                    <div className="row align-items-start">
                        {/* Avatar */}
                        <div className="col-lg-4 border-end">
                            <div className="text-center">
                                <Image
                                    src={
                                        avatar
                                            ? URL.createObjectURL(
                                                  avatar
                                              )
                                            : user.avatar ||
                                              "/default-avatar.png"
                                    }
                                    alt="Avatar"
                                    width={180}
                                    height={180}
                                    className="rounded-circle"
                                    style={{
                                        width: "180px",
                                        height: "180px",
                                        objectFit: "cover",
                                        border:
                                            "5px solid white",
                                        boxShadow:
                                            "0 12px 30px rgba(0,0,0,.15)",
                                    }}
                                    unoptimized
                                />

                                <h4 className="fw-bold mt-4 mb-1">
                                    {user.firstName}{" "}
                                    {user.lastName}
                                </h4>

                                <p className="text-muted">
                                    Thành viên EngLearn
                                </p>

                                {editing && (
                                    <div className="mt-3">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="form-control"
                                            onChange={
                                                handleAvatarChange
                                            }
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Information */}
                        <div className="col-lg-8 ps-lg-5 mt-4 mt-lg-0">
                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <label className="form-label fw-bold">
                                        Họ
                                    </label>

                                    <input
                                        type="text"
                                        name="firstName"
                                        value={
                                            formData.firstName
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        disabled={!editing}
                                        className="form-control"
                                        style={{
                                            minHeight: "50px",
                                            borderRadius:
                                                "12px",
                                            backgroundColor:
                                                editing
                                                    ? "#fff"
                                                    : "#f8fafc",
                                        }}
                                    />
                                </div>

                                <div className="col-md-6 mb-3">
                                    <label className="form-label fw-bold">
                                        Tên
                                    </label>

                                    <input
                                        type="text"
                                        name="lastName"
                                        value={
                                            formData.lastName
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        disabled={!editing}
                                        className="form-control"
                                        style={{
                                            minHeight: "50px",
                                            borderRadius:
                                                "12px",
                                            backgroundColor:
                                                editing
                                                    ? "#fff"
                                                    : "#f8fafc",
                                        }}
                                    />
                                </div>
                            </div>

                            <div className="mb-3">
                                <label className="form-label fw-bold">
                                    Email
                                </label>

                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    disabled={!editing}
                                    className="form-control"
                                    style={{
                                        minHeight: "50px",
                                        borderRadius:
                                            "12px",
                                        backgroundColor:
                                            editing
                                                ? "#fff"
                                                : "#f8fafc",
                                    }}
                                />
                            </div>

                            <div className="mb-4">
                                <label className="form-label fw-bold">
                                    Số điện thoại
                                </label>

                                <input
                                    type="text"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    disabled={!editing}
                                    className="form-control"
                                    style={{
                                        minHeight: "50px",
                                        borderRadius:
                                            "12px",
                                        backgroundColor:
                                            editing
                                                ? "#fff"
                                                : "#f8fafc",
                                    }}
                                />
                            </div>

                            {editing && (
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="btn btn-primary px-5 py-3 fw-bold"
                                    style={{
                                        borderRadius:
                                            "14px",
                                    }}
                                >
                                    {loading
                                        ? "Đang cập nhật..."
                                        : "Lưu thay đổi"}
                                </button>
                            )}
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}