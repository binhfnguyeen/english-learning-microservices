package com.heulwen.backendservice.service;

import com.heulwen.backendservice.dto.TopicDto;
import com.heulwen.backendservice.form.TopicCreateForm;

import java.util.List;

public interface TopicService {
    TopicDto createTopic(TopicCreateForm form);
    List<TopicDto> getAllTopics();
    TopicDto getTopicById(Long id);
}
