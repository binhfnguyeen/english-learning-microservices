package com.heulwen.backendservice.service.impl;

import com.heulwen.backendservice.dto.ProgressDto;
import com.heulwen.backendservice.dto.ProgressOverviewDto;
import com.heulwen.backendservice.exception.ResourceNotFoundException;
import com.heulwen.backendservice.mapper.ProgressMapper;
import com.heulwen.backendservice.mapper.UserMapper;
import com.heulwen.backendservice.model.Progress;
import com.heulwen.backendservice.model.User;
import com.heulwen.backendservice.repository.LearnedWordRepository;
import com.heulwen.backendservice.repository.ProgressRepository;
import com.heulwen.backendservice.repository.UserRepository;
import com.heulwen.backendservice.service.ProgressService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ProgressServiceImpl implements ProgressService {

    ProgressRepository progressRepository;
    LearnedWordRepository learnedWordRepository;
    UserRepository userRepository;

    @Override
    public ProgressOverviewDto getProgressOverview(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found id: " + userId));

        // Logic đếm ngày: Giả định mỗi record Progress là 1 ngày học (do logic trackDailyProgress chặn trùng)
        long daysStudied = progressRepository.countDistinctDaysByUserId(userId);

        // Logic đếm từ: Đếm số record trong bảng learned_words của user
        long totalWordsLearned = learnedWordRepository.sumWordsLearnedByUser_Id(userId);

        String level = calculateLevel(daysStudied, totalWordsLearned);

        return ProgressOverviewDto.builder()
                .user(UserMapper.map(user))
                .daysStudied((int) daysStudied)
                .wordsLearned((int) totalWordsLearned)
                .level(level)
                .build();
    }

    @Override
    @Transactional
    public ProgressDto trackDailyProgress(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found id: " + userId));

        LocalDate today = LocalDate.now();
        LocalDateTime startOfDay = today.atStartOfDay();
        LocalDateTime endOfDay = today.atTime(LocalTime.MAX);

        boolean exists = progressRepository.existsByUserIdAndLearnedDateBetween(userId, startOfDay, endOfDay);

        if (exists) {
            throw new RuntimeException("Learned date already exists for today");
        }

        Progress progress = new Progress();
        progress.setUser(user);
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
