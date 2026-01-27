package com.heulwen.backendservice.mapper;

import com.heulwen.backendservice.dto.QuestionChoiceDto;
import com.heulwen.backendservice.dto.QuestionDto;
import com.heulwen.backendservice.form.QuestionChoiceForm;
import com.heulwen.backendservice.form.QuestionCreateForm;
import com.heulwen.backendservice.model.Question;
import com.heulwen.backendservice.model.QuestionChoice;
import com.heulwen.backendservice.model.Vocabulary;

import java.util.List;
import java.util.stream.Collectors;

public class QuestionMapper {

    /**
     * CREATE
     * QuestionCreateForm -> Question
     */
    public static Question map(QuestionCreateForm form) {
        if (form == null) {
            return null;
        }

        Question question = new Question();
        question.setContent(form.getContent());
        return question;
    }

    /**
     * UPDATE
     * QuestionCreateForm -> existing Question
     */
    public static void map(QuestionCreateForm form, Question question) {
        if (form == null || question == null) {
            return;
        }

        question.setContent(form.getContent());
    }

    /**
     * READ
     * Question -> QuestionDto
     */
    public static QuestionDto map(Question question) {
        if (question == null) {
            return null;
        }

        return QuestionDto.builder()
                .id(question.getId())
                .content(question.getContent())
                .choices(
                        question.getChoices() != null
                                ? question.getChoices()
                                .stream()
                                .map(QuestionMapper::map)
                                .collect(Collectors.toList())
                                : List.of()
                )
                .build();
    }

    /**
     * CREATE
     * QuestionChoiceForm + resolved Vocabulary -> QuestionChoice
     */
    public static QuestionChoice map(
            QuestionChoiceForm form,
            Question question,
            Vocabulary vocabulary
    ) {
        if (form == null) {
            return null;
        }

        QuestionChoice choice = new QuestionChoice();
        choice.setIsCorrect(form.getIsCorrect());
        choice.setQuestion(question);
        choice.setVocabulary(vocabulary);

        return choice;
    }

    /**
     * READ
     * QuestionChoice -> QuestionChoiceDto
     */
    public static QuestionChoiceDto map(QuestionChoice choice) {
        if (choice == null) {
            return null;
        }

        return QuestionChoiceDto.builder()
                .id(choice.getId())
                .isCorrect(choice.getIsCorrect())
                .vocabulary(VocabularyMapper.map(choice.getVocabulary()))
                .build();
    }
}