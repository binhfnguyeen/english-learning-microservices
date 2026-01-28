package com.heulwen.userservice.service.impl;

import com.heulwen.userservice.model.OtpToken;
import com.heulwen.userservice.model.User;
import com.heulwen.userservice.repository.OtpTokenRepository;
import com.heulwen.userservice.repository.UserRepository;
import com.heulwen.userservice.service.EmailService;
import com.heulwen.userservice.service.OtpService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class OtpServiceImpl implements OtpService {

    OtpTokenRepository otpTokenRepository;
    UserRepository userRepository;
    EmailService emailService;
    PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void generateAndSendOtp(String email) {
        User user = userRepository.findByEmail(email);
        String otp = generateRandomOtp();
        OtpToken otpToken = new OtpToken();
        otpToken.setOtpCode(otp);
        otpToken.setExpiryDate(LocalDateTime.now().plusMinutes(5));
        otpToken.setUser(user);
        otpTokenRepository.save(otpToken);
        emailService.sendOtpEmail(user.getEmail(), otp);
    }

    @Override
    @Transactional
    public void verifyOtpAndResetPassword(String email, String otp, String newPassword) {
        // 1. Tìm User
        User user = userRepository.findByEmail(email);

        // 2. Tìm Token dựa trên User và Code
        OtpToken otpToken = otpTokenRepository.findByUserAndOtpCode(user, otp)
                .orElseThrow(() -> new RuntimeException("Invalid OTP")); // Hoặc Custom Exception: InvalidOtpException

        // 3. Kiểm tra hạn
        if (otpToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("OTP has expired"); // Hoặc Custom Exception
        }

        // 4. Đổi mật khẩu
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        // 5. Xóa OTP đã dùng
        otpTokenRepository.delete(otpToken);
    }

    // Helper tạo OTP ngẫu nhiên
    private String generateRandomOtp() {
        SecureRandom random = new SecureRandom();
        int otp = 100000 + random.nextInt(900000);
        return String.valueOf(otp);
    }
}
