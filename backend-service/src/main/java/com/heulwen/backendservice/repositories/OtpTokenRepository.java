/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Interface.java to edit this template
 */
package com.heulwen.backendservice.repositories;

import com.heulwen.backendservice.model.OtpToken;
import com.heulwen.backendservice.model.User;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 *
 * @author Dell
 */
@Repository
public interface OtpTokenRepository extends JpaRepository<OtpToken, Integer>{
    Optional<OtpToken> findByUserIdAndOtpCode(User user, String otpCode);
}
