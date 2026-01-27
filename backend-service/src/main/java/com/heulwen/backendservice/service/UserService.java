package com.heulwen.backendservice.service;

import com.heulwen.backendservice.dto.UserDto;
import com.heulwen.backendservice.form.UserCreateForm;
import com.heulwen.backendservice.form.UserUpdateForm;
import com.heulwen.backendservice.model.User;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface UserService extends UserDetailsService {
    UserDto createUser(UserCreateForm form, MultipartFile avatar);
    UserDto createAdmin(UserCreateForm form, MultipartFile avatar);
    UserDto updateUser(Integer userId, UserUpdateForm form, MultipartFile avatar);
    void deleteAdmin(int id);
    List<UserDto> getUsersAdmin(String role);
    List<UserDto> getUsers();
    User getUserByUsername(String username);
}
