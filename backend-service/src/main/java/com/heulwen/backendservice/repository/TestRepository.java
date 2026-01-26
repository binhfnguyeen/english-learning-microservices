package com.heulwen.backendservice.repository;

import com.heulwen.backendservice.model.Test;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TestRepository extends JpaRepository<Test, Long> {

}
