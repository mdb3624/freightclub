package com.freightclub.repository;

import com.freightclub.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, String> {

    Optional<User> findByEmailAndDeletedAtIsNull(String email);

    boolean existsByEmail(String email);
}
