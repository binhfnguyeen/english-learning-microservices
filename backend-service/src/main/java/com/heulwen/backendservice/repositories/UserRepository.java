/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.heulwen.backendservice.repositories;

import com.heulwen.backendservice.model.User;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 *
 * @author Dell
 */
@Repository
public interface UserRepository extends JpaRepository<User, Integer>{
    public boolean existsByUsername(String username);
    Optional<User> findByUsername(String username);
    public User getUserByUsername(String username);
    User findByEmail(String email);
    List<User> findByRole(String role);
}
