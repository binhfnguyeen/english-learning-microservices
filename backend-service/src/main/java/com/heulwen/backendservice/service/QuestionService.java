package com.heulwen.backendservice.service;

import com.heulwen.backendservice.dto.QuestionDto;
import com.heulwen.backendservice.form.QuestionCreateForm;

import java.util.List;

public interface QuestionService {
    QuestionDto createQuestion(QuestionCreateForm form);
    QuestionDto updateQuestion(Long id, QuestionCreateForm form);
    List<QuestionDto> getAllQuestions();
    QuestionDto getQuestionById(Long id);
    void deleteQuestion(Long id);
}
