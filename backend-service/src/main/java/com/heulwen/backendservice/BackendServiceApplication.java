package com.heulwen.backendservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication(scanBasePackages = "com.heulwen")
@ComponentScan(basePackages = {
    "com.heulwen.backendservice.controllers",
    "com.heulwen.backendservice.repositories",
    "com.heulwen.backendservice.services",
    "com.heulwen.backendservice.mapper",
    "com.heulwen.backendservice.exceptions",
    "com.heulwen.backendservice.configs",
    "com.heulwen.backendservice.resolvers"
})
@EnableJpaRepositories(basePackages = "com.heulwen.backendservice.repositories")
@EntityScan(basePackages = "com.heulwen.pojo")
public class BackendServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(BackendServiceApplication.class, args);
    }

}
