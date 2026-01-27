package com.heulwen.backendservice.repository;

import com.heulwen.backendservice.model.Answer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AnswerRepository extends JpaRepository<Answer, Long> {
    List<Answer> getAnswerByTestResult_Id(Long testResultId);
}
