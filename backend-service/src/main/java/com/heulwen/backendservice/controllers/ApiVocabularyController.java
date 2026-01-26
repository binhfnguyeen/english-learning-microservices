/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.heulwen.backendservice.controllers;

import com.heulwen.backendservice.dto.request.VocabularyCreationRequest;
import com.heulwen.backendservice.dto.response.ApiResponse;
import com.heulwen.backendservice.dto.response.VocabularyResponse;
import com.heulwen.backendservice.services.VocabularyService;
import java.io.IOException;
import java.util.Map;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

/**
 *
 * @author Dell
 */
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class ApiVocabularyController {

    VocabularyService vocabularyService;

    @GetMapping("/vocabularies")
    ApiResponse<Page<VocabularyResponse>> list(@RequestParam(required = false) String keyword, @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<VocabularyResponse> result = vocabularyService.getVocabularies(keyword, pageable);
        return ApiResponse.<Page<VocabularyResponse>>builder()
                .code(1000)
                .result(result)
                .build();
    }

    @PostMapping(path = "/vocabularies", consumes = MediaType.MULTIPART_FORM_DATA_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    ApiResponse<VocabularyResponse> add(
            @RequestParam(value = "id", required = false) Integer id, @RequestParam("word") String word,
            @RequestParam("meaning") String meaning, @RequestParam("partOfSpeech") String partOfSpeech,
            @RequestParam("picture") MultipartFile picFile) throws IOException {
        VocabularyCreationRequest request = new VocabularyCreationRequest();
        if (id != null) {
            request.setId(id);
        }
        request.setMeaning(meaning);
        request.setWord(word);
        request.setPartOfSpeech(partOfSpeech);
        VocabularyResponse result = vocabularyService.addOrUpdateVocabulary(request, picFile);
        return ApiResponse.<VocabularyResponse>builder()
                .code(1000)
                .result(result)
                .build();
    }

    @GetMapping("/vocabularies/{id}")
    ApiResponse<VocabularyResponse> retrieve(@PathVariable("id") int id) {
        return ApiResponse.<VocabularyResponse>builder()
                .code(1000)
                .result(vocabularyService.getVocabularyById(id))
                .build();
    }

    @DeleteMapping("/vocabularies/{id}")
    ResponseEntity<?> delete(@PathVariable("id") int id) {
        this.vocabularyService.deleteVocabulary(id);
        return ResponseEntity.ok(Map.of("message", "Deleted successfully"));
    }
}
