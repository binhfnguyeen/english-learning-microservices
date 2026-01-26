package com.heulwen.backendservice.service;

import com.heulwen.backendservice.dto.ExerciseDto;
import com.heulwen.backendservice.form.ExerciseCreateForm;

import java.util.List;

public interface ExerciseService {
    ExerciseDto createExercise(ExerciseCreateForm form);
    List<ExerciseDto> getExercisesByVocabularyId(Long vocabularyId);
}
