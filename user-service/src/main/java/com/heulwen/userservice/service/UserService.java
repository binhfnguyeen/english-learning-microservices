package com.heulwen.userservice.service;

import com.heulwen.userservice.dto.UserDto;
import com.heulwen.userservice.form.UserCreateForm;
import com.heulwen.userservice.form.UserUpdateForm;
import com.heulwen.userservice.model.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface UserService extends UserDetailsService {
    UserDto createUser(UserCreateForm form, MultipartFile avatar);
    UserDto createAdmin(UserCreateForm form, MultipartFile avatar);
    UserDto updateUser(Long userId, UserUpdateForm form, MultipartFile avatar);
    void deleteAdmin(Long id);
    List<UserDto> getUsersAdmin(String role);
    List<UserDto> getUsers();
    User getUserByUsername(String username);
}
