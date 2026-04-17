package com.heulwen.backendservice.form;

import com.heulwen.backendservice.model.enumType.ExerciseType;
import lombok.Data;

import java.util.List;

@Data
public class ExerciseCreateForm {
    private String question;
    private ExerciseType exerciseType;
    private Long vocabularyId;
    private List<ExerciseChoiceForm> choices;
}
