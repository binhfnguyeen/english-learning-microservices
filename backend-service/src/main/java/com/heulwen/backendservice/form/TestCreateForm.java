package com.heulwen.backendservice.form;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class TestCreateForm {
    @NotBlank(message = "Tiêu đề không được để trống")
    private String title;

    private String description;

    private String difficultyLevel;

    @NotNull(message = "Bắt buộc phải chọn một chủ đề cho bài kiểm tra")
    private Long topicId;

    private List<QuestionCreateForm> questions;
}
