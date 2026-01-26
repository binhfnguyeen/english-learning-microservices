package com.heulwen.backendservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProgressDto {
    private Long id;
    private Long userId;
    private LocalDateTime learnedDate;
}
