/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.heulwen.backendservice.controllers;

import com.heulwen.backendservice.dto.request.ExerciseRequest;
import com.heulwen.backendservice.dto.response.ApiResponse;
import com.heulwen.backendservice.dto.response.ExerciseResponse;
import com.heulwen.backendservice.services.ExerciseService;
import java.util.List;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 *
 * @author Dell
 */
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class ApiExerciseController {
    
    ExerciseService exerciseService;
    
    @PostMapping("/exercises")
    public ApiResponse<ExerciseResponse> createExercise(@RequestBody ExerciseRequest request){
        return ApiResponse.<ExerciseResponse>builder()
                .code(1000)
                .result(exerciseService.createExercise(request))
                .build();
    }
    
    @GetMapping("/vocabularies/{vocabId}/exercises")
    public ApiResponse<List<ExerciseResponse>> getVocabularyExercises(@PathVariable("vocabId") Integer vocabId){
        return ApiResponse.<List<ExerciseResponse>>builder()
                .code(1000)
                .result(exerciseService.getVocabularyExercise(vocabId))
                .build();
    }
    
    @DeleteMapping("/exercises/{exersId}")
    public ResponseEntity<?> deleteExercise(@PathVariable("exersId") Integer exersId){
        exerciseService.deleteExercise(exersId);
        return ResponseEntity.ok("Xóa bài luyện tập thành công!");
    }
}
