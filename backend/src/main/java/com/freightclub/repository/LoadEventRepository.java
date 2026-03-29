package com.freightclub.repository;

import com.freightclub.domain.LoadEvent;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LoadEventRepository extends JpaRepository<LoadEvent, String> {
}
