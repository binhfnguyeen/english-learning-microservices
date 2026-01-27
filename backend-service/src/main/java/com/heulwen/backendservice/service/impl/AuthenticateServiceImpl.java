package com.heulwen.backendservice.service.impl;

import com.heulwen.backendservice.dto.AuthenticateDto;
import com.heulwen.backendservice.exception.ResourceNotFoundException;
import com.heulwen.backendservice.form.AuthenticateForm;
import com.heulwen.backendservice.model.User;
import com.heulwen.backendservice.repository.UserRepository;
import com.heulwen.backendservice.service.AuthenticateService;
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
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AuthenticateServiceImpl implements AuthenticateService {
    UserRepository userRepository;
    PasswordEncoder passwordEncoder; // Inject Bean từ SecurityConfig

    @NonFinal
    @Value("${spring.jwt.signerkey}")
    protected String SIGNER_KEY;

    @Override
    public AuthenticateDto authenticate(AuthenticateForm form) {
        User user = userRepository.findByUsername(form.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User not existed"));

        // 2. Check Password
        boolean authenticated = passwordEncoder.matches(form.getPassword(), user.getPassword());

        if (!authenticated) {
            throw new RuntimeException("Unauthenticated"); // Nên dùng BadCredentialsException của Spring Security
        }

        // 3. Generate Token
        var token = generateToken(user);

        return AuthenticateDto.builder()
                .token(token)
                .authenticated(authenticated)
                .build();
    }

    private String generateToken(User user) {
        JWSHeader header = new JWSHeader(JWSAlgorithm.HS512);

        JWTClaimsSet jwtClaimsSet = new JWTClaimsSet.Builder()
                .subject(user.getUsername())
                .issuer("heulwen.tech")
                .issueTime(new Date())
                .expirationTime(new Date(
                        Instant.now().plus(1, ChronoUnit.HOURS).toEpochMilli()
                ))
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
