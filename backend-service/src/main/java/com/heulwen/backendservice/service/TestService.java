package com.heulwen.backendservice.service;

import com.heulwen.backendservice.dto.TestDto;
import com.heulwen.backendservice.form.TestCreateForm;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface TestService {
    TestDto createTest(TestCreateForm form);
    TestDto updateTest(Long id, TestCreateForm form); // Sử dụng CreateForm hoặc UpdateForm
    Page<TestDto> getTests(String keyword, Pageable pageable);
    TestDto getTestById(Long id);
    void deleteTest(Long id);
}
