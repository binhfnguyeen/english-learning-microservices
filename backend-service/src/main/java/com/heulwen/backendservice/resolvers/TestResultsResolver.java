/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.heulwen.backendservice.resolvers;

import com.heulwen.backendservice.exceptions.AppException;
import com.heulwen.backendservice.exceptions.ErrorCode;
import com.heulwen.backendservice.model.TestResult;
import com.heulwen.backendservice.repositories.TestResultsRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Component;

/**
 *
 * @author Dell
 */
@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class TestResultsResolver {
    TestResultsRepository testResultsRepository;
    
    public TestResult fromId(Integer id) {
        return id == null ? null
                : testResultsRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.TEST_NOT_FOUND));
    }
}
