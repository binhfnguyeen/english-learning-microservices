/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.heulwen.backendservice.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import java.io.Serializable;
import java.util.Set;
import  jakarta.persistence.Basic;
import jakarta.persistence.CascadeType;
import  jakarta.persistence.Column;
import  jakarta.persistence.Entity;
import  jakarta.persistence.GeneratedValue;
import  jakarta.persistence.GenerationType;
import  jakarta.persistence.Id;
import  jakarta.persistence.Lob;
import  jakarta.persistence.NamedQueries;
import  jakarta.persistence.NamedQuery;
import  jakarta.persistence.OneToMany;
import  jakarta.persistence.Table;
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
@Table(name = "test")
@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@NamedQueries({
    @NamedQuery(name = "Test.findAll", query = "SELECT t FROM Test t"),
    @NamedQuery(name = "Test.findById", query = "SELECT t FROM Test t WHERE t.id = :id"),
    @NamedQuery(name = "Test.findByTitle", query = "SELECT t FROM Test t WHERE t.title = :title")})
public class Test implements Serializable {

    static final long serialVersionUID = 1L;
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Basic(optional = false)
    @Column(name = "id")
    Integer id;
    @Column(name = "title")
    String title;
    @Lob
    @Column(name = "description")
    String description;
    @OneToMany(mappedBy = "testId", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    Set<Question> questionSet;
    @OneToMany(mappedBy = "testId", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    Set<TestResult> testResultSet;

    @Override
    public int hashCode() {
        int hash = 0;
        hash += (id != null ? id.hashCode() : 0);
        return hash;
    }

    @Override
    public boolean equals(Object object) {
        // TODO: Warning - this method won't work in the case the id fields are not set
        if (!(object instanceof Test)) {
            return false;
        }
        Test other = (Test) object;
        if ((this.id == null && other.id != null) || (this.id != null && !this.id.equals(other.id))) {
            return false;
        }
        return true;
    }

    @Override
    public String toString() {
        return "com.heulwen.pojo.Test[ id=" + id + " ]";
    }
    
}
