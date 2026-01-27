package com.heulwen.backendservice.repository;

import com.heulwen.backendservice.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long>{
    boolean existsByUsername(String username);
    Optional<User> findByUsername(String username);
    User getUserByUsername(String username);
    User findByEmail(String email);
    List<User> findByRole(String role);
}
