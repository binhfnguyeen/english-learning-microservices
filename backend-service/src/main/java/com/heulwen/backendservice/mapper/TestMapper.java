package com.heulwen.backendservice.mapper;

import com.heulwen.backendservice.dto.TestDto;
import com.heulwen.backendservice.form.TestCreateForm;
import com.heulwen.backendservice.model.Test;

import java.util.List;
import java.util.stream.Collectors;

public class TestMapper {

    /**
     * CREATE
     * TestCreateForm -> Test
     * Tương đương toTest(TestRequest)
     */
    public static Test map(TestCreateForm form) {
        if (form == null) {
            return null;
        }

        Test test = new Test();
        test.setTitle(form.getTitle());
        test.setDescription(form.getDescription());
        return test;
    }

    /**
     * UPDATE
     * TestCreateForm -> existing Test
     */
    public static void map(TestCreateForm form, Test test) {
        if (form == null || test == null) {
            return;
        }

        test.setTitle(form.getTitle());
        test.setDescription(form.getDescription());
    }

    /**
     * READ
     * Test -> TestDto
     * Tương đương toTestResponse()
     */
    public static TestDto map(Test test) {
        if (test == null) {
            return null;
        }

        return TestDto.builder()
                .id(test.getId())
                .title(test.getTitle())
                .description(test.getDescription())
                .questions(
                        test.getQuestions() != null
                                ? test.getQuestions()
                                .stream()
                                .map(QuestionMapper::map)
                                .collect(Collectors.toList())
                                : List.of()
                )
                .build();
    }

    /**
     * READ LIST
     * List<Test> -> List<TestDto>
     */
    public static List<TestDto> map(List<Test> tests) {
        if (tests == null) {
            return List.of();
        }

        return tests.stream()
                .map(TestMapper::map)
                .collect(Collectors.toList());
    }
}