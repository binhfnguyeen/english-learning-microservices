package com.heulwen.userservice.service.impl;

import com.heulwen.userservice.dto.AuthenticateDto;
import com.heulwen.userservice.exception.AppException;
import com.heulwen.userservice.exception.ErrorCode;
import com.heulwen.userservice.exception.ResourceNotFoundException;
import com.heulwen.userservice.form.AuthenticateForm;
import com.heulwen.userservice.model.RefreshToken;
import com.heulwen.userservice.model.User;
import com.heulwen.userservice.repository.UserRepository;
import com.heulwen.userservice.service.AuthenticateService;
import com.heulwen.userservice.service.RefreshTokenService;
import com.nimbusds.jose.*;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jwt.JWTClaimsSet;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthenticateServiceImpl implements AuthenticateService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final RefreshTokenService refreshTokenService;

    @Value("${spring.jwt.signerkey}")
    protected String SIGNER_KEY;

    @Value("${spring.jwt.access-token-expiration-ms}")
    private long accessTokenExpirationMs;

    @Override
    public AuthenticateDto authenticate(AuthenticateForm form) {

        User user = userRepository.findByUsername(form.getUsername())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        boolean authenticated =
                passwordEncoder.matches(form.getPassword(), user.getPassword());

        if (!authenticated) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }

        String accessToken = generateToken(user);

        RefreshToken refreshToken =
                refreshTokenService.createRefreshToken(user.getId());

        return AuthenticateDto.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken.getToken())
                .authenticated(true)
                .tokenType("Bearer")
                .build();
    }

    @Override
    public String generateAccessTokenForRefresh(User user) {
        return generateToken(user);
    }

    private String generateToken(User user) {
        JWSHeader header = new JWSHeader(JWSAlgorithm.HS512);

        JWTClaimsSet jwtClaimsSet = new JWTClaimsSet.Builder()
                .subject(user.getUsername())
                .issuer("heulwen.tech")
                .issueTime(new Date())
                .expirationTime(new Date(System.currentTimeMillis() + accessTokenExpirationMs))
                .jwtID(java.util.UUID.randomUUID().toString())
                .claim("scope", buildScope(user))
                .build();

        Payload payload = new Payload(jwtClaimsSet.toJSONObject());
        JWSObject jwsObject = new JWSObject(header, payload);

        try {
            jwsObject.sign(new MACSigner(SIGNER_KEY.getBytes()));
            return jwsObject.serialize();
        } catch (JOSEException e) {
            log.error("Can not create token", e);
            throw new RuntimeException(e);
        }
    }

    private String buildScope(User user) {
        if (user.getRole() != null) {
            return "ROLE_" + user.getRole();
        }
        return "";
    }
}
