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
    @Query(value = "SELECT AVG(maxScore) FROM (SELECT MAX(score) AS maxScore FROM test_results WHERE user_id = :userId GROUP BY test_id) AS t", nativeQuery = true)
    Double getAverageTestScore(@Param("userId") Long userId);

    @Query("""
        SELECT COUNT(DISTINCT tr.test.id)
        FROM TestResult tr
        WHERE tr.userId = :userId
    """)
    long countDistinctTestByUser(@Param("userId") Long userId);
}
