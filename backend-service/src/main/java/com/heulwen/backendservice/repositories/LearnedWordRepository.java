/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Interface.java to edit this template
 */
package com.heulwen.backendservice.repositories;

import com.heulwen.backendservice.model.LearnedWord;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 *
 * @author Dell
 */
@Repository
public interface LearnedWordRepository extends JpaRepository<LearnedWord, Integer> {

    @Query("SELECT COUNT(lw) FROM LearnedWord lw WHERE lw.userId.id = :userId")
    long sumWordsLearnedByUserId(@Param("userId") int userId);

    boolean existsByUserId_IdAndVocabularyId_Id(Integer userId, Integer vocabularyId);

    List<LearnedWord> getLearnedWordByUserId_Id(Integer userId);

    @Query("SELECT lw.userId, COUNT(lw) "
            + "FROM LearnedWord lw "
            + "GROUP BY lw.userId")
    List<Object[]> countLearnedWordsByUser();
}
