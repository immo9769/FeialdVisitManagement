package com.crm.fieldvisit.repository;

import com.crm.fieldvisit.entity.Industry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface IndustryRepository extends JpaRepository<Industry, Integer> {
    Optional<Industry> findByCode(String code);
}
