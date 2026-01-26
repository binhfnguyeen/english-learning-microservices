package com.heulwen.backendservice.service.impl;

import com.heulwen.backendservice.dto.TestDto;
import com.heulwen.backendservice.exception.ResourceNotFoundException;
import com.heulwen.backendservice.form.TestCreateForm;
import com.heulwen.backendservice.mapper.TestMapper;
import com.heulwen.backendservice.model.Test;
import com.heulwen.backendservice.repository.TestRepository;
import com.heulwen.backendservice.service.TestService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class TestServiceImpl implements TestService {

    private final TestRepository testRepository;

    @Override
    public TestDto createTest(TestCreateForm form) {
        Test test = TestMapper.map(form);
        test = testRepository.save(test);
        return TestMapper.map(test);
    }

    @Override
    @Transactional(readOnly = true)
    public TestDto getTestById(Long id) {
        Test test = testRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Test not found with id: " + id));
        return TestMapper.map(test);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TestDto> getAllTests() {
        return testRepository.findAll().stream()
                .map(TestMapper::map)
                .collect(Collectors.toList());
    }
}
