package com.heulwen.userservice.config;

import com.heulwen.userservice.model.Role;
import com.heulwen.userservice.model.User;
import com.heulwen.userservice.repository.UserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class ApplicationInitConfig {
    PasswordEncoder passwordEncoder;

    @Bean
    ApplicationRunner applicationRunner(UserRepository userRepository) {
        return args -> {
            if (userRepository.findByUsername("admin").isEmpty())  {
                User user = User.builder()
                        .email("admin@elearnweb.com")
                        .username("admin")
                        .password(passwordEncoder.encode("admin"))
                        .isActive(Boolean.TRUE)
                        .role(Role.ADMIN.name())
                        .build();

                userRepository.save(user);
                log.warn(">>admin user has been created with default password: admin, please change it!");
            }
        };
    }
}
