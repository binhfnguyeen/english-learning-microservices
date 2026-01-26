package com.heulwen.backendservice.form;

import lombok.Data;

@Data
public class TestCreateForm {
    private String title;
    private String description;
    private List<QuestionCreateForm> questions; // Tạo Test kèm luôn câu hỏi
}
