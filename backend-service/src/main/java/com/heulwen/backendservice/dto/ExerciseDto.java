package com.heulwen.backendservice.dto;

import com.heulwen.backendservice.model.ExerciseType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExerciseDto {
    private Long id;
    private String question;
    private ExerciseType exerciseType;
    private VocabularyDto vocabulary; // Bài tập này dành cho từ vựng nào
    private List<ExerciseChoiceDto> choices;
}
