/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.heulwen.backendservice.resolvers;

import com.heulwen.backendservice.exceptions.AppException;
import com.heulwen.backendservice.exceptions.ErrorCode;
import com.heulwen.backendservice.model.QuestionChoice;
import com.heulwen.backendservice.repositories.QuestionChoiceRepository;
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
public class QuestionChoiceResolver {
    QuestionChoiceRepository questionChoiceRepository;
    
    public QuestionChoice fromId(Integer id) {
        return id == null ? null
                : questionChoiceRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.QUESTION_NOT_FOUND));
    }
    
}
