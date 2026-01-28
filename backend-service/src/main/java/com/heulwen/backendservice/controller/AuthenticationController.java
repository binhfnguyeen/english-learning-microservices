package com.heulwen.backendservice.controller;

import com.heulwen.backendservice.dto.ApiDto;
import com.heulwen.backendservice.dto.AuthenticateDto;
import com.heulwen.backendservice.dto.UserDto;
import com.heulwen.backendservice.form.AuthenticateForm;
import com.heulwen.backendservice.mapper.UserMapper;
import com.heulwen.backendservice.model.User;
import com.heulwen.backendservice.service.AuthenticateService;
import com.heulwen.backendservice.service.OtpService;
import com.heulwen.backendservice.service.UserService;
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
