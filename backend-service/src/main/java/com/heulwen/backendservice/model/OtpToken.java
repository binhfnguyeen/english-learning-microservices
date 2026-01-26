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
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;
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
@Table(name = "otp_token")
@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@NamedQueries({
    @NamedQuery(name = "OtpToken.findAll", query = "SELECT o FROM OtpToken o"),
    @NamedQuery(name = "OtpToken.findById", query = "SELECT o FROM OtpToken o WHERE o.id = :id"),
    @NamedQuery(name = "OtpToken.findByOtpCode", query = "SELECT o FROM OtpToken o WHERE o.otpCode = :otpCode"),
    @NamedQuery(name = "OtpToken.findByExpiryDate", query = "SELECT o FROM OtpToken o WHERE o.expiryDate = :expiryDate")})
public class OtpToken implements Serializable {

    private static final long serialVersionUID = 1L;
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Basic(optional = false)
    @Column(name = "id")
    Integer id;
    @Size(max = 6)
    @Column(name = "otp_code")
    String otpCode;
    @Column(name = "expiry_date")
    @Temporal(TemporalType.TIMESTAMP)
    LocalDateTime expiryDate;
    @JoinColumn(name = "user_id", referencedColumnName = "id")
    @ManyToOne
    User userId;

    @Override
    public int hashCode() {
        int hash = 0;
        hash += (id != null ? id.hashCode() : 0);
        return hash;
    }

    @Override
    public boolean equals(Object object) {
        // TODO: Warning - this method won't work in the case the id fields are not set
        if (!(object instanceof OtpToken)) {
            return false;
        }
        OtpToken other = (OtpToken) object;
        if ((this.id == null && other.id != null) || (this.id != null && !this.id.equals(other.id))) {
            return false;
        }
        return true;
    }

    @Override
    public String toString() {
        return "com.heulwen.pojo.OtpToken[ id=" + id + " ]";
    }
    
}
