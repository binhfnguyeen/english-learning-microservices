package com.heulwen.backendservice.service.impl;

import com.heulwen.backendservice.dto.ApiDto;
import com.heulwen.backendservice.dto.ProgressDto;
import com.heulwen.backendservice.dto.ProgressOverviewDto;
import com.heulwen.backendservice.dto.UserDto;
import com.heulwen.backendservice.exception.AppException;
import com.heulwen.backendservice.exception.ErrorCode;
import com.heulwen.backendservice.mapper.ProgressMapper;
import com.heulwen.backendservice.model.Progress;
import com.heulwen.backendservice.repository.LearnedWordRepository;
import com.heulwen.backendservice.repository.ProgressRepository;
import com.heulwen.backendservice.repository.TestResultRepository;
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
    TestResultRepository testResultRepository;
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

        long totalXP = calculateTotalXP(userId);
        String cefr = getCefrFromXP(totalXP);
        String proficiency = mapProficiency(cefr);

        return ProgressOverviewDto.builder()
                .user(userDto)
                .daysStudied((int) daysStudied)
                .wordsLearned((int) totalWordsLearned)
                .cefr(cefr)
                .proficiency(proficiency)
                .xp(totalXP)
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
            throw new AppException(ErrorCode.LEARNED_DATE_ALREADY_EXISTS);
        }

        Progress progress = new Progress();
        progress.setUserId(userId);
        progress.setLearnedDate(LocalDateTime.now());

        return ProgressMapper.map(progressRepository.save(progress));
    }

    private long calculateTotalXP(Long userId){
        long scoreA1 = learnedWordRepository.countLearnedWordsByLevel(userId, "A1");
        long scoreA2 = learnedWordRepository.countLearnedWordsByLevel(userId, "A2") * 2;
        long scoreB1 = learnedWordRepository.countLearnedWordsByLevel(userId, "B1") * 3;
        long scoreB2 = learnedWordRepository.countLearnedWordsByLevel(userId, "B2") * 4;
        long scoreC1 = learnedWordRepository.countLearnedWordsByLevel(userId, "C1") * 5;
        long scoreC2 = learnedWordRepository.countLearnedWordsByLevel(userId, "C2") * 6;

        long totalVocabPoints = scoreA1 + scoreA2 + scoreB1 + scoreB2 + scoreC1 + scoreC2;

        Double avgTestScore = testResultRepository.getAverageTestScore(userId);
        if (avgTestScore == null) avgTestScore = 0.0;

        long distinctTests = testResultRepository.countDistinctTestByUser(userId);
        long totalTestPoints = (long) (distinctTests * avgTestScore * 3);
        return totalVocabPoints + totalTestPoints;
    }

    private String getCefrFromXP(long totalXP) {
        if (totalXP < 100) return "A0 (Newbie)";
        if (totalXP < 500) return "A1";
        if (totalXP < 1200) return "A2";
        if (totalXP < 2500) return "B1";
        if (totalXP < 4000) return "B2";
        if (totalXP < 6000) return "C1";
        return "C2";
    }

    private String mapProficiency(String cefr){
        if (cefr.contains("A0")) return "Newbie";
        return switch (cefr) {
            case "A2" -> "Elementary";
            case "B1" -> "Intermediate";
            case "B2" -> "Upper-Intermediate";
            case "C1", "C2" -> "Advanced";
            default -> "Beginner";
        };
    }
}
