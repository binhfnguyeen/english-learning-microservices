package com.heulwen.userservice.service;

public interface EmailService {
    void sendOtpEmail(String to, String otp);
}
