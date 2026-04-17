package com.heulwen.backendservice.mapper;

import com.heulwen.backendservice.dto.QuestionChoiceDto;
import com.heulwen.backendservice.form.QuestionChoiceForm;
import com.heulwen.backendservice.model.QuestionChoice;

public class QuestionChoiceMapper {

    /**
     * FORM -> ENTITY
     */
    public static QuestionChoice map(QuestionChoiceForm form) {
        if (form == null) return null;

        QuestionChoice choice = new QuestionChoice();
        choice.setIsCorrect(form.getIsCorrect());
        choice.setTextContent(form.getTextContent());
        return choice;
    }

    /**
     * ENTITY -> DTO
     */
    public static QuestionChoiceDto map(QuestionChoice entity) {
        if (entity == null) return null;

        return QuestionChoiceDto.builder()
                .id(entity.getId())
                .isCorrect(entity.getIsCorrect())
                .textContent(entity.getTextContent()) // Bổ sung textContent
                .vocabulary(
                        entity.getVocabulary() != null
                                ? VocabularyMapper.map(entity.getVocabulary())
                                : null
                )
                .build();
    }
}