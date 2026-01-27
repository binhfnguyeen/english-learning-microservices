package com.heulwen.backendservice.mapper;

import com.heulwen.backendservice.dto.TestResultDto;
import com.heulwen.backendservice.model.TestResult;

import java.util.List;
import java.util.stream.Collectors;

public class TestResultMapper {

    /**
     * READ
     * TestResult -> TestResultDto
     * Tương đương toTestResultsResponse()
     */
    public static TestResultDto map(TestResult entity) {
        if (entity == null) {
            return null;
        }

        return TestResultDto.builder()
                .id(entity.getId())
                .score(entity.getScore())
                .dateTaken(entity.getDateTaken())
                .testTitle(
                        entity.getTest() != null
                                ? entity.getTest().getTitle()
                                : null
                )
                .userId(
                        entity.getUser() != null
                                ? entity.getUser().getId()
                                : null
                )
                .build();
    }

    /**
     * READ LIST
     * List<TestResult> -> List<TestResultDto>
     */
    public static List<TestResultDto> map(List<TestResult> entities) {
        if (entities == null) {
            return List.of();
        }

        return entities.stream()
                .map(TestResultMapper::map)
                .collect(Collectors.toList());
    }
}
