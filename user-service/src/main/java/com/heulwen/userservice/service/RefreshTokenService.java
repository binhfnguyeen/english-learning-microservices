package com.heulwen.userservice.service;

import com.heulwen.userservice.model.RefreshToken;

public interface RefreshTokenService {

    RefreshToken findByToken(String token);

    RefreshToken createRefreshToken(Long userId);

    RefreshToken verifyExpiration(RefreshToken token);

    void deleteByUserId(Long userId);

}
