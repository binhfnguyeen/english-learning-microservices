/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.heulwen.backendservice.controllers;

import com.heulwen.backendservice.dto.request.AuthenticationRequest;
import com.heulwen.backendservice.dto.response.ApiResponse;
import com.heulwen.backendservice.dto.response.AuthenticationResponse;
import com.heulwen.backendservice.dto.response.UserResponse;
import com.heulwen.backendservice.mapper.UserMapper;
import com.heulwen.backendservice.model.User;
import com.heulwen.backendservice.services.AuthenticationService;
import com.heulwen.backendservice.services.OtpService;
import com.heulwen.backendservice.services.UserService;
import java.security.Principal;
import java.util.Map;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

/**
 *
 * @author Dell
 */
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class ApiAuthenticationController {

    AuthenticationService authenticationService;
    UserService userDetailsService;
    UserMapper userMapper;
    OtpService otpService;

    @PostMapping("/login")
    public ApiResponse<AuthenticationResponse> login(@RequestBody AuthenticationRequest request) {
        var result = authenticationService.authenticate(request);
        return ApiResponse.<AuthenticationResponse>builder()
                .code(1000)
                .result(result)
                .build();
    }

    @PostMapping("/secure/profile")
    @ResponseBody
    @CrossOrigin
    public ApiResponse<UserResponse> getProfile(Principal principal) {
        User user = this.userDetailsService.getUserByUsername(principal.getName());
        UserResponse response = userMapper.toUserResponse(user);

        return ApiResponse.<UserResponse>builder()
                .code(1000)
                .result(response)
                .build();
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        otpService.generateAndSendOtp(email);
        return ResponseEntity.ok("OTP đã được gửi");
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String otp = request.get("otp");
        String newPassword = request.get("newPassword");
        otpService.verifyOtpAndResetPassword(email, otp, newPassword);
        return ResponseEntity.ok("Đổi mật khẩu thành công");
    }
}
