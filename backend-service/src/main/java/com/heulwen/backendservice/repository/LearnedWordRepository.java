package com.heulwen.backendservice.repository;

import com.heulwen.backendservice.model.LearnedWord;
import com.heulwen.backendservice.model.Vocabulary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LearnedWordRepository extends JpaRepository<LearnedWord, Long> {
    @Query("SELECT lw.userId, COUNT(lw) "
            + "FROM LearnedWord lw "
            + "GROUP BY lw.userId")
    List<Object[]> countLearnedWordsByUser();
    @Query("SELECT COUNT(lw) FROM LearnedWord lw WHERE lw.userId = :userId")
    long sumWordsLearnedByUserId(@Param("userId") Long userId);
    boolean existsByUserIdAndVocabulary(Long userId, Vocabulary vocabulary);
    List<LearnedWord> getLearnedWordByUserId(Long userId);
    @Query("SELECT COUNT(lw) " +
            "FROM LearnedWord lw " +
            "JOIN Vocabulary v ON lw.vocabulary.id = v.id " +
            "WHERE lw.userId = :userId AND v.level = :level")
    long countLearnedWordsByLevel(@Param("userId") Long userId, @Param("level") String level);
}
