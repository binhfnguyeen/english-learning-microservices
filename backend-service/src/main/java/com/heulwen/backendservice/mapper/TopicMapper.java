package com.heulwen.backendservice.mapper;

import com.heulwen.backendservice.dto.TopicDto;
import com.heulwen.backendservice.form.TopicCreateForm;
import com.heulwen.backendservice.model.Topic;

public class TopicMapper {

    public static Topic map(TopicCreateForm form) {
        var topic = new Topic();
        topic.setName(form.getName());
        topic.setDescription(form.getDescription());
        return topic;
    }

    public static TopicDto map(Topic topic) {
        var dto = new TopicDto();
        dto.setId(topic.getId());
        dto.setName(topic.getName());
        dto.setDescription(topic.getDescription());
        return dto;
    }
}