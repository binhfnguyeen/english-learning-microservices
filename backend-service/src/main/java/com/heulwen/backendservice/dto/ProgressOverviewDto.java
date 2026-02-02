package com.heulwen.backendservice.dto;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProgressOverviewDto {
    UserDto user;
    Integer daysStudied;
    Integer wordsLearned;

    String cefr;
    String proficiency;
    Long xp;
}
