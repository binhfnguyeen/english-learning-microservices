package com.heulwen.backendservice.service;

import com.heulwen.backendservice.dto.LearnedWordDto;

import java.util.List;

public interface LearnedWordService {
    List<LearnedWordDto> getLearnedWordsByUserId(Long userId);
    boolean isWordLearned(Long userId, Long vocabularyId);
}
