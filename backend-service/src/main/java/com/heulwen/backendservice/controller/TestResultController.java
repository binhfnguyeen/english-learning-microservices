package com.heulwen.backendservice.controller;

import com.heulwen.backendservice.dto.ApiDto;
import com.heulwen.backendservice.dto.TestResultDto;
import com.heulwen.backendservice.form.TestSubmissionForm;
import com.heulwen.backendservice.service.TestResultService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class TestResultController {
    TestResultService testResultService;

    // --- GET ALL TEST RESULTS ---
    @GetMapping("/test-results")
    public ApiDto<List<TestResultDto>> list() {
        return ApiDto.<List<TestResultDto>>builder()
                .code(1000)
                .result(testResultService.getAllTestResults())
                .build();
    }

    // --- SUBMIT TEST (CREATE RESULT) ---
    @PostMapping("/test-results")
    public ApiDto<TestResultDto> submitTest(@RequestBody TestSubmissionForm form) {
        return ApiDto.<TestResultDto>builder()
                .code(1000)
                .result(testResultService.createTestResult(form))
                .build();
    }

    // --- GET TEST RESULT BY ID ---
    @GetMapping("/test-results/{id}")
    public ApiDto<TestResultDto> retrieve(@PathVariable("id") Long id) {
        return ApiDto.<TestResultDto>builder()
                .code(1000)
                .result(testResultService.getTestResultById(id))
                .build();
    }

    // --- GET RESULTS BY TEST AND USER ---
    @GetMapping("/tests/{testId}/results")
    public ApiDto<List<TestResultDto>> getTestResultByUser(
            @PathVariable("testId") Long testId,
            @RequestParam("userId") Long userId
    ) {
        return ApiDto.<List<TestResultDto>>builder()
                .code(1000)
                .result(testResultService.getTestResultsByUserAndTest(userId, testId))
                .build();
    }
}
