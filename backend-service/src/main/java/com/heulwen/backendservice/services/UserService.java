/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.heulwen.backendservice.services;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.heulwen.backendservice.dto.request.UserCreationRequest;
import com.heulwen.backendservice.dto.request.UserRequest;
import com.heulwen.backendservice.dto.response.UserResponse;
import com.heulwen.backendservice.exceptions.AppException;
import com.heulwen.backendservice.exceptions.ErrorCode;
import com.heulwen.backendservice.mapper.UserMapper;
import com.heulwen.backendservice.model.Role;
import com.heulwen.backendservice.model.User;
import com.heulwen.backendservice.repositories.UserRepository;
import java.io.IOException;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.logging.Level;
import java.util.logging.Logger;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

/**
 *
 * @author Dell
 */
@Service
@RequiredArgsConstructor // Thay the autowire
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class UserService implements UserDetailsService {

    UserRepository userRepository;
    UserMapper userMapper;
    PasswordEncoder passwordEncoder;
    Cloudinary cloudinary;

    public UserResponse createUser(UserCreationRequest request, MultipartFile avatar) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new AppException(ErrorCode.USER_EXISTED);
        }

        User user = userMapper.toUser(request);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setIsActive(Boolean.TRUE);
        user.setRole(Role.USER.name());

        if (!avatar.isEmpty()) {
            try {
                Map res = cloudinary.uploader().upload(avatar.getBytes(), ObjectUtils.asMap("resource_type", "auto"));
                user.setAvatar(res.get("secure_url").toString());
            } catch (IOException ex) {
                Logger.getLogger(UserService.class.getName()).log(Level.SEVERE, null, ex);
            }
        }

        User saved = userRepository.save(user);
        return userMapper.toUserResponse(saved);
    }
    
    public void deleteAdmin(int id){
        User u = userRepository.findById(id).orElseThrow(()->new AppException(ErrorCode.USER_NOT_EXISTED));
        userRepository.delete(u);
    }

    public UserResponse createAdmin(UserCreationRequest request, MultipartFile avatar) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new AppException(ErrorCode.USER_EXISTED);
        }

        User user = userMapper.toUser(request);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setIsActive(Boolean.TRUE);
        user.setRole(Role.ADMIN.name());

        if (!avatar.isEmpty()) {
            try {
                Map res = cloudinary.uploader().upload(avatar.getBytes(), ObjectUtils.asMap("resource_type", "auto"));
                user.setAvatar(res.get("secure_url").toString());
            } catch (IOException ex) {
                Logger.getLogger(UserService.class.getName()).log(Level.SEVERE, null, ex);
            }
        }

        User saved = userRepository.save(user);
        return userMapper.toUserResponse(saved);
    }

    public List<UserResponse> getUsersAdmin(String role) {
        return userRepository.findByRole(role).stream().map(userMapper::toUserResponse).toList();
    }

    public List<UserResponse> getUsers() {
        return userRepository.findAll().stream().map(userMapper::toUserResponse).toList();
    }

    public User getUserByUsername(String username) {
        return this.userRepository.getUserByUsername(username);
    }

    public User updateUser(Integer userId, UserRequest request, MultipartFile avatar) {
        User u = userRepository.findById(userId).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        if (request.getEmail() != null) {
            u.setEmail(request.getEmail());
        }

        if (request.getPhone() != null) {
            u.setPhone(request.getPhone());
        }

        if (request.getFirstName() != null) {
            u.setFirstName(request.getFirstName());
        }

        if (request.getLastName() != null) {
            u.setLastName(request.getLastName());
        }

        if (avatar != null && !avatar.isEmpty()) {
            try {
                Map res = cloudinary.uploader().upload(avatar.getBytes(), ObjectUtils.asMap("resource_type", "auto"));
                u.setAvatar(res.get("secure_url").toString());
            } catch (IOException ex) {
                Logger.getLogger(UserService.class.getName()).log(Level.SEVERE, null, ex);
            }
        }

        return userRepository.save(u);
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User u = this.getUserByUsername(username);
        if (u == null) {
            throw new UsernameNotFoundException("Invalid username!");
        }
        Set<GrantedAuthority> authorities = new HashSet<>();
        authorities.add(new SimpleGrantedAuthority(u.getRole()));
        return new org.springframework.security.core.userdetails.User(
                u.getUsername(), u.getPassword(), authorities);
    }
}
