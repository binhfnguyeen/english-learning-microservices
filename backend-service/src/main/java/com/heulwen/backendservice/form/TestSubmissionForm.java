package com.heulwen.backendservice.form;

import lombok.Data;

@Data
public class TestSubmissionForm {
    private Long testId;
    private Long userId;
    private List<AnswerSubmissionForm> answers;
}
