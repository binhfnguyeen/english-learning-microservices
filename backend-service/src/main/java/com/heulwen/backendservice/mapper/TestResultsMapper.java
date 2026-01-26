/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Interface.java to edit this template
 */
package com.heulwen.backendservice.mapper;

import com.heulwen.backendservice.dto.request.TestResultsRequest;
import com.heulwen.backendservice.dto.response.TestResultsResponse;
import com.heulwen.backendservice.model.TestResult;
import com.heulwen.backendservice.resolvers.TestResolver;
import com.heulwen.backendservice.resolvers.UserResolver;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

/**
 *
 * @author Dell
 */
@Mapper(componentModel = "spring", uses = {TestResolver.class, UserResolver.class, AnswerMapper.class})
public interface TestResultsMapper {
    
    @Mapping(source = "userId", target = "userId")
    @Mapping(source = "testId", target = "testId")
    @Mapping(source = "answers", target = "answerSet")
    TestResult toTestResults(TestResultsRequest request);
    
    @Mapping(source = "answerSet", target = "answers")
    TestResultsResponse toTestResultsResponse(TestResult testResult);
}
