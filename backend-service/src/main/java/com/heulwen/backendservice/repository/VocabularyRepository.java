package com.heulwen.backendservice.repository;

import com.heulwen.backendservice.model.Vocabulary;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VocabularyRepository extends JpaRepository<Vocabulary, Long> {

    Page<Vocabulary> findByWordContainingIgnoreCase(String keyword, Pageable pageable);

    @Query("SELECT v FROM Vocabulary v JOIN v.topics t "
            + "WHERE t.id = :topicId AND "
            + "LOWER(v.word) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<Vocabulary> findByTopicAndKeyword(@Param("topicId") Long topicId,
                                           @Param("keyword") String keyword,
                                           Pageable pageable);

    @Query("""
       SELECT v FROM Vocabulary v
       WHERE :topicId NOT IN (
           SELECT t.id FROM v.topics t
       )
       AND (:keyword IS NULL OR LOWER(v.word) LIKE LOWER(CONCAT('%', :keyword, '%')))
       """)
    List<Vocabulary> findVocabNotInTopic(@Param("topicId") Long topicId,
                                         @Param("keyword") String keyword);

}
