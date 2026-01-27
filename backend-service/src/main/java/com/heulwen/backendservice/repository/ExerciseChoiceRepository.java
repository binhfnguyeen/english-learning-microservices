package com.heulwen.backendservice.repository;

import com.heulwen.backendservice.model.ExerciseChoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ExerciseChoiceRepository extends JpaRepository<ExerciseChoice, Long> {

}
