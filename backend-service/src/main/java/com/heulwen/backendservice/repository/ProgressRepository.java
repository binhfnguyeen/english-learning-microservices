package com.heulwen.backendservice.repository;

import com.heulwen.backendservice.model.Progress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProgressRepository extends JpaRepository<Progress, Long> {
    List<Progress> findByUserId(Long userId);
}
