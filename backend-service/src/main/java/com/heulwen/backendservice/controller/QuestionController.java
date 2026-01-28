package com.heulwen.backendservice.controller;

import com.heulwen.backendservice.dto.ApiDto;
import com.heulwen.backendservice.dto.QuestionDto;
import com.heulwen.backendservice.form.QuestionCreateForm;
import com.heulwen.backendservice.service.QuestionService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/questions")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class QuestionController {
    QuestionService questionService;

    // --- GET LIST QUESTIONS ---
    @GetMapping
    public ApiDto<List<QuestionDto>> list() {
        return ApiDto.<List<QuestionDto>>builder()
                .code(1000)
                .result(questionService.getAllQuestions())
                .build();
    }

    // --- CREATE QUESTION ---
    @PostMapping
    public ApiDto<QuestionDto> create(@RequestBody QuestionCreateForm request) {
        // Logic trong Service đã bao gồm xử lý choices và map vocabulary
        return ApiDto.<QuestionDto>builder()
                .code(1000)
                .result(questionService.createQuestion(request))
                .build();
    }

    // --- UPDATE QUESTION ---
    @PutMapping("/{id}")
    public ApiDto<QuestionDto> update(@PathVariable Long id, @RequestBody QuestionCreateForm request) {
        return ApiDto.<QuestionDto>builder()
                .code(1000)
                .message("Question updated successfully")
                .result(questionService.updateQuestion(id, request))
                .build();
    }

    // --- GET QUESTION BY ID ---
    @GetMapping("/{id}")
    public ApiDto<QuestionDto> retrieve(@PathVariable("id") Long id) {
        return ApiDto.<QuestionDto>builder()
                .code(1000)
                .result(questionService.getQuestionById(id))
                .build();
    }

    // --- DELETE QUESTION ---
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable("id") Long id) {
        questionService.deleteQuestion(id);
        return ResponseEntity.ok(Map.of("messages", "Deleted successfully!"));
    }
}
