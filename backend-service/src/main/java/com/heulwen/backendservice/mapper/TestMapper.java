package com.heulwen.backendservice.mapper;

import com.heulwen.backendservice.dto.QuestionDto;
import com.heulwen.backendservice.dto.TestDto;
import com.heulwen.backendservice.form.QuestionCreateForm;
import com.heulwen.backendservice.form.TestCreateForm;
import com.heulwen.backendservice.model.Question;
import com.heulwen.backendservice.model.Test;

import java.util.ArrayList;
import java.util.List;

public class TestMapper {

    public static Test map(TestCreateForm form) {
        if (form == null) return null;

        Test test = new Test();
        test.setTitle(form.getTitle());
        test.setDescription(form.getDescription());

        if (form.getQuestions() != null) {
            List<Question> questions = new ArrayList<>();
            for (QuestionCreateForm qForm : form.getQuestions()) {
                Question question = QuestionMapper.map(qForm);
                question.setTest(test);
                questions.add(question);
            }
            test.setQuestions(questions);
        }
        return test;
    }

    public static TestDto map(Test test) {
        if (test == null) return null;

        TestDto dto = new TestDto();
        dto.setId(test.getId());
        dto.setTitle(test.getTitle());
        dto.setDescription(test.getDescription());

        List<QuestionDto> questionDtos = new ArrayList<>();
        if (test.getQuestions() != null) {
            for (Question question : test.getQuestions()) {
                questionDtos.add(QuestionMapper.map(question));
            }
        }
        dto.setQuestions(questionDtos);

        return dto;
    }
}