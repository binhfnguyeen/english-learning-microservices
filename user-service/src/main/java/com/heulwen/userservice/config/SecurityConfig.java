package com.heulwen.userservice.config;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import javax.crypto.spec.SecretKeySpec;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Value("${spring.jwt.signerkey}")
    protected String SIGNER_KEY;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity httpSecurity) throws Exception {
        httpSecurity
                .csrf(AbstractHttpConfigurer::disable)
                .cors(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(auth -> auth
                        // ========================
                        // 1. PUBLIC APIs (No login)
                        // ========================
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        // Auth
                        .requestMatchers(HttpMethod.POST,
                                "/api/login",
                                "/api/forgot-password",
                                "/api/reset-password"
                        ).permitAll()
                        // Register user
                        .requestMatchers(HttpMethod.POST, "/api/users").permitAll()
                        // ========================
                        // 2. ADMIN APIs
                        // ========================
                        // TẤT CẢ API /secure/**
                        .requestMatchers("/api/secure/**").hasAuthority("ROLE_ADMIN")
                        // ========================
                        // 3. AUTHENTICATED USER APIs
                        // ========================
                        // Profile
                        .requestMatchers(HttpMethod.GET, "/api/secure/profile").authenticated()
                        // Update user (multipart)
                        .requestMatchers(HttpMethod.POST, "/api/users/*").authenticated()
                        // Get user by id
                        .requestMatchers(HttpMethod.GET, "/api/users/*").authenticated()
                        // ========================
                        // 4. DEFAULT
                        // ========================
                        .anyRequest().authenticated()
                );

        // Cấu hình Resource Server để service này cũng hiểu được Token (để bảo vệ API update profile)
        httpSecurity.oauth2ResourceServer(oauth2
                -> oauth2.jwt(jwtConfigurer -> jwtConfigurer
                .decoder(jwtDecoder())
                .jwtAuthenticationConverter(jwtAuthenticationConverter()))
        );

        return httpSecurity.build();
    }

    // ---------------------------------------------------------
    // CÁC BEAN QUAN TRỌNG CHO USER-SERVICE
    // ---------------------------------------------------------

    // 1. PasswordEncoder: BẮT BUỘC để mã hóa mật khẩu khi đăng ký/đăng nhập
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(10);
    }

    // 2. JwtDecoder: Để giải mã Token (khi user gọi API lấy profile của chính mình)
    @Bean
    public JwtDecoder jwtDecoder() {
        SecretKeySpec secretKeySpec = new SecretKeySpec(SIGNER_KEY.getBytes(), "HS512");
        return NimbusJwtDecoder
                .withSecretKey(secretKeySpec)
                .macAlgorithm(MacAlgorithm.HS512)
                .build();
    }

    // 3. Converter: Đọc Role từ Token
    @Bean
    public JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtGrantedAuthoritiesConverter jwtGrantedAuthoritiesConverter = new JwtGrantedAuthoritiesConverter();
        jwtGrantedAuthoritiesConverter.setAuthorityPrefix("");
        JwtAuthenticationConverter jwtAuthenticationConverter = new JwtAuthenticationConverter();
        jwtAuthenticationConverter.setJwtGrantedAuthoritiesConverter(jwtGrantedAuthoritiesConverter);
        return jwtAuthenticationConverter;
    }

    // 4. Cloudinary: Để upload Avatar
    @Bean
    public Cloudinary cloudinary() {
        return new Cloudinary(ObjectUtils.asMap(
                "cloud_name", "dwivkhh8t",
                "api_key", "925656835271691",
                "api_secret", "xggQhqIzVzwLbOJx05apmM4Od7U",
                "secure", true));
    }
}