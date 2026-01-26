/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.heulwen.backendservice.services;

import com.heulwen.backendservice.dto.request.LearnedWordRequest;
import com.heulwen.backendservice.dto.response.LearnedWordResponse;
import com.heulwen.backendservice.dto.response.UserStatsResponse;
import com.heulwen.backendservice.exceptions.AppException;
import com.heulwen.backendservice.exceptions.ErrorCode;
import com.heulwen.backendservice.mapper.LearnedWordMapper;
import com.heulwen.backendservice.mapper.UserMapper;
import com.heulwen.backendservice.model.LearnedWord;
import com.heulwen.backendservice.model.User;
import com.heulwen.backendservice.repositories.LearnedWordRepository;
import java.util.List;
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
public class LearnedWordService {

    LearnedWordRepository learnedWordRepository;

    LearnedWordMapper learnedWordMapper;
    
    UserMapper userMapper;

    public LearnedWordResponse addLearnedWord(LearnedWordRequest request) {
        if (learnedWordRepository.existsByUserId_IdAndVocabularyId_Id(request.getUserId(), request.getVocabularyId())) {
            throw new AppException(ErrorCode.WORD_ALREADY_LEARNED);
        }
        LearnedWord learnedWord = learnedWordMapper.toLearnedWord(request);
        LearnedWord saved = learnedWordRepository.save(learnedWord);
        return learnedWordMapper.toLearnedWordResponse(saved);
    }

    public List<LearnedWordResponse> getLearnedWordsByUser(Integer userId) {
        List<LearnedWord> learnedWords = learnedWordRepository.getLearnedWordByUserId_Id(userId);
        return learnedWords.stream().map(learnedWordMapper::toLearnedWordResponse).toList();
    }

    public List<UserStatsResponse> getUserLearnedWordsStats() {
        return learnedWordRepository.countLearnedWordsByUser().stream()
                .map(obj -> {
                    User user = (User) obj[0];
                    Long total = ((Number) obj[1]).longValue();
                    return new UserStatsResponse(userMapper.toUserResponse(user), total);
                }).toList();
    }
}
