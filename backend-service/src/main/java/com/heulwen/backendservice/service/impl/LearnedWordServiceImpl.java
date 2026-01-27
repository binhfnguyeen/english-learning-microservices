package com.heulwen.backendservice.service.impl;

import com.heulwen.backendservice.dto.LearnedWordDto;
import com.heulwen.backendservice.dto.UserStatsDto;
import com.heulwen.backendservice.exception.ResourceNotFoundException;
import com.heulwen.backendservice.form.LearnedWordCreateForm;
import com.heulwen.backendservice.mapper.LearnedWordMapper;
import com.heulwen.backendservice.mapper.UserMapper;
import com.heulwen.backendservice.model.LearnedWord;
import com.heulwen.backendservice.model.User;
import com.heulwen.backendservice.model.Vocabulary;
import com.heulwen.backendservice.repository.LearnedWordRepository;
import com.heulwen.backendservice.repository.UserRepository;
import com.heulwen.backendservice.repository.VocabularyRepository;
import com.heulwen.backendservice.service.LearnedWordService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class LearnedWordServiceImpl implements LearnedWordService {

    LearnedWordRepository learnedWordRepository;
    UserRepository userRepository;
    VocabularyRepository vocabularyRepository;

    @Override
    @Transactional
    public LearnedWordDto addLearnedWord(LearnedWordCreateForm form) {
        // 1. Fetch User và Vocabulary
        User user = userRepository.findById(form.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found id: " + form.getUserId()));

        Vocabulary vocab = vocabularyRepository.findById(form.getVocabularyId())
                .orElseThrow(() -> new ResourceNotFoundException("Vocabulary not found id: " + form.getVocabularyId()));

        // 2. Check đã học chưa (Dùng Object User và Vocabulary để check chính xác hơn)
        if (learnedWordRepository.existsByUserAndVocabulary(user, vocab)) {
            throw new RuntimeException("Word already learned"); // Hoặc Custom Exception
        }

        // 3. Tạo Entity mới
        LearnedWord learnedWord = new LearnedWord();
        learnedWord.setUser(user);
        learnedWord.setVocabulary(vocab);
        learnedWord.setCreatedAt(LocalDateTime.now()); // Set thời gian tạo nếu Entity Listener chưa auto-fill lúc new

        return LearnedWordMapper.map(learnedWordRepository.save(learnedWord));
    }

    @Override
    public List<LearnedWordDto> getLearnedWordsByUser(Long userId) {
        // Cần đảm bảo Repository có hàm findByUserId(Long userId)
        List<LearnedWord> learnedWords = learnedWordRepository.getLearnedWordByUser_Id(userId);

        return learnedWords.stream()
                .map(LearnedWordMapper::map)
                .toList();
    }

    @Override
    public List<UserStatsDto> getUserLearnedWordsStats() {
        // Repository trả về List<Object[]>: index 0 là User, index 1 là Count (Long)
        List<Object[]> stats = learnedWordRepository.countLearnedWordsByUser();

        return stats.stream()
                .map(obj -> {
                    User user = (User) obj[0];
                    Long total = (Long) obj[1];
                    // Map User Entity -> UserDto và gán vào UserStatsDto
                    return new UserStatsDto(UserMapper.map(user), total);
                })
                .toList();
    }
}
