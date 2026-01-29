package com.heulwen.backendservice.controller;

import com.heulwen.backendservice.dto.ApiDto;
import com.heulwen.backendservice.dto.ProgressDto;
import com.heulwen.backendservice.dto.ProgressOverviewDto;
import com.heulwen.backendservice.service.ProgressService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/progress")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class ProgressController {
    ProgressService progressService;

    // --- GET PROGRESS OVERVIEW ---
    @GetMapping("/{userId}/overview")
    public ApiDto<ProgressOverviewDto> getUserProgress(@PathVariable("userId") Long userId) {
        return ApiDto.<ProgressOverviewDto>builder()
                .code(1000)
                .result(progressService.getProgressOverview(userId))
                .build();
    }

    // --- TRACK DAILY PROGRESS ---
    @PostMapping("/{userId}/date-learned")
    public ApiDto<ProgressDto> trackDailyProgress(@PathVariable("userId") Long userId) {
        return ApiDto.<ProgressDto>builder()
                .code(1000)
                .result(progressService.trackDailyProgress(userId))
                .build();
    }
}
