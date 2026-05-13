package com.heulwen.backendservice.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
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
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Vocabulary {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    @EqualsAndHashCode.Include
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
    @ToString.Exclude
    List<Topic> topics;

    @OneToMany(mappedBy = "vocabulary", cascade = CascadeType.ALL)
    @ToString.Exclude
    List<LearnedWord> learnedWords;

    @OneToMany(mappedBy = "vocabulary", cascade = CascadeType.ALL)
    @ToString.Exclude
    List<QuestionChoice> questionChoices;

    @OneToMany(mappedBy = "vocabulary", cascade = CascadeType.ALL)
    @ToString.Exclude
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
