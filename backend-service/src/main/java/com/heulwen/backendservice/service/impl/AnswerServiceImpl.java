package com.heulwen.backendservice.service.impl;

import com.heulwen.backendservice.dto.AnswerDto;
import com.heulwen.backendservice.mapper.AnswerMapper;
import com.heulwen.backendservice.model.Answer;
import com.heulwen.backendservice.repository.AnswerRepository;
import com.heulwen.backendservice.service.AnswerService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class AnswerServiceImpl implements AnswerService {
    private final AnswerRepository answerRepository;

    @Override
    public List<AnswerDto> getAnswersByTestResultId(Long testResultId) {
        List<Answer> answers = answerRepository.getAnswerByTestResult_Id(testResultId);
        return answers.stream().map(AnswerMapper::map).toList();
    }
}
