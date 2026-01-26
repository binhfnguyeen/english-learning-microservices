/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.heulwen.backendservice.controllers;

import com.heulwen.backendservice.dto.request.TopicRequest;
import com.heulwen.backendservice.dto.response.VocabTopicResponse;
import com.heulwen.backendservice.dto.response.ApiResponse;
import com.heulwen.backendservice.dto.response.TopicResponse;
import com.heulwen.backendservice.dto.response.VocabularyResponse;
import com.heulwen.backendservice.services.TopicService;
import java.util.List;
import java.util.Map;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 *
 * @author Dell
 */
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class ApiTopicController {

    TopicService topicService;

    @GetMapping("/topics")
    ApiResponse<Page<TopicResponse>> list(@RequestParam(required = false) String keyword, @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<TopicResponse> result = topicService.getTopics(keyword, pageable);
        return ApiResponse.<Page<TopicResponse>>builder()
                .code(1000)
                .result(result)
                .build();
    }

    @PostMapping("/topics")
    ApiResponse<TopicResponse> addOrUpdate(@RequestBody TopicRequest request) {
        TopicResponse result = topicService.addOrUpdateTopic(request);
        return ApiResponse.<TopicResponse>builder()
                .code(1000)
                .result(result)
                .build();
    }
    
    @GetMapping("/topics/{id}")
    ApiResponse<TopicResponse> retrieve(@PathVariable("id") Integer id){
        return ApiResponse.<TopicResponse>builder()
                .code(1000)
                .result(topicService.getTopicById(id))
                .build();
    }
    
    @DeleteMapping("/topics/{id}")
    ResponseEntity<?> delete(@PathVariable("id") int id){
        this.topicService.deleteTopic(id);
        return ResponseEntity.ok(Map.of("message", "Deleted successfully!"));
    }
    
    @GetMapping("/topics/{topicId}/vocabularies")
    ApiResponse<Page<VocabularyResponse>> list(@PathVariable("topicId") int topicId, 
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page, 
            @RequestParam(defaultValue = "10") int size){
        Pageable pageable = PageRequest.of(page, size);
        Page<VocabularyResponse> result = topicService.getVocabulariesWithTopic(topicId, keyword, pageable);
        return ApiResponse.<Page<VocabularyResponse>>builder()
                .code(1000)
                .result(result)
                .build();
    }
    
    @PostMapping("/topics/{topicId}/vocabularies")
    ApiResponse<VocabTopicResponse> addVocabToTopic(@PathVariable("topicId") int topicId, @RequestParam("vocabId") int vocabId){
        return ApiResponse.<VocabTopicResponse>builder()
                .code(1000)
                .result(topicService.addVocabToTopic(topicId, vocabId))
                .build();
    }
    
    @GetMapping("/topics/{topicId}/vocabularies/not-in")
    ApiResponse<List<VocabularyResponse>> getVocabNotInTopic(@PathVariable("topicId") int topicId, @RequestParam(required = false) String keyword) {
        return ApiResponse.<List<VocabularyResponse>> builder()
                .code(1000)
                .result(this.topicService.getVocabNotInTopic(topicId, keyword))
                .build();
    }
    
    @DeleteMapping("/topics/{topicId}/vocabularies")
    ResponseEntity<?> removeVocabFromTopic(@PathVariable("topicId") int topicId, @RequestParam("vocabId") int vocabId){
        this.topicService.removeVocabFromTopic(topicId, vocabId);
        return ResponseEntity.ok(Map.of("messages", "Vocabulary has been deleted!"));
    }
}
