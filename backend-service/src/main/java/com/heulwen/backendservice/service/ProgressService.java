package com.heulwen.backendservice.service;

import com.heulwen.backendservice.dto.ProgressDto;
import com.heulwen.backendservice.dto.ProgressOverviewDto;

public interface ProgressService {
    ProgressOverviewDto getProgressOverview(Long userId);
    ProgressDto trackDailyProgress(Long userId);
}
