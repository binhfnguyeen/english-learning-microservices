/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.heulwen.backendservice.services;

import com.heulwen.backendservice.dto.request.TestResultsRequest;
import com.heulwen.backendservice.dto.response.TestResultsResponse;
import com.heulwen.backendservice.exceptions.AppException;
import com.heulwen.backendservice.exceptions.ErrorCode;
import com.heulwen.backendservice.mapper.TestResultsMapper;
import com.heulwen.backendservice.model.Answer;
import com.heulwen.backendservice.model.QuestionChoice;
import com.heulwen.backendservice.model.TestResult;
import com.heulwen.backendservice.repositories.QuestionChoiceRepository;
import com.heulwen.backendservice.repositories.TestResultsRepository;
import java.util.HashSet;
import java.util.List;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

/**
 *
 * @author Dell
 */
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class TestResultsService {

    TestResultsRepository testResultsRepository;
    QuestionChoiceRepository questionChoiceRepository;
    TestResultsMapper testResultsMapper;

    public TestResultsResponse createTestResults(TestResultsRequest request) {
        TestResult testResult = testResultsMapper.toTestResults(request);

        if (request.getAnswers() != null && !request.getAnswers().isEmpty()) {
            List<Answer> answerList = request.getAnswers().stream()
                    .map(ansReq -> {
                        Answer answer = new Answer();
                        answer.setTestResultId(testResult);
                        QuestionChoice qc = questionChoiceRepository.getReferenceById(ansReq.getQuestionChoiceId());
                        answer.setQuestionChoiceId(qc);
                        return answer;
                    })
                    .toList();

            testResult.setAnswerSet(new HashSet<>(answerList));
        }
        TestResult saved = testResultsRepository.save(testResult);
        return testResultsMapper.toTestResultsResponse(saved);
    }

    public List<TestResultsResponse> getTestResults() {
        return testResultsRepository.findAll().stream().map(testResultsMapper::toTestResultsResponse).toList();
    }

    public TestResultsResponse getTestResultsById(int id) {
        TestResult testResult = testResultsRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.TEST_RESULTS_NOT_FOUND));
        return testResultsMapper.toTestResultsResponse(testResult);
    }

    public List<TestResultsResponse> getResultTestByUser(int userId, int testId) {
        List<TestResult> testResults = testResultsRepository.findByUserId_IdAndTestId_Id(userId, testId);
        return testResults.stream().map(testResultsMapper::toTestResultsResponse).toList();
    }
}
