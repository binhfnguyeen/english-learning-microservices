package com.heulwen.backendservice.service.impl;

import com.heulwen.backendservice.dto.TestResultDto;
import com.heulwen.backendservice.exception.AppException;
import com.heulwen.backendservice.exception.ErrorCode;
import com.heulwen.backendservice.form.AnswerSubmissionForm;
import com.heulwen.backendservice.form.TestSubmissionForm;
import com.heulwen.backendservice.mapper.TestResultMapper;
import com.heulwen.backendservice.model.*;
import com.heulwen.backendservice.model.enumType.QuestionType;
import com.heulwen.backendservice.repository.QuestionChoiceRepository;
import com.heulwen.backendservice.repository.QuestionRepository;
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
    QuestionRepository questionRepository;

    @Override
    @Transactional
    public TestResultDto createTestResult(TestSubmissionForm form) {
        Test test = testRepository.findById(form.getTestId())
                .orElseThrow(() -> new AppException(ErrorCode.TEST_NOT_FOUND));

        int totalQuestions = test.getQuestions().size();

        TestResult testResult = new TestResult();
        testResult.setUserId(form.getUserId());
        testResult.setTest(test);
        testResult.setDateTaken(LocalDateTime.now());

        if (form.getAnswers() != null && !form.getAnswers().isEmpty()) {
            List<Answer> answers = new ArrayList<>();
            long correctCount = 0;

            for (AnswerSubmissionForm ansForm : form.getAnswers()) {
                // 1. Tìm câu hỏi gốc để biết loại bài tập và đáp án
                Question question = questionRepository.findById(ansForm.getQuestionId())
                        .orElseThrow(() -> new AppException(ErrorCode.QUESTION_NOT_FOUND));

                Answer answer = new Answer();
                answer.setTestResult(testResult);
                answer.setQuestion(question);
                boolean isCorrect = false;

                // 2. Rẽ nhánh chấm điểm theo loại câu hỏi
                if (question.getType() == null || question.getType() == QuestionType.MULTIPLE_CHOICE) {
                    // Xử lý trắc nghiệm bình thường
                    if (ansForm.getQuestionChoiceId() != null) {
                        QuestionChoice choice = questionChoiceRepository.findById(ansForm.getQuestionChoiceId())
                                .orElseThrow(() -> new AppException(ErrorCode.CHOICE_NOT_FOUND));
                        answer.setQuestionChoice(choice);

                        if (Boolean.TRUE.equals(choice.getIsCorrect())) {
                            isCorrect = true;
                        }
                    }
                } else {
                    answer.setGivenAnswerText(ansForm.getGivenAnswerText());

                    String userAnswer = ansForm.getGivenAnswerText() != null ? ansForm.getGivenAnswerText().trim().toLowerCase() : "";
                    String correctAnswer = question.getCorrectAnswerText() != null ? question.getCorrectAnswerText().trim().toLowerCase() : "";

                    // So sánh chuỗi đáp án (bỏ qua khoảng trắng thừa và in hoa/thường)
                    if (!userAnswer.isEmpty() && userAnswer.equals(correctAnswer)) {
                        isCorrect = true;
                    }
                }

                if (isCorrect) {
                    correctCount++;
                }
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
    @Transactional(readOnly = true)
    public TestResultDto getTestResultById(Long id) {
        TestResult testResult = testResultRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.TEST_RESULTS_NOT_FOUND));
        return TestResultMapper.map(testResult);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TestResultDto> getTestResultsByUserAndTest(Long userId, Long testId) {
        List<TestResult> results = testResultRepository.findByUserIdAndTestId(userId, testId);
        return results.stream()
                .map(TestResultMapper::map)
                .toList();
    }
}
