/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.heulwen.backendservice.configs;

import com.heulwen.backendservice.model.Role;
import com.heulwen.backendservice.model.User;
import com.heulwen.backendservice.repositories.UserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 *
 * @author Dell
 */
@Configuration
@RequiredArgsConstructor // Thay the autowire
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class ApplicationInitConfig {
    PasswordEncoder passwordEncoder;
    
    @Bean
    ApplicationRunner applicationRunner(UserRepository userRepository){
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
