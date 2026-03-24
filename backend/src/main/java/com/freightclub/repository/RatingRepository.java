package com.freightclub.repository;

import com.freightclub.domain.Rating;
import com.freightclub.domain.UserRole;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.Set;

public interface RatingRepository extends JpaRepository<Rating, String> {

    Optional<Rating> findByLoadIdAndReviewerId(String loadId, String reviewerId);

    boolean existsByLoadIdAndReviewerId(String loadId, String reviewerId);

    Page<Rating> findByReviewedIdOrderByCreatedAtDesc(String reviewedId, Pageable pageable);

    @Query("SELECT AVG(r.stars) FROM Rating r WHERE r.reviewedId = :id AND r.reviewerRole = :role")
    Double findAvgStars(@Param("id") String reviewedId, @Param("role") UserRole role);

    @Query("SELECT COUNT(r) FROM Rating r WHERE r.reviewedId = :id AND r.reviewerRole = :role")
    long countRatings(@Param("id") String reviewedId, @Param("role") UserRole role);

    // Batch fetch for load board: returns [reviewedId, avgStars, count] per shipper
    @Query("SELECT r.reviewedId, AVG(r.stars), COUNT(r) FROM Rating r " +
           "WHERE r.reviewedId IN :ids AND r.reviewerRole = :role GROUP BY r.reviewedId")
    List<Object[]> findSummariesForIds(@Param("ids") Set<String> ids, @Param("role") UserRole role);
}
