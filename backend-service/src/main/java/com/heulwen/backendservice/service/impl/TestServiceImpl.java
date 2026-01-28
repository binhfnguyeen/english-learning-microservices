package com.heulwen.backendservice.service.impl;

import com.heulwen.backendservice.dto.TestDto;
import com.heulwen.backendservice.exception.ResourceNotFoundException;
import com.heulwen.backendservice.form.ExerciseChoiceForm; // Tạm dùng nếu chưa có QuestionChoiceForm
import com.heulwen.backendservice.form.QuestionChoiceForm; // Cần tạo form này
import com.heulwen.backendservice.form.QuestionCreateForm; // Cần tạo form này
import com.heulwen.backendservice.form.TestCreateForm;
import com.heulwen.backendservice.mapper.QuestionChoiceMapper;
import com.heulwen.backendservice.mapper.QuestionMapper;
import com.heulwen.backendservice.mapper.TestMapper;
import com.heulwen.backendservice.model.Question;
import com.heulwen.backendservice.model.QuestionChoice;
import com.heulwen.backendservice.model.Test;
import com.heulwen.backendservice.model.Vocabulary;
import com.heulwen.backendservice.repository.TestRepository;
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

    @Override
    @Transactional
    public TestDto createTest(TestCreateForm form) {
        // 1. Map Test cơ bản
        Test test = TestMapper.map(form);

        // 2. Xử lý danh sách câu hỏi (Questions) nếu có trong form
        if (form.getQuestions() != null && !form.getQuestions().isEmpty()) {
            List<Question> questions = new ArrayList<>();

            for (QuestionCreateForm qForm : form.getQuestions()) {
                Question question = QuestionMapper.map(qForm);
                question.setTest(test); // Set relationship Parent

                // 3. Xử lý các lựa chọn (Choices) của câu hỏi
                if (qForm.getChoices() != null && !qForm.getChoices().isEmpty()) {
                    List<QuestionChoice> choices = new ArrayList<>();

                    for (QuestionChoiceForm cForm : qForm.getChoices()) {
                        QuestionChoice choice = QuestionChoiceMapper.map(cForm);
                        choice.setQuestion(question); // Set relationship Parent

                        // 4. Lookup Vocabulary (Logic cũ: check vocabularyId)
                        if (cForm.getVocabularyId() != null) {
                            Vocabulary vocab = vocabularyRepository.findById(cForm.getVocabularyId())
                                    .orElseThrow(() -> new ResourceNotFoundException("Vocabulary not found id: " + cForm.getVocabularyId()));
                            choice.setVocabulary(vocab);
                        }
                        choices.add(choice);
                    }
                    question.setChoices(choices);
                }
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
                .orElseThrow(() -> new ResourceNotFoundException("Test not found with id: " + id));
        TestMapper.map(form, test);

        return TestMapper.map(testRepository.save(test));
    }

    @Override
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
    public TestDto getTestById(Long id) {
        Test test = testRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Test not found with id: " + id));
        return TestMapper.map(test);
    }

    @Override
    @Transactional
    public void deleteTest(Long id) {
        if (!testRepository.existsById(id)) {
            throw new ResourceNotFoundException("Test not found with id: " + id);
        }
        testRepository.deleteById(id);
    }
}