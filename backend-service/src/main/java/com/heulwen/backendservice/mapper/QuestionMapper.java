package com.heulwen.backendservice.mapper;

import com.heulwen.backendservice.dto.QuestionChoiceDto;
import com.heulwen.backendservice.dto.QuestionDto;
import com.heulwen.backendservice.form.QuestionChoiceForm;
import com.heulwen.backendservice.form.QuestionCreateForm;
import com.heulwen.backendservice.model.Question;
import com.heulwen.backendservice.model.QuestionChoice;

import java.util.ArrayList;
import java.util.List;

public class QuestionMapper {

    // --- MAP QUESTION: FORM -> ENTITY ---
    public static Question map(QuestionCreateForm form) {
        if (form == null) return null;

        Question question = new Question();
        question.setContent(form.getContent());

        if (form.getChoices() != null) {
            List<QuestionChoice> choices = new ArrayList<>();
            for (QuestionChoiceForm choiceForm : form.getChoices()) {
                choices.add(map(choiceForm, question));
            }
            question.setChoices(choices);
        }
        return question;
    }

    // --- MAP QUESTION: ENTITY -> DTO ---
    public static QuestionDto map(Question question) {
        if (question == null) return null;

        QuestionDto dto = new QuestionDto();
        dto.setId(question.getId());
        dto.setContent(question.getContent());

        List<QuestionChoiceDto> choiceDtos = new ArrayList<>();
        if (question.getChoices() != null) {
            for (QuestionChoice choice : question.getChoices()) {
                choiceDtos.add(map(choice));
            }
        }
        dto.setChoices(choiceDtos);

        return dto;
    }

    // --- MAP CHOICE: FORM -> ENTITY ---
    public static QuestionChoice map(QuestionChoiceForm form, Question parent) {
        QuestionChoice choice = new QuestionChoice();
        choice.setIsCorrect(form.getIsCorrect());
        choice.setQuestion(parent);
        return choice;
    }

    // --- MAP CHOICE: ENTITY -> DTO ---
    public static QuestionChoiceDto map(QuestionChoice choice) {
        QuestionChoiceDto dto = new QuestionChoiceDto();
        dto.setId(choice.getId());
        dto.setIsCorrect(choice.getIsCorrect());
        dto.setVocabulary(VocabularyMapper.map(choice.getVocabulary()));
        return dto;
    }
}