package com.heulwen.backendservice.service.impl;

import com.heulwen.backendservice.dto.TestDto;
import com.heulwen.backendservice.exception.AppException;
import com.heulwen.backendservice.exception.ErrorCode;
import com.heulwen.backendservice.form.QuestionChoiceForm;
import com.heulwen.backendservice.form.QuestionCreateForm;
import com.heulwen.backendservice.form.TestCreateForm;
import com.heulwen.backendservice.mapper.QuestionMapper;
import com.heulwen.backendservice.mapper.TestMapper;
import com.heulwen.backendservice.model.*;
import com.heulwen.backendservice.repository.TestRepository;
import com.heulwen.backendservice.repository.TopicRepository;
import com.heulwen.backendservice.repository.VocabularyRepository;
import com.heulwen.backendservice.service.TestService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class TestServiceImpl implements TestService {

    TestRepository testRepository;
    VocabularyRepository vocabularyRepository;
    TopicRepository topicRepository;

    @Override
    @Transactional
    public TestDto createTest(TestCreateForm form) {
        Test test = TestMapper.map(form);

        if (form.getTopicId() != null) {
            Topic topic = topicRepository.findById(form.getTopicId())
                    .orElseThrow(() -> new AppException(ErrorCode.TOPIC_NOT_FOUND));
            test.setTopic(topic);
        }
        if (form.getQuestions() != null && !form.getQuestions().isEmpty()) {
            List<Question> questions = new ArrayList<>();

            for (QuestionCreateForm qForm : form.getQuestions()) {
                Question question = QuestionMapper.map(qForm);
                question.setTest(test);
                List<QuestionChoice> choices = new ArrayList<>();

                if (qForm.getChoices() != null && !qForm.getChoices().isEmpty()) {
                    for (QuestionChoiceForm cForm : qForm.getChoices()) {

                        Vocabulary vocab = null;
                        if (cForm.getVocabularyId() != null) {
                            vocab = vocabularyRepository.findById(cForm.getVocabularyId())
                                    .orElseThrow(() -> new AppException(ErrorCode.VOCAB_NOT_FOUND));
                        }

                        QuestionChoice choice = QuestionMapper.map(cForm, question, vocab);
                        choices.add(choice);
                    }
                }

                question.setChoices(choices);
                questions.add(question);
            }
            test.setQuestions(questions);
        }

        return TestMapper.map(testRepository.save(test));
    }

    @Override
    @Transactional
    public TestDto updateTest(Long id, TestCreateForm form) {
        Test test = testRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.TEST_NOT_FOUND));
        TestMapper.map(form, test);

        return TestMapper.map(testRepository.save(test));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<TestDto> getTests(String keyword, Pageable pageable) {
        Page<Test> testResult;
        if (keyword != null && !keyword.isEmpty()) {
            testResult = testRepository.findByTitleContainingIgnoreCase(keyword, pageable);
        } else {
            testResult = testRepository.findAll(pageable);
        }
        return testResult.map(TestMapper::map);
    }

    @Override
    @Transactional(readOnly = true)
    public TestDto getTestById(Long id) {
        Test test = testRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.TEST_NOT_FOUND));
        return TestMapper.map(test);
    }

    @Override
    @Transactional
    public void deleteTest(Long id) {
        if (!testRepository.existsById(id)) {
            throw new AppException(ErrorCode.TEST_NOT_FOUND);
        }
        testRepository.deleteById(id);
    }
}