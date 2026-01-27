package com.heulwen.backendservice.mapper;

import com.heulwen.backendservice.dto.ExerciseChoiceDto;
import com.heulwen.backendservice.dto.ExerciseDto;
import com.heulwen.backendservice.form.ExerciseChoiceForm;
import com.heulwen.backendservice.form.ExerciseCreateForm;
import com.heulwen.backendservice.model.Exercise;
import com.heulwen.backendservice.model.ExerciseChoice;

import java.util.List;

public class ExerciseMapper {
    /**
    * CREATE
    */
    public static Exercise map(ExerciseCreateForm form) {
        if (form == null) return null;

        Exercise exercise = new Exercise();
        exercise.setQuestion(form.getQuestion());
        exercise.setExerciseType(form.getExerciseType());

        if (form.getChoices() != null && !form.getChoices().isEmpty()) {
            List<ExerciseChoice> choices = form.getChoices().stream()
                    .map(choiceForm -> map(choiceForm, exercise))
                    .toList();
            exercise.setChoices(choices);
        }

        return exercise;
    }

    /**
    * READ
    */
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
                                .map(ExerciseMapper::map)
                                .toList()
                )
                .build();
    }

    /**
    * CHOICE
    */
    public static ExerciseChoice map(ExerciseChoiceForm form, Exercise parent) {
        if (form == null) return null;

        ExerciseChoice choice = new ExerciseChoice();
        choice.setContent(form.getContent());
        choice.setIsCorrect(form.getIsCorrect());
        choice.setExercise(parent);
        return choice;
    }

    public static ExerciseChoiceDto map(ExerciseChoice choice) {
        if (choice == null) return null;

        return ExerciseChoiceDto.builder()
                .id(choice.getId())
                .content(choice.getContent())
                .isCorrect(choice.getIsCorrect())
                .build();
    }
}