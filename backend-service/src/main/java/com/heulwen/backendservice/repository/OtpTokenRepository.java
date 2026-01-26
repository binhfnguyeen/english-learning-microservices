package com.heulwen.backendservice.repository;

import com.heulwen.backendservice.model.OtpToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OtpTokenRepository extends JpaRepository<OtpToken, Long> {
    Optional<OtpToken> findByOtpCode(String otpCode);
    Optional<OtpToken> findFirstByUserIdOrderByCreatedAtDesc(Long userId);
}
