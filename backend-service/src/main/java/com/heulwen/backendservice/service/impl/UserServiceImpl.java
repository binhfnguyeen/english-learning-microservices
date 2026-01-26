package com.heulwen.backendservice.service.impl;

import com.heulwen.backendservice.dto.UserDto;
import com.heulwen.backendservice.exception.ResourceNotFoundException;
import com.heulwen.backendservice.form.UserCreateForm;
import com.heulwen.backendservice.form.UserUpdateForm;
import com.heulwen.backendservice.mapper.UserMapper;
import com.heulwen.backendservice.model.User;
import com.heulwen.backendservice.repository.UserRepository;
import com.heulwen.backendservice.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder; // Cần cấu hình Bean này trong SecurityConfig

    @Override
    public UserDto createUser(UserCreateForm form) {
        if (userRepository.existsByUsername(form.getUsername())) {
            throw new RuntimeException("Username already exists");
        }

        User user = UserMapper.map(form);
        user.setPassword(passwordEncoder.encode(form.getPassword())); // Mã hóa password

        user = userRepository.save(user);
        return UserMapper.map(user);
    }

    @Override
    public UserDto updateUser(Long id, UserUpdateForm form) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        UserMapper.map(form, user);
        user = userRepository.save(user);
        return UserMapper.map(user);
    }

    @Override
    @Transactional(readOnly = true)
    public UserDto getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        return UserMapper.map(user);
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(UserMapper::map)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new ResourceNotFoundException("User not found with id: " + id);
        }
        userRepository.deleteById(id);
    }

    @Override
    public boolean existsByUsername(String username) {
        return userRepository.existsByUsername(username);
    }
}
