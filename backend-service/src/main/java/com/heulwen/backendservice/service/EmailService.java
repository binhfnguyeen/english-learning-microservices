package com.heulwen.backendservice.service;

public interface EmailService {
    void sendOtpEmail(String to, String otp);
}
