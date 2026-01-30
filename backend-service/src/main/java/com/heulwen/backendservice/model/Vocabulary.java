package com.heulwen.backendservice.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "vocabularies")
@EntityListeners(AuditingEntityListener.class)
@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Vocabulary {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    Long id;

    @Column(name = "word")
    String word;

    @Column(name = "meaning")
    String meaning;

    @Column(name = "part_of_speech")
    String partOfSpeech;

    @Column(name = "level")
    String level;

    @Column(name = "picture")
    String picture;

    @ManyToMany(mappedBy = "vocabularies", fetch = FetchType.LAZY)
    List<Topic> topics;

    @OneToMany(mappedBy = "vocabulary", cascade = CascadeType.ALL)
    List<LearnedWord> learnedWords;

    @OneToMany(mappedBy = "vocabulary", cascade = CascadeType.ALL)
    List<QuestionChoice> questionChoices;

    @OneToMany(mappedBy = "vocabulary", cascade = CascadeType.ALL)
    List<Exercise> exercises;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    LocalDateTime updatedAt;

    @Transient
    @JsonIgnore
    MultipartFile picFile;
}
