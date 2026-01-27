package com.heulwen.backendservice.service;

import com.heulwen.backendservice.dto.TestResultDto;
import com.heulwen.backendservice.form.TestSubmissionForm;

import java.util.List;

public interface TestResultService {
    TestResultDto createTestResult(TestSubmissionForm form);
    List<TestResultDto> getAllTestResults();
    TestResultDto getTestResultById(Long id);
    List<TestResultDto> getTestResultsByUserAndTest(Long userId, Long testId);
}
