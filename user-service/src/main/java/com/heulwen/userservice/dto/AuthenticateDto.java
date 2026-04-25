package com.heulwen.userservice.dto;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AuthenticateDto {
    String accessToken;
    String refreshToken;
    String tokenType = "Bearer";
    boolean authenticated;
}
