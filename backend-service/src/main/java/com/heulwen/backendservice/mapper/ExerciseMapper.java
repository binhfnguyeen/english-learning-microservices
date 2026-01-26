/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Interface.java to edit this template
 */
package com.heulwen.backendservice.mapper;

import com.heulwen.backendservice.dto.request.ExerciseRequest;
import com.heulwen.backendservice.dto.response.ExerciseResponse;
import com.heulwen.backendservice.model.Exercise;
import java.util.List;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

/**
 *
 * @author Dell
 */
@Mapper(componentModel = "spring", uses = {ExerciseChoiceMapper.class})
public interface ExerciseMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "exerciseChoiceSet", source = "choices")
   @Mapping(target = "vocabularyId", ignore = true)
    Exercise toExercise(ExerciseRequest request);

    @Mapping(target = "choices", source = "exerciseChoiceSet")
    @Mapping(target = "vocabularyId", source = "vocabularyId.id")
    ExerciseResponse toExerciseResponse(Exercise entity);
    
    List<ExerciseResponse> toExerciseResponses(List<Exercise> entities);
}
