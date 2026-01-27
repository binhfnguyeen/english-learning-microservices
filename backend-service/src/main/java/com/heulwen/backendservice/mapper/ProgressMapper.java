package com.heulwen.backendservice.mapper;

import com.heulwen.backendservice.dto.ProgressDto;
import com.heulwen.backendservice.model.Progress;

import java.util.List;
import java.util.stream.Collectors;

public class ProgressMapper {

    /**
     * READ
     * Progress -> ProgressDto
     */
    public static ProgressDto map(Progress entity) {
        if (entity == null) {
            return null;
        }

        return ProgressDto.builder()
                .id(entity.getId())
                .userId(
                        entity.getUser() != null
                                ? entity.getUser().getId()
                                : null
                )
                .learnedDate(entity.getLearnedDate())
                .build();
    }

    /**
     * READ LIST
     * List<Progress> -> List<ProgressDto>
     */
    public static List<ProgressDto> map(List<Progress> entities) {
        if (entities == null) {
            return List.of();
        }

        return entities.stream()
                .map(ProgressMapper::map)
                .collect(Collectors.toList());
    }
}
