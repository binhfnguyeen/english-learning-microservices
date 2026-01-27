package com.heulwen.backendservice.repository;

import com.heulwen.backendservice.model.QuestionChoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface QuestionChoiceRepository extends JpaRepository<QuestionChoice, Long> {

}
