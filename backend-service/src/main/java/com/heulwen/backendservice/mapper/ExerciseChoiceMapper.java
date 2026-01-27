package com.heulwen.backendservice.mapper;

import com.heulwen.backendservice.dto.ExerciseChoiceDto;
import com.heulwen.backendservice.form.ExerciseChoiceForm;
import com.heulwen.backendservice.model.Exercise;
import com.heulwen.backendservice.model.ExerciseChoice;

public class ExerciseChoiceMapper {

    /**
     * FORM -> ENTITY
    */
    public static ExerciseChoice map(ExerciseChoiceForm form, Exercise parent) {
        return ExerciseMapper.map(form, parent);
    }

    /**
    * ENTITY -> DTO
    */

    public static ExerciseChoiceDto map(ExerciseChoice entity) {
        return ExerciseMapper.map(entity);
    }
}

