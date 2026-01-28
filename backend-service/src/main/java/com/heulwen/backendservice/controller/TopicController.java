package com.heulwen.backendservice.controller;

import com.heulwen.backendservice.dto.ApiDto;
import com.heulwen.backendservice.dto.TopicDto;
import com.heulwen.backendservice.dto.VocabularyDto;
import com.heulwen.backendservice.form.TopicCreateForm;
import com.heulwen.backendservice.service.TopicService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/topics")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class TopicController {
    TopicService topicService;

    // --- GET LIST TOPICS ---
    @GetMapping
    public ApiDto<Page<TopicDto>> list(
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        Page<TopicDto> result = topicService.getTopics(keyword, pageable);

        return ApiDto.<Page<TopicDto>>builder()
                .code(1000)
                .result(result)
                .build();
    }

    // --- CREATE TOPIC ---
    @PostMapping
    public ApiDto<TopicDto> createTopic(@RequestBody TopicCreateForm request) {
        TopicDto result = topicService.addOrUpdateTopic(null, request);

        return ApiDto.<TopicDto>builder()
                .code(1000)
                .result(result)
                .build();
    }

    // --- UPDATE TOPIC ---
    @PutMapping("/{id}")
    public ApiDto<TopicDto> updateTopic(@PathVariable Long id, @RequestBody TopicCreateForm request) {
        // Truyền id để cập nhật
        TopicDto result = topicService.addOrUpdateTopic(id, request);

        return ApiDto.<TopicDto>builder()
                .code(1000)
                .message("Topic updated successfully")
                .result(result)
                .build();
    }

    // --- GET TOPIC BY ID ---
    @GetMapping("/{id}")
    public ApiDto<TopicDto> retrieve(@PathVariable("id") Long id) {
        return ApiDto.<TopicDto>builder()
                .code(1000)
                .result(topicService.getTopicById(id))
                .build();
    }

    // --- DELETE TOPIC ---
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable("id") Long id) {
        topicService.deleteTopic(id);
        return ResponseEntity.ok(Map.of("message", "Deleted successfully!"));
    }

    // --- GET VOCABULARIES IN TOPIC ---
    @GetMapping("/{topicId}/vocabularies")
    public ApiDto<Page<VocabularyDto>> listVocabsInTopic(
            @PathVariable("topicId") Long topicId,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        Page<VocabularyDto> result = topicService.getVocabulariesWithTopic(topicId, keyword, pageable);

        return ApiDto.<Page<VocabularyDto>>builder()
                .code(1000)
                .result(result)
                .build();
    }

    // --- ADD VOCAB TO TOPIC ---
    @PostMapping("/{topicId}/vocabularies")
    public ApiDto<String> addVocabToTopic(
            @PathVariable("topicId") Long topicId,
            @RequestParam("vocabId") Long vocabId
    ) {
        topicService.addVocabToTopic(topicId, vocabId);

        return ApiDto.<String>builder()
                .code(1000)
                .message("Vocabulary added to topic successfully")
                .build();
    }

    // --- GET VOCAB NOT IN TOPIC ---
    @GetMapping("/{topicId}/vocabularies/not-in")
    public ApiDto<List<VocabularyDto>> getVocabNotInTopic(
            @PathVariable("topicId") Long topicId,
            @RequestParam(required = false) String keyword
    ) {
        return ApiDto.<List<VocabularyDto>>builder()
                .code(1000)
                .result(topicService.getVocabNotInTopic(topicId, keyword))
                .build();
    }

    // --- REMOVE VOCAB FROM TOPIC ---
    @DeleteMapping("/{topicId}/vocabularies")
    public ResponseEntity<?> removeVocabFromTopic(
            @PathVariable("topicId") Long topicId,
            @RequestParam("vocabId") Long vocabId
    ) {
        topicService.removeVocabFromTopic(topicId, vocabId);
        return ResponseEntity.ok(Map.of("messages", "Vocabulary has been removed from topic!"));
    }
}
