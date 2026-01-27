package com.heulwen.backendservice.mapper;

import com.heulwen.backendservice.dto.ExerciseDto;
import com.heulwen.backendservice.form.ExerciseCreateForm;
import com.heulwen.backendservice.model.Exercise;

import java.util.List;

public class ExerciseMapper {

    // FORM -> ENTITY
    public static Exercise map(ExerciseCreateForm form) {
        if (form == null) return null;

        Exercise exercise = new Exercise();
        exercise.setQuestion(form.getQuestion());
        exercise.setExerciseType(form.getExerciseType());
        return exercise;
    }

    // ENTITY -> DTO
    public static ExerciseDto map(Exercise exercise) {
        if (exercise == null) return null;

        return ExerciseDto.builder()
                .id(exercise.getId())
                .question(exercise.getQuestion())
                .exerciseType(exercise.getExerciseType())
                .vocabulary(
                        exercise.getVocabulary() != null
                                ? VocabularyMapper.map(exercise.getVocabulary())
                                : null
                )
                .choices(
                        exercise.getChoices() == null
                                ? List.of()
                                : exercise.getChoices().stream()
                                .map(ExerciseChoiceMapper::map)
                                .toList()
                )
                .build();
    }
}