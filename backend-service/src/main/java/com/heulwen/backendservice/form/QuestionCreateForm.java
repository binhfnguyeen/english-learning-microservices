package com.heulwen.backendservice.form;

import com.heulwen.backendservice.model.enumType.QuestionType;
import lombok.Data;

import java.util.List;

@Data
public class QuestionCreateForm {
    private String content;
    private Long testId;
    private QuestionType type;
    private String correctAnswerText;
    private List<QuestionChoiceForm> choices;
}
