package com.heulwen.backendservice.service;

import com.heulwen.backendservice.dto.LearnedWordDto;
import com.heulwen.backendservice.dto.UserStatsDto;
import com.heulwen.backendservice.form.LearnedWordCreateForm;

import java.util.List;

public interface LearnedWordService {
    LearnedWordDto addLearnedWord(LearnedWordCreateForm form);
    List<LearnedWordDto> getLearnedWordsByUser(Long userId);
    List<UserStatsDto> getUserLearnedWordsStats();
}
