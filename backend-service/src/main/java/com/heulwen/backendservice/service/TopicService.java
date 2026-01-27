package com.heulwen.backendservice.service;

import com.heulwen.backendservice.dto.TopicDto;
import com.heulwen.backendservice.dto.VocabularyDto;
import com.heulwen.backendservice.form.TopicCreateForm;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface TopicService {
    TopicDto addOrUpdateTopic(Integer id, TopicCreateForm form);
    Page<TopicDto> getTopics(String keyword, Pageable pageable);
    TopicDto getTopicById(int id);
    void deleteTopic(int id);

    // Logic Vocabulary trong Topic
    void addVocabToTopic(int topicId, int vocabId);
    Page<VocabularyDto> getVocabulariesWithTopic(int topicId, String keyword, Pageable pageable);
    List<VocabularyDto> getVocabNotInTopic(int topicId, String keyword);
    void removeVocabFromTopic(int topicId, int vocabId);
}
