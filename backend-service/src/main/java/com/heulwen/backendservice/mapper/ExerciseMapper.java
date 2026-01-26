package com.heulwen.backendservice.mapper;

import com.heulwen.backendservice.dto.ExerciseChoiceDto;
import com.heulwen.backendservice.dto.ExerciseDto;
import com.heulwen.backendservice.form.ExerciseChoiceForm;
import com.heulwen.backendservice.form.ExerciseCreateForm;
import com.heulwen.backendservice.model.Exercise;
import com.heulwen.backendservice.model.ExerciseChoice;

import java.util.ArrayList;
import java.util.List;

public class ExerciseMapper {

    // --- MAP EXERCISE: FORM -> ENTITY ---
    public static Exercise map(ExerciseCreateForm form) {
        if (form == null) return null;

        Exercise exercise = new Exercise();
        exercise.setQuestion(form.getQuestion());
        exercise.setExerciseType(form.getExerciseType());

        if (form.getChoices() != null) {
            List<ExerciseChoice> choices = new ArrayList<>();
            for (ExerciseChoiceForm choiceForm : form.getChoices()) {
                choices.add(map(choiceForm, exercise));
            }
            exercise.setChoices(choices);
        }
        return exercise;
    }

    // --- MAP EXERCISE: ENTITY -> DTO ---
    public static ExerciseDto map(Exercise exercise) {
        if (exercise == null) return null;

        ExerciseDto dto = new ExerciseDto();
        dto.setId(exercise.getId());
        dto.setQuestion(exercise.getQuestion());
        dto.setExerciseType(exercise.getExerciseType());

        dto.setVocabulary(VocabularyMapper.map(exercise.getVocabulary()));

        List<ExerciseChoiceDto> choiceDtos = new ArrayList<>();
        if (exercise.getChoices() != null) {
            for (ExerciseChoice choice : exercise.getChoices()) {
                choiceDtos.add(map(choice));
            }
        }
        dto.setChoices(choiceDtos);

        return dto;
    }

    // --- MAP CHOICE: FORM -> ENTITY ---
    public static ExerciseChoice map(ExerciseChoiceForm form, Exercise parent) {
        ExerciseChoice choice = new ExerciseChoice();
        choice.setContent(form.getContent());
        choice.setIsCorrect(form.getIsCorrect());
        choice.setExercise(parent);
        return choice;
    }

    // --- MAP CHOICE: ENTITY -> DTO ---
    public static ExerciseChoiceDto map(ExerciseChoice choice) {
        ExerciseChoiceDto dto = new ExerciseChoiceDto();
        dto.setId(choice.getId());
        dto.setContent(choice.getContent());
        dto.setIsCorrect(choice.getIsCorrect());
        return dto;
    }
}