package com.heulwen.backendservice.service.impl;

import com.heulwen.backendservice.dto.ApiDto;
import com.heulwen.backendservice.dto.ProgressDto;
import com.heulwen.backendservice.dto.ProgressOverviewDto;
import com.heulwen.backendservice.dto.UserDto;
import com.heulwen.backendservice.exception.ResourceNotFoundException;
import com.heulwen.backendservice.mapper.ProgressMapper;
import com.heulwen.backendservice.model.Progress;
import com.heulwen.backendservice.repository.LearnedWordRepository;
import com.heulwen.backendservice.repository.ProgressRepository;
import com.heulwen.backendservice.repository.httpClient.UserClient;
import com.heulwen.backendservice.service.ProgressService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class ProgressServiceImpl implements ProgressService {

    ProgressRepository progressRepository;
    LearnedWordRepository learnedWordRepository;
    UserClient userClient;

    @Override
    public ProgressOverviewDto getProgressOverview(Long userId) {
        UserDto userDto = new UserDto();
        try {
            ApiDto<UserDto> response = userClient.getUserById(userId);
            if (response != null && response.getResult() != null) {
                userDto = response.getResult();
            }
        } catch (Exception e) {
            log.error("Cannot fetch user info for overview", e);
            userDto.setId(userId);
            userDto.setUsername("Unknown");
        }

        long daysStudied = progressRepository.countDistinctDaysByUserId(userId);
        long totalWordsLearned = learnedWordRepository.sumWordsLearnedByUserId(userId);
        String level = calculateLevel(daysStudied, totalWordsLearned);

        return ProgressOverviewDto.builder()
                .user(userDto)
                .daysStudied((int) daysStudied)
                .wordsLearned((int) totalWordsLearned)
                .level(level)
                .build();
    }

    @Override
    @Transactional
    public ProgressDto trackDailyProgress(Long userId) {
        LocalDate today = LocalDate.now();
        LocalDateTime startOfDay = today.atStartOfDay();
        LocalDateTime endOfDay = today.atTime(LocalTime.MAX);

        boolean exists = progressRepository.existsByUserIdAndLearnedDateBetween(userId, startOfDay, endOfDay);

        if (exists) {
            throw new RuntimeException("Learned date already exists for today");
        }

        Progress progress = new Progress();
        progress.setUserId(userId);
        progress.setLearnedDate(LocalDateTime.now());

        return ProgressMapper.map(progressRepository.save(progress));
    }

    private String calculateLevel(long daysStudied, long totalWordsLearned) {
        if (daysStudied >= 10 && totalWordsLearned >= 50) {
            return "intermediate";
        } else if (daysStudied >= 5 && totalWordsLearned >= 20) {
            return "beginner";
        } else {
            return "newbie";
        }
    }
}
