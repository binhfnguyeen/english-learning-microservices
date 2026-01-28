package com.heulwen.backendservice.controller;

import com.heulwen.backendservice.dto.AnswerDto;
import com.heulwen.backendservice.dto.ApiDto;
import com.heulwen.backendservice.service.AnswerService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class AnswerController {
    AnswerService answerService;

    // --- GET ANSWERS FROM TEST RESULT ---
    @GetMapping("/test-results/{trId}/answers")
    public ApiDto<List<AnswerDto>> getAnswersByTestResult(@PathVariable("trId") Long testResultId) {
        return ApiDto.<List<AnswerDto>>builder()
                .code(1000)
                .result(answerService.getAnswersByTestResultId(testResultId))
                .build();
    }
}
