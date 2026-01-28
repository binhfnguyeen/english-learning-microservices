package com.heulwen.backendservice.repository;

import com.heulwen.backendservice.model.Progress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;

@Repository
public interface ProgressRepository extends JpaRepository<Progress, Long> {
    long countDistinctDaysByUserId(Long userId);
    boolean existsByUserIdAndLearnedDateBetween(Long userId, LocalDateTime startOfDay, LocalDateTime endOfDay);
}
