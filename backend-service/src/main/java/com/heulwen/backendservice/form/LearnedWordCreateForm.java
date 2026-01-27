package com.heulwen.backendservice.form;

import lombok.Data;

@Data
public class LearnedWordCreateForm {
    private Long userId;
    private Long vocabularyId;
}
