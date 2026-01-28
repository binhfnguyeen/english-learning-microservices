package com.heulwen.backendservice.controller;

import com.heulwen.backendservice.dto.ApiDto;
import com.heulwen.backendservice.dto.TestDto;
import com.heulwen.backendservice.form.TestCreateForm;
import com.heulwen.backendservice.service.TestService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/tests")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class TestController {
    TestService testService;

    // --- GET LIST TESTS ---
    @GetMapping
    public ApiDto<Page<TestDto>> list(
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        Page<TestDto> result = testService.getTests(keyword, pageable);

        return ApiDto.<Page<TestDto>>builder()
                .code(1000)
                .result(result)
                .build();
    }

    // --- CREATE TEST (Hỗ trợ cả tạo thường và tạo Full câu hỏi) ---
    @PostMapping
    public ApiDto<TestDto> createTest(@RequestBody TestCreateForm request) {
        // Logic trong Service đã xử lý việc loop qua questions và choices nếu có trong request
        return ApiDto.<TestDto>builder()
                .code(1000)
                .result(testService.createTest(request))
                .build();
    }

    // --- UPDATE TEST ---
    @PutMapping("/{id}")
    public ApiDto<TestDto> updateTest(@PathVariable Long id, @RequestBody TestCreateForm request) {
        return ApiDto.<TestDto>builder()
                .code(1000)
                .message("Test updated successfully")
                .result(testService.updateTest(id, request))
                .build();
    }

    // --- GET TEST BY ID (Trả về Full thông tin nếu Mapper map đủ) ---
    @GetMapping("/{id}")
    public ApiDto<TestDto> retrieve(@PathVariable("id") Long id) {
        return ApiDto.<TestDto>builder()
                .code(1000)
                .result(testService.getTestById(id))
                .build();
    }

    // --- DELETE TEST ---
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable("id") Long id) {
        testService.deleteTest(id);
        return ResponseEntity.ok(Map.of("message", "Deleted successfully!"));
    }
}
