package com.heulwen.backendservice.mapper;

import com.heulwen.backendservice.dto.TestResultDto;
import com.heulwen.backendservice.model.TestResult;

public class TestResultMapper {

    public static TestResultDto map(TestResult entity) {
        var dto = new TestResultDto();
        dto.setId(entity.getId());
        dto.setScore(entity.getScore());
        dto.setDateTaken(entity.getDateTaken());
        dto.setTestTitle(entity.getTest() != null ? entity.getTest().getTitle() : null);
        dto.setUserId(entity.getUser() != null ? entity.getUser().getId() : null);
        return dto;
    }
}