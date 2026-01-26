package com.heulwen.backendservice.service.impl;

import com.heulwen.backendservice.dto.VocabularyDto;
import com.heulwen.backendservice.form.VocabularyCreateForm;
import com.heulwen.backendservice.mapper.VocabularyMapper;
import com.heulwen.backendservice.model.Topic;
import com.heulwen.backendservice.model.Vocabulary;
import com.heulwen.backendservice.repository.TopicRepository;
import com.heulwen.backendservice.repository.VocabularyRepository;
import com.heulwen.backendservice.service.VocabularyService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class VocabularyServiceImpl implements VocabularyService {

    private final VocabularyRepository vocabularyRepository;
    private final TopicRepository topicRepository;

    @Override
    public VocabularyDto createVocabulary(VocabularyCreateForm form) {
        Vocabulary vocabulary = VocabularyMapper.map(form);

        if (form.getTopicIds() != null && !form.getTopicIds().isEmpty()) {
            List<Topic> topics = topicRepository.findAllById(form.getTopicIds());
            vocabulary.setTopics(topics);
        }

        vocabulary = vocabularyRepository.save(vocabulary);
        return VocabularyMapper.map(vocabulary);
    }

    @Override
    @Transactional(readOnly = true)
    public List<VocabularyDto> getAllVocabularies() {
        return vocabularyRepository.findAll().stream()
                .map(VocabularyMapper::map)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<VocabularyDto> searchVocabulary(String keyword) {
        return vocabularyRepository.findByWordContaining(keyword).stream()
                .map(VocabularyMapper::map)
                .collect(Collectors.toList());
    }
}
