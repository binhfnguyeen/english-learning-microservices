package com.heulwen.backendservice.mapper;

import com.heulwen.backendservice.dto.TopicDto;
import com.heulwen.backendservice.form.TopicCreateForm;
import com.heulwen.backendservice.model.Topic;
import com.heulwen.backendservice.repository.TopicRepository;

public class TopicMapper {

    /**
     * CREATE
     * TopicCreateForm -> Topic
     * Tương đương toTopic(TopicRequest)
     */
    public static Topic map(TopicCreateForm form) {
        if (form == null) {
            return null;
        }

        Topic topic = new Topic();
        topic.setName(form.getName());
        topic.setDescription(form.getDescription());

        return topic;
    }

    /**
     * READ
     * Topic -> TopicDto
     * Tương đương toTopicResponse()
     */
    public static TopicDto map(Topic topic, int totalVocabs) {
        if (topic == null) {
            return null;
        }

        return TopicDto.builder()
                .id(topic.getId())
                .name(topic.getName())
                .description(topic.getDescription())
                .totalVocabs(totalVocabs)
                .build();
    }

    /**
     * UPDATE
     * TopicCreateForm -> existing Topic
     * Tương đương updateTopicFromRequest()
     */
    public static void map(TopicCreateForm form, Topic topic) {
        if (form == null || topic == null) {
            return;
        }

        topic.setName(form.getName());
        topic.setDescription(form.getDescription());
    }
}
