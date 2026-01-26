package com.heulwen.backendservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuestionChoiceDto {
    private Long id;
    private Boolean isCorrect;
    private VocabularyDto vocabulary;
}
