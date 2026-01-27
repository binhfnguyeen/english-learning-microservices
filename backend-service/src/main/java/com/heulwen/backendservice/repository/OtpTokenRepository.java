package com.heulwen.backendservice.repository;

import com.heulwen.backendservice.model.OtpToken;
import com.heulwen.backendservice.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OtpTokenRepository extends JpaRepository<OtpToken, Long>{
    Optional<OtpToken> findByUserAndOtpCode(User user, String otpCode);
}
