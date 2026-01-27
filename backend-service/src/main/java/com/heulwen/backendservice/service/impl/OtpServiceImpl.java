package com.heulwen.backendservice.service.impl;

import com.heulwen.backendservice.exception.ResourceNotFoundException;
import com.heulwen.backendservice.model.OtpToken;
import com.heulwen.backendservice.model.User;
import com.heulwen.backendservice.repository.OtpTokenRepository;
import com.heulwen.backendservice.repository.UserRepository;
import com.heulwen.backendservice.service.EmailService;
import com.heulwen.backendservice.service.OtpService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
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
    PasswordEncoder passwordEncoder; // Inject Bean cấu hình chung thay vì new thủ công

    @Override
    @Transactional
    public void generateAndSendOtp(String email) {
        // Tìm user, ném lỗi nếu không tồn tại
        User user = userRepository.findByEmail(email);

        // Generate OTP
        String otp = generateRandomOtp();

        // Tạo OtpToken entity
        OtpToken otpToken = new OtpToken();
        otpToken.setOtpCode(otp);
        otpToken.setExpiryDate(LocalDateTime.now().plusMinutes(5));
        otpToken.setUser(user); // Set quan hệ User

        otpTokenRepository.save(otpToken);

        // Gửi email
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
