/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.heulwen.backendservice.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.io.Serializable;
import java.util.Date;
import  jakarta.persistence.Basic;
import  jakarta.persistence.Column;
import  jakarta.persistence.Entity;
import  jakarta.persistence.GeneratedValue;
import  jakarta.persistence.GenerationType;
import  jakarta.persistence.Id;
import  jakarta.persistence.JoinColumn;
import  jakarta.persistence.ManyToOne;
import  jakarta.persistence.NamedQueries;
import  jakarta.persistence.NamedQuery;
import  jakarta.persistence.Table;
import  jakarta.persistence.Temporal;
import  jakarta.persistence.TemporalType;
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
@Table(name = "learned_word")
@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@NamedQueries({
    @NamedQuery(name = "LearnedWord.findAll", query = "SELECT l FROM LearnedWord l"),
    @NamedQuery(name = "LearnedWord.findById", query = "SELECT l FROM LearnedWord l WHERE l.id = :id"),
    @NamedQuery(name = "LearnedWord.findByDate", query = "SELECT l FROM LearnedWord l WHERE l.date = :date")})
public class LearnedWord implements Serializable {

    static final long serialVersionUID = 1L;
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Basic(optional = false)
    @Column(name = "id")
    Integer id;
    @Column(name = "date")
    @Temporal(TemporalType.DATE)
    Date date;
    @JoinColumn(name = "user_id", referencedColumnName = "id")
    @ManyToOne
    @JsonIgnore
    User userId;
    @JoinColumn(name = "vocabulary_id", referencedColumnName = "id")
    @ManyToOne
    @JsonBackReference
    @JsonIgnore
    Vocabulary vocabularyId;
    
    @Override
    public int hashCode() {
        int hash = 0;
        hash += (id != null ? id.hashCode() : 0);
        return hash;
    }

    @Override
    public boolean equals(Object object) {
        // TODO: Warning - this method won't work in the case the id fields are not set
        if (!(object instanceof LearnedWord)) {
            return false;
        }
        LearnedWord other = (LearnedWord) object;
        if ((this.id == null && other.id != null) || (this.id != null && !this.id.equals(other.id))) {
            return false;
        }
        return true;
    }

    @Override
    public String toString() {
        return "com.heulwen.pojo.LearnedWord[ id=" + id + " ]";
    }
    
}
