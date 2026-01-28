package com.heulwen.userservice.service;

public interface OtpService {
    void generateAndSendOtp(String email);
    void verifyOtpAndResetPassword(String email, String otp, String newPassword);
}
