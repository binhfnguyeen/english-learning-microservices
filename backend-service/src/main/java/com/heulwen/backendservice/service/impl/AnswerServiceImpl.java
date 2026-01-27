package com.heulwen.backendservice.service.impl;

import com.heulwen.backendservice.dto.AnswerDto;
import com.heulwen.backendservice.mapper.AnswerMapper;
import com.heulwen.backendservice.model.Answer;
import com.heulwen.backendservice.repository.AnswerRepository;
import com.heulwen.backendservice.service.AnswerService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AnswerServiceImpl implements AnswerService {

    AnswerRepository answerRepository;

    @Override
    @Transactional(readOnly = true)
    public List<AnswerDto> getAnswersByTestResultId(Long testResultId) {
        return answerRepository.getAnswerByTestResult_Id(testResultId).stream()
                .map(AnswerMapper::map)
                .toList();
    }
}
