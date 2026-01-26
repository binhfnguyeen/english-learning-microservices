package com.heulwen.backendservice.service.impl;

import com.heulwen.backendservice.dto.TopicDto;
import com.heulwen.backendservice.exception.ResourceNotFoundException;
import com.heulwen.backendservice.form.TopicCreateForm;
import com.heulwen.backendservice.mapper.TopicMapper;
import com.heulwen.backendservice.model.Topic;
import com.heulwen.backendservice.repository.TopicRepository;
import com.heulwen.backendservice.service.TopicService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class TopicServiceImpl implements TopicService {

    private final TopicRepository topicRepository;

    @Override
    public TopicDto createTopic(TopicCreateForm form) {
        Topic topic = TopicMapper.map(form);
        topic = topicRepository.save(topic);
        return TopicMapper.map(topic);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TopicDto> getAllTopics() {
        return topicRepository.findAll().stream()
                .map(TopicMapper::map)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public TopicDto getTopicById(Long id) {
        Topic topic = topicRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Topic not found with id: " + id));
        return TopicMapper.map(topic);
    }
}
