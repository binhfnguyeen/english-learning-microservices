package com.heulwen.backendservice.dto;

import com.heulwen.backendservice.model.enumType.QuestionType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuestionDto {
    private Long id;
    private String content;
    private QuestionType type;
    private String correctAnswerText;
    private List<QuestionChoiceDto> choices;
}
