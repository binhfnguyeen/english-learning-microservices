/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.heulwen.backendservice.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import java.io.Serializable;
import jakarta.persistence.Basic;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.NamedQueries;
import jakarta.persistence.NamedQuery;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.util.Objects;
import java.util.Set;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

/**
 *
 * @author Dell
 */
@Entity
@Table(name = "question_choice")
@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@NamedQueries({
    @NamedQuery(name = "QuestionChoice.findAll", query = "SELECT q FROM QuestionChoice q"),
    @NamedQuery(name = "QuestionChoice.findById", query = "SELECT q FROM QuestionChoice q WHERE q.id = :id"),
    @NamedQuery(name = "QuestionChoice.findByIsCorrect", query = "SELECT q FROM QuestionChoice q WHERE q.isCorrect = :isCorrect")})
public class QuestionChoice implements Serializable {

    static final long serialVersionUID = 1L;
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Basic(optional = false)
    @Column(name = "id")
    Integer id;
    @Column(name = "isCorrect")
    Boolean isCorrect;
    @JoinColumn(name = "vocabulary_id", referencedColumnName = "id")
    @ManyToOne
    @JsonBackReference
    Vocabulary vocabularyId;
    @JoinColumn(name = "question_id", referencedColumnName = "id")
    @ManyToOne
    @JsonBackReference
    Question questionId;
    @OneToMany(mappedBy = "questionChoiceId", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    @JsonIgnore
    Set<Answer> answerSet;

    @Override
    public int hashCode() {
        // Nếu id đã tồn tại, dùng id để hash
        if (this.id != null) {
            return Objects.hash(this.id);
        }
        // Nếu không, dùng các trường khác
        return Objects.hash(vocabularyId, questionId);
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof QuestionChoice)) {
            return false;
        }
        QuestionChoice other = (QuestionChoice) o;

        if (this.id != null && other.id != null) {
            return this.id.equals(other.id);
        }

        return Objects.equals(this.vocabularyId, other.vocabularyId)
                && Objects.equals(this.questionId, other.questionId);
    }

    @Override
    public String toString() {
        return "com.heulwen.pojo.QuestionChoice[ id=" + id + " ]";
    }

}
