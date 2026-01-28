package com.heulwen.userservice.controller;

import com.heulwen.userservice.dto.ApiDto;
import com.heulwen.userservice.dto.AuthenticateDto;
import com.heulwen.userservice.dto.UserDto;
import com.heulwen.userservice.form.AuthenticateForm;
import com.heulwen.userservice.mapper.UserMapper;
import com.heulwen.userservice.model.User;
import com.heulwen.userservice.service.AuthenticateService;
import com.heulwen.userservice.service.OtpService;
import com.heulwen.userservice.service.UserService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class AuthenticationController {
    AuthenticateService authenticateService;
    UserService userService;
    OtpService otpService;

    // --- LOGIN ---
    @PostMapping("/login")
    public ApiDto<AuthenticateDto> login(@RequestBody AuthenticateForm request) {
        AuthenticateDto result = authenticateService.authenticate(request);

        return ApiDto.<AuthenticateDto>builder()
                .code(1000)
                .result(result)
                .build();
    }

    // --- GET PROFILE ---
    @GetMapping("/secure/profile")
    public ApiDto<UserDto> getProfile(Principal principal) {
        if (principal == null) {
            throw new RuntimeException("Unauthorized");
        }

        User user = userService.getUserByUsername(principal.getName());

        return ApiDto.<UserDto>builder()
                .code(1000)
                .result(UserMapper.map(user))
                .build();
    }

    // --- FORGOT PASSWORD (SEND OTP) ---
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestParam("email") String email) {
        otpService.generateAndSendOtp(email);
        return ResponseEntity.ok(Map.of("message", "OTP đã được gửi"));
    }

    // --- RESET PASSWORD ---
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(
            @RequestParam("email") String email,
            @RequestParam("otp") String otp,
            @RequestParam("newPassword") String newPassword
    ) {
        otpService.verifyOtpAndResetPassword(email, otp, newPassword);
        return ResponseEntity.ok(Map.of("message", "Đổi mật khẩu thành công"));
    }
}
