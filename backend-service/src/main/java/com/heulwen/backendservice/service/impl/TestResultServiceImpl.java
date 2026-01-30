package com.heulwen.backendservice.service.impl;

import com.heulwen.backendservice.dto.TestResultDto;
import com.heulwen.backendservice.exception.ResourceNotFoundException;
import com.heulwen.backendservice.form.AnswerSubmissionForm;
import com.heulwen.backendservice.form.TestSubmissionForm;
import com.heulwen.backendservice.mapper.TestResultMapper;
import com.heulwen.backendservice.model.*;
import com.heulwen.backendservice.repository.QuestionChoiceRepository;
import com.heulwen.backendservice.repository.TestRepository;
import com.heulwen.backendservice.repository.TestResultRepository;
import com.heulwen.backendservice.service.TestResultService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class TestResultServiceImpl implements TestResultService {

    TestResultRepository testResultRepository;
    QuestionChoiceRepository questionChoiceRepository;
    TestRepository testRepository;

    @Override
    @Transactional
    public TestResultDto createTestResult(TestSubmissionForm form) {
        Test test = testRepository.findById(form.getTestId())
                .orElseThrow(() -> new ResourceNotFoundException("Test not found id: " + form.getTestId()));

        int totalQuestions = test.getQuestions().size();

        TestResult testResult = new TestResult();
        testResult.setUserId(form.getUserId());
        testResult.setTest(test);
        testResult.setDateTaken(LocalDateTime.now());

        if (form.getAnswers() != null && !form.getAnswers().isEmpty()) {
            List<Answer> answers = new ArrayList<>();
            long correctCount = 0;
            for (AnswerSubmissionForm ansForm : form.getAnswers()) {
                QuestionChoice choice = questionChoiceRepository.findById(ansForm.getQuestionChoiceId())
                        .orElseThrow(() -> new ResourceNotFoundException("Choice not found id: " + ansForm.getQuestionChoiceId()));
                if (Boolean.TRUE.equals(choice.getIsCorrect())) {
                    correctCount++;
                }
                Answer answer = new Answer();
                answer.setQuestionChoice(choice);
                answer.setTestResult(testResult);
                answers.add(answer);
            }
            testResult.setAnswers(answers);
            double score = (totalQuestions > 0) ? (10.0 * correctCount) / totalQuestions : 0;
            testResult.setScore(score);
        }
        TestResult saved = testResultRepository.save(testResult);
        return TestResultMapper.map(saved);
    }

    @Override
    public List<TestResultDto> getAllTestResults() {
        return testResultRepository.findAll().stream()
                .map(TestResultMapper::map)
                .toList();
    }

    @Override
    public TestResultDto getTestResultById(Long id) {
        TestResult testResult = testResultRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Test result not found id: " + id));
        return TestResultMapper.map(testResult);
    }

    @Override
    public List<TestResultDto> getTestResultsByUserAndTest(Long userId, Long testId) {
        List<TestResult> results = testResultRepository.findByUserIdAndTestId(userId, testId);
        return results.stream()
                .map(TestResultMapper::map)
                .toList();
    }
}
