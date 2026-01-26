/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.heulwen.backendservice.model;

import java.io.Serializable;
import jakarta.persistence.Basic;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.NamedQueries;
import jakarta.persistence.NamedQuery;
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
@Table(name = "exercise_choice")
@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@NamedQueries({
    @NamedQuery(name = "ExerciseChoice.findAll", query = "SELECT e FROM ExerciseChoice e"),
    @NamedQuery(name = "ExerciseChoice.findById", query = "SELECT e FROM ExerciseChoice e WHERE e.id = :id"),
    @NamedQuery(name = "ExerciseChoice.findByIsCorrect", query = "SELECT e FROM ExerciseChoice e WHERE e.isCorrect = :isCorrect")})
public class ExerciseChoice implements Serializable {

    private static final long serialVersionUID = 1L;
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Basic(optional = false)
    @Column(name = "id")
    Integer id;
    @Column(name = "content", length = 255, nullable = false)
    String content;
    @Column(name = "is_correct")
    Boolean isCorrect;
    @JoinColumn(name = "exercise_id", referencedColumnName = "id")
    @ManyToOne
    Exercise exerciseId;

    @Override
    public int hashCode() {
        if (this.id != null) {
            return Objects.hash(this.id);
        }
        return Objects.hash(content, exerciseId);
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof ExerciseChoice)) {
            return false;
        }
        ExerciseChoice other = (ExerciseChoice) o;

        if (this.id != null && other.id != null) {
            return this.id.equals(other.id);
        }

        return Objects.equals(this.content, other.content)
                && Objects.equals(this.exerciseId, other.exerciseId);
    }

    @Override
    public String toString() {
        return "com.heulwen.pojo.ExerciseChoice[ id=" + id + " ]";
    }
    
}
