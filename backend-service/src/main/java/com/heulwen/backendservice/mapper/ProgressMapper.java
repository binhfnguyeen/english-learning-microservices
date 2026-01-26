package com.heulwen.backendservice.mapper;

import com.heulwen.backendservice.dto.ProgressDto;
import com.heulwen.backendservice.model.Progress;

public class ProgressMapper {

    public static ProgressDto map(Progress entity) {
        var dto = new ProgressDto();
        dto.setId(entity.getId());
        dto.setUserId(entity.getUser() != null ? entity.getUser().getId() : null);
        dto.setLearnedDate(entity.getLearnedDate());
        return dto;
    }
}