package com.crm.fieldvisit.repository;

import com.crm.fieldvisit.entity.Principal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PrincipalRepository extends JpaRepository<Principal, Integer> {
    Optional<Principal> findByCode(String code);
    Optional<Principal> findByName(String name);
    List<Principal> findAllByOrderByNameAsc();
}
