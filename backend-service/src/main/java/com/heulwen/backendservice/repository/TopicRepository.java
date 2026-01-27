package com.heulwen.backendservice.repository;

import com.heulwen.backendservice.model.Topic;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TopicRepository extends JpaRepository<Topic, Long> {
    Page<Topic> findByNameContainingIgnoreCase(String keyword, Pageable pageable);
}
