package com.heulwen.backendservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExerciseChoiceDto {
    private Long id;
    private String content;
    private Boolean isCorrect;
}