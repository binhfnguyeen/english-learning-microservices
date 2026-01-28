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
    @Query("SELECT lw.user, COUNT(lw) "
            + "FROM LearnedWord lw "
            + "GROUP BY lw.user")
    List<Object[]> countLearnedWordsByUser();
    @Query("SELECT COUNT(lw) FROM LearnedWord lw WHERE lw.user.id = :userId")
    long sumWordsLearnedByUser_Id(@Param("userId") Long userId);
    boolean existsByUserAndVocabulary(User user, Vocabulary vocabulary);
    List<LearnedWord> getLearnedWordByUser_Id(Long userId);
}
