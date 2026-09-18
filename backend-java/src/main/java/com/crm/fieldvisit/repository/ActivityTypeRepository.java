package com.crm.fieldvisit.repository;

import com.crm.fieldvisit.entity.ActivityType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ActivityTypeRepository extends JpaRepository<ActivityType, Integer> {
    Optional<ActivityType> findByCode(String code);
}
