package com.heulwen.backendservice.form;

import lombok.Data;

@Data
public class AnswerSubmissionForm {
    private Long questionChoiceId;
    private Long questionId;
    private String givenAnswerText;
}
