package com.heulwen.backendservice.service.impl;

import com.heulwen.backendservice.dto.ExerciseDto;
import com.heulwen.backendservice.exception.ResourceNotFoundException;
import com.heulwen.backendservice.form.ExerciseCreateForm;
import com.heulwen.backendservice.mapper.ExerciseMapper;
import com.heulwen.backendservice.model.Exercise;
import com.heulwen.backendservice.model.Vocabulary;
import com.heulwen.backendservice.repository.ExerciseRepository;
import com.heulwen.backendservice.repository.VocabularyRepository;
import com.heulwen.backendservice.service.ExerciseService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class ExerciseServiceImpl implements ExerciseService {

    private final ExerciseRepository exerciseRepository;
    private final VocabularyRepository vocabularyRepository;

    @Override
    public ExerciseDto createExercise(ExerciseCreateForm form) {
        Vocabulary vocabulary = vocabularyRepository.findById(form.getVocabularyId())
                .orElseThrow(() -> new ResourceNotFoundException("Vocabulary not found id: " + form.getVocabularyId()));

        Exercise exercise = ExerciseMapper.map(form);
        exercise.setVocabulary(vocabulary);

        exercise = exerciseRepository.save(exercise);
        return ExerciseMapper.map(exercise);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ExerciseDto> getExercisesByVocabularyId(Long vocabularyId) {
        return exerciseRepository.findByVocabularyId(vocabularyId).stream()
                .map(ExerciseMapper::map)
                .collect(Collectors.toList());
    }
}
