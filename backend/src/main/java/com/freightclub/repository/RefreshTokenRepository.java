package com.freightclub.repository;

import com.freightclub.domain.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import jakarta.persistence.LockModeType;
import java.util.List;
import java.util.Optional;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, String> {

    Optional<RefreshToken> findByTokenHash(String tokenHash);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT t FROM RefreshToken t WHERE t.tokenHash = :tokenHash")
    Optional<RefreshToken> findByTokenHashForUpdate(@Param("tokenHash") String tokenHash);

    void deleteAllByUserId(String userId);

    // US-882: a new refresh token is minted on every successful login (AuthService.login /
    // register) — its createdAt is the closest existing proxy for "login events" without
    // building new tracking infrastructure (per the story's explicit no-new-instrumentation
    // scope).
    List<RefreshToken> findAllByUserIdOrderByCreatedAtDesc(String userId);
}
