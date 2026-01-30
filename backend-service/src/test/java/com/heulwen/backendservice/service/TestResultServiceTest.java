package com.heulwen.backendservice.service;

import com.heulwen.backendservice.dto.TestResultDto;
import com.heulwen.backendservice.form.AnswerSubmissionForm;
import com.heulwen.backendservice.form.TestSubmissionForm;
import com.heulwen.backendservice.model.Question;
import com.heulwen.backendservice.model.QuestionChoice;
import com.heulwen.backendservice.model.TestResult;
import com.heulwen.backendservice.repository.*;
import com.heulwen.backendservice.service.impl.TestResultServiceImpl;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class TestResultServiceTest {
    @Mock private TestResultRepository testResultRepository;
    @Mock private QuestionChoiceRepository questionChoiceRepository;
    @Mock private TestRepository testRepository;
    @Mock private QuestionRepository questionRepository;
    @Mock private AnswerRepository answerRepository;

    @InjectMocks
    private TestResultServiceImpl testResultService;

    private final Long TEST_ID = 1L;
    private final Long USER_ID = 100L;
    private com.heulwen.backendservice.model.Test mockTest;
    private List<Question> mockQuestions;

    @BeforeEach
    void setup() {
        mockTest = new com.heulwen.backendservice.model.Test();
        mockTest.setId(TEST_ID);
        mockTest.setTitle("Mock Test");

        mockQuestions = new ArrayList<>();

        // Câu 1: Đúng là ID 11
        Question q1 = new Question(); q1.setId(10L);
        QuestionChoice c1_Right = new QuestionChoice(); c1_Right.setId(11L); c1_Right.setIsCorrect(true);
        QuestionChoice c1_Wrong = new QuestionChoice(); c1_Wrong.setId(12L); c1_Wrong.setIsCorrect(false);
        q1.setChoices(List.of(c1_Right, c1_Wrong));

        // Câu 2: Đúng là ID 21
        Question q2 = new Question(); q2.setId(20L);
        QuestionChoice c2_Right = new QuestionChoice(); c2_Right.setId(21L); c2_Right.setIsCorrect(true);
        QuestionChoice c2_Wrong = new QuestionChoice(); c2_Wrong.setId(22L); c2_Wrong.setIsCorrect(false);
        q2.setChoices(List.of(c2_Right, c2_Wrong));

        mockQuestions.add(q1);
        mockQuestions.add(q2);

        mockTest.setQuestions(mockQuestions);
    }

    @Test
    void createTestResults_simple_save_success() {
        // GIVEN
        TestSubmissionForm form = new TestSubmissionForm();
        form.setTestId(TEST_ID);
        form.setUserId(USER_ID);

        AnswerSubmissionForm ansForm = new AnswerSubmissionForm();
        ansForm.setQuestionChoiceId(11L);
        form.setAnswers(List.of(ansForm));

        when(testRepository.findById(TEST_ID)).thenReturn(Optional.of(mockTest));

        QuestionChoice mockChoice = new QuestionChoice();
        mockChoice.setId(11L);
        when(questionChoiceRepository.findById(11L)).thenReturn(Optional.of(mockChoice));

        when(testResultRepository.save(any(TestResult.class))).thenAnswer(i -> {
            TestResult saved = i.getArgument(0);
            saved.setId(999L);
            saved.setTest(mockTest);
            saved.setDateTaken(LocalDateTime.now());
            return saved;
        });

        // WHEN
        TestResultDto result = testResultService.createTestResult(form);

        // THEN
        assertNotNull(result);
        assertEquals(999L, result.getId());

        verify(questionChoiceRepository, times(1)).findById(11L);
        verify(testResultRepository, times(1)).save(any(TestResult.class));
    }

    @Test
    void submitTest_calculateScoreCorrectly() {
        // GIVEN
        when(testRepository.findById(TEST_ID)).thenReturn(Optional.of(mockTest));

        when(testResultRepository.save(any(TestResult.class))).thenAnswer(i -> {
            TestResult saved = i.getArgument(0);
            saved.setId(123L);
            return saved;
        });

        QuestionChoice choice11 = new QuestionChoice();
        choice11.setId(11L);
        choice11.setIsCorrect(true);

        QuestionChoice choice22 = new QuestionChoice();
        choice22.setId(22L);
        choice22.setIsCorrect(false);

        when(questionChoiceRepository.findById(11L)).thenReturn(Optional.of(choice11));
        when(questionChoiceRepository.findById(22L)).thenReturn(Optional.of(choice22));

        TestSubmissionForm form = new TestSubmissionForm();
        form.setTestId(TEST_ID);
        form.setUserId(USER_ID);

        AnswerSubmissionForm ans1 = new AnswerSubmissionForm();
        ans1.setQuestionChoiceId(11L);

        AnswerSubmissionForm ans2 = new AnswerSubmissionForm();
        ans2.setQuestionChoiceId(22L);

        form.setAnswers(List.of(ans1, ans2));

        // WHEN
        TestResultDto result = testResultService.createTestResult(form);

        // THEN
        assertNotNull(result);
        assertEquals(5.0, result.getScore());

        verify(testResultRepository, times(1)).save(any(TestResult.class));
    }
}