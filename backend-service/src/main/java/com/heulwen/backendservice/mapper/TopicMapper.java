/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Interface.java to edit this template
 */
package com.heulwen.backendservice.mapper;

import com.heulwen.backendservice.dto.request.TopicRequest;
import com.heulwen.backendservice.dto.response.TopicResponse;
import com.heulwen.backendservice.model.Topic;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

/**
 *
 * @author Dell
 */
@Mapper(componentModel = "spring")
public interface TopicMapper {
    Topic toTopic(TopicRequest request);
    TopicResponse toTopicResponse(Topic topic);
    void updateTopicFromRequest(TopicRequest request, @MappingTarget Topic topic);
}
