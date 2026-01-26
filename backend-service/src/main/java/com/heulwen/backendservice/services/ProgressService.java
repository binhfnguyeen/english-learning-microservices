/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.heulwen.backendservice.services;

import com.heulwen.backendservice.dto.response.ProgressOverviewResponse;
import com.heulwen.backendservice.dto.response.ProgressResponse;
import com.heulwen.backendservice.exceptions.AppException;
import com.heulwen.backendservice.exceptions.ErrorCode;
import com.heulwen.backendservice.mapper.ProgressMapper;
import com.heulwen.backendservice.model.Progress;
import com.heulwen.backendservice.model.User;
import com.heulwen.backendservice.repositories.LearnedWordRepository;
import com.heulwen.backendservice.repositories.ProgressRepository;
import com.heulwen.backendservice.repositories.UserRepository;
import java.time.LocalDate;
import java.sql.Date;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

/**
 *
 * @author Dell
 */
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class ProgressService {

    ProgressRepository progressRepository;
    LearnedWordRepository learnedWordRepository;
    UserRepository userRepository;
    ProgressMapper progressMapper;

    public ProgressOverviewResponse getProgressOverview(int userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        long daysStudied = progressRepository.countDistinctDaysByUserId(userId);
        long totalWordsLearned = learnedWordRepository.sumWordsLearnedByUserId(userId);

        String level;

        if (daysStudied >= 10 && totalWordsLearned >= 50) {
            level = "intermediate";
        } else if (daysStudied >= 5 && totalWordsLearned >= 20) {
            level = "beginner";
        } else {
            level = "newbie";
        }

        return ProgressOverviewResponse.builder()
                .userId(user)
                .daysStudied((int) daysStudied)
                .wordsLearned((int) totalWordsLearned)
                .level(level)
                .build();
    }

    public ProgressResponse updateUserLearnedDay(int userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        
        Date today = Date.valueOf(LocalDate.now());
        
        boolean exists = progressRepository.existsByUserId_IdAndLearnedDate(userId, today);
        
        if (exists) {
            throw new AppException(ErrorCode.LEARNED_DATE_ALREADY_EXISTS);
        }

        Progress progress = new Progress();
        progress.setUserId(user);
        progress.setLearnedDate(Date.valueOf(LocalDate.now()));

        return progressMapper.toProgressResponse(progressRepository.save(progress));
    }
}
