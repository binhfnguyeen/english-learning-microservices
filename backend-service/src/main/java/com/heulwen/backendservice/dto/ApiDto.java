package com.heulwen.backendservice.dto;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ApiDto<T> {
    @Builder.Default
    int code = 1000;
    String message;
    T result;
}
