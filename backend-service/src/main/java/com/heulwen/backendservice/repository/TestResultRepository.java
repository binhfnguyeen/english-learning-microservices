package com.heulwen.backendservice.repository;

import com.heulwen.backendservice.model.TestResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TestResultRepository extends JpaRepository<TestResult, Long>{
    List<TestResult> findByUserIdAndTestId(Long userId, Long testId);
    @Query("SELECT AVG(tr.score) FROM TestResult tr WHERE tr.userId = :userId")
    Double getAverageTestScore(@Param("userId") Long userId);
    long countByUserId(Long userId);
}
