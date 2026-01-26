/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.heulwen.backendservice.controllers;

import com.heulwen.backendservice.dto.request.QuestionRequest;
import com.heulwen.backendservice.dto.response.ApiResponse;
import com.heulwen.backendservice.dto.response.QuestionResponse;
import com.heulwen.backendservice.services.QuestionService;
import java.util.List;
import java.util.Map;
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
public class ApiQuestionController {
    QuestionService questionService;
    
    @GetMapping("/questions")
    ApiResponse<List<QuestionResponse>> list(){
        return ApiResponse.<List<QuestionResponse>>builder()
                .code(1000)
                .result(questionService.getQuestions())
                .build();
    }
    
    @PostMapping("/questions")
    ApiResponse<QuestionResponse> addOrUpdate(@RequestBody QuestionRequest request){
        QuestionResponse result = questionService.addOrUpdateQuestion(request);
        return ApiResponse.<QuestionResponse>builder()
                .code(1000)
                .result(result)
                .build();
    }
    
    @GetMapping("/questions/{id}")
    ApiResponse<QuestionResponse> retrieve(@PathVariable("id") int id){
        return ApiResponse.<QuestionResponse>builder()
                .code(1000)
                .result(questionService.getQuestionById(id))
                .build();
    }
    
    @DeleteMapping("/questions/{id}")
    ResponseEntity<?> delete(@PathVariable("id") int id){
        this.questionService.deleteQuestion(id);
        return ResponseEntity.ok().body(Map.of("messages", "Deleted successfully!"));
    }
}
