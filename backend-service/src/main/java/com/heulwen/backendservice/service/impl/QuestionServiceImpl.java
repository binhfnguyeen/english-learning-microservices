package com.heulwen.backendservice.service.impl;

import com.heulwen.backendservice.dto.QuestionDto;
import com.heulwen.backendservice.exception.AppException;
import com.heulwen.backendservice.exception.ErrorCode;
import com.heulwen.backendservice.form.QuestionChoiceForm;
import com.heulwen.backendservice.form.QuestionCreateForm;
import com.heulwen.backendservice.mapper.QuestionChoiceMapper;
import com.heulwen.backendservice.mapper.QuestionMapper;
import com.heulwen.backendservice.model.Question;
import com.heulwen.backendservice.model.QuestionChoice;
import com.heulwen.backendservice.model.Test;
import com.heulwen.backendservice.model.Vocabulary;
import com.heulwen.backendservice.repository.QuestionRepository;
import com.heulwen.backendservice.repository.TestRepository;
import com.heulwen.backendservice.repository.VocabularyRepository;
import com.heulwen.backendservice.service.QuestionService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class QuestionServiceImpl implements QuestionService {

    QuestionRepository questionRepository;
    TestRepository testRepository;
    VocabularyRepository vocabularyRepository;

    @Override
    @Transactional
    public QuestionDto createQuestion(QuestionCreateForm form) {
        // 1. Map Question cơ bản
        Question question = QuestionMapper.map(form);

        // 2. Link tới Test (Parent)
        if (form.getTestId() != null) {
            Test test = testRepository.findById(form.getTestId())
                    .orElseThrow(() -> new AppException(ErrorCode.TEST_NOT_FOUND));
            question.setTest(test);
        }

        // 3. Xử lý Choices (Children) nếu có
        if (form.getChoices() != null && !form.getChoices().isEmpty()) {
            List<QuestionChoice> choices = new ArrayList<>();
            for (QuestionChoiceForm choiceForm : form.getChoices()) {
                QuestionChoice choice = QuestionChoiceMapper.map(choiceForm);
                choice.setQuestion(question); // Set Parent

                // Link tới Vocabulary nếu có
                if (choiceForm.getVocabularyId() != null) {
                    Vocabulary vocab = vocabularyRepository.findById(choiceForm.getVocabularyId())
                            .orElseThrow(() -> new AppException(ErrorCode.VOCAB_NOT_FOUND));
                    choice.setVocabulary(vocab);
                }
                choices.add(choice);
            }
            question.setChoices(choices);
        }

        // 4. Save (Cascade sẽ lưu Choices)
        return QuestionMapper.map(questionRepository.save(question));
    }

    @Override
    @Transactional
    public QuestionDto updateQuestion(Long id, QuestionCreateForm form) {
        Question question = questionRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.QUESTION_NOT_FOUND));

        // Update thông tin cơ bản
        QuestionMapper.map(form, question);

        // Update link tới Test nếu thay đổi
        if (form.getTestId() != null) {
            Test test = testRepository.findById(form.getTestId())
                    .orElseThrow(() -> new AppException(ErrorCode.TEST_NOT_FOUND));
            question.setTest(test);
        }

        // Nếu form gửi lên danh sách choices mới, cách đơn giản nhất là xóa cũ thêm mới:
        if (form.getChoices() != null) {
            // Xóa danh sách cũ (cần cấu hình orphanRemoval=true trong Entity Question)
            question.getChoices().clear();

            // Thêm danh sách mới
            for (QuestionChoiceForm choiceForm : form.getChoices()) {
                QuestionChoice choice = QuestionChoiceMapper.map(choiceForm);
                choice.setQuestion(question);

                if (choiceForm.getVocabularyId() != null) {
                    Vocabulary vocab = vocabularyRepository.findById(choiceForm.getVocabularyId())
                            .orElseThrow(() -> new AppException(ErrorCode.VOCAB_NOT_FOUND));
                    choice.setVocabulary(vocab);
                }
                question.getChoices().add(choice);
            }
        }

        return QuestionMapper.map(questionRepository.save(question));
    }

    @Override
    public List<QuestionDto> getAllQuestions() {
        return questionRepository.findAll().stream()
                .map(QuestionMapper::map)
                .toList();
    }

    @Override
    public QuestionDto getQuestionById(Long id) {
        Question question = questionRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.QUESTION_NOT_FOUND));
        return QuestionMapper.map(question);
    }

    @Override
    public void deleteQuestion(Long id) {
        if (!questionRepository.existsById(id)) {
            throw new AppException(ErrorCode.QUESTION_NOT_FOUND);
        }
        questionRepository.deleteById(id);
    }
}
