package com.heulwen.backendservice.form;

import lombok.Data;

@Data
public class QuestionChoiceForm {
    private Long vocabularyId;
    private Boolean isCorrect;
}
