package com.crm.fieldvisit.repository;

import com.crm.fieldvisit.entity.GradeFuelRate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface GradeFuelRateRepository extends JpaRepository<GradeFuelRate, Integer> {
    Optional<GradeFuelRate> findByGradeCode(String gradeCode);
}
