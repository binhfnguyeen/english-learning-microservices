/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.heulwen.backendservice.services;

import com.heulwen.backendservice.dto.request.FullTestRequest;
import com.heulwen.backendservice.dto.request.QuestionChoiceRequest;
import com.heulwen.backendservice.dto.request.QuestionTestRequest;
import com.heulwen.backendservice.dto.request.TestRequest;
import com.heulwen.backendservice.dto.response.QuestionChoiceResponse;
import com.heulwen.backendservice.dto.response.QuestionTestResponse;
import com.heulwen.backendservice.dto.response.TestFullResponse;
import com.heulwen.backendservice.dto.response.TestResponse;
import com.heulwen.backendservice.exceptions.AppException;
import com.heulwen.backendservice.exceptions.ErrorCode;
import com.heulwen.backendservice.mapper.TestMapper;
import com.heulwen.backendservice.model.Question;
import com.heulwen.backendservice.model.QuestionChoice;
import com.heulwen.backendservice.model.Test;
import com.heulwen.backendservice.model.Vocabulary;
import com.heulwen.backendservice.repositories.TestRepository;
import com.heulwen.backendservice.repositories.VocabularyRepository;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

/**
 *
 * @author Dell
 */
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class TestService {

    TestRepository testRepository;
    VocabularyRepository vocabularyRepository;
    TestMapper testMapper;

    private TestFullResponse toTestFullResponse(Test test) {
        List<QuestionTestResponse> questions = test.getQuestionSet().stream().map(q -> {
            List<QuestionChoiceResponse> choices = q.getQuestionChoiceSet().stream().map(c -> {
                return new QuestionChoiceResponse(
                        c.getId(),
                        c.getIsCorrect(),
                        c.getVocabularyId() != null ? c.getVocabularyId().getId() : null,
                        c.getVocabularyId() != null ? c.getVocabularyId().getWord() : null
                );
            }).toList();

            return new QuestionTestResponse(q.getId(), q.getContent(), choices);
        }).toList();

        return new TestFullResponse(test.getId(), test.getTitle(), test.getDescription(), questions);
    }

    public TestResponse addOrUpdateTest(TestRequest request) {
        Test test;

        if (request.getId() != null) {
            test = testRepository.findById(request.getId()).orElseThrow(() -> new AppException(ErrorCode.TEST_NOT_FOUND));
            testMapper.updateTestFromRequest(request, test);
        } else {
            test = testMapper.toTest(request);
        }

        Test saved = testRepository.save(test);
        return testMapper.toTestResponse(saved);
    }

    public Page<TestResponse> getTests(String keyword, Pageable pageable) {
        Page<Test> testResult;
        if (keyword != null && !keyword.isEmpty()){
            testResult = testRepository.findByTitleContainingIgnoreCase(keyword, pageable);
        } else {
            testResult = testRepository.findAll(pageable);
        }
        return testResult.map(testMapper::toTestResponse);
    }

    public TestResponse getTestById(int id) {
        Test test = testRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.TEST_NOT_FOUND));
        return testMapper.toTestResponse(test);
    }

    public void deleteTest(int id) {
        testRepository.deleteById(id);
    }

    public void createFullTest(FullTestRequest request) {
        Test test = new Test();
        test.setTitle(request.getTitle());
        test.setDescription(request.getDescription());

        Set<Question> questions = new HashSet<>();

        for (QuestionTestRequest qr : request.getQuestions()) {
            Question question = new Question();
            question.setContent(qr.getContent());
            question.setTestId(test);

            Set<QuestionChoice> choices = new HashSet<>();

            for (QuestionChoiceRequest cr : qr.getChoices()) {
                Vocabulary vocab = vocabularyRepository.findById(cr.getVocabularyId())
                        .orElseThrow(() -> new AppException(ErrorCode.VOCAB_NOT_FOUND));

                QuestionChoice choice = new QuestionChoice();
                choice.setVocabularyId(vocab);
                choice.setIsCorrect(cr.isCorrect());
                choice.setQuestionId(question);

                choices.add(choice);
            }

            question.setQuestionChoiceSet(choices);
            questions.add(question);
        }

        test.setQuestionSet(questions);
        testRepository.save(test);
    }

    public List<TestFullResponse> getAllTestsFull() {
        return testRepository.findAll().stream().map(this::toTestFullResponse).toList();
    }

    public TestFullResponse getTestFullById(int id) {
        Test test = testRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.TEST_NOT_FOUND));
        return toTestFullResponse(test);
    }
}
