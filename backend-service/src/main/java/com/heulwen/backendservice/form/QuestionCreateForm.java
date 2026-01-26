package com.heulwen.backendservice.form;

import lombok.Data;

@Data
public class QuestionCreateForm {
    private String content;
    private Long testId;
    private List<QuestionChoiceForm> choices;
}
