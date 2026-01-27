package com.heulwen.backendservice.repository;

import com.heulwen.backendservice.model.Test;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TestRepository extends JpaRepository<Test, Long>{
    Page<Test> findByTitleContainingIgnoreCase(String keyword, Pageable pageable);
}
