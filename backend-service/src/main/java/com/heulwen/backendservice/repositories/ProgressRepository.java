/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Interface.java to edit this template
 */
package com.heulwen.backendservice.repositories;

import com.heulwen.backendservice.model.Progress;
import java.util.Date;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 *
 * @author Dell
 */
@Repository
public interface ProgressRepository extends JpaRepository<Progress, Integer> {

    @Query("SELECT COUNT(DISTINCT p.learnedDate) FROM Progress p WHERE p.userId.id = :userId")
    long countDistinctDaysByUserId(@Param("userId") int userId);

    @Query("SELECT p FROM Progress p WHERE p.userId.id = :userId")
    Progress findByUserId(@Param("userId") Integer userId);
    
    boolean existsByUserId_IdAndLearnedDate(Integer userId, Date learnedDate);
}
