package com.heulwen.backendservice.form;

import lombok.Data;

import java.util.List;

@Data
public class TestCreateForm {
    private String title;
    private String description;
    private String difficultyLevel;
    private Long topicId;
    private List<QuestionCreateForm> questions;
}
