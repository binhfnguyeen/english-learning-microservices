package com.heulwen.backendservice.service.impl;

import com.heulwen.backendservice.dto.UserDto;
import com.heulwen.backendservice.exception.ResourceNotFoundException;
import com.heulwen.backendservice.form.UserCreateForm;
import com.heulwen.backendservice.form.UserUpdateForm;
import com.heulwen.backendservice.mapper.UserMapper;
import com.heulwen.backendservice.model.User;
import com.heulwen.backendservice.repository.UserRepository;
import com.heulwen.backendservice.service.UserService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.ObjectUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class UserServiceImpl implements UserService {

    UserRepository userRepository;
    UserMapper userMapper;
    PasswordEncoder passwordEncoder;
    Cloudinary cloudinary;

    @Override
    public UserDto createUser(UserCreateForm form, MultipartFile avatar) {
        if (userRepository.existsByUsername(form.getUsername())) {
            throw new RuntimeException("User existed"); // Hoặc dùng Custom Exception
        }

        User user = userMapper.map(form);
        user.setPassword(passwordEncoder.encode(form.getPassword()));
        user.setIsActive(true);
        user.setRole("USER");

        uploadAvatarIfExists(user, avatar);

        return userMapper.map(userRepository.save(user));
    }

    @Override
    public UserDto createAdmin(UserCreateForm form, MultipartFile avatar) {
        if (userRepository.existsByUsername(form.getUsername())) {
            throw new RuntimeException("User existed");
        }

        User user = userMapper.map(form);
        user.setPassword(passwordEncoder.encode(form.getPassword()));
        user.setIsActive(true);
        user.setRole("ADMIN");

        uploadAvatarIfExists(user, avatar);

        return userMapper.map(userRepository.save(user));
    }

    @Override
    public UserDto updateUser(Integer userId, UserUpdateForm form, MultipartFile avatar) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        userMapper.map(form, user); // Overload map để update entity
        uploadAvatarIfExists(user, avatar);

        return userMapper.map(userRepository.save(user));
    }

    @Override
    public void deleteAdmin(int id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        userRepository.delete(user);
    }

    @Override
    public List<UserDto> getUsersAdmin(String role) {
        return userRepository.findByRole(role).stream()
                .map(userMapper::map)
                .toList();
    }

    @Override
    public List<UserDto> getUsers() {
        return userRepository.findAll().stream()
                .map(userMapper::map)
                .toList();
    }

    @Override
    public User getUserByUsername(String username) {
        return userRepository.findByUsername(username).orElse(null);
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Invalid username!"));

        return new org.springframework.security.core.userdetails.User(
                user.getUsername(),
                user.getPassword(),
                Collections.singletonList(new SimpleGrantedAuthority(user.getRole()))
        );
    }

    private void uploadAvatarIfExists(User user, MultipartFile avatar) {
        if (avatar != null && !avatar.isEmpty()) {
            try {
                Map res = cloudinary.uploader().upload(avatar.getBytes(), ObjectUtils.asMap("resource_type", "auto"));
                user.setAvatar(res.get("secure_url").toString());
            } catch (IOException ex) {
                log.error("Cloudinary upload failed", ex);
            }
        }
    }
}
