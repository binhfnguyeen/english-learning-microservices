package com.heulwen.backendservice.mapper;

import com.heulwen.backendservice.dto.UserDto;
import com.heulwen.backendservice.form.UserCreateForm;
import com.heulwen.backendservice.form.UserUpdateForm;
import com.heulwen.backendservice.model.User;

public class UserMapper {

    public static User map(UserCreateForm form) {
        var user = new User();
        user.setFirstName(form.getFirstName());
        user.setLastName(form.getLastName());
        user.setEmail(form.getEmail());
        user.setPhone(form.getPhone());
        user.setUsername(form.getUsername());
        user.setPassword(form.getPassword());
        user.setRole(form.getRole());
        user.setIsActive(true);
        return user;
    }

    public static UserDto map(User user) {
        var dto = new UserDto();
        dto.setId(user.getId());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setEmail(user.getEmail());
        dto.setPhone(user.getPhone());
        dto.setUsername(user.getUsername());
        dto.setIsActive(user.getIsActive());
        dto.setAvatar(user.getAvatar());
        dto.setRole(user.getRole());
        dto.setCreatedAt(user.getCreatedAt());
        dto.setUpdatedAt(user.getUpdatedAt());
        return dto;
    }

    public static void map(UserUpdateForm form, User user) {
        user.setFirstName(form.getFirstName());
        user.setLastName(form.getLastName());
        user.setPhone(form.getPhone());
        if (form.getIsActive() != null) {
            user.setIsActive(form.getIsActive());
        }
    }
}