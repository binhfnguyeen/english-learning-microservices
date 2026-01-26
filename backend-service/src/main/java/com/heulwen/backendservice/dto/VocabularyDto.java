package com.heulwen.backendservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VocabularyDto {
    private Long id;
    private String word;
    private String meaning;
    private String partOfSpeech;
    private String picture;
}
