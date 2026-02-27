package com.heulwen.backendservice.service.impl;

import com.heulwen.backendservice.dto.ExerciseDto;
import com.heulwen.backendservice.exception.AppException;
import com.heulwen.backendservice.exception.ErrorCode;
import com.heulwen.backendservice.form.ExerciseChoiceForm;
import com.heulwen.backendservice.form.ExerciseCreateForm;
import com.heulwen.backendservice.mapper.ExerciseChoiceMapper;
import com.heulwen.backendservice.mapper.ExerciseMapper;
import com.heulwen.backendservice.model.Exercise;
import com.heulwen.backendservice.model.ExerciseChoice;
import com.heulwen.backendservice.model.ExerciseType;
import com.heulwen.backendservice.model.Vocabulary;
import com.heulwen.backendservice.repository.ExerciseRepository;
import com.heulwen.backendservice.repository.VocabularyRepository;
import com.heulwen.backendservice.service.ExerciseService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ExerciseServiceImpl implements ExerciseService {

    ExerciseRepository exerciseRepository;
    VocabularyRepository vocabularyRepository;

    @Override
    @Transactional
    public ExerciseDto createExercise(ExerciseCreateForm form) {
        // 1. Kiểm tra Vocabulary tồn tại
        Vocabulary vocab = vocabularyRepository.findById(form.getVocabularyId())
                .orElseThrow(() -> new AppException(ErrorCode.VOCAB_NOT_FOUND));

        // 2. Kiểm tra logic nghiệp vụ
        if (ExerciseType.LISTEN_AND_TYPE.equals(form.getExerciseType())) {
            boolean exists = exerciseRepository.existsByVocabulary_IdAndExerciseType(
                    form.getVocabularyId(),
                    ExerciseType.LISTEN_AND_TYPE
            );
            if (exists) {
                throw new AppException(ErrorCode.EXERCISE_ALREADY_EXISTS);
            }
        }

        // 3. Map Form -> Entity (Exercise)
        Exercise exercise = ExerciseMapper.map(form);
        exercise.setVocabulary(vocab);

        // 4. Xử lý ExerciseChoices (Sử dụng Mapper mới của bạn)
        if (form.getChoices() != null && !form.getChoices().isEmpty()) {
            List<ExerciseChoice> choices = new ArrayList<>();
            for (ExerciseChoiceForm choiceForm : form.getChoices()) {
                // GỌI HÀM MAP 2 THAM SỐ (Form + Parent)
                ExerciseChoice choice = ExerciseChoiceMapper.map(choiceForm, exercise);
                choices.add(choice);
            }
            exercise.setChoices(choices);
        }

        // 5. Save
        return ExerciseMapper.map(exerciseRepository.save(exercise));
    }

    @Override
    public List<ExerciseDto> getExercisesByVocabularyId(Long vocabularyId) {
        if (!vocabularyRepository.existsById(vocabularyId)) {
            throw new AppException(ErrorCode.VOCAB_NOT_FOUND);
        }

        // Repository cần có hàm findByVocabularyId trả về List<Exercise>
        return exerciseRepository.findByVocabularyId(vocabularyId).stream()
                .map(ExerciseMapper::map)
                .toList();
    }

    @Override
    @Transactional
    public void deleteExercise(Long id) {
        if (!exerciseRepository.existsById(id)) {
            throw new AppException(ErrorCode.EXERCISE_NOT_FOUND);
        }
        exerciseRepository.deleteById(id);
    }
}
