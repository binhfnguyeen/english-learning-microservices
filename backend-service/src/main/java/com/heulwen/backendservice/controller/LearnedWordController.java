package com.heulwen.backendservice.controller;

import com.heulwen.backendservice.dto.ApiDto;
import com.heulwen.backendservice.dto.LearnedWordDto;
import com.heulwen.backendservice.dto.UserStatsDto;
import com.heulwen.backendservice.form.LearnedWordCreateForm;
import com.heulwen.backendservice.service.LearnedWordService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class LearnedWordController {
    LearnedWordService learnedWordService;

    // --- ADD LEARNED WORD ---
    @PostMapping("/learned-words")
    public ApiDto<LearnedWordDto> addLearnedWord(@RequestBody LearnedWordCreateForm request) {
        return ApiDto.<LearnedWordDto>builder()
                .code(1000)
                .result(learnedWordService.addLearnedWord(request))
                .build();
    }

    // --- GET LEARNED WORDS BY USER ---
    @GetMapping("/learned-words/{userId}")
    public ApiDto<List<LearnedWordDto>> getLearnedWordsByUser(@PathVariable("userId") Long userId) { // Đổi int -> Long
        return ApiDto.<List<LearnedWordDto>>builder()
                .code(1000)
                .result(learnedWordService.getLearnedWordsByUser(userId))
                .build();
    }

    // --- GET USER STATS (Leaderboard/Thống kê) ---
    @GetMapping("learned-words")
    public ApiDto<List<UserStatsDto>> getUserLearnedWordsStats() {
        return ApiDto.<List<UserStatsDto>>builder()
                .code(1000)
                .result(learnedWordService.getUserLearnedWordsStats())
                .build();
    }
}
