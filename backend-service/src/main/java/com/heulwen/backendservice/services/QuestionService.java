/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.heulwen.backendservice.services;

import com.heulwen.backendservice.dto.request.QuestionRequest;
import com.heulwen.backendservice.dto.response.QuestionResponse;
import com.heulwen.backendservice.exceptions.AppException;
import com.heulwen.backendservice.exceptions.ErrorCode;
import com.heulwen.backendservice.mapper.QuestionMapper;
import com.heulwen.backendservice.model.Question;
import com.heulwen.backendservice.repositories.QuestionRepository;
import java.util.List;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

/**
 *
 * @author Dell
 */
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class QuestionService {
    QuestionRepository questionRepository;
    QuestionMapper questionMapper;
    
    public QuestionResponse addOrUpdateQuestion(QuestionRequest request){
        Question question;
        
        if (request.getId() != null){
            question = questionRepository.findById(request.getId()).orElseThrow(()->new AppException(ErrorCode.QUESTION_NOT_FOUND));
            questionMapper.updateQuestionFromRequest(request, question);
        } else {
            question = questionMapper.toQuestion(request);
        }
        
        Question saved = questionRepository.save(question);
        return questionMapper.toQuestionResponse(saved);
    }
    
    public List<QuestionResponse> getQuestions(){
        return questionRepository.findAll().stream().map(questionMapper::toQuestionResponse).toList();
    }
    
    public QuestionResponse getQuestionById(int id){
        Question question = questionRepository.findById(id).orElseThrow(()->new AppException(ErrorCode.QUESTION_NOT_FOUND));
        return questionMapper.toQuestionResponse(question);
    }
    
    public void deleteQuestion(int id){
        this.questionRepository.deleteById(id);
    }
}
