package com.heulwen.backendservice.service.impl;

import com.heulwen.backendservice.dto.TopicDto;
import com.heulwen.backendservice.dto.VocabularyDto;
import com.heulwen.backendservice.exception.AppException;
import com.heulwen.backendservice.exception.ErrorCode;
import com.heulwen.backendservice.form.TopicCreateForm;
import com.heulwen.backendservice.mapper.TopicMapper;
import com.heulwen.backendservice.mapper.VocabularyMapper;
import com.heulwen.backendservice.model.Topic;
import com.heulwen.backendservice.model.Vocabulary;
import com.heulwen.backendservice.repository.TopicRepository;
import com.heulwen.backendservice.repository.VocabularyRepository;
import com.heulwen.backendservice.service.TopicService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class TopicServiceImpl implements TopicService {

    TopicRepository topicRepository;      // JpaRepository<Topic, Long>
    VocabularyRepository vocabularyRepository; // JpaRepository<Vocabulary, Long>

    @Override
    public TopicDto addOrUpdateTopic(Long id, TopicCreateForm form) {
        Topic topic;
        if (id != null) {
            topic = topicRepository.findById(id)
                    .orElseThrow(() -> new AppException(ErrorCode.TOPIC_NOT_FOUND));
            TopicMapper.map(form, topic);
        } else {
            topic = TopicMapper.map(form);
        }
        return TopicMapper.map(topicRepository.save(topic));
    }

    @Override
    public Page<TopicDto> getTopics(String keyword, Pageable pageable) {
        Page<Topic> topicResult;
        if (keyword != null && !keyword.isEmpty()) {
            topicResult = topicRepository.findByNameContainingIgnoreCase(keyword, pageable);
        } else {
            topicResult = topicRepository.findAll(pageable);
        }
        return topicResult.map(TopicMapper::map);
    }

    @Override
    public TopicDto getTopicById(Long id) {
        Topic topic = topicRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.TOPIC_NOT_FOUND));
        return TopicMapper.map(topic);
    }

    @Override
    public void deleteTopic(Long id) {
        topicRepository.deleteById(id);
    }

    @Override
    public void addVocabToTopic(Long topicId, Long vocabId) {
        Topic topic = topicRepository.findById(topicId)
                .orElseThrow(() -> new AppException(ErrorCode.TOPIC_NOT_FOUND));
        Vocabulary vocab = vocabularyRepository.findById(vocabId)
                .orElseThrow(() -> new AppException(ErrorCode.TOPIC_NOT_FOUND));

        if (topic.getVocabularies() == null) {
            topic.setVocabularies(new ArrayList<>());
        }

        if (!topic.getVocabularies().contains(vocab)) {
            topic.getVocabularies().add(vocab);
            topicRepository.save(topic);
        }
    }

    @Override
    public Page<VocabularyDto> getVocabulariesWithTopic(Long topicId, String keyword, Pageable pageable) {
        String searchKeyword = (keyword == null) ? "" : keyword;
        Page<Vocabulary> vocabPage = vocabularyRepository.findByTopicAndKeyword(topicId, searchKeyword, pageable);
        return vocabPage.map(VocabularyMapper::map);
    }

    @Override
    public List<VocabularyDto> getVocabNotInTopic(Long topicId, String keyword) {
        String searchKeyword = (keyword == null) ? "" : keyword;
        List<Vocabulary> vocab = vocabularyRepository.findVocabNotInTopic(topicId, searchKeyword);
        return vocab.stream().map(VocabularyMapper::map).toList();
    }

    @Override
    public void removeVocabFromTopic(Long topicId, Long vocabId) {
        Topic topic = topicRepository.findById(topicId)
                .orElseThrow(() -> new AppException(ErrorCode.TOPIC_NOT_FOUND));
        Vocabulary vocabulary = vocabularyRepository.findById(vocabId)
                .orElseThrow(() -> new AppException(ErrorCode.VOCAB_NOT_FOUND));

        if (topic.getVocabularies() != null) {
            topic.getVocabularies().remove(vocabulary);
            topicRepository.save(topic);
        }
    }
}