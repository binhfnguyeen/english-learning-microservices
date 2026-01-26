/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Interface.java to edit this template
 */
package com.heulwen.backendservice.mapper;

import com.heulwen.backendservice.dto.request.AnswerRequest;
import com.heulwen.backendservice.dto.response.AnswerResponse;
import com.heulwen.backendservice.model.Answer;
import com.heulwen.backendservice.resolvers.QuestionChoiceResolver;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

/**
 *
 * @author Dell
 */
@Mapper(componentModel = "spring", uses = {QuestionChoiceResolver.class})
public interface AnswerMapper {
    
    @Mapping(source = "questionChoiceId", target = "questionChoiceId")
    Answer toAnswer(AnswerRequest request);
    
    AnswerResponse toAnswerResponse(Answer answer);
}
