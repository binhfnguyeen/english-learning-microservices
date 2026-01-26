/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.heulwen.backendservice.services;

import com.heulwen.backendservice.dto.request.ExerciseRequest;
import com.heulwen.backendservice.dto.response.ExerciseResponse;
import com.heulwen.backendservice.exceptions.AppException;
import com.heulwen.backendservice.exceptions.ErrorCode;
import com.heulwen.backendservice.mapper.ExerciseMapper;
import com.heulwen.backendservice.model.Exercise;
import com.heulwen.backendservice.model.ExerciseType;
import com.heulwen.backendservice.model.Vocabulary;
import com.heulwen.backendservice.repositories.ExerciseRepository;
import com.heulwen.backendservice.repositories.VocabularyRepository;
import java.util.List;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

/**
 *
 * @author Dell
 */
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class ExerciseService {

    ExerciseRepository exerciseRepository;
    VocabularyRepository vocabularyRepository;
    ExerciseMapper exerciseMapper;

    public ExerciseResponse createExercise(ExerciseRequest request) {
        Exercise exercise = exerciseMapper.toExercise(request);

        Vocabulary vocab = vocabularyRepository.findById(request.getVocabularyId()).orElseThrow(() -> new AppException(ErrorCode.VOCAB_NOT_FOUND));
        exercise.setVocabularyId(vocab);

        if (ExerciseType.LISTEN_AND_TYPE.equals(request.getExerciseType())) {
            boolean exists = exerciseRepository.existsByVocabularyId_IdAndExerciseType(
                    request.getVocabularyId(),
                    ExerciseType.LISTEN_AND_TYPE
            );
            if (exists) {
                throw new AppException(ErrorCode.EXERCISE_ALREADY_EXISTS);
            }
        }

        if (exercise.getExerciseChoiceSet() != null) {
            exercise.getExerciseChoiceSet().forEach(c -> c.setExerciseId(exercise));
        }

        Exercise saved = exerciseRepository.save(exercise);
        return exerciseMapper.toExerciseResponse(saved);
    }

    public List<ExerciseResponse> getVocabularyExercise(Integer vocabularyId) {
        Vocabulary vocab = vocabularyRepository.findById(vocabularyId).orElseThrow(() -> new AppException(ErrorCode.VOCAB_NOT_FOUND));
        return exerciseRepository.findByVocabularyId(vocab).stream().map(exerciseMapper::toExerciseResponse).toList();
    }

    public void deleteExercise(Integer id) {
        Exercise existing = exerciseRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.EXERCISE_NOT_FOUND));
        exerciseRepository.delete(existing);
    }
}
