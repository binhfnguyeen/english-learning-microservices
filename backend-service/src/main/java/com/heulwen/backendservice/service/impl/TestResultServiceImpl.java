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
    UserRepository userRepository;
    TestRepository testRepository;

    @Override
    @Transactional
    public TestResultDto createTestResult(TestSubmissionForm form) {
        // 1. Fetch User và Test để set relationship
        User user = userRepository.findById(form.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found id: " + form.getUserId()));

        Test test = testRepository.findById(form.getTestId())
                .orElseThrow(() -> new ResourceNotFoundException("Test not found id: " + form.getTestId()));

        // 2. Khởi tạo TestResult (Manual Map cơ bản)
        TestResult testResult = new TestResult();
        testResult.setUser(user);
        testResult.setTest(test);
        testResult.setDateTaken(LocalDateTime.now());
        // testResult.setScore(...) // Logic tính điểm có thể thêm ở đây nếu cần

        // 3. Xử lý danh sách câu trả lời (Answers)
        if (form.getAnswers() != null && !form.getAnswers().isEmpty()) {
            List<Answer> answers = new ArrayList<>();

            for (AnswerSubmissionForm ansForm : form.getAnswers()) {
                QuestionChoice choice = questionChoiceRepository.findById(ansForm.getQuestionChoiceId())
                        .orElseThrow(() -> new ResourceNotFoundException("Choice not found id: " + ansForm.getQuestionChoiceId()));

                Answer answer = new Answer();
                answer.setQuestionChoice(choice);
                answer.setTestResult(testResult);

                answers.add(answer);
            }
            testResult.setAnswers(answers);
        }

        // 4. Save (Cascade sẽ tự lưu Answers)
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
        List<TestResult> results = testResultRepository.findByUser_IdAndTest_Id(userId, testId);
        return results.stream()
                .map(TestResultMapper::map)
                .toList();
    }
}
