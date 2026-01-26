/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.heulwen.backendservice.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import java.io.Serializable;
import java.util.Date;
import  jakarta.persistence.Basic;
import jakarta.persistence.CascadeType;
import  jakarta.persistence.Column;
import  jakarta.persistence.Entity;
import  jakarta.persistence.GeneratedValue;
import  jakarta.persistence.GenerationType;
import  jakarta.persistence.Id;
import  jakarta.persistence.JoinColumn;
import  jakarta.persistence.ManyToOne;
import  jakarta.persistence.NamedQueries;
import  jakarta.persistence.NamedQuery;
import jakarta.persistence.OneToMany;
import  jakarta.persistence.Table;
import  jakarta.persistence.Temporal;
import  jakarta.persistence.TemporalType;
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
@Table(name = "test_results")
@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@NamedQueries({
    @NamedQuery(name = "TestResults.findAll", query = "SELECT t FROM TestResult t"),
    @NamedQuery(name = "TestResults.findById", query = "SELECT t FROM TestResult t WHERE t.id = :id"),
    @NamedQuery(name = "TestResults.findByScore", query = "SELECT t FROM TestResult t WHERE t.score = :score"),
    @NamedQuery(name = "TestResults.findByDateTaken", query = "SELECT t FROM TestResult t WHERE t.dateTaken = :dateTaken")})
public class TestResult implements Serializable {

    static final long serialVersionUID = 1L;
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Basic(optional = false)
    @Column(name = "id")
    Integer id;
    @Column(name = "score")
    Integer score;
    @Column(name = "date_taken")
    @Temporal(TemporalType.DATE)
    Date dateTaken;
    @JoinColumn(name = "test_id", referencedColumnName = "id")
    @ManyToOne
    Test testId;
    @JoinColumn(name = "user_id", referencedColumnName = "id")
    @ManyToOne
    User userId;
    @OneToMany(mappedBy = "testResultsId", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    Set<Answer> answerSet;

    @Override
    public int hashCode() {
        int hash = 0;
        hash += (id != null ? id.hashCode() : 0);
        return hash;
    }

    @Override
    public boolean equals(Object object) {
        // TODO: Warning - this method won't work in the case the id fields are not set
        if (!(object instanceof TestResult)) {
            return false;
        }
        TestResult other = (TestResult) object;
        if ((this.id == null && other.id != null) || (this.id != null && !this.id.equals(other.id))) {
            return false;
        }
        return true;
    }

    @Override
    public String toString() {
        return "com.heulwen.pojo.TestResult[ id=" + id + " ]";
    }
    
}
