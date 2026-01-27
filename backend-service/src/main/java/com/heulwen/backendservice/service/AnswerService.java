package com.heulwen.backendservice.service;

import com.heulwen.backendservice.dto.AnswerDto;

import java.util.List;

public interface AnswerService {
    List<AnswerDto> getAnswersByTestResultId(Long testResultId);
}
