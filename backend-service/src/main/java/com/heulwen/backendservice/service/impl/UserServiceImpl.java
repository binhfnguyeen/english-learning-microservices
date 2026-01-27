package com.heulwen.backendservice.service.impl;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
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
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class UserServiceImpl implements UserService {

    UserRepository userRepository;
    PasswordEncoder passwordEncoder;
    Cloudinary cloudinary;

    @Override
    @Transactional
    public UserDto createUser(UserCreateForm form, MultipartFile avatar) {
        if (userRepository.existsByUsername(form.getUsername())) {
            throw new RuntimeException("User existed"); // Hoặc Custom Exception
        }

        // 1. Map Form -> Entity
        User user = UserMapper.map(form);

        // 2. Set các giá trị mặc định/bảo mật
        user.setPassword(passwordEncoder.encode(form.getPassword()));
        user.setIsActive(true);
        user.setRole("USER"); // Model User đang dùng String cho Role

        // 3. Upload Avatar
        uploadAvatarIfExists(user, avatar);

        // 4. Save & Map to DTO
        return UserMapper.map(userRepository.save(user));
    }

    @Override
    @Transactional
    public UserDto createAdmin(UserCreateForm form, MultipartFile avatar) {
        if (userRepository.existsByUsername(form.getUsername())) {
            throw new RuntimeException("User existed");
        }

        User user = UserMapper.map(form);
        user.setPassword(passwordEncoder.encode(form.getPassword()));
        user.setIsActive(true);
        user.setRole("ADMIN");

        uploadAvatarIfExists(user, avatar);

        return UserMapper.map(userRepository.save(user));
    }

    @Override
    @Transactional
    public UserDto updateUser(Long userId, UserUpdateForm form, MultipartFile avatar) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found id: " + userId));

        // Update thông tin từ Form vào User hiện tại
        UserMapper.map(form, user);

        uploadAvatarIfExists(user, avatar);

        return UserMapper.map(userRepository.save(user));
    }

    @Override
    @Transactional
    public void deleteAdmin(Long id) {
        if (!userRepository.existsById(id)) {
            throw new ResourceNotFoundException("User not found id: " + id);
        }
        userRepository.deleteById(id);
    }

    @Override
    public List<UserDto> getUsersAdmin(String role) {
        // Repository cần hàm findByRole(String role)
        return userRepository.findByRole(role).stream()
                .map(UserMapper::map)
                .toList();
    }

    @Override
    public List<UserDto> getUsers() {
        return userRepository.findAll().stream()
                .map(UserMapper::map)
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

    /**
     * Helper method upload ảnh
     */
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
