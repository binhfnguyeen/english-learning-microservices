package com.heulwen.backendservice.service.impl;

import com.heulwen.backendservice.dto.TopicDto;
import com.heulwen.backendservice.dto.VocabularyDto;
import com.heulwen.backendservice.exception.ResourceNotFoundException;
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
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class TopicServiceImpl implements TopicService {

    TopicRepository topicRepository;
    VocabularyRepository vocabularyRepository;
    TopicMapper topicMapper;
    VocabularyMapper vocabularyMapper;

    @Override
    public TopicDto addOrUpdateTopic(Integer id, TopicCreateForm form) {
        Topic topic;
        if (id != null) {
            topic = topicRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Topic not found"));
            topicMapper.map(form, topic); // Update overloading
        } else {
            topic = topicMapper.map(form); // Create overloading
        }

        return topicMapper.map(topicRepository.save(topic));
    }

    @Override
    public Page<TopicDto> getTopics(String keyword, Pageable pageable) {
        Page<Topic> topicResult;
        if (keyword != null && !keyword.isEmpty()) {
            topicResult = topicRepository.findByNameContainingIgnoreCase(keyword, pageable);
        } else {
            topicResult = topicRepository.findAll(pageable);
        }
        return topicResult.map(topicMapper::map);
    }

    @Override
    public TopicDto getTopicById(int id) {
        Topic topic = topicRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Topic not found"));
        return topicMapper.map(topic);
    }

    @Override
    public void deleteTopic(int id) {
        topicRepository.deleteById(id);
    }

    @Override
    public void addVocabToTopic(int topicId, int vocabId) {
        Vocabulary vocab = vocabularyRepository.findById(vocabId)
                .orElseThrow(() -> new ResourceNotFoundException("Vocab not found"));
        Topic topic = topicRepository.findById(topicId)
                .orElseThrow(() -> new ResourceNotFoundException("Topic not found"));

        if (vocab.getTopicSet() == null) {
            vocab.setTopicSet(new HashSet<>());
        }

        // Logic cũ: Lưu vocab vì vocab là owning side hoặc để trigger update
        vocab.getTopicSet().add(topic);
        vocabularyRepository.save(vocab);
    }

    @Override
    public Page<VocabularyDto> getVocabulariesWithTopic(int topicId, String keyword, Pageable pageable) {
        String searchKeyword = (keyword == null) ? "" : keyword;
        // Sử dụng custom query ở VocabularyRepository
        Page<Vocabulary> vocabPage = vocabularyRepository.findByTopicAndKeyword(topicId, searchKeyword, pageable);
        return vocabPage.map(vocabularyMapper::map);
    }

    @Override
    public List<VocabularyDto> getVocabNotInTopic(int topicId, String keyword) {
        String searchKeyword = (keyword == null) ? "" : keyword;
        // Sử dụng custom query ở VocabularyRepository
        List<Vocabulary> vocab = vocabularyRepository.findVocabNotInTopic(topicId, searchKeyword);
        return vocab.stream().map(vocabularyMapper::map).toList();
    }

    @Override
    public void removeVocabFromTopic(int topicId, int vocabId) {
        Topic topic = topicRepository.findById(topicId)
                .orElseThrow(() -> new ResourceNotFoundException("Topic not found"));
        Vocabulary vocabulary = vocabularyRepository.findById(vocabId)
                .orElseThrow(() -> new ResourceNotFoundException("Vocab not found"));

        if (topic.getVocabularySet() != null) topic.getVocabularySet().remove(vocabulary);
        if (vocabulary.getTopicSet() != null) vocabulary.getTopicSet().remove(topic);

        topicRepository.save(topic); // Hoặc vocabularyRepository.save(vocabulary) tuỳ cấu hình cascade
    }
}
