package com.heulwen.backendservice.repository;

import com.heulwen.backendservice.model.Exercise;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExerciseRepository extends JpaRepository<Exercise, Long> {
    List<Exercise> findByVocabularyId(Long vocabularyId);
}
