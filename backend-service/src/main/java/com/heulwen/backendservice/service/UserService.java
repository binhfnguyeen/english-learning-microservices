package com.heulwen.backendservice.service;

import com.heulwen.backendservice.dto.UserDto;
import com.heulwen.backendservice.form.UserCreateForm;
import com.heulwen.backendservice.form.UserUpdateForm;

import java.util.List;

public interface UserService {
    UserDto createUser(UserCreateForm form);
    UserDto updateUser(Long id, UserUpdateForm form);
    UserDto getUserById(Long id);
    List<UserDto> getAllUsers();
    void deleteUser(Long id);
    boolean existsByUsername(String username);
}
