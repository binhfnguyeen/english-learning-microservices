/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.heulwen.backendservice.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import org.springframework.web.multipart.MultipartFile;

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

    @Column(name = "picture")
    String picture;

    @ManyToMany(mappedBy = "vocabularies")
    List<Topic> topics;

    @OneToMany(mappedBy = "vocabularyId", cascade = CascadeType.ALL)
    List<LearnedWord> learnedWords;

    @OneToMany(mappedBy = "vocabularyId", cascade = CascadeType.ALL)
    List<QuestionChoice> questionChoices;

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
