/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Interface.java to edit this template
 */
package com.heulwen.backendservice.mapper;

import com.heulwen.backendservice.dto.request.ExerciseChoiceRequest;
import com.heulwen.backendservice.dto.response.ExerciseChoiceResponse;
import com.heulwen.backendservice.model.ExerciseChoice;
import java.util.List;
import org.mapstruct.Mapper;

/**
 *
 * @author Dell
 */
@Mapper(componentModel = "spring")
public interface ExerciseChoiceMapper {
    ExerciseChoice toExerciseChoice(ExerciseChoiceRequest request);
    ExerciseChoiceResponse toExerciseChoiceResponse(ExerciseChoice entity);
    List<ExerciseChoice> toExerciseChoices(List<ExerciseChoiceRequest> requests);
    List<ExerciseChoiceResponse> toExerciseChoiceResponses(List<ExerciseChoice> entities);
}
