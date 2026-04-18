package com.heulwen.backendservice.mapper;

import com.heulwen.backendservice.dto.TestDto;
import com.heulwen.backendservice.dto.TopicDto;
import com.heulwen.backendservice.form.TestCreateForm;
import com.heulwen.backendservice.model.Test;

import java.util.List;
import java.util.stream.Collectors;

public class TestMapper {

    public static Test map(TestCreateForm form) {
        if (form == null) {
            return null;
        }

        Test test = new Test();
        test.setTitle(form.getTitle());
        test.setDescription(form.getDescription());
        test.setDifficultyLevel(form.getDifficultyLevel());
        return test;
    }

    public static void map(TestCreateForm form, Test test) {
        if (form == null || test == null) {
            return;
        }

        test.setTitle(form.getTitle());
        test.setDescription(form.getDescription());
        test.setDifficultyLevel(form.getDifficultyLevel());
    }

    public static TestDto map(Test test) {
        if (test == null) {
            return null;
        }

        TopicDto mappedTopic = null;
        if (test.getTopic() != null) {
            int vocabCount = (test.getTopic().getVocabularies() != null)
                    ? test.getTopic().getVocabularies().size()
                    : 0;

            mappedTopic = TopicMapper.map(test.getTopic(), vocabCount);
        }

        return TestDto.builder()
                .id(test.getId())
                .title(test.getTitle())
                .description(test.getDescription())
                .difficultyLevel(test.getDifficultyLevel())
                .questions(
                        test.getQuestions() != null
                                ? test.getQuestions()
                                .stream()
                                .map(QuestionMapper::map)
                                .collect(Collectors.toList())
                                : List.of()
                )
                .topic(mappedTopic)
                .build();
    }

    public static List<TestDto> map(List<Test> tests) {
        if (tests == null) {
            return List.of();
        }

        return tests.stream()
                .map(TestMapper::map)
                .collect(Collectors.toList());
    }
}