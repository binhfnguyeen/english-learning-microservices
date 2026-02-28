package com.heulwen.backendservice.controller;

import com.heulwen.backendservice.dto.ApiDto;
import com.heulwen.backendservice.dto.VocabularyDto;
import com.heulwen.backendservice.form.VocabularyCreateForm;
import com.heulwen.backendservice.service.VocabularyService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/vocabularies")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class VocabularyController {
    VocabularyService vocabularyService;

    @GetMapping
    public ApiDto<Page<VocabularyDto>> list(
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        Page<VocabularyDto> result = vocabularyService.getVocabularies(keyword, pageable);

        return ApiDto.<Page<VocabularyDto>>builder()
                .code(1000)
                .result(result)
                .build();
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ApiDto<VocabularyDto> addOrUpdate(
            @RequestParam(value = "id", required = false) Long id,
            @RequestParam("word") String word,
            @RequestParam("meaning") String meaning,
            @RequestParam("partOfSpeech") String partOfSpeech,
            @RequestParam("level") String level,
            @RequestParam(value = "picture", required = false) MultipartFile picFile
    ) {
        VocabularyCreateForm form = new VocabularyCreateForm();
        form.setWord(word);
        form.setMeaning(meaning);
        form.setPartOfSpeech(partOfSpeech);
        form.setLevel(level);

        VocabularyDto result;
        if (id != null) {
            result = vocabularyService.updateVocabulary(id, form, picFile);
        } else {
            result = vocabularyService.createVocabulary(form, picFile);
        }

        return ApiDto.<VocabularyDto>builder()
                .code(1000)
                .result(result)
                .build();
    }

    @GetMapping("/{id}")
    public ApiDto<VocabularyDto> retrieve(@PathVariable("id") Long id) {
        return ApiDto.<VocabularyDto>builder()
                .code(1000)
                .result(vocabularyService.getVocabularyById(id))
                .build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable("id") Long id) {
        vocabularyService.deleteVocabulary(id);
        return ResponseEntity.ok(Map.of("message", "Deleted successfully"));
    }
}
