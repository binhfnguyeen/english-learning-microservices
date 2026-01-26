package com.heulwen.backendservice.repository;

import com.heulwen.backendservice.model.Vocabulary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VocabularyRepository extends JpaRepository<Vocabulary, Long> {
    List<Vocabulary> findByWordContaining(String word);
}
