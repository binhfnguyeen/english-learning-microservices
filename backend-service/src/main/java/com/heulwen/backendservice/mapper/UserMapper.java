package com.heulwen.backendservice.mapper;

import com.heulwen.backendservice.dto.UserDto;
import com.heulwen.backendservice.form.UserCreateForm;
import com.heulwen.backendservice.form.UserUpdateForm;
import com.heulwen.backendservice.model.User;

public class UserMapper {

    /**
     * CREATE
     * UserCreateForm -> User
     * Tương đương toUser(UserCreationRequest)
     */
    public static User map(UserCreateForm form) {
        if (form == null) {
            return null;
        }

        return User.builder()
                .firstName(form.getFirstName())
                .lastName(form.getLastName())
                .email(form.getEmail())
                .phone(form.getPhone())
                .username(form.getUsername())
                .password(form.getPassword())
                .avatar(form.getAvatar())
                .role(form.getRole())
                .isActive(true) // mặc định active
                .build();
    }

    /**
     * READ
     * User -> UserDto
     * Tương đương toUserResponse()
     */
    public static UserDto map(User user) {
        if (user == null) {
            return null;
        }

        return UserDto.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .username(user.getUsername())
                .isActive(user.getIsActive())
                .avatar(user.getAvatar())
                .role(user.getRole())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }

    /**
     * UPDATE
     * UserUpdateForm -> existing User
     * (MapStruct-style: chỉ update field được gửi)
     */
    public static void map(UserUpdateForm form, User user) {
        if (form == null || user == null) {
            return;
        }

        if (form.getFirstName() != null) {
            user.setFirstName(form.getFirstName());
        }
        if (form.getLastName() != null) {
            user.setLastName(form.getLastName());
        }
        if (form.getPhone() != null) {
            user.setPhone(form.getPhone());
        }
        if (form.getAvatar() != null) {
            user.setAvatar(form.getAvatar());
        }
        if (form.getIsActive() != null) {
            user.setIsActive(form.getIsActive());
        }
    }
}
