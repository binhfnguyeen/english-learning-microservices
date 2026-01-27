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
    @Query("SELECT COUNT(DISTINCT p.learnedDate) FROM Progress p WHERE p.user.id = :userId")
    long countDistinctDaysByUserId(@Param("userId") Long userId);
    @Query("SELECT p FROM Progress p WHERE p.user.id = :userId")
    Progress findByUserId(@Param("userId") Long userId);
    boolean existsByUser_IdAndLearnedDate(Long userId, LocalDateTime learnedDate);
}
