package com.heulwen.backendservice.service.impl;

import com.heulwen.backendservice.dto.ApiDto;
import com.heulwen.backendservice.dto.LearnedWordDto;
import com.heulwen.backendservice.dto.UserDto;
import com.heulwen.backendservice.dto.UserStatsDto;
import com.heulwen.backendservice.exception.ResourceNotFoundException;
import com.heulwen.backendservice.form.LearnedWordCreateForm;
import com.heulwen.backendservice.mapper.LearnedWordMapper;
import com.heulwen.backendservice.model.LearnedWord;
import com.heulwen.backendservice.model.Vocabulary;
import com.heulwen.backendservice.repository.LearnedWordRepository;
import com.heulwen.backendservice.repository.VocabularyRepository;
import com.heulwen.backendservice.repository.httpClient.UserClient;
import com.heulwen.backendservice.service.LearnedWordService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class LearnedWordServiceImpl implements LearnedWordService {

    LearnedWordRepository learnedWordRepository;
    VocabularyRepository vocabularyRepository;
    UserClient userClient;

    @Override
    @Transactional
    public LearnedWordDto addLearnedWord(LearnedWordCreateForm form) {
        Long userId = form.getUserId();
        Vocabulary vocab = vocabularyRepository.findById(form.getVocabularyId())
                .orElseThrow(() -> new ResourceNotFoundException("Vocabulary not found id: " + form.getVocabularyId()));
        if (learnedWordRepository.existsByUserIdAndVocabulary(userId, vocab)) {
            throw new RuntimeException("Word already learned");
        }
        LearnedWord learnedWord = new LearnedWord();
        learnedWord.setUserId(userId);
        learnedWord.setVocabulary(vocab);
        learnedWord.setCreatedAt(LocalDateTime.now());

        return LearnedWordMapper.map(learnedWord);
    }

    @Override
    public List<LearnedWordDto> getLearnedWordsByUser(Long userId) {
        List<LearnedWord> learnedWords = learnedWordRepository.getLearnedWordByUserId(userId);

        return learnedWords.stream()
                .map(LearnedWordMapper::map)
                .toList();
    }

    @Override
    public List<UserStatsDto> getUserLearnedWordsStats() {
        List<Object[]> stats = learnedWordRepository.countLearnedWordsByUser();
        List<UserStatsDto> result = new ArrayList<>();
        for (Object[] row : stats) {
            Long userId = (Long) row[0];
            Long total = (Long) row[1];

            UserDto userDto = new UserDto();
            try {
                ApiDto<UserDto> response = userClient.getUserById(userId);

                if (response != null && response.getResult() != null) {
                    userDto = response.getResult();
                } else {
                    userDto.setId(userId);
                    userDto.setUsername("Unknown User");
                }
            } catch (Exception e) {
                log.error("Failed to fetch user info for userId: " + userId, e);
                userDto.setId(userId);
                userDto.setUsername("User " + userId);
            }

            result.add(new UserStatsDto(userDto, total));
        }

        return result;
    }
}