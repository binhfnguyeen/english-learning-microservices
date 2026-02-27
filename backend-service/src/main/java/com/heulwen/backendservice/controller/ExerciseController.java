package com.heulwen.backendservice.controller;

import com.heulwen.backendservice.dto.ApiDto;
import com.heulwen.backendservice.dto.ExerciseDto;
import com.heulwen.backendservice.form.ExerciseCreateForm;
import com.heulwen.backendservice.service.ExerciseService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class ExerciseController {
    ExerciseService exerciseService;

    // --- CREATE EXERCISE ---
    @PostMapping("/exercises")
    public ApiDto<ExerciseDto> createExercise(@RequestBody ExerciseCreateForm request) {
        return ApiDto.<ExerciseDto>builder()
                .code(1000)
                .result(exerciseService.createExercise(request))
                .build();
    }

    // --- GET EXERCISES BY VOCABULARY ---
    @GetMapping("/vocabularies/{vocabId}/exercises")
    public ApiDto<List<ExerciseDto>> getVocabularyExercises(@PathVariable("vocabId") Long vocabId) { // Đổi Integer -> Long
        return ApiDto.<List<ExerciseDto>>builder()
                .code(1000)
                .result(exerciseService.getExercisesByVocabularyId(vocabId))
                .build();
    }

    // --- DELETE EXERCISE ---
    @DeleteMapping("/exercises/{id}")
    public ResponseEntity<?> deleteExercise(@PathVariable("id") Long id) { // Đổi Integer -> Long
        exerciseService.deleteExercise(id);
        return ResponseEntity.ok(Map.of("message", "Xóa bài luyện tập thành công!"));
    }
}
