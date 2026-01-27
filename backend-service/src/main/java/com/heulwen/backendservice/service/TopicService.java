package com.heulwen.backendservice.service;

import com.heulwen.backendservice.dto.TopicDto;
import com.heulwen.backendservice.dto.VocabularyDto;
import com.heulwen.backendservice.form.TopicCreateForm;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface TopicService {
    TopicDto addOrUpdateTopic(Long id, TopicCreateForm form); // Long id
    Page<TopicDto> getTopics(String keyword, Pageable pageable);
    TopicDto getTopicById(Long id); // Long id
    void deleteTopic(Long id); // Long id
    void addVocabToTopic(Long topicId, Long vocabId);
    Page<VocabularyDto> getVocabulariesWithTopic(Long topicId, String keyword, Pageable pageable);
    List<VocabularyDto> getVocabNotInTopic(Long topicId, String keyword);
    void removeVocabFromTopic(Long topicId, Long vocabId);
}
