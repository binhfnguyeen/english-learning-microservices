package com.heulwen.backendservice.repository.httpClient;

import com.heulwen.backendservice.config.FeignClientConfig;
import com.heulwen.backendservice.dto.ApiDto;
import com.heulwen.backendservice.dto.UserDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "user-service", configuration = FeignClientConfig.class)
public interface UserClient {
    @GetMapping("/api/users/{id}")
    ApiDto<UserDto> getUserById(@PathVariable("id") Long id);
}
