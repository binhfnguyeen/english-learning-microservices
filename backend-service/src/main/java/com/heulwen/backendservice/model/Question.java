/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.heulwen.backendservice.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import java.io.Serializable;
import java.util.Set;
import jakarta.persistence.Basic;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.NamedQueries;
import jakarta.persistence.NamedQuery;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.util.Objects;
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
@Table(name = "question")
@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@NamedQueries({
    @NamedQuery(name = "Question.findAll", query = "SELECT q FROM Question q"),
    @NamedQuery(name = "Question.findById", query = "SELECT q FROM Question q WHERE q.id = :id")})
public class Question implements Serializable {

    static final long serialVersionUID = 1L;
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Basic(optional = false)
    @Column(name = "id")

    Integer id;
    @Lob
    @Column(name = "content")
    String content;
    @JoinColumn(name = "test_id", referencedColumnName = "id")
    @ManyToOne
    Test testId;
    @OneToMany(mappedBy = "questionId", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    Set<QuestionChoice> questionChoiceSet;

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof Question)) {
            return false;
        }
        Question other = (Question) o;

        if (this.id != null && other.id != null) {
            return this.id.equals(other.id);
        }

        return Objects.equals(this.content, other.content)
                && Objects.equals(this.testId, other.testId);
    }

    @Override
    public int hashCode() {
        if (this.id != null) {
            return Objects.hash(this.id);
        }

        return Objects.hash(content, testId);
    }

    @Override
    public String toString() {
        return "com.heulwen.pojo.Question[ id=" + id + " ]";
    }

}
