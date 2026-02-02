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
    @Query("""
        SELECT AVG(t.maxScore)
        FROM (
        SELECT MAX(tr.score) AS maxScore
        FROM TestResult tr
        WHERE tr.userId = :userId
        GROUP BY tr.test.id
        ) t
    """)
    Double getAverageTestScore(@Param("userId") Long userId);
    @Query("""
        SELECT COUNT(DISTINCT tr.test.id)
        FROM TestResult tr
        WHERE tr.userId = :userId
    """)
    long countDistinctTestByUser(@Param("userId") Long userId);
}
