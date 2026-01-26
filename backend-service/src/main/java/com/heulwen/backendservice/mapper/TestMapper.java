/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.heulwen.backendservice.mapper;

import com.heulwen.backendservice.dto.request.TestRequest;
import com.heulwen.backendservice.dto.response.TestResponse;
import com.heulwen.backendservice.model.Test;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

/**
 *
 * @author Dell
 */
@Mapper(componentModel = "spring")
public interface TestMapper {
    Test toTest(TestRequest  request);
    TestResponse toTestResponse(Test test);
    void updateTestFromRequest(TestRequest request, @MappingTarget Test test);
}
