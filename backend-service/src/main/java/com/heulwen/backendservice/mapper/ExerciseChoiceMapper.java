package com.heulwen.backendservice.mapper;

import com.heulwen.backendservice.dto.ExerciseChoiceDto;
import com.heulwen.backendservice.form.ExerciseChoiceForm;
import com.heulwen.backendservice.model.Exercise;
import com.heulwen.backendservice.model.ExerciseChoice;

public class ExerciseChoiceMapper {

    // FORM -> ENTITY
    public static ExerciseChoice map(ExerciseChoiceForm form, Exercise parent) {
        if (form == null) return null;

        ExerciseChoice choice = new ExerciseChoice();
        choice.setContent(form.getContent());
        choice.setIsCorrect(form.getIsCorrect());
        choice.setExercise(parent);
        return choice;
    }

    // ENTITY -> DTO
    public static ExerciseChoiceDto map(ExerciseChoice entity) {
        if (entity == null) return null;

        return ExerciseChoiceDto.builder()
                .id(entity.getId())
                .content(entity.getContent())
                .isCorrect(entity.getIsCorrect())
                .build();
    }
}

