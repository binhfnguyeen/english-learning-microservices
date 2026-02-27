package com.heulwen.backendservice.config;

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
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(auth -> auth
                        // =========================
                        // OPTIONS (CORS)
                        // =========================
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        // =========================
                        // ADMIN APIs (CRUD content)
                        // =========================
                        // Vocabulary
                        .requestMatchers(HttpMethod.POST,   "/api/vocabularies/**").hasAuthority("ROLE_ADMIN")
                        .requestMatchers(HttpMethod.PUT,    "/api/vocabularies/**").hasAuthority("ROLE_ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/vocabularies/**").hasAuthority("ROLE_ADMIN")
                        // Topic
                        .requestMatchers(HttpMethod.POST,   "/api/topics/**").hasAuthority("ROLE_ADMIN")
                        .requestMatchers(HttpMethod.PUT,    "/api/topics/**").hasAuthority("ROLE_ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/topics/**").hasAuthority("ROLE_ADMIN")
                        // Test
                        .requestMatchers(HttpMethod.POST,   "/api/tests/**").hasAuthority("ROLE_ADMIN")
                        .requestMatchers(HttpMethod.PUT,    "/api/tests/**").hasAuthority("ROLE_ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/tests/**").hasAuthority("ROLE_ADMIN")
                        // Question
                        .requestMatchers(HttpMethod.POST,   "/api/questions/**").hasAuthority("ROLE_ADMIN")
                        .requestMatchers(HttpMethod.PUT,    "/api/questions/**").hasAuthority("ROLE_ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/questions/**").hasAuthority("ROLE_ADMIN")
                        // Exercise
                        .requestMatchers(HttpMethod.POST,   "/api/exercises/**").hasAuthority("ROLE_ADMIN")
                        .requestMatchers(HttpMethod.PUT,    "/api/exercises/**").hasAuthority("ROLE_ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/exercises/**").hasAuthority("ROLE_ADMIN")
                        // =========================
                        // AUTHENTICATED USER APIs
                        // =========================
                        // GET vocab / topic / test / question / exercise
                        .requestMatchers(HttpMethod.GET,
                                "/api/vocabularies/**",
                                "/api/topics/**",
                                "/api/tests/**",
                                "/api/questions/**",
                                "/api/exercises/**"
                        ).authenticated()
                        // Learned words
                        .requestMatchers("/api/learnedWords/**").authenticated()
                        .requestMatchers("/api/users/learnedWords").authenticated()
                        // Progress
                        .requestMatchers("/api/progress/**").authenticated()
                        // Test results & answers
                        .requestMatchers("/api/test-results/**").authenticated()
                        .requestMatchers("/api/tests/*/results").authenticated()
                        .requestMatchers("/api/test-results/*/answers").authenticated()
                        // =========================
                        // DEFAULT
                        // =========================
                        .anyRequest().authenticated()
                )

                // =========================
                // JWT Resource Server
                // =========================
                .oauth2ResourceServer(oauth2 ->
                        oauth2.jwt(jwt -> jwt
                                .decoder(jwtDecoder())
                                .jwtAuthenticationConverter(jwtAuthenticationConverter())
                        )
                );
        return http.build();
    }

    @Bean
    public JwtDecoder jwtDecoder() {
        SecretKeySpec secretKeySpec = new SecretKeySpec(SIGNER_KEY.getBytes(), "HS512");
        return NimbusJwtDecoder
                .withSecretKey(secretKeySpec)
                .macAlgorithm(MacAlgorithm.HS512)
                .build();
    }

    @Bean
    public JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtGrantedAuthoritiesConverter jwtGrantedAuthoritiesConverter = new JwtGrantedAuthoritiesConverter();
        jwtGrantedAuthoritiesConverter.setAuthorityPrefix("");
        JwtAuthenticationConverter jwtAuthenticationConverter = new JwtAuthenticationConverter();
        jwtAuthenticationConverter.setJwtGrantedAuthoritiesConverter(jwtGrantedAuthoritiesConverter);
        return jwtAuthenticationConverter;
    }

    @Bean
    public Cloudinary cloudinary() {
        Cloudinary cloudinary
                = new Cloudinary(ObjectUtils.asMap(
                "cloud_name", "dwivkhh8t",
                "api_key", "925656835271691",
                "api_secret", "xggQhqIzVzwLbOJx05apmM4Od7U",
                "secure", true));
        return cloudinary;
    }
}
