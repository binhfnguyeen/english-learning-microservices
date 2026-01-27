package com.heulwen.backendservice.mapper;

import com.heulwen.backendservice.dto.AnswerDto;
import com.heulwen.backendservice.form.AnswerCreateForm;
import com.heulwen.backendservice.model.Answer;
import com.heulwen.backendservice.model.QuestionChoice;
import com.heulwen.backendservice.model.TestResult;

public class AnswerMapper {

    /**
     * FORM -> ENTITY
     */
    public static Answer toEntity(
            AnswerCreateForm form,
            TestResult testResult,
            QuestionChoice questionChoice
    ) {
        if (form == null) return null;

        Answer answer = new Answer();
        answer.setTestResult(testResult);
        answer.setQuestionChoice(questionChoice);

        return answer;
    }

    /**
     * ENTITY -> DTO
     */
    public static AnswerDto toDto(Answer entity) {
        if (entity == null) return null;

        return AnswerDto.builder()
                .id(entity.getId())
                .testResultId(
                        entity.getTestResult() != null
                                ? entity.getTestResult().getId()
                                : null
                )
                .questionId(
                        entity.getQuestionChoice() != null
                                && entity.getQuestionChoice().getQuestion() != null
                                ? entity.getQuestionChoice().getQuestion().getId()
                                : null
                )
                .questionChoiceId(
                        entity.getQuestionChoice() != null
                                ? entity.getQuestionChoice().getId()
                                : null
                )
                .build();
    }
}