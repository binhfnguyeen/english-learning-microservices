package com.heulwen.backendservice.mapper;

import com.heulwen.backendservice.dto.LearnedWordDto;
import com.heulwen.backendservice.model.LearnedWord;

public class LearnedWordMapper {

    public static LearnedWordDto map(LearnedWord entity) {
        var dto = new LearnedWordDto();
        dto.setId(entity.getId());
        dto.setUserId(entity.getUser() != null ? entity.getUser().getId() : null);
        dto.setLearnedDate(entity.getCreatedAt());

        dto.setVocabulary(VocabularyMapper.map(entity.getVocabulary()));

        return dto;
    }
}