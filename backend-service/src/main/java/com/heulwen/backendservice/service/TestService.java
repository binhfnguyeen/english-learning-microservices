package com.heulwen.backendservice.service;

import com.heulwen.backendservice.dto.TestDto;
import com.heulwen.backendservice.form.TestCreateForm;

import java.util.List;

public interface TestService {
    TestDto createTest(TestCreateForm form);
    TestDto getTestById(Long id);
    List<TestDto> getAllTests();
}
