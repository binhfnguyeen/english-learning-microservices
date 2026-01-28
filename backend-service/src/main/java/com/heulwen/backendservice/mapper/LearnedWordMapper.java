package com.heulwen.backendservice.mapper;

import com.heulwen.backendservice.dto.LearnedWordDto;
import com.heulwen.backendservice.model.LearnedWord;

import java.util.List;
import java.util.stream.Collectors;

public class LearnedWordMapper {

    /**
     * READ
     * LearnedWord -> LearnedWordDto
     */
    public static LearnedWordDto map(LearnedWord entity) {
        if (entity == null) {
            return null;
        }

        return LearnedWordDto.builder()
                .id(entity.getId())
                .userId(entity.getUserId())
                .learnedDate(entity.getCreatedAt())
                .vocabulary(
                        entity.getVocabulary() != null
                                ? VocabularyMapper.map(entity.getVocabulary())
                                : null
                )
                .build();
    }

    /**
     * READ LIST
     */
    public static List<LearnedWordDto> map(List<LearnedWord> entities) {
        if (entities == null) {
            return List.of();
        }

        return entities.stream()
                .map(LearnedWordMapper::map)
                .collect(Collectors.toList());
    }
}
