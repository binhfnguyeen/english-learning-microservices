/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Interface.java to edit this template
 */
package com.heulwen.backendservice.repositories;

import com.heulwen.backendservice.model.Vocabulary;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 *
 * @author Dell
 */
@Repository
public interface VocabularyRepository extends JpaRepository<Vocabulary, Integer> {

    Page<Vocabulary> findByWordContainingIgnoreCase(String keyword, Pageable pageable);

    @Query("SELECT v FROM Vocabulary v JOIN v.topicSet t "
            + "WHERE t.id = :topicId AND "
            + "LOWER(v.word) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<Vocabulary> findByTopicAndKeyword(@Param("topicId") int topicId,
            @Param("keyword") String keyword,
            Pageable pageable);

    @Query("""
       SELECT v FROM Vocabulary v
       WHERE :topicId NOT IN (
           SELECT t.id FROM v.topicSet t
       )
       AND (:keyword IS NULL OR LOWER(v.word) LIKE LOWER(CONCAT('%', :keyword, '%')))
       """)
    List<Vocabulary> findVocabNotInTopic(@Param("topicId") Integer topicId,
            @Param("keyword") String keyword);

}
